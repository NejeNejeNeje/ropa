import { router, publicProcedure, protectedProcedure } from '@/lib/trpc';
import { z } from 'zod';

export const circleRouter = router({
    getUpcoming: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.swapCircle.findMany({
            where: { isPast: false },
            include: {
                host: true,
                rsvps: { include: { user: true }, take: 5 },
            },
            orderBy: { date: 'asc' },
        });
    }),

    getPast: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.swapCircle.findMany({
            where: { isPast: true },
            include: {
                host: true,
                rsvps: { include: { user: true }, take: 5 },
            },
            orderBy: { date: 'desc' },
        });
    }),

    getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.prisma.swapCircle.findUnique({
            where: { id: input },
            include: {
                host: true,
                rsvps: { include: { user: true } },
            },
        });
    }),

    rsvp: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        const circle = await ctx.prisma.swapCircle.findUnique({
            where: { id: input },
            include: { rsvps: true },
        });
        if (!circle) throw new Error('Circle not found');
        if (circle.rsvps.length >= circle.capacity) throw new Error('Circle is full');

        await ctx.prisma.circleRSVP.create({
            data: { userId: ctx.userId, circleId: input },
        });

        // Update full status
        if (circle.rsvps.length + 1 >= circle.capacity) {
            await ctx.prisma.swapCircle.update({
                where: { id: input },
                data: { isFull: true },
            });
        }

        return { success: true };
    }),

    cancelRsvp: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        await ctx.prisma.circleRSVP.delete({
            where: { userId_circleId: { userId: ctx.userId, circleId: input } },
        });

        // Un-full the circle
        await ctx.prisma.swapCircle.update({
            where: { id: input },
            data: { isFull: false },
        });

        return { success: true };
    }),
});
