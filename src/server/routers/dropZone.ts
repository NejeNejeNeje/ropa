import { router, publicProcedure, protectedProcedure } from '@/lib/trpc';
import { z } from 'zod';

export const dropZoneRouter = router({
    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.dropZone.findMany({
            orderBy: { activeListings: 'desc' },
        });
    }),

    getByCity: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.prisma.dropZone.findMany({
            where: { city: input },
            orderBy: { activeListings: 'desc' },
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
        // Link listing to drop zone
        await ctx.prisma.listing.update({
            where: { id: input.listingId, userId: ctx.userId },
            data: { dropZoneId: input.dropZoneId },
        });
        // Increment active listings count
        await ctx.prisma.dropZone.update({
            where: { id: input.dropZoneId },
            data: { activeListings: { increment: 1 } },
        });
        return { success: true };
    }),
});
