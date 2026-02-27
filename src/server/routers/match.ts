import { router, protectedProcedure } from '@/lib/trpc';
import { z } from 'zod';

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
            },
            orderBy: { updatedAt: 'desc' },
        });
        return matches;
    }),

    accept: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
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

            return review;
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
