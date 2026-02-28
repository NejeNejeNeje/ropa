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
            },
        });
    }),

    updateProfile: protectedProcedure.input(z.object({
        name: z.string().max(100).optional(),
        bio: z.string().max(1000).optional(),
        currentCity: z.string().max(100).optional(),
        country: z.string().max(100).optional(),
        preferredSizes: z.array(z.string().max(30)).max(20).optional(),
        preferredStyles: z.array(z.string().max(50)).max(20).optional(),
    })).mutation(async ({ ctx, input }) => {
        const data: Record<string, unknown> = {};
        if (input.name) data.name = input.name;
        if (input.bio !== undefined) data.bio = input.bio;
        if (input.currentCity) data.currentCity = input.currentCity;
        if (input.country) data.country = input.country;
        if (input.preferredSizes) data.preferredSizes = JSON.stringify(input.preferredSizes);
        if (input.preferredStyles) data.preferredStyles = JSON.stringify(input.preferredStyles);

        return ctx.prisma.user.update({
            where: { id: ctx.userId },
            data,
        });
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
