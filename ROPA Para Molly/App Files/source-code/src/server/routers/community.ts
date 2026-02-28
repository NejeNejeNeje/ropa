import { router, publicProcedure, protectedProcedure } from '@/lib/trpc';
import { z } from 'zod';
import { recalcTrustTier } from '@/lib/karma';

export const communityRouter = router({
    getFeed: publicProcedure.input(z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
    }).optional()).query(async ({ ctx, input }) => {
        const limit = input?.limit ?? 20;
        const posts = await ctx.prisma.travelPost.findMany({
            include: { user: true, linkedListing: true },
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            cursor: input?.cursor ? { id: input.cursor } : undefined,
        });

        let nextCursor: string | undefined;
        if (posts.length > limit) {
            const next = posts.pop();
            nextCursor = next?.id;
        }
        return { posts, nextCursor };
    }),

    createPost: protectedProcedure.input(z.object({
        imageUrl: z.string().max(2048),
        caption: z.string().max(2000),
        linkedListingId: z.string().max(100).optional(),
        city: z.string().max(100),
        country: z.string().max(100),
        tags: z.array(z.string().max(50)).max(10).optional(),
    })).mutation(async ({ ctx, input }) => {
        const post = await ctx.prisma.travelPost.create({
            data: {
                userId: ctx.userId,
                imageUrl: input.imageUrl,
                caption: input.caption,
                linkedListingId: input.linkedListingId,
                city: input.city,
                country: input.country,
                tags: JSON.stringify(input.tags || []),
            },
        });

        // Award karma
        await ctx.prisma.karmaEntry.create({
            data: {
                userId: ctx.userId,
                action: 'travel_post',
                points: 10,
                description: 'Shared a swap story',
            },
        });
        await ctx.prisma.user.update({
            where: { id: ctx.userId },
            data: { karmaPoints: { increment: 10 } },
        });
        await recalcTrustTier(ctx.prisma, ctx.userId);

        return post;
    }),

    toggleLike: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        // Simple toggle — increment/decrement likes
        // In production, use a PostLike junction table
        const post = await ctx.prisma.travelPost.findUnique({ where: { id: input } });
        if (!post) throw new Error('Post not found');

        const updated = await ctx.prisma.travelPost.update({
            where: { id: input },
            data: { likes: { increment: 1 } },
        });
        return updated;
    }),
});
