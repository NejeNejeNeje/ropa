import { router, publicProcedure, protectedProcedure } from '@/lib/trpc';
import { z } from 'zod';

export const dropZoneRouter = router({
    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.dropZone.findMany({
            include: { _count: { select: { listings: { where: { isActive: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
    }),

    getByCity: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.prisma.dropZone.findMany({
            where: { city: input },
            include: { _count: { select: { listings: { where: { isActive: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
    }),

    getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.prisma.dropZone.findUnique({
            where: { id: input },
            include: { listings: { where: { isActive: true }, include: { user: true } } },
        });
    }),

    scanQR: protectedProcedure.input(z.object({
        dropZoneId: z.string(),
        listingId: z.string(),
    })).mutation(async ({ ctx, input }) => {
        // Link listing to drop zone (count is now computed, no manual increment needed)
        await ctx.prisma.listing.update({
            where: { id: input.listingId, userId: ctx.userId },
            data: { dropZoneId: input.dropZoneId },
        });
        return { success: true };
    }),
});

