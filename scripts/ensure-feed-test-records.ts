import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const targetVisible = Number.parseInt(process.env.FEED_TEST_RECORD_TARGET ?? '108', 10);
const testUserEmail = process.env.FEED_TEST_USER_EMAIL ?? 'test3@ropa.trade';
const sellerCount = Number.parseInt(process.env.FEED_TEST_SELLER_COUNT ?? '6', 10);
const testPassword = process.env.FEED_TEST_PASSWORD ?? 'test1234';
const listingPrefix = 'ROPA Feed Test';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`Usage:
  DATABASE_URL="postgresql://..." npm run db:ensure-feed-test-records

Optional environment variables:
  FEED_TEST_USER_EMAIL      Defaults to test3@ropa.trade
  FEED_TEST_RECORD_TARGET   Defaults to 108
  FEED_TEST_SELLER_COUNT    Defaults to 6
  FEED_TEST_PASSWORD        Defaults to test1234`);
    process.exit(0);
}

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required. This script is non-destructive, but it needs an explicit database target.');
    process.exit(1);
}

const berlin = {
    city: 'Berlin',
    country: 'Germany',
    lat: 52.52,
    lng: 13.405,
};

const catalog = [
    { title: 'Packable Rain Shell', category: 'outerwear', size: 'M', genderTarget: 'unisex', condition: 'good', brand: 'Arcade Trail', colors: ['navy', 'black'], pricingType: 'fixed', price: 24, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop' },
    { title: 'Linen Travel Shirt', category: 'tops', size: 'S', genderTarget: 'womens', condition: 'like_new', brand: 'Nomad Linen', colors: ['white', 'cream'], pricingType: 'fixed', price: 16, image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop' },
    { title: 'Compression Packing Hoodie', category: 'tops', size: 'L', genderTarget: 'unisex', condition: 'good', brand: 'Wayfarer', colors: ['gray'], pricingType: 'negotiable', price: 29, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop' },
    { title: 'Market Day Tote', category: 'accessories', size: 'ONE_SIZE', genderTarget: 'unisex', condition: 'new_with_tags', brand: 'Muji', colors: ['natural', 'beige'], pricingType: 'free', price: null, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=800&fit=crop' },
    { title: 'City Walking Loafers', category: 'shoes', size: 'M', genderTarget: 'mens', condition: 'fair', brand: 'Roma Works', colors: ['brown'], pricingType: 'negotiable', price: 35, image: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=600&h=800&fit=crop' },
    { title: 'Wrap Sundress', category: 'dresses', size: 'M', genderTarget: 'womens', condition: 'like_new', brand: 'Zara', colors: ['red'], pricingType: 'fixed', price: 18, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop' },
    { title: 'Cargo Travel Pants', category: 'bottoms', size: 'M', genderTarget: 'unisex', condition: 'good', brand: 'Uniqlo', colors: ['olive'], pricingType: 'fixed', price: 21, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop' },
    { title: 'Sun Hat', category: 'accessories', size: 'ONE_SIZE', genderTarget: 'unisex', condition: 'good', brand: 'Handmade', colors: ['straw'], pricingType: 'fixed', price: 9, image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=800&fit=crop' },
    { title: 'Merino Base Layer', category: 'activewear', size: 'M', genderTarget: 'unisex', condition: 'like_new', brand: 'Smartwool', colors: ['charcoal'], pricingType: 'free', price: null, image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=800&fit=crop' },
    { title: 'Light Down Vest', category: 'outerwear', size: 'M', genderTarget: 'unisex', condition: 'good', brand: 'Uniqlo', colors: ['black'], pricingType: 'fixed', price: 15, image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop' },
    { title: 'Denim Trucker Jacket', category: 'outerwear', size: 'L', genderTarget: 'unisex', condition: 'good', brand: "Levi's", colors: ['blue'], pricingType: 'negotiable', price: 28, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=800&fit=crop' },
    { title: 'Board Shorts', category: 'swimwear', size: 'M', genderTarget: 'mens', condition: 'good', brand: 'Rip Curl', colors: ['teal', 'coral'], pricingType: 'fixed', price: 12, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=800&fit=crop' },
] as const;

async function main() {
    if (!Number.isFinite(targetVisible) || targetVisible < 9) {
        throw new Error('FEED_TEST_RECORD_TARGET must be a number >= 9.');
    }
    if (!Number.isFinite(sellerCount) || sellerCount < 1) {
        throw new Error('FEED_TEST_SELLER_COUNT must be a number >= 1.');
    }

    const password = await hash(testPassword, 12);

    const testUser = await prisma.user.upsert({
        where: { email: testUserEmail },
        update: {
            currentCity: berlin.city,
            country: berlin.country,
            lat: berlin.lat,
            lng: berlin.lng,
        },
        create: {
            email: testUserEmail,
            name: 'Test User 3',
            password,
            image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=TestThree',
            bio: 'Feed batch testing account.',
            currentCity: berlin.city,
            country: berlin.country,
            lat: berlin.lat,
            lng: berlin.lng,
            karmaPoints: 50,
            trustTier: 'bronze',
            rating: 3.8,
            totalTrades: 1,
            completedTrades: 1,
        },
    });

    const sellers: User[] = [];
    for (let index = 1; index <= sellerCount; index += 1) {
        sellers.push(await prisma.user.upsert({
            where: { email: `feed-test-seller-${index}@ropa.trade` },
            update: {
                currentCity: berlin.city,
                country: berlin.country,
                lat: berlin.lat,
                lng: berlin.lng,
            },
            create: {
                email: `feed-test-seller-${index}@ropa.trade`,
                name: `Feed Test Seller ${index}`,
                password,
                image: `https://api.dicebear.com/9.x/adventurer/svg?seed=FeedSeller${index}`,
                bio: 'Dedicated seller account for feed batch testing.',
                currentCity: berlin.city,
                country: berlin.country,
                lat: berlin.lat,
                lng: berlin.lng,
                karmaPoints: 200 + index * 10,
                trustTier: index % 3 === 0 ? 'gold' : index % 2 === 0 ? 'silver' : 'bronze',
                rating: 4.1 + (index % 5) * 0.1,
                totalTrades: 5 + index,
                completedTrades: 3 + index,
            },
        }));
    }

    const swipedIds = await prisma.swipe.findMany({
        where: { swiperId: testUser.id },
        select: { listingId: true },
    });

    const visibleWhere: Prisma.ListingWhereInput = {
        isActive: true,
        userId: { not: testUser.id },
    };
    if (swipedIds.length > 0) {
        visibleWhere.id = { notIn: swipedIds.map((swipe) => swipe.listingId) };
    }

    const visibleBefore = await prisma.listing.count({ where: visibleWhere });
    const needed = Math.max(0, targetVisible - visibleBefore);

    if (needed > 0) {
        const existingTopUpCount = await prisma.listing.count({
            where: { title: { startsWith: listingPrefix } },
        });

        const records: Prisma.ListingCreateManyInput[] = Array.from({ length: needed }, (_, offset) => {
            const sequence = existingTopUpCount + offset + 1;
            const item = catalog[(sequence - 1) % catalog.length];
            const seller = sellers[(sequence - 1) % sellers.length];
            const createdAt = new Date(Date.now() - offset * 60_000);

            return {
                userId: seller.id,
                title: `${listingPrefix} ${String(sequence).padStart(3, '0')} - ${item.title}`,
                description: `Extra active listing for repeated 9-card feed like/dislike testing. Batch seed #${sequence}.`,
                category: item.category,
                size: item.size,
                genderTarget: item.genderTarget,
                condition: item.condition,
                brand: item.brand,
                colors: JSON.stringify(item.colors),
                pricingType: item.pricingType,
                price: item.price,
                currency: 'EUR',
                city: berlin.city,
                country: berlin.country,
                lat: berlin.lat,
                lng: berlin.lng,
                images: JSON.stringify([{ id: `feed-test-${sequence}`, url: item.image, sortOrder: 0 }]),
                isActive: true,
                createdAt,
                updatedAt: createdAt,
            };
        });

        await prisma.listing.createMany({ data: records });
    }

    const visibleAfter = await prisma.listing.count({ where: visibleWhere });
    const totalListings = await prisma.listing.count();

    console.log(`Feed test records ready for ${testUserEmail}.`);
    console.log(`Visible unswiped active listings before: ${visibleBefore}`);
    console.log(`Added listings: ${needed}`);
    console.log(`Visible unswiped active listings after: ${visibleAfter}`);
    console.log(`Total listings in database: ${totalListings}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
