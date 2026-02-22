/**
 * Server-side data fetching — replaces direct mock imports.
 * Queries Prisma and maps DB rows to the frontend types.
 * Falls back to mock data if DB query fails.
 */
import { prisma } from '@/lib/prisma';
import type { User, Listing, DropZone, TravelPost, SwapCircle, KarmaEntry } from '@/data/types';
import * as mock from '@/data/mockData';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

function adaptUser(u: Row): User {
    return {
        id: u.id, email: u.email, displayName: u.name || u.displayName || '',
        avatarUrl: u.image || u.avatarUrl || '',
        bio: u.bio || '', gender: u.gender || 'prefer-not-to-say',
        currentLocation: { lat: u.lat || 0, lng: u.lng || 0 },
        currentCity: u.currentCity || '', country: u.country || '',
        rating: u.rating || 0, totalTrades: u.totalTrades || 0,
        completedTrades: u.completedTrades || 0,
        karmaPoints: u.karmaPoints || 0,
        trustTier: u.trustTier || 'bronze',
        citiesVisited: typeof u.citiesVisited === 'string' ? JSON.parse(u.citiesVisited) : (u.citiesVisited || []),
        swapBuddyIds: u.swapBuddyIds || [],
        preferredSizes: typeof u.preferredSizes === 'string' ? JSON.parse(u.preferredSizes) : (u.preferredSizes || []),
        preferredStyles: typeof u.preferredStyles === 'string' ? JSON.parse(u.preferredStyles) : (u.preferredStyles || []),
        createdAt: u.createdAt?.toISOString?.() || u.createdAt || new Date().toISOString(),
        verifiedAt: u.verifiedAt?.toISOString?.() || u.verifiedAt,
    };
}

function adaptListing(l: Row, user?: User): Listing {
    const images = typeof l.images === 'string' ? JSON.parse(l.images) : (l.images || []);
    return {
        id: l.id, userId: l.userId, title: l.title, description: l.description,
        category: l.category, size: l.size, genderTarget: l.genderTarget,
        condition: l.condition, brand: l.brand || '',
        colors: typeof l.colors === 'string' ? JSON.parse(l.colors) : (l.colors || []),
        pricingType: l.pricingType || 'free', price: l.price ?? null,
        currency: l.currency || 'USD',
        location: { lat: l.lat || 0, lng: l.lng || 0 },
        city: l.city, country: l.country,
        images, isActive: l.isActive ?? true,
        createdAt: l.createdAt?.toISOString?.() || l.createdAt || new Date().toISOString(),
        user, dropZoneId: l.dropZoneId || undefined,
    };
}

function adaptDropZone(dz: Row): DropZone {
    return {
        id: dz.id, name: dz.name, type: dz.type,
        address: dz.address, city: dz.city, country: dz.country,
        location: { lat: dz.lat || 0, lng: dz.lng || 0 },
        imageUrl: dz.imageUrl, activeListings: dz.activeListings || 0,
        hours: dz.hours || '', description: dz.description || '',
        partnerSince: dz.partnerSince?.toISOString?.() || dz.partnerSince || '',
    };
}

function adaptSwapCircle(sc: Row, host: User): SwapCircle {
    return {
        id: sc.id, title: sc.title, description: sc.description,
        city: sc.city, country: sc.country, venue: sc.venue, venueType: sc.venueType,
        date: sc.date?.toISOString?.() || sc.date,
        time: sc.time, capacity: sc.capacity,
        attendeeCount: sc.rsvps?.length || sc.attendeeCount || 0,
        attendeeAvatars: sc.rsvps?.map((r: Row) => r.user?.image || '') || sc.attendeeAvatars || [],
        hostUserId: sc.hostUserId, imageUrl: sc.imageUrl,
        isFull: sc.isFull, isPast: sc.isPast,
        tags: typeof sc.tags === 'string' ? JSON.parse(sc.tags) : (sc.tags || []),
    };
}

