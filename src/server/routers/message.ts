import { router, protectedProcedure } from '@/lib/trpc';
import { z } from 'zod';
import { sendPushToUser } from '@/lib/push';

export const messageRouter = router({
    send: protectedProcedure.input(z.object({
        matchId: z.string().max(100),
        body: z.string().min(1).max(5000),
        imageUrl: z.string().max(2048).optional(),
    })).mutation(async ({ ctx, input }) => {
        const message = await ctx.prisma.message.create({
            data: {
                matchId: input.matchId,
                senderId: ctx.userId,
                body: input.body,
                imageUrl: input.imageUrl,
            },
            include: { sender: true },
        });
        // Update match timestamp
        const match = await ctx.prisma.match.update({
            where: { id: input.matchId },
            data: { updatedAt: new Date() },
            select: { userAId: true, userBId: true },
        });
        // Push notification to the other party (fire-and-forget)
        const recipientId = match.userAId === ctx.userId ? match.userBId : match.userAId;
        const senderName = (message.sender as { name?: string | null }).name || 'Your swap partner';
        sendPushToUser(recipientId, {
            title: `💬 ${senderName}`,
            body: input.body.slice(0, 80),
            url: `/chat/${input.matchId}`,
            tag: `chat-${input.matchId}`,
        }).catch(() => { }); // never block on push
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
