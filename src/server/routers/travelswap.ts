import { router, publicProcedure, protectedProcedure } from '@/lib/trpc';
import { z } from 'zod';

export const travelSwapRouter = router({
    // Create a new swap request with needs and offers
    create: protectedProcedure.input(z.object({
        city: z.string().min(1),
        destination: z.string().optional(),
        needs: z.array(z.object({
            category: z.string(),
            description: z.string().optional(),
            sizeRange: z.string().optional(),
            isFlexible: z.boolean().optional(),
        })).min(1),
        offers: z.array(z.object({
            category: z.string(),
            description: z.string().optional(),
            sizeRange: z.string().optional(),
            listingId: z.string().optional(),
        })).min(1),
        expiresInDays: z.number().min(1).max(30).optional(),
    })).mutation(async ({ ctx, input }) => {
        // Expire any existing active requests for this user in this city
        await ctx.prisma.swapRequest.updateMany({
            where: { userId: ctx.userId, city: input.city, status: 'active' },
            data: { status: 'expired' },
        });

        const expiresAt = input.expiresInDays
            ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7 days

        const request = await ctx.prisma.swapRequest.create({
            data: {
                userId: ctx.userId,
                city: input.city,
                destination: input.destination || '',
                expiresAt,
                needs: {
                    create: input.needs.map((n) => ({
                        category: n.category,
                        description: n.description || '',
                        sizeRange: n.sizeRange || '',
                        isFlexible: n.isFlexible ?? true,
                    })),
                },
                offers: {
                    create: input.offers.map((o) => ({
                        category: o.category,
                        description: o.description || '',
                        sizeRange: o.sizeRange || '',
                        listingId: o.listingId,
                    })),
                },
            },
            include: { needs: true, offers: true },
        });

        return request;
    }),

    // Get current user's active swap requests
    getMyRequests: protectedProcedure.query(async ({ ctx }) => {
        return ctx.prisma.swapRequest.findMany({
            where: { userId: ctx.userId, status: 'active' },
            include: { needs: true, offers: true },
            orderBy: { createdAt: 'desc' },
        });
    }),

    // Find bilateral matches: users who have what I need AND need what I have
    findMatches: protectedProcedure.input(z.object({
        swapRequestId: z.string(),
    })).query(async ({ ctx, input }) => {
        // Get the user's swap request
        const myRequest = await ctx.prisma.swapRequest.findUnique({
            where: { id: input.swapRequestId },
            include: { needs: true, offers: true },
        });
        if (!myRequest || myRequest.userId !== ctx.userId) {
            throw new Error('Swap request not found');
        }

        const myNeedCategories = myRequest.needs.map((n) => n.category);
        const myOfferCategories = myRequest.offers.map((o) => o.category);

        // Find all other active requests in the same city
        const otherRequests = await ctx.prisma.swapRequest.findMany({
            where: {
                city: myRequest.city,
                status: 'active',
                userId: { not: ctx.userId },
                expiresAt: { gt: new Date() },
            },
            include: {
                needs: true,
                offers: true,
                user: true,
            },
        });

        // Categorize matches
        const bilateral: typeof otherRequests = [];
        const partial: typeof otherRequests = [];

        for (const other of otherRequests) {
            const theirOfferCategories = other.offers.map((o) => o.category);
            const theirNeedCategories = other.needs.map((n) => n.category);

            // They have something I need
            const theyHaveWhatINeed = myNeedCategories.some((cat) =>
                theirOfferCategories.includes(cat)
            );
            // They need something I have
            const theyNeedWhatIHave = myOfferCategories.some((cat) =>
                theirNeedCategories.includes(cat)
            );

            if (theyHaveWhatINeed && theyNeedWhatIHave) {
                bilateral.push(other);
            } else if (theyHaveWhatINeed) {
                partial.push(other);
            }
        }

        // Sort by overlap count (more overlapping categories = better match)
        const sortByOverlap = (a: typeof otherRequests[0], b: typeof otherRequests[0]) => {
            const aOverlap =
                a.offers.filter((o) => myNeedCategories.includes(o.category)).length +
                a.needs.filter((n) => myOfferCategories.includes(n.category)).length;
            const bOverlap =
                b.offers.filter((o) => myNeedCategories.includes(o.category)).length +
                b.needs.filter((n) => myOfferCategories.includes(n.category)).length;
            return bOverlap - aOverlap;
        };

        bilateral.sort(sortByOverlap);
        partial.sort(sortByOverlap);

        return { bilateral, partial, myRequest };
    }),

    // Get all active requests in a city (for browsing)
    getByCity: publicProcedure.input(z.object({
        city: z.string(),
        excludeUserId: z.string().optional(),
    })).query(async ({ ctx, input }) => {
        return ctx.prisma.swapRequest.findMany({
            where: {
                city: input.city,
                status: 'active',
                expiresAt: { gt: new Date() },
                ...(input.excludeUserId ? { userId: { not: input.excludeUserId } } : {}),
            },
            include: { needs: true, offers: true, user: true },
            orderBy: { createdAt: 'desc' },
        });
    }),

    // Cancel/expire a swap request
    expire: protectedProcedure.input(z.object({
        swapRequestId: z.string(),
    })).mutation(async ({ ctx, input }) => {
        return ctx.prisma.swapRequest.update({
            where: { id: input.swapRequestId, userId: ctx.userId },
            data: { status: 'cancelled' },
        });
    }),
});
