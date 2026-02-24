import { router, publicProcedure, protectedProcedure } from '@/lib/trpc';
import { z } from 'zod';

export const listingRouter = router({
    create: protectedProcedure.input(z.object({
        title: z.string().min(2).max(100),
        description: z.string().max(2000),
        category: z.string().max(50),
        size: z.string().max(20),
        genderTarget: z.string().max(20),
        condition: z.string().max(50),
        brand: z.string().max(100).optional(),
        colors: z.array(z.string().max(30)).optional(),
        pricingType: z.string().max(20),
        price: z.number().nullable().optional(),
        currency: z.string().max(10).optional(),
        city: z.string().max(100),
        country: z.string().max(100),
        images: z.array(z.object({ id: z.string().max(100), url: z.string().max(2048), sortOrder: z.number() })),
        dropZoneId: z.string().max(100).optional(),
    })).mutation(async ({ ctx, input }) => {

        const listing = await ctx.prisma.listing.create({
            data: {
                userId: ctx.userId,
                title: input.title,
                description: input.description,
                category: input.category,
                size: input.size,
                genderTarget: input.genderTarget,
                condition: input.condition,
                brand: input.brand || '',
                colors: JSON.stringify(input.colors || []),
                pricingType: input.pricingType,
                price: input.price,
                currency: input.currency || 'USD',
                city: input.city,
                country: input.country,
                images: JSON.stringify(input.images),
                dropZoneId: input.dropZoneId,
            },
        });

        // Award karma for free listing
        if (input.pricingType === 'free') {
            await ctx.prisma.karmaEntry.create({
                data: {
                    userId: ctx.userId,
                    action: 'list_free_item',
                    points: 10,
                    description: `Listed "${input.title}" for free`,
                },
            });
            await ctx.prisma.user.update({
                where: { id: ctx.userId },
                data: { karmaPoints: { increment: 10 } },
            });
        }

        return listing;
    }),

    getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.prisma.listing.findUnique({
            where: { id: input },
            include: { user: true, dropZone: true },
        });
    }),

    getFeed: publicProcedure.input(z.object({
        excludeUserId: z.string().optional(),
        category: z.string().optional(),
        city: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
    })).query(async ({ ctx, input }) => {
        const where: Record<string, unknown> = { isActive: true };
        if (input.excludeUserId) where.userId = { not: input.excludeUserId };
        if (input.category) where.category = input.category;
        if (input.city) where.city = input.city;

        // I7: Exclude listings already swiped by this user
        const sessionUserId = (ctx.session?.user as { id?: string } | null | undefined)?.id;
        if (sessionUserId) {
            const swipedIds = await ctx.prisma.swipe.findMany({
                where: { swiperId: sessionUserId },
                select: { listingId: true },
            });
            if (swipedIds.length > 0) {
                where.id = { notIn: swipedIds.map((s) => s.listingId) };
            }
        }

        const listings = await ctx.prisma.listing.findMany({
            where,
            include: { user: true, dropZone: true },
            orderBy: { createdAt: 'desc' },
            take: input.limit + 1,
            cursor: input.cursor ? { id: input.cursor } : undefined,
        });

        let nextCursor: string | undefined;
        if (listings.length > input.limit) {
            const next = listings.pop();
            nextCursor = next?.id;
        }

        return { listings, nextCursor };
    }),


    getByDropZone: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.prisma.listing.findMany({
            where: { dropZoneId: input, isActive: true },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
    }),

    getUserListings: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.prisma.listing.findMany({
            where: { userId: input },
            orderBy: { createdAt: 'desc' },
        });
    }),
});
