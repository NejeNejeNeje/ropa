import { router, protectedProcedure } from '@/lib/trpc';
import { z } from 'zod';
import { recalcTrustTier } from '@/lib/karma';
import { sendEmail, emailTemplates } from '@/lib/email';

// Haversine distance in km
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Trust tier weight
const TRUST_WEIGHTS: Record<string, number> = { bronze: 0.3, silver: 0.6, gold: 1.0 };

// Style overlap score (0-1)
function styleOverlap(a: string, b: string): number {
    try {
        const setA: string[] = JSON.parse(a || '[]');
        const setB: string[] = JSON.parse(b || '[]');
        if (setA.length === 0 || setB.length === 0) return 0.5;
        const intersection = setA.filter((s) => setB.includes(s)).length;
        return intersection / Math.max(setA.length, setB.length);
    } catch { return 0.5; }
}

export const offerRouter = router({
    // Buyer creates an offer on a listing
    create: protectedProcedure.input(z.object({
        listingId: z.string().max(100),
        amount: z.number().positive(),
        currency: z.string().max(10).default('USD'),
    })).mutation(async ({ ctx, input }) => {
        const listing = await ctx.prisma.listing.findUniqueOrThrow({
            where: { id: input.listingId },
            include: { user: true },
        });

        const buyer = await ctx.prisma.user.findUniqueOrThrow({
            where: { id: ctx.userId },
        });

        // Prevent self-offers
        if (listing.userId === ctx.userId) {
            throw new Error('Cannot make an offer on your own listing');
        }

        // I3: Rate limit — max 3 offers per buyer per listing per 24h
        const recentOfferCount = await ctx.prisma.offer.count({
            where: {
                buyerId: ctx.userId,
                listingId: input.listingId,
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
        });
        if (recentOfferCount >= 3) {
            throw new Error('Rate limit: max 3 offers per listing per 24h');
        }

        // Determine offer type
        const askingPrice = listing.price || 0;
        let offerType: string;
        if (input.amount > askingPrice) offerType = 'OVERBID';
        else if (input.amount === askingPrice) offerType = 'MATCH';
        else offerType = 'UNDERBID';

        // Compute distance
        const distanceKm = haversineKm(buyer.lat, buyer.lng, listing.lat, listing.lng);

        // Compute compatibility score
        const proximityScore = 1 / (1 + distanceKm / 100);
        const karmaScore = Math.min(buyer.karmaPoints / 1000, 1);
        const trustScore = TRUST_WEIGHTS[buyer.trustTier] || 0.3;
        const experienceScore = Math.min(buyer.completedTrades / 20, 1);
        const styleScore = styleOverlap(buyer.preferredStyles, listing.user.preferredStyles);

        const sellerScore = (
            proximityScore * 0.3 +
            karmaScore * 0.15 +
            trustScore * 0.15 +
            experienceScore * 0.15 +
            styleScore * 0.15 +
            (offerType === 'OVERBID' ? 0.1 : offerType === 'MATCH' ? 0.05 : 0) // price premium bonus
        );

        // 24h expiry
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Compute ROPA-held escrow amount for overbids
        // When buyer overbids, the premium above asking price (amount - askingPrice)
        // is retained by ROPA until the seller accepts. This incentivises the seller
        // to act quickly and rewards ROPA for facilitating the deal.
        const ropaHeldAmount = offerType === 'OVERBID' && askingPrice > 0
            ? Math.round((input.amount - askingPrice) * 100) / 100
            : null;

        const offer = await ctx.prisma.offer.create({
            data: {
                buyerId: ctx.userId,
                sellerId: listing.userId,
                listingId: input.listingId,
                offerType,
                amount: input.amount,
                currency: input.currency,
                expiresAt,
                sellerScore,
                distanceKm,
                ropaHeldAmount,
            },
        });

        // Also create the swipe record
        await ctx.prisma.swipe.upsert({
            where: { swiperId_listingId: { swiperId: ctx.userId, listingId: input.listingId } },
            create: {
                swiperId: ctx.userId,
                listingId: input.listingId,
                direction: 'RIGHT',
                offerId: offer.id,
            },
            update: { direction: 'RIGHT', offerId: offer.id },
        });

        // I4: Lowball auto-decline — check seller's minOfferPercent preference
        const seller = listing.user;
        let autoDeclined = false;
        if (seller.minOfferPercent > 0 && askingPrice > 0) {
            const floorAmount = (askingPrice * seller.minOfferPercent) / 100;
            if (input.amount < floorAmount) {
                await ctx.prisma.offer.update({
                    where: { id: offer.id },
                    data: { status: 'declined', declinedAt: new Date() },
                });
                autoDeclined = true;
            }
        }

        // Notify seller about new offer (fire-and-forget)
        if (!autoDeclined) {
            const baseUrl = process.env.AUTH_URL || 'https://ropa-trade.vercel.app';
            const { subject, html } = emailTemplates.offerReceived(
                listing.user.name, buyer.name, listing.title,
                input.amount, input.currency, `${baseUrl}/offers`
            );
            sendEmail({ to: listing.user.email, subject, html }).catch(() => { });
        }

        return { ...offer, autoDeclined };
    }),

    // Seller sets their minimum offer threshold
    setMinOfferPercent: protectedProcedure.input(z.object({
        percent: z.number().min(0).max(100).int(),
    })).mutation(async ({ ctx, input }) => {
        return ctx.prisma.user.update({
            where: { id: ctx.userId },
            data: { minOfferPercent: input.percent },
        });
    }),

    // Seller's offers dashboard
    getForSeller: protectedProcedure.query(async ({ ctx }) => {
        const now = new Date();

        // F3: Auto-expire stale offers at DB level
        await ctx.prisma.offer.updateMany({
            where: {
                sellerId: ctx.userId,
                status: 'pending',
                expiresAt: { lt: now },
            },
            data: { status: 'expired', escrowStatus: 'refunded' },
        });

        // Fetch all offers (now with correct statuses)
        return ctx.prisma.offer.findMany({
            where: { sellerId: ctx.userId },
            include: {
                buyer: true,
                listing: true,
            },
            orderBy: { sellerScore: 'desc' },
        });
    }),

    // F1: Seller accepts an offer → atomic transaction (match + decline-others + karma)
    accept: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        const offer = await ctx.prisma.offer.findUniqueOrThrow({
            where: { id: input },
            include: { listing: true },
        });

        if (offer.sellerId !== ctx.userId) throw new Error('Not your offer');
        if (offer.status !== 'pending') throw new Error('Offer no longer pending');
        if (offer.expiresAt < new Date()) throw new Error('Offer has expired');

        // Find a listing from the buyer to link (or use the same listing for sell-mode)
        const buyerListing = await ctx.prisma.listing.findFirst({
            where: { userId: offer.buyerId, isActive: true },
        });

        // Atomic transaction: match + update offer + decline others + karma
        const result = await ctx.prisma.$transaction(async (tx) => {
            // Create match
            const match = await tx.match.create({
                data: {
                    userAId: offer.sellerId,
                    userBId: offer.buyerId,
                    listingAId: offer.listingId,
                    listingBId: buyerListing?.id || offer.listingId,
                    status: 'accepted',
                    agreedPrice: offer.amount,
                },
            });

            // Update offer — mark accepted + escrow held
            await tx.offer.update({
                where: { id: input },
                data: { status: 'accepted', acceptedAt: new Date(), matchId: match.id, escrowStatus: 'held' },
            });

            // Decline other pending offers on same listing
            await tx.offer.updateMany({
                where: {
                    listingId: offer.listingId,
                    status: 'pending',
                    id: { not: input },
                },
                data: { status: 'declined', declinedAt: new Date(), escrowStatus: 'refunded' },
            });

            // Award karma
            await tx.karmaEntry.createMany({
                data: [
                    { userId: offer.sellerId, action: 'accept_offer', points: 5, description: 'Accepted an offer' },
                    { userId: offer.buyerId, action: 'offer_accepted', points: 10, description: 'Your offer was accepted!' },
                ],
            });
            await tx.user.update({ where: { id: offer.sellerId }, data: { karmaPoints: { increment: 5 } } });
            await tx.user.update({ where: { id: offer.buyerId }, data: { karmaPoints: { increment: 10 } } });
            await recalcTrustTier(tx, offer.sellerId);
            await recalcTrustTier(tx, offer.buyerId);

            return { offer, match };
        });

        // Notify buyer that their offer was accepted
        const buyer = await ctx.prisma.user.findUnique({ where: { id: offer.buyerId }, select: { name: true, email: true } });
        if (buyer) {
            const baseUrl = process.env.AUTH_URL || 'https://ropa-trade.vercel.app';
            const { subject, html } = emailTemplates.offerAccepted(
                buyer.name, offer.listing.title, offer.amount, offer.currency, `${baseUrl}/matches`
            );
            sendEmail({ to: buyer.email, subject, html }).catch(() => { });
        }

        return result;
    }),

    // Seller declines
    decline: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        const declined = await ctx.prisma.offer.update({
            where: { id: input, sellerId: ctx.userId },
            data: { status: 'declined', declinedAt: new Date(), escrowStatus: 'refunded' },
            include: { buyer: true, listing: true },
        });

        // Notify buyer that their offer was declined
        const baseUrl = process.env.AUTH_URL || 'https://ropa-trade.vercel.app';
        const { subject, html } = emailTemplates.offerDeclined(
            declined.buyer.name, declined.listing.title, `${baseUrl}/feed`
        );
        sendEmail({ to: declined.buyer.email, subject, html }).catch(() => { });

        return declined;
    }),

    // Seller counters
    counter: protectedProcedure.input(z.object({
        offerId: z.string(),
        counterAmount: z.number().positive(),
    })).mutation(async ({ ctx, input }) => {
        const updated = await ctx.prisma.offer.update({
            where: { id: input.offerId, sellerId: ctx.userId },
            data: { status: 'countered', counterAmount: input.counterAmount },
            include: { buyer: true, listing: true },
        });

        // Notify buyer about counter-offer
        const baseUrl = process.env.AUTH_URL || 'https://ropa-trade.vercel.app';
        const { subject, html } = emailTemplates.offerCountered(
            updated.buyer.name, updated.listing.title,
            input.counterAmount, updated.currency, `${baseUrl}/offers`
        );
        sendEmail({ to: updated.buyer.email, subject, html }).catch(() => { });

        return updated;
    }),

    // Buyer accepts seller's counter-offer → creates Match at counter price
    acceptCounter: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        const offer = await ctx.prisma.offer.findUniqueOrThrow({
            where: { id: input },
            include: { listing: true },
        });

        if (offer.buyerId !== ctx.userId) throw new Error('Not your offer');
        if (offer.status !== 'countered') throw new Error('Offer not in countered state');
        if (!offer.counterAmount) throw new Error('No counter amount set');

        const buyerListing = await ctx.prisma.listing.findFirst({
            where: { userId: ctx.userId, isActive: true },
        });

        const result = await ctx.prisma.$transaction(async (tx) => {
            const match = await tx.match.create({
                data: {
                    userAId: offer.sellerId,
                    userBId: offer.buyerId,
                    listingAId: offer.listingId,
                    listingBId: buyerListing?.id || offer.listingId,
                    status: 'accepted',
                    agreedPrice: offer.counterAmount!,
                },
            });

            await tx.offer.update({
                where: { id: input },
                data: { status: 'accepted', acceptedAt: new Date(), matchId: match.id },
            });

            // Decline other pending/countered offers on same listing
            await tx.offer.updateMany({
                where: {
                    listingId: offer.listingId,
                    id: { not: input },
                    status: { in: ['pending', 'countered'] },
                },
                data: { status: 'declined', declinedAt: new Date() },
            });

            await tx.karmaEntry.createMany({
                data: [
                    { userId: offer.sellerId, action: 'counter_accepted', points: 5, description: 'Counter-offer accepted' },
                    { userId: offer.buyerId, action: 'accept_counter', points: 10, description: 'Accepted a counter-offer' },
                ],
            });
            await tx.user.update({ where: { id: offer.sellerId }, data: { karmaPoints: { increment: 5 } } });
            await tx.user.update({ where: { id: offer.buyerId }, data: { karmaPoints: { increment: 10 } } });
            await recalcTrustTier(tx, offer.sellerId);
            await recalcTrustTier(tx, offer.buyerId);

            return { offer, match };
        });

        return result;
    }),

    // Buyer declines seller's counter-offer
    declineCounter: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        return ctx.prisma.offer.update({
            where: { id: input, buyerId: ctx.userId, status: 'countered' },
            data: { status: 'declined', declinedAt: new Date() },
        });
    }),

    // Buyer's offers (with seller info for counter-response UI)
    getForBuyer: protectedProcedure.query(async ({ ctx }) => {
        return ctx.prisma.offer.findMany({
            where: { buyerId: ctx.userId },
            include: { listing: true, seller: true },
            orderBy: { createdAt: 'desc' },
        });
    }),
});
