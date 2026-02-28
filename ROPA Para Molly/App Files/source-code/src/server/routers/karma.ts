import { router, protectedProcedure } from '@/lib/trpc';
import { KARMA_TIERS } from '@/data/types';

export const karmaRouter = router({
    getLog: protectedProcedure.query(async ({ ctx }) => {
        return ctx.prisma.karmaEntry.findMany({
            where: { userId: ctx.userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.prisma.user.findUnique({
            where: { id: ctx.userId },
            select: { karmaPoints: true, trustTier: true },
        });
        if (!user) throw new Error('User not found');

        const currentTier = [...KARMA_TIERS].reverse().find((t) => user.karmaPoints >= t.min) || KARMA_TIERS[0];
        const nextTier = KARMA_TIERS.find((t) => t.min > user.karmaPoints);

        return {
            points: user.karmaPoints,
            trustTier: user.trustTier,
            currentTier,
            nextTier,
            progress: nextTier
                ? ((user.karmaPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100
                : 100,
        };
    }),
});
