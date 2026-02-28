import { PrismaClient } from '@prisma/client';

type PrismaLike = PrismaClient | Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

/**
 * Recalculate a user's trustTier based on their current karmaPoints.
 * Call this after every karma award to keep tiers in sync.
 *
 * Thresholds:
 *   0–99   → bronze
 *   100–499 → silver
 *   500+   → gold
 */
export async function recalcTrustTier(prisma: PrismaLike, userId: string): Promise<void> {
    const user = await (prisma as PrismaClient).user.findUnique({
        where: { id: userId },
        select: { karmaPoints: true, trustTier: true },
    });
    if (!user) return;

    let newTier: string;
    if (user.karmaPoints >= 500) newTier = 'gold';
    else if (user.karmaPoints >= 100) newTier = 'silver';
    else newTier = 'bronze';

    if (newTier !== user.trustTier) {
        await (prisma as PrismaClient).user.update({
            where: { id: userId },
            data: { trustTier: newTier },
        });
    }
}
