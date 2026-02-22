import { router, protectedProcedure } from '@/lib/trpc';
import { z } from 'zod';

export const swipeRouter = router({
    create: protectedProcedure.input(z.object({
        listingId: z.string(),
        direction: z.enum(['LEFT', 'RIGHT', 'SUPER']),
    })).mutation(async ({ ctx, input }) => {
        // Create swipe
        const swipe = await ctx.prisma.swipe.create({
            data: {
                swiperId: ctx.userId,
                listingId: input.listingId,
                direction: input.direction,
            },
        });

        // Check for match on RIGHT or SUPER
        if (input.direction === 'RIGHT' || input.direction === 'SUPER') {
            const listing = await ctx.prisma.listing.findUnique({
                where: { id: input.listingId },
                select: { userId: true },
            });

            if (!listing) return { swipe, matched: false };

            // Check if the other user swiped right on any of our listings
            const ourListings = await ctx.prisma.listing.findMany({
                where: { userId: ctx.userId, isActive: true },
                select: { id: true },
            });

            const reciprocal = await ctx.prisma.swipe.findFirst({
                where: {
                    swiperId: listing.userId,
                    listingId: { in: ourListings.map((l) => l.id) },
                    direction: { in: ['RIGHT', 'SUPER'] },
                },
                include: { listing: true },
            });

            if (reciprocal) {
                const match = await ctx.prisma.match.create({
                    data: {
                        userAId: ctx.userId,
                        userBId: listing.userId,
                        listingAId: reciprocal.listingId,
                        listingBId: input.listingId,
                        status: 'pending',
                    },
                });
                return { swipe, matched: true, match };
            }
        }

        return { swipe, matched: false };
    }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
        const [total, rights, matches] = await Promise.all([
            ctx.prisma.swipe.count({ where: { swiperId: ctx.userId } }),
            ctx.prisma.swipe.count({ where: { swiperId: ctx.userId, direction: { in: ['RIGHT', 'SUPER'] } } }),
            ctx.prisma.match.count({
                where: { OR: [{ userAId: ctx.userId }, { userBId: ctx.userId }] },
            }),
        ]);
        return { total, rights, matchRate: total > 0 ? (matches / rights) * 100 : 0 };
    }),
});
