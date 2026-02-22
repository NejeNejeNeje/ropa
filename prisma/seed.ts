import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding ROPA database...');

    // Clean existing data (idempotent — safe to re-run)
    console.log('🧹 Cleaning existing data...');
    await prisma.offer.deleteMany();
    await prisma.swipe.deleteMany();
    await prisma.message.deleteMany();
    await prisma.review.deleteMany();
    await prisma.match.deleteMany();
    await prisma.circleRSVP.deleteMany();
    await prisma.swapCircle.deleteMany();
    await prisma.travelPost.deleteMany();
    await prisma.karmaEntry.deleteMany();
    await prisma.swapBuddy.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.offerItem.deleteMany();
    await prisma.swapRequest.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.dropZone.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // ─── Users ───
    const password = await hash('ropa2026', 12);
    const testPassword = await hash('test1234', 12);
    const adminPassword = await hash('admin1234', 12);

    const u0 = await prisma.user.upsert({
        where: { email: 'you@ropa.trade' },
        update: {},
        create: {
            email: 'you@ropa.trade', name: 'You', password,
            image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Traveler',
            bio: 'Exploring the world one swap at a time 🌎',
            gender: 'prefer-not-to-say', currentCity: 'Paris', country: 'France',
            lat: 48.8566, lng: 2.3522,
            karmaPoints: 420, trustTier: 'silver', rating: 4.7,
            totalTrades: 12, completedTrades: 8,
            verifiedAt: new Date('2025-08-10'),
            preferredSizes: JSON.stringify(['M', 'L']),
            preferredStyles: JSON.stringify(['tops', 'outerwear', 'bottoms']),
            citiesVisited: JSON.stringify(['Paris', 'Barcelona', 'Lisbon', 'Bangkok', 'Tokyo', 'Berlin']),
        },
    });

    // ─── Test Users (for quick-login testing) ───
    const testUsersData = [
        { email: 'test1@ropa.trade', name: 'Test User 1', password: testPassword, role: 'user', image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=TestOne', bio: 'Test account #1 🧪', currentCity: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, karmaPoints: 100, trustTier: 'bronze', rating: 4.0, totalTrades: 3, completedTrades: 2 },
        { email: 'test2@ropa.trade', name: 'Test User 2', password: testPassword, role: 'user', image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=TestTwo', bio: 'Test account #2 🧪', currentCity: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, karmaPoints: 250, trustTier: 'silver', rating: 4.3, totalTrades: 7, completedTrades: 5 },
        { email: 'test3@ropa.trade', name: 'Test User 3', password: testPassword, role: 'user', image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=TestThree', bio: 'Test account #3 🧪', currentCity: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, karmaPoints: 50, trustTier: 'bronze', rating: 3.8, totalTrades: 1, completedTrades: 1 },
        { email: 'admin@ropa.trade', name: 'ROPA Admin', password: adminPassword, role: 'admin', image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Admin', bio: 'Platform administrator 🛡️', currentCity: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194, karmaPoints: 9999, trustTier: 'gold', rating: 5.0, totalTrades: 0, completedTrades: 0, verifiedAt: new Date('2025-01-01') },
    ];

    for (const data of testUsersData) {
        await prisma.user.upsert({
            where: { email: data.email },
            update: {},
            create: data,
        });
    }
    console.log(`   ✅ Created ${testUsersData.length} test users (incl. admin)`);


    const usersData = [
        { email: 'maya@example.com', name: 'Maya Chen', image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Maya', bio: 'Backpacking through Europe 🌍 Trading fashion as I go!', gender: 'female', currentCity: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, karmaPoints: 680, trustTier: 'gold', rating: 4.8, totalTrades: 23, completedTrades: 18, verifiedAt: new Date('2025-11-20'), preferredSizes: '["S","M"]', preferredStyles: '["tops","dresses"]', citiesVisited: '["Paris","Barcelona","Lisbon","Berlin","Amsterdam"]' },
        { email: 'liam@example.com', name: 'Liam Okafor', image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Liam', bio: 'Digital nomad 💻 Love vintage finds and street style.', gender: 'male', currentCity: 'Barcelona', country: 'Spain', lat: 41.3874, lng: 2.1686, karmaPoints: 340, trustTier: 'silver', rating: 4.6, totalTrades: 15, completedTrades: 10, verifiedAt: new Date('2025-12-10'), preferredSizes: '["L","XL"]', preferredStyles: '["tops","outerwear"]', citiesVisited: '["Barcelona","Berlin","Bangkok"]' },
        { email: 'sofia@example.com', name: 'Sofía Rivera', image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Sofia', bio: 'Artsy traveler 🎨 Always looking for unique pieces.', gender: 'female', currentCity: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, karmaPoints: 1250, trustTier: 'gold', rating: 4.9, totalTrades: 31, completedTrades: 25, verifiedAt: new Date('2025-10-25'), preferredSizes: '["XS","S"]', preferredStyles: '["dresses","accessories"]', citiesVisited: '["Mexico City","Oaxaca","Lisbon","Paris","Tokyo","Bali"]' },
        { email: 'kai@example.com', name: 'Kai Tanaka', image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Kai', bio: 'Minimalist packer ✈️ One bag, maximum style.', gender: 'non-binary', currentCity: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, karmaPoints: 520, trustTier: 'gold', rating: 4.7, totalTrades: 19, completedTrades: 14, verifiedAt: new Date('2026-01-10'), preferredSizes: '["M","L"]', preferredStyles: '["activewear","outerwear"]', citiesVisited: '["Tokyo","Seoul","Bangkok","Chiang Mai"]' },
        { email: 'zara@example.com', name: 'Zara Mensah', image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Zara', bio: 'Surf & sun 🌊 Swapping winter for summer gear!', gender: 'female', currentCity: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, karmaPoints: 180, trustTier: 'silver', rating: 4.5, totalTrades: 11, completedTrades: 7, verifiedAt: new Date('2026-01-25'), preferredSizes: '["M"]', preferredStyles: '["tops","bottoms","swimwear"]', citiesVisited: '["Sydney","Melbourne","Bali"]' },
        { email: 'marco@example.com', name: 'Marco Bianchi', image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Marco', bio: 'Fashion capital traveler 🇮🇹 Sustainable style advocate.', gender: 'male', currentCity: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.19, karmaPoints: 90, trustTier: 'bronze', rating: 4.4, totalTrades: 8, completedTrades: 5, preferredSizes: '["M","L"]', preferredStyles: '["bottoms","shoes"]', citiesVisited: '["Milan","Rome"]' },
        { email: 'ines@example.com', name: 'Inês Ferreira', image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Ines', bio: 'Beach lover 🏖️ Trading layered looks for sundresses.', gender: 'female', currentCity: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, karmaPoints: 890, trustTier: 'gold', rating: 4.9, totalTrades: 27, completedTrades: 21, verifiedAt: new Date('2025-09-15'), preferredSizes: '["S","M"]', preferredStyles: '["dresses","swimwear"]', citiesVisited: '["Lisbon","Porto","Paris","Barcelona","Marrakech"]' },
        { email: 'alex@example.com', name: 'Alex Park', image: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Alex', bio: 'K-fashion enthusiast 🇰🇷 Mixing streetwear with trad.', gender: 'non-binary', currentCity: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.978, karmaPoints: 610, trustTier: 'gold', rating: 4.8, totalTrades: 22, completedTrades: 17, verifiedAt: new Date('2025-12-01'), preferredSizes: '["S","M"]', preferredStyles: '["tops","accessories","activewear"]', citiesVisited: '["Seoul","Tokyo","Osaka","Bangkok"]' },
    ];

    const users = [];
    for (const data of usersData) {
        const u = await prisma.user.upsert({
            where: { email: data.email },
            update: {},
            create: { ...data, password },
        });
        users.push(u);
    }
    const [maya, liam, sofia, kai, zara, marco, ines, alex] = users;

    // ─── Drop Zones ───
    const dzData = [
        { name: 'Le Marais Backpackers', type: 'hostel', address: '11 Rue du Temple, 75004 Paris', city: 'Paris', country: 'France', lat: 48.8588, lng: 2.3513, imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop', activeListings: 14, hours: '08:00–22:00', description: 'Swap shelf in the common room — browse before breakfast!', partnerSince: new Date('2025-11-01') },
        { name: 'Nomad Hub Barcelona', type: 'coworking', address: 'Carrer de Pallars 85, 08018 Barcelona', city: 'Barcelona', country: 'Spain', lat: 41.3976, lng: 2.1910, imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&h=400&fit=crop', activeListings: 22, hours: '07:00–23:00', description: 'Dedicated rack by the coffee bar. Scan, grab, go.', partnerSince: new Date('2025-12-15') },
        { name: 'Bangkok Bed Station', type: 'hostel', address: '113 Rambuttri Rd, Phra Nakhon, Bangkok', city: 'Bangkok', country: 'Thailand', lat: 13.7633, lng: 100.4968, imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop', activeListings: 31, hours: '24/7', description: 'Rooftop swap shelf with Khao San Road views 🌆', partnerSince: new Date('2026-01-01') },
        { name: 'Alfama Coffee & Swap', type: 'cafe', address: 'Rua de São Miguel 23, 1100 Lisbon', city: 'Lisbon', country: 'Portugal', lat: 38.7120, lng: -9.1300, imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop', activeListings: 9, hours: '09:00–19:00', description: 'Cozy café in Alfama with a curated swap corner.', partnerSince: new Date('2026-01-20') },
        { name: 'Berlin Kreuzberg Hostel', type: 'hostel', address: 'Oranienstraße 34, 10999 Berlin', city: 'Berlin', country: 'Germany', lat: 52.5010, lng: 13.4230, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop', activeListings: 18, hours: '08:00–23:00', description: 'Vintage finds in the lobby. Kreuzberg style, naturally.', partnerSince: new Date('2026-02-01') },
        { name: 'Shibuya Work Lounge', type: 'coworking', address: '1-21-3 Jinnan, Shibuya, Tokyo', city: 'Tokyo', country: 'Japan', lat: 35.6620, lng: 139.6990, imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop', activeListings: 12, hours: '09:00–21:00', description: 'Minimalist swap corner near the standing desks.', partnerSince: new Date('2026-02-10') },
    ];

    const dropZones = [];
    for (const dz of dzData) {
        const zone = await prisma.dropZone.create({ data: dz });
        dropZones.push(zone);
    }

    // ─── Listings ───
    const listingsData = [
        { userId: maya.id, title: 'Vintage Silk Blouse', description: 'Gorgeous ivory silk blouse from a Paris flea market.', category: 'tops', size: 'S', genderTarget: 'womens', condition: 'like_new', brand: 'Sézane', colors: '["ivory","cream"]', pricingType: 'fixed', price: 18, currency: 'EUR', city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, images: JSON.stringify([{ id: 'img1a', url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop', sortOrder: 0 }]) },
        { userId: liam.id, title: 'Weatherproof Trail Jacket', description: 'North Face shell, perfect for rainy hikes.', category: 'outerwear', size: 'L', genderTarget: 'mens', condition: 'good', brand: 'The North Face', colors: '["navy","black"]', pricingType: 'negotiable', price: 35, currency: 'EUR', city: 'Barcelona', country: 'Spain', lat: 41.3874, lng: 2.1686, images: JSON.stringify([{ id: 'img2a', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop', sortOrder: 0 }]), dropZoneId: dropZones[1].id },
        { userId: sofia.id, title: 'Embroidered Mexican Dress', description: 'Handmade embroidered cotton dress from Oaxaca.', category: 'dresses', size: 'S', genderTarget: 'womens', condition: 'new_with_tags', brand: 'Artisan', colors: '["white","multicolor"]', pricingType: 'fixed', price: 25, currency: 'USD', city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, images: JSON.stringify([{ id: 'img3a', url: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=800&fit=crop', sortOrder: 0 }]) },
        { userId: kai.id, title: 'Merino Wool Running Top', description: 'Ultra-light Smartwool base layer.', category: 'activewear', size: 'M', genderTarget: 'unisex', condition: 'like_new', brand: 'Smartwool', colors: '["charcoal"]', pricingType: 'free', currency: 'JPY', city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, images: JSON.stringify([{ id: 'img4a', url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=800&fit=crop', sortOrder: 0 }]) },
        { userId: zara.id, title: 'Tropical Print Board Shorts', description: 'Quick-dry board shorts with bold palm print.', category: 'swimwear', size: 'M', genderTarget: 'mens', condition: 'good', brand: 'Rip Curl', colors: '["teal","coral"]', pricingType: 'fixed', price: 12, currency: 'AUD', city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, images: JSON.stringify([{ id: 'img5a', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=800&fit=crop', sortOrder: 0 }]) },
        { userId: marco.id, title: 'Italian Leather Loafers', description: 'Handcrafted in Florence. Cognac leather.', category: 'shoes', size: 'L', genderTarget: 'mens', condition: 'fair', brand: 'Gucci', colors: '["cognac","brown"]', pricingType: 'negotiable', price: 45, currency: 'EUR', city: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.19, images: JSON.stringify([{ id: 'img6a', url: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=600&h=800&fit=crop', sortOrder: 0 }]) },
        { userId: ines.id, title: 'Linen Wrap Sundress', description: 'Flowy linen dress perfect for Lisbon summers.', category: 'dresses', size: 'M', genderTarget: 'womens', condition: 'like_new', brand: 'Zara', colors: '["terracotta"]', pricingType: 'fixed', price: 15, currency: 'EUR', city: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, images: JSON.stringify([{ id: 'img7a', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop', sortOrder: 0 }]), dropZoneId: dropZones[3].id },
        { userId: alex.id, title: 'Oversized Streetwear Hoodie', description: 'Korean streetwear brand. Washed black, boxy fit.', category: 'tops', size: 'L', genderTarget: 'unisex', condition: 'good', brand: 'Ader Error', colors: '["washed-black"]', pricingType: 'negotiable', price: 30, currency: 'KRW', city: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.978, images: JSON.stringify([{ id: 'img8a', url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop', sortOrder: 0 }]) },
        { userId: maya.id, title: 'Canvas Tote Bag', description: 'Sturdy organic cotton tote.', category: 'accessories', size: 'ONE_SIZE', genderTarget: 'unisex', condition: 'new_with_tags', brand: 'Muji', colors: '["natural","beige"]', pricingType: 'free', currency: 'EUR', city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, images: JSON.stringify([{ id: 'img9a', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=800&fit=crop', sortOrder: 0 }]), dropZoneId: dropZones[0].id },
        { userId: sofia.id, title: 'Woven Straw Hat', description: 'Wide-brim sun hat, perfect for beach days.', category: 'accessories', size: 'ONE_SIZE', genderTarget: 'unisex', condition: 'good', brand: 'Handmade', colors: '["straw","natural"]', pricingType: 'fixed', price: 8, currency: 'USD', city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, images: JSON.stringify([{ id: 'img10a', url: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=800&fit=crop', sortOrder: 0 }]) },
        { userId: zara.id, title: 'High-Waisted Cargo Pants', description: 'Olive cargo pants with adjustable hems.', category: 'bottoms', size: 'M', genderTarget: 'womens', condition: 'like_new', brand: 'Uniqlo', colors: '["olive"]', pricingType: 'fixed', price: 20, currency: 'AUD', city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, images: JSON.stringify([{ id: 'img11a', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop', sortOrder: 0 }]) },
        { userId: kai.id, title: 'Lightweight Down Vest', description: 'Packable Uniqlo down vest.', category: 'outerwear', size: 'M', genderTarget: 'unisex', condition: 'good', brand: 'Uniqlo', colors: '["black"]', pricingType: 'fixed', price: 15, currency: 'JPY', city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, images: JSON.stringify([{ id: 'img12a', url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop', sortOrder: 0 }]) },
        // u0's own listings (so Selling tab has offers)
        { userId: u0.id, title: 'Broken-In Denim Jacket', description: 'Classic Levis trucker jacket, beautifully worn in from 6 months of backpacking.', category: 'outerwear', size: 'M', genderTarget: 'unisex', condition: 'good', brand: "Levi's", colors: '["indigo","blue"]', pricingType: 'negotiable', price: 28, currency: 'EUR', city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, images: JSON.stringify([{ id: 'img13a', url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=800&fit=crop', sortOrder: 0 }]), dropZoneId: dropZones[0].id },
        { userId: u0.id, title: 'Patagonia Fleece Vest', description: 'Better Sweater vest in sage green. Perfect layering piece.', category: 'outerwear', size: 'L', genderTarget: 'unisex', condition: 'like_new', brand: 'Patagonia', colors: '["sage","green"]', pricingType: 'fixed', price: 22, currency: 'EUR', city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, images: JSON.stringify([{ id: 'img14a', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop', sortOrder: 0 }]) },
    ];

    const listings = [];
    for (const data of listingsData) {
        const l = await prisma.listing.create({ data });
        listings.push(l);
    }

    // ─── Matches ───
    await prisma.match.createMany({
        data: [
            { userAId: u0.id, userBId: maya.id, listingAId: listings[3].id, listingBId: listings[0].id, status: 'accepted' },
            { userAId: u0.id, userBId: ines.id, listingAId: listings[10].id, listingBId: listings[6].id, status: 'pending' },
            { userAId: u0.id, userBId: kai.id, listingAId: listings[7].id, listingBId: listings[3].id, status: 'completed' },
        ],
    });

    const matches = await prisma.match.findMany();

    // ─── Messages ───
    await prisma.message.createMany({
        data: [
            { matchId: matches[0].id, senderId: maya.id, body: 'Hey! Want to meet at Café de Flore tomorrow? ☕' },
            { matchId: matches[1].id, senderId: ines.id, body: 'Love your style! Are you near Bairro Alto?' },
            { matchId: matches[2].id, senderId: kai.id, body: 'Thanks for the swap! Safe travels 🙏' },
        ],
    });

    // ─── Swap Circles ───
    const circlesData = [
        { title: 'Paris Spring Swap Night', description: 'Bring 3–5 items you no longer need.', city: 'Paris', country: 'France', venue: 'Le Marais Backpackers', venueType: 'hostel', date: new Date('2026-03-01'), time: '19:00–21:30', capacity: 30, imageUrl: 'https://images.unsplash.com/photo-1529543544282-ea57407bc2f7?w=600&h=400&fit=crop', hostUserId: maya.id, tags: '["Spring Collection","Wine & Swap"]' },
        { title: 'Barcelona Beach Swap', description: 'End-of-winter clearance!', city: 'Barcelona', country: 'Spain', venue: 'Nomad Hub Barcelona', venueType: 'coworking', date: new Date('2026-03-08'), time: '17:00–20:00', capacity: 25, imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&h=400&fit=crop', hostUserId: liam.id, isFull: true, tags: '["Summer Prep","Outerwear"]' },
        { title: 'Tokyo Minimalist Exchange', description: 'Marie Kondo meets ROPA.', city: 'Tokyo', country: 'Japan', venue: 'Shibuya Work Lounge', venueType: 'coworking', date: new Date('2026-03-15'), time: '14:00–17:00', capacity: 20, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop', hostUserId: kai.id, tags: '["Minimalism","Activewear"]' },
        { title: 'Lisbon Sunset Swap', description: 'Last month\'s event was a blast!', city: 'Lisbon', country: 'Portugal', venue: 'Alfama Coffee & Swap', venueType: 'cafe', date: new Date('2026-02-15'), time: '18:00–20:30', capacity: 20, imageUrl: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&h=400&fit=crop', hostUserId: ines.id, isFull: true, isPast: true, tags: '["Sunset Vibes","Dresses"]' },
    ];

    for (const data of circlesData) {
        await prisma.swapCircle.create({ data });
    }

    // ─── Travel Posts ───
    const postsData = [
        { userId: maya.id, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop', caption: 'Swapped my denim jacket for this gorgeous silk blouse at Le Marais Backpackers! 🤍', linkedListingId: listings[0].id, likes: 47, commentCount: 8, city: 'Paris', country: 'France', tags: '["Paris","VintageFind","DropZone"]' },
        { userId: kai.id, imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop', caption: 'Minimalist exchange in Shibuya 🗾 Traded my running top for a down vest.', linkedListingId: listings[11].id, likes: 32, commentCount: 5, city: 'Tokyo', country: 'Japan', tags: '["Tokyo","OneBagLife"]' },
        { userId: ines.id, imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop', caption: 'Lisbon sunset swap was INCREDIBLE 🌅', likes: 89, commentCount: 15, city: 'Lisbon', country: 'Portugal', tags: '["Lisbon","SwapCircle"]' },
        { userId: sofia.id, imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=600&fit=crop', caption: 'This handmade Oaxacan dress found a new home today 🌸', linkedListingId: listings[2].id, likes: 63, commentCount: 11, city: 'Mexico City', country: 'Mexico', tags: '["MexicoCity","Handmade"]' },
        { userId: liam.id, imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=600&fit=crop', caption: 'Left my jacket at the Nomad Hub Drop Zone. Within 2 hours it was claimed! 🧥', linkedListingId: listings[1].id, likes: 28, commentCount: 4, city: 'Barcelona', country: 'Spain', tags: '["Barcelona","DropZone"]' },
        { userId: zara.id, imageUrl: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=600&h=600&fit=crop', caption: 'Bondi to Bali wardrobe swap complete! 🌊', likes: 41, commentCount: 7, city: 'Sydney', country: 'Australia', tags: '["Sydney","TravelLight"]' },
        { userId: alex.id, imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=600&fit=crop', caption: 'K-fashion finds at Seoul swap circle 🇰🇷', linkedListingId: listings[7].id, likes: 55, commentCount: 9, city: 'Seoul', country: 'South Korea', tags: '["Seoul","KFashion"]' },
        { userId: marco.id, imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop', caption: 'Milan fashion week on a ROPA budget 💅', linkedListingId: listings[5].id, likes: 72, commentCount: 13, city: 'Milan', country: 'Italy', tags: '["Milan","SustainableFashion"]' },
    ];

    for (const data of postsData) {
        await prisma.travelPost.create({ data });
    }

    // ─── Karma Log ───
    await prisma.karmaEntry.createMany({
        data: [
            { userId: u0.id, action: 'complete_swap', points: 20, description: 'Completed swap with Kai Tanaka' },
            { userId: u0.id, action: 'leave_review', points: 5, description: 'Left a review for Kai' },
            { userId: u0.id, action: 'five_star_received', points: 15, description: 'Maya Chen gave you ⭐⭐⭐⭐⭐' },
            { userId: u0.id, action: 'list_free_item', points: 10, description: 'Listed "Canvas Tote Bag" for free' },
            { userId: u0.id, action: 'travel_post', points: 10, description: 'Shared a swap story' },
            { userId: u0.id, action: 'attend_circle', points: 30, description: 'Attended Lisbon Sunset Swap' },
            { userId: u0.id, action: 'refer_friend', points: 50, description: 'Referred Liam Okafor' },
            { userId: u0.id, action: 'complete_swap', points: 20, description: 'Completed swap with Inês Ferreira' },
            { userId: u0.id, action: 'complete_swap', points: 20, description: 'Completed swap with Maya Chen' },
            { userId: u0.id, action: 'list_free_item', points: 10, description: 'Listed "Old hiking boots" for free' },
        ],
    });

    // ─── Swap Buddies ───
    await prisma.swapBuddy.createMany({
        data: [
            { userAId: u0.id, userBId: maya.id },
            { userAId: u0.id, userBId: ines.id },
            { userAId: u0.id, userBId: kai.id },
            { userAId: maya.id, userBId: liam.id },
            { userAId: maya.id, userBId: ines.id },
            { userAId: kai.id, userBId: alex.id },
            { userAId: sofia.id, userBId: zara.id },
        ],
    });

    // ─── Swipes ───
    await prisma.swipe.createMany({
        data: [
            // Only 2 swipes for u0 — leaves most items visible in feed
            { swiperId: u0.id, listingId: listings[0].id, direction: 'RIGHT' },
            { swiperId: u0.id, listingId: listings[1].id, direction: 'LEFT' },
            { swiperId: maya.id, listingId: listings[3].id, direction: 'RIGHT' },
            { swiperId: liam.id, listingId: listings[0].id, direction: 'RIGHT' },
            { swiperId: sofia.id, listingId: listings[7].id, direction: 'RIGHT' },
            { swiperId: kai.id, listingId: listings[6].id, direction: 'RIGHT' },
        ],
    });

    // ─── Offers (Swipe Auction data) ───
    const offersData = [
        // Pending offers on Maya's blouse (for u0 seller view)
        { buyerId: liam.id, sellerId: maya.id, listingId: listings[0].id, offerType: 'MATCH', amount: 18, currency: 'EUR', status: 'pending', expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000), sellerScore: 0.72, distanceKm: 850 },
        { buyerId: sofia.id, sellerId: maya.id, listingId: listings[0].id, offerType: 'OVERBID', amount: 22, currency: 'EUR', status: 'pending', expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000), sellerScore: 0.58, distanceKm: 9200 },
        // Countered offer — u0 offered on Marco's loafers, seller countered
        { buyerId: u0.id, sellerId: marco.id, listingId: listings[5].id, offerType: 'UNDERBID', amount: 30, currency: 'EUR', status: 'countered', counterAmount: 40, expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), sellerScore: 0.65, distanceKm: 640 },
        // Accepted offer — u0 offered on Inês's dress, accepted
        { buyerId: u0.id, sellerId: ines.id, listingId: listings[6].id, offerType: 'MATCH', amount: 15, currency: 'EUR', status: 'accepted', acceptedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), expiresAt: new Date(Date.now() + 21 * 60 * 60 * 1000), sellerScore: 0.81, distanceKm: 1240 },
        // Pending offer — u0 offered on Alex's hoodie
        { buyerId: u0.id, sellerId: alex.id, listingId: listings[7].id, offerType: 'UNDERBID', amount: 22, currency: 'KRW', status: 'pending', expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000), sellerScore: 0.55, distanceKm: 8800 },
        // Declined offer — u0 offered on Sofia's dress
        { buyerId: u0.id, sellerId: sofia.id, listingId: listings[2].id, offerType: 'UNDERBID', amount: 15, currency: 'USD', status: 'declined', declinedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000), sellerScore: 0.48, distanceKm: 9500 },
        // === Offers WHERE u0 IS THE SELLER (appear in Selling tab) ===
        { buyerId: maya.id, sellerId: u0.id, listingId: listings[12].id, offerType: 'OVERBID', amount: 32, currency: 'EUR', status: 'pending', expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000), sellerScore: 0.82, distanceKm: 0 },
        { buyerId: kai.id, sellerId: u0.id, listingId: listings[12].id, offerType: 'UNDERBID', amount: 20, currency: 'EUR', status: 'pending', expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000), sellerScore: 0.61, distanceKm: 9700 },
        { buyerId: liam.id, sellerId: u0.id, listingId: listings[13].id, offerType: 'MATCH', amount: 22, currency: 'EUR', status: 'pending', expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000), sellerScore: 0.75, distanceKm: 850 },
        // Pending offer — Kai offered on Zara's cargo pants
        { buyerId: kai.id, sellerId: zara.id, listingId: listings[10].id, offerType: 'OVERBID', amount: 25, currency: 'AUD', status: 'pending', expiresAt: new Date(Date.now() + 15 * 60 * 60 * 1000), sellerScore: 0.69, distanceKm: 7800 },
        // Expired offer
        { buyerId: alex.id, sellerId: liam.id, listingId: listings[1].id, offerType: 'MATCH', amount: 35, currency: 'EUR', status: 'expired', expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000), sellerScore: 0.61, distanceKm: 8900 },
    ];

    for (const data of offersData) {
        await prisma.offer.create({ data });
    }

    // ─── Cleanup TravelSwap tables ───
    await prisma.wishlistItem.deleteMany();
    await prisma.offerItem.deleteMany();
    await prisma.swapRequest.deleteMany();

    // ─── TravelSwap Requests ───
    // Bilateral match: u0 needs outerwear+gear, offers swimwear+tops
    // Maya needs swimwear+accessories, offers outerwear+tops → bilateral with u0!
    await prisma.swapRequest.create({
        data: {
            userId: u0.id, city: 'Paris', destination: 'Zurich',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            needs: {
                create: [
                    { category: 'outerwear', description: 'Warm jacket for the Alps' },
                    { category: 'gear', description: 'Hiking daypack' },
                ]
            },
            offers: {
                create: [
                    { category: 'swimwear', description: 'Board shorts and rash guard' },
                    { category: 'tops', description: 'Linen shirts' },
                ]
            },
        },
    });

    await prisma.swapRequest.create({
        data: {
            userId: maya.id, city: 'Paris', destination: 'Bali',
            expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            needs: {
                create: [
                    { category: 'swimwear', description: 'Anything for the beach!' },
                    { category: 'accessories', description: 'Sun hat or sunglasses' },
                ]
            },
            offers: {
                create: [
                    { category: 'outerwear', description: 'Wool peacoat, barely worn' },
                    { category: 'tops', description: 'Cashmere sweater' },
                ]
            },
        },
    });

    // Partial match: Liam needs outerwear (matches u0's need) but offers gear (not what u0 needs directly)
    await prisma.swapRequest.create({
        data: {
            userId: liam.id, city: 'Paris', destination: 'Berlin',
            expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
            needs: {
                create: [
                    { category: 'electronics', description: 'EU power adapter' },
                    { category: 'books_guides', description: 'Berlin travel guide' },
                ]
            },
            offers: {
                create: [
                    { category: 'gear', description: 'Travel towel' },
                    { category: 'footwear', description: 'Trail runners size L' },
                ]
            },
        },
    });

    // Another partial: Ines has swimwear u0 needs but needs toiletries
    await prisma.swapRequest.create({
        data: {
            userId: ines.id, city: 'Paris', destination: 'Marrakech',
            expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            needs: {
                create: [
                    { category: 'toiletries', description: 'Sunscreen and moisturizer' },
                    { category: 'accessories', description: 'Scarf or bandana' },
                ]
            },
            offers: {
                create: [
                    { category: 'swimwear', description: 'One-piece swimsuit size S' },
                    { category: 'bottoms', description: 'Linen trousers' },
                ]
            },
        },
    });

    // Kai in Paris too — needs tops, offers electronics
    await prisma.swapRequest.create({
        data: {
            userId: kai.id, city: 'Paris', destination: 'Lisbon',
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            needs: {
                create: [
                    { category: 'tops', description: 'Light t-shirts' },
                    { category: 'footwear', description: 'Sandals' },
                ]
            },
            offers: {
                create: [
                    { category: 'electronics', description: 'Universal adapter' },
                    { category: 'outerwear', description: 'Fleece pullover' },
                ]
            },
        },
    });

    console.log('✅ Seed complete!');
    console.log(`   ${await prisma.user.count()} users`);
    console.log(`   ${await prisma.listing.count()} listings`);
    console.log(`   ${await prisma.swipe.count()} swipes`);
    console.log(`   ${await prisma.offer.count()} offers`);
    console.log(`   ${await prisma.match.count()} matches`);
    console.log(`   ${await prisma.dropZone.count()} drop zones`);
    console.log(`   ${await prisma.swapCircle.count()} swap circles`);
    console.log(`   ${await prisma.travelPost.count()} travel posts`);
    console.log(`   ${await prisma.karmaEntry.count()} karma entries`);
    console.log(`   ${await prisma.swapBuddy.count()} swap buddies`);
    console.log(`   ${await prisma.swapRequest.count()} swap requests`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
