import { router, publicProcedure, protectedProcedure } from '@/lib/trpc';
import { z } from 'zod';

export const userRouter = router({
    me: protectedProcedure.query(async ({ ctx }) => {
        return ctx.prisma.user.findUnique({
            where: { id: ctx.userId },
            include: {
                buddiesA: { include: { userB: true } },
                buddiesB: { include: { userA: true } },
            },
        });
    }),

    getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.prisma.user.findUnique({
            where: { id: input },
            select: {
                id: true, name: true, image: true, bio: true, gender: true,
                currentCity: true, country: true, karmaPoints: true, trustTier: true,
                rating: true, totalTrades: true, completedTrades: true,
                verifiedAt: true, citiesVisited: true, createdAt: true,
                lat: true, lng: true,
                destination: true, destinationDate: true,
                destLat: true, destLng: true, destCountry: true,
            },
        });
    }),

    updateProfile: protectedProcedure.input(z.object({
        name: z.string().max(100).optional(),
        bio: z.string().max(1000).optional(),
        currentCity: z.string().max(100).optional(),
        country: z.string().max(100).optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        destination: z.string().max(100).optional(),
        destinationDate: z.string().optional().nullable(),
        destLat: z.number().nullable().optional(),
        destLng: z.number().nullable().optional(),
        destCountry: z.string().max(100).optional(),
        preferredSizes: z.array(z.string().max(30)).max(20).optional(),
        preferredStyles: z.array(z.string().max(50)).max(20).optional(),
    })).mutation(async ({ ctx, input }) => {
        const data: Record<string, unknown> = {};
        if (input.name !== undefined) data.name = input.name;
        if (input.bio !== undefined) data.bio = input.bio;
        if (input.currentCity !== undefined) data.currentCity = input.currentCity;
        if (input.country !== undefined) data.country = input.country;
        if (input.lat !== undefined) data.lat = input.lat;
        if (input.lng !== undefined) data.lng = input.lng;
        if (input.destination !== undefined) data.destination = input.destination;
        if (input.destinationDate !== undefined) {
            data.destinationDate = input.destinationDate ? new Date(input.destinationDate) : null;
        }
        if (input.destLat !== undefined) data.destLat = input.destLat;
        if (input.destLng !== undefined) data.destLng = input.destLng;
        if (input.destCountry !== undefined) data.destCountry = input.destCountry;
        if (input.preferredSizes) data.preferredSizes = JSON.stringify(input.preferredSizes);
        if (input.preferredStyles) data.preferredStyles = JSON.stringify(input.preferredStyles);

        return ctx.prisma.user.update({
            where: { id: ctx.userId },
            data,
        });
    }),

    boostListing: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        const user = await ctx.prisma.user.findUniqueOrThrow({
            where: { id: ctx.userId },
            select: { boostCredits: true },
        });
        if (user.boostCredits < 1) throw new Error('No boost credits available');
        // Verify listing belongs to user and is active
        const listing = await ctx.prisma.listing.findFirst({
            where: { id: input, userId: ctx.userId, isActive: true },
        });
        if (!listing) throw new Error('Listing not found or not yours');
        if (listing.isBoosted) throw new Error('Listing is already boosted');

        await ctx.prisma.$transaction([
            ctx.prisma.user.update({
                where: { id: ctx.userId },
                data: { boostCredits: { decrement: 1 } },
            }),
            ctx.prisma.listing.update({
                where: { id: input },
                data: { isBoosted: true, boostedAt: new Date() },
            }),
        ]);
        return { success: true };
    }),

    getSwapBuddies: protectedProcedure.query(async ({ ctx }) => {
        const buddies = await ctx.prisma.swapBuddy.findMany({
            where: {
                OR: [{ userAId: ctx.userId }, { userBId: ctx.userId }],
            },
            include: { userA: true, userB: true },
        });
        return buddies.map((b) =>
            b.userAId === ctx.userId ? b.userB : b.userA
        );
    }),
});
