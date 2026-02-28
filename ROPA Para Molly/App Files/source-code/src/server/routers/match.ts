import { router, protectedProcedure } from '@/lib/trpc';
import { z } from 'zod';
import { recalcTrustTier } from '@/lib/karma';

export const matchRouter = router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const matches = await ctx.prisma.match.findMany({
            where: {
                OR: [{ userAId: ctx.userId }, { userBId: ctx.userId }],
            },
            include: {
                userA: true, userB: true,
                listingA: true, listingB: true,
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                offer: { select: { id: true, escrowStatus: true, amount: true, currency: true, ropaHeldAmount: true, offerType: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return matches;
    }),

    accept: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        const match = await ctx.prisma.match.findUniqueOrThrow({ where: { id: input } });
        if (match.userAId !== ctx.userId && match.userBId !== ctx.userId) {
            throw new Error('Forbidden');
        }
        return ctx.prisma.match.update({
            where: { id: input },
            data: { status: 'accepted' },
        });
    }),

    complete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        const match = await ctx.prisma.match.update({
            where: { id: input },
            data: { status: 'completed' },
        });

        // Award karma to both users
        const karmaData = [
            { userId: match.userAId, action: 'complete_swap', points: 20, description: 'Completed a swap' },
            { userId: match.userBId, action: 'complete_swap', points: 20, description: 'Completed a swap' },
        ];
        await ctx.prisma.karmaEntry.createMany({ data: karmaData });
        await ctx.prisma.user.updateMany({
            where: { id: { in: [match.userAId, match.userBId] } },
            data: { karmaPoints: { increment: 20 }, completedTrades: { increment: 1 }, totalTrades: { increment: 1 } },
        });
        await recalcTrustTier(ctx.prisma, match.userAId);
        await recalcTrustTier(ctx.prisma, match.userBId);

        // Create buddy connection if not exists
        const existing = await ctx.prisma.swapBuddy.findFirst({
            where: {
                OR: [
                    { userAId: match.userAId, userBId: match.userBId },
                    { userAId: match.userBId, userBId: match.userAId },
                ],
            },
        });
        if (!existing) {
            await ctx.prisma.swapBuddy.create({
                data: { userAId: match.userAId, userBId: match.userBId },
            });
        }

        return match;
    }),

    getMessages: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        // CHAT-4: Verify caller is a member of this match
        const match = await ctx.prisma.match.findUnique({
            where: { id: input },
            select: { userAId: true, userBId: true },
        });
        if (!match || (match.userAId !== ctx.userId && match.userBId !== ctx.userId)) {
            throw new Error('Forbidden');
        }
        return ctx.prisma.message.findMany({
            where: { matchId: input },
            include: { sender: true },
            orderBy: { createdAt: 'asc' },
        });
    }),

    // CHAT-3: Count unread messages for badge in navigation
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
        return ctx.prisma.message.count({
            where: {
                match: {
                    OR: [{ userAId: ctx.userId }, { userBId: ctx.userId }],
                },
                senderId: { not: ctx.userId },
                isRead: false,
            },
        });
    }),

    // REVIEW: Leave a 1-5 star review after a completed swap
    createReview: protectedProcedure
        .input(z.object({
            matchId: z.string(),
            rating: z.number().int().min(1).max(5),
            comment: z.string().max(500).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Verify caller is a participant in this match
            const match = await ctx.prisma.match.findUnique({
                where: { id: input.matchId },
                select: { userAId: true, userBId: true, status: true },
            });
            if (!match || (match.userAId !== ctx.userId && match.userBId !== ctx.userId)) {
                throw new Error('Forbidden');
            }
            if (match.status !== 'completed') {
                throw new Error('Can only review completed swaps');
            }
            // Determine who is being reviewed
            const revieweeId = match.userAId === ctx.userId ? match.userBId : match.userAId;

            // Prevent duplicate reviews
            const existing = await ctx.prisma.review.findFirst({
                where: { matchId: input.matchId, reviewerId: ctx.userId },
            });
            if (existing) throw new Error('Already reviewed this swap');

            const review = await ctx.prisma.review.create({
                data: {
                    matchId: input.matchId,
                    reviewerId: ctx.userId,
                    revieweeId,
                    rating: input.rating,
                    comment: input.comment ?? '',
                },
            });

            // Update reviewee's average rating
            const allReviews = await ctx.prisma.review.findMany({
                where: { revieweeId },
                select: { rating: true },
            });
            const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
            await ctx.prisma.user.update({
                where: { id: revieweeId },
                data: { rating: Math.round(avgRating * 10) / 10 },
            });

            // Award karma for leaving a review
            await ctx.prisma.karmaEntry.create({
                data: {
                    userId: ctx.userId,
                    action: 'leave_review',
                    points: 5,
                    description: 'Left a review after a swap',
                },
            });
            await ctx.prisma.user.update({
                where: { id: ctx.userId },
                data: { karmaPoints: { increment: 5 } },
            });
            await recalcTrustTier(ctx.prisma, ctx.userId);

            // Award karma for receiving a 5-star review
            if (input.rating === 5) {
                await ctx.prisma.karmaEntry.create({
                    data: {
                        userId: revieweeId,
                        action: 'five_star_received',
                        points: 15,
                        description: 'Received a ⭐⭐⭐⭐⭐ review',
                    },
                });
                await ctx.prisma.user.update({
                    where: { id: revieweeId },
                    data: { karmaPoints: { increment: 15 } },
                });
                await recalcTrustTier(ctx.prisma, revieweeId);
            }

            return review;
        }),

    // ESCROW: Dual-confirmation delivery — each party confirms independently
    confirmDelivery: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        const match = await ctx.prisma.match.findUniqueOrThrow({
            where: { id: input },
            include: { offer: true },
        });

        // Verify caller is a participant
        if (match.userAId !== ctx.userId && match.userBId !== ctx.userId) {
            throw new Error('Forbidden');
        }
        if (match.status !== 'accepted') {
            throw new Error('Match must be accepted to confirm delivery');
        }

        // Determine role: userA = seller (listed the item), userB = buyer (made the offer)
        const isSeller = match.userAId === ctx.userId;
        const now = new Date();

        // Prevent double-confirm
        if (isSeller && match.sellerConfirmedAt) throw new Error('You already confirmed delivery');
        if (!isSeller && match.buyerConfirmedAt) throw new Error('You already confirmed delivery');

        // Set the confirmation timestamp
        const updateData = isSeller
            ? { sellerConfirmedAt: now }
            : { buyerConfirmedAt: now };

        const updated = await ctx.prisma.match.update({
            where: { id: input },
            data: updateData,
        });

        // Check if BOTH parties have now confirmed
        const bothConfirmed = (isSeller ? updated.sellerConfirmedAt : match.sellerConfirmedAt)
            && (!isSeller ? updated.buyerConfirmedAt : match.buyerConfirmedAt);

        if (bothConfirmed) {
            // Auto-complete the match + release escrow
            await ctx.prisma.match.update({
                where: { id: input },
                data: { status: 'completed', escrowReleasedAt: now },
            });

            // Release escrow on the linked offer
            if (match.offer) {
                await ctx.prisma.offer.update({
                    where: { id: match.offer.id },
                    data: { escrowStatus: 'released' },
                });
            }

            // Award karma to both users
            await ctx.prisma.karmaEntry.createMany({
                data: [
                    { userId: match.userAId, action: 'complete_swap', points: 20, description: 'Completed a swap' },
                    { userId: match.userBId, action: 'complete_swap', points: 20, description: 'Completed a swap' },
                ],
            });
            await ctx.prisma.user.updateMany({
                where: { id: { in: [match.userAId, match.userBId] } },
                data: { karmaPoints: { increment: 20 }, completedTrades: { increment: 1 }, totalTrades: { increment: 1 } },
            });
            await recalcTrustTier(ctx.prisma, match.userAId);
            await recalcTrustTier(ctx.prisma, match.userBId);

            // Create buddy connection if not exists
            const existing = await ctx.prisma.swapBuddy.findFirst({
                where: {
                    OR: [
                        { userAId: match.userAId, userBId: match.userBId },
                        { userAId: match.userBId, userBId: match.userAId },
                    ],
                },
            });
            if (!existing) {
                await ctx.prisma.swapBuddy.create({
                    data: { userAId: match.userAId, userBId: match.userBId },
                });
            }

            return { confirmed: true, bothConfirmed: true, status: 'completed' };
        }

        return { confirmed: true, bothConfirmed: false, status: 'accepted', waitingOn: isSeller ? 'buyer' : 'seller' };
    }),

    // ESCROW: Open a dispute — pauses escrow release
    openDispute: protectedProcedure.input(z.object({
        matchId: z.string(),
        reason: z.string().min(5).max(500),
    })).mutation(async ({ ctx, input }) => {
        const match = await ctx.prisma.match.findUniqueOrThrow({
            where: { id: input.matchId },
            include: { offer: true },
        });

        if (match.userAId !== ctx.userId && match.userBId !== ctx.userId) {
            throw new Error('Forbidden');
        }
        if (match.status === 'completed' || match.status === 'disputed') {
            throw new Error('Cannot dispute this match');
        }

        // Set match to disputed
        await ctx.prisma.match.update({
            where: { id: input.matchId },
            data: { status: 'disputed', disputeReason: input.reason, disputeOpenedBy: ctx.userId },
        });

        // Set offer escrow to disputed
        if (match.offer) {
            await ctx.prisma.offer.update({
                where: { id: match.offer.id },
                data: { escrowStatus: 'disputed' },
            });
        }

        return { disputed: true };
    }),

    // ADMIN: Resolve a dispute — force-release or force-refund
    resolveDispute: protectedProcedure.input(z.object({
        matchId: z.string(),
        resolution: z.enum(['release', 'refund']),
    })).mutation(async ({ ctx, input }) => {
        // Check admin role (session has role baked in from JWT)
        const user = await ctx.prisma.user.findUniqueOrThrow({ where: { id: ctx.userId } });
        if (user.role !== 'admin') throw new Error('Admin only');

        const match = await ctx.prisma.match.findUniqueOrThrow({
            where: { id: input.matchId },
            include: { offer: true },
        });

        const now = new Date();
        const newMatchStatus = input.resolution === 'release' ? 'completed' : 'expired';
        const newEscrowStatus = input.resolution === 'release' ? 'released' : 'refunded';

        await ctx.prisma.match.update({
            where: { id: input.matchId },
            data: {
                status: newMatchStatus,
                escrowReleasedAt: input.resolution === 'release' ? now : undefined,
            },
        });

        if (match.offer) {
            await ctx.prisma.offer.update({
                where: { id: match.offer.id },
                data: { escrowStatus: newEscrowStatus },
            });
        }

        // If releasing, award karma
        if (input.resolution === 'release') {
            await ctx.prisma.karmaEntry.createMany({
                data: [
                    { userId: match.userAId, action: 'complete_swap', points: 20, description: 'Swap completed (admin resolved)' },
                    { userId: match.userBId, action: 'complete_swap', points: 20, description: 'Swap completed (admin resolved)' },
                ],
            });
            await ctx.prisma.user.updateMany({
                where: { id: { in: [match.userAId, match.userBId] } },
                data: { karmaPoints: { increment: 20 }, completedTrades: { increment: 1 } },
            });
            await recalcTrustTier(ctx.prisma, match.userAId);
            await recalcTrustTier(ctx.prisma, match.userBId);
        }

        return { resolved: true, resolution: input.resolution };
    }),

    // REVIEW: Check if current user has already reviewed a match
    getReviewStatus: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const review = await ctx.prisma.review.findFirst({
                where: { matchId: input, reviewerId: ctx.userId },
            });
            return { hasReviewed: !!review, review };
        }),
});
