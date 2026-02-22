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
        return ctx.prisma.message.findMany({
            where: { matchId: input },
            include: { sender: true },
            orderBy: { createdAt: 'asc' },
        });
    }),
});