function adaptPost(p: Row, user?: User, linkedListing?: Listing): TravelPost {
    return {
        id: p.id, userId: p.userId, imageUrl: p.imageUrl, caption: p.caption,
        linkedListingId: p.linkedListingId || undefined,
        likes: p.likes || 0, commentCount: p.commentCount || 0,
        city: p.city, country: p.country,
        tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []),
        createdAt: p.createdAt?.toISOString?.() || p.createdAt || new Date().toISOString(),
        user, linkedListing,
    };
}

// ─── Query Functions ───

export async function getDropZones(): Promise<DropZone[]> {
    try {
        const zones = await prisma.dropZone.findMany({ orderBy: { activeListings: 'desc' } });
        return zones.map(adaptDropZone);
    } catch { return mock.DROP_ZONES; }
}

export async function getSwapCircles(): Promise<SwapCircle[]> {
    try {
        const circles = await prisma.swapCircle.findMany({
            include: { host: true, rsvps: { include: { user: true }, take: 5 } },
            orderBy: { date: 'asc' },
        });
        return circles.map((sc) => adaptSwapCircle(sc, adaptUser(sc.host)));
    } catch { return mock.SWAP_CIRCLES; }
}

export async function getTravelPosts(): Promise<TravelPost[]> {
    try {
        const posts = await prisma.travelPost.findMany({
            include: { user: true, linkedListing: true },
            orderBy: { createdAt: 'desc' },
        });
        return posts.map((p) => {
            const user = p.user ? adaptUser(p.user) : undefined;
            const listing = p.linkedListing ? adaptListing(p.linkedListing) : undefined;
            return adaptPost(p, user, listing);
        });
    } catch { return mock.TRAVEL_POSTS; }
}

export async function getListings(): Promise<Listing[]> {
    try {
        const listings = await prisma.listing.findMany({
            where: { isActive: true },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
        return listings.map((l) => {
            const user = l.user ? adaptUser(l.user) : undefined;
            return adaptListing(l, user);
        });
    } catch { return mock.LISTINGS.map((l) => ({ ...l, user: mock.USERS.find((u) => u.id === l.userId) })); }
}

export async function getMatches(userId: string) {
    try {
        const matches = await prisma.match.findMany({
            where: { OR: [{ userAId: userId }, { userBId: userId }] },
            include: { userA: true, userB: true, listingA: true, listingB: true, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
            orderBy: { updatedAt: 'desc' },
        });
        return matches.map((m) => ({
            id: m.id, status: m.status as 'pending' | 'accepted' | 'completed' | 'expired' | 'disputed',
            userA: adaptUser(m.userA), userB: adaptUser(m.userB),
            listingA: adaptListing(m.listingA), listingB: adaptListing(m.listingB),
            lastMessage: m.messages[0]?.body || '',
            createdAt: m.createdAt.toISOString(),
        }));
    } catch { return mock.MATCHES; }
}

export async function getCurrentUser(userId: string): Promise<User | null> {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        return user ? adaptUser(user) : null;
    } catch { return mock.CURRENT_USER; }
}

export async function getKarmaLog(userId: string): Promise<KarmaEntry[]> {
    try {
        const entries = await prisma.karmaEntry.findMany({
            where: { userId }, orderBy: { createdAt: 'desc' }, take: 10,
        });
        return entries.map((e) => ({
            id: e.id, userId: e.userId,
            action: e.action as KarmaEntry['action'],
            points: e.points, description: e.description,
            createdAt: e.createdAt.toISOString(),
        }));
    } catch { return mock.KARMA_LOG; }
}

export async function getSwapBuddies(userId: string): Promise<User[]> {
    try {
        const buddies = await prisma.swapBuddy.findMany({
            where: { OR: [{ userAId: userId }, { userBId: userId }] },
            include: { userA: true, userB: true },
        });
        return buddies.map((b) => adaptUser(b.userAId === userId ? b.userB : b.userA));
    } catch { return []; }
}
