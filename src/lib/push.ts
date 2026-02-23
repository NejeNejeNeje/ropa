import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

interface PushPayload {
    title: string;
    body: string;
    url?: string;
    tag?: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
    // Set VAPID at runtime so env vars are available
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT!,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!,
    );

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pushSubscription: true },
    });

    if (!user?.pushSubscription) return;

    try {
        const subscription = JSON.parse(user.pushSubscription as string);
        await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (err) {
        // If subscription is expired/invalid, clear it
        const error = err as { statusCode?: number };
        if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.user.update({
                where: { id: userId },
                data: { pushSubscription: null },
            });
        }
    }
}
