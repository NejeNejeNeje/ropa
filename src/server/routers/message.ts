import { router, protectedProcedure } from '@/lib/trpc';
import { z } from 'zod';

export const messageRouter = router({
    send: protectedProcedure.input(z.object({
        matchId: z.string(),
        body: z.string().min(1),
        imageUrl: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
        const message = await ctx.prisma.message.create({
            data: {
                matchId: input.matchId,
                senderId: ctx.userId,
                body: input.body,
                imageUrl: input.imageUrl,
            },
        });
        // Update match timestamp
        await ctx.prisma.match.update({
            where: { id: input.matchId },
            data: { updatedAt: new Date() },
        });
        return message;
    }),

    markRead: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        await ctx.prisma.message.updateMany({
            where: {
                matchId: input,
                senderId: { not: ctx.userId },
                isRead: false,
            },
            data: { isRead: true },
        });
        return { success: true };
    }),
});
