import { User, Listing, Match, DropZone, SwapCircle, TravelPost, KarmaEntry } from './types';

// ─── Mock Users ──────────────────────────────────────────────

export const USERS: User[] = [
    {
        id: 'u1', email: 'maya@example.com', displayName: 'Maya Chen',
        avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Maya',
        gender: 'female', preferredSizes: ['S', 'M'], preferredStyles: ['tops', 'dresses'],
        currentLocation: { lat: 48.8566, lng: 2.3522 }, currentCity: 'Paris', country: 'France',
        bio: 'Backpacking through Europe 🌍 Trading fashion as I go!',
        rating: 4.8, totalTrades: 23, createdAt: '2025-11-15T10:00:00Z',
        karmaPoints: 680, trustTier: 'gold', verifiedAt: '2025-11-20T00:00:00Z',
        citiesVisited: ['Paris', 'Barcelona', 'Lisbon', 'Berlin', 'Amsterdam'],
        swapBuddyIds: ['u2', 'u7', 'u0'], completedTrades: 18,
    },
    {
        id: 'u2', email: 'liam@example.com', displayName: 'Liam Okafor',
        avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Liam',
        gender: 'male', preferredSizes: ['L', 'XL'], preferredStyles: ['tops', 'outerwear'],
        currentLocation: { lat: 41.3874, lng: 2.1686 }, currentCity: 'Barcelona', country: 'Spain',
        bio: 'Digital nomad 💻 Love vintage finds and street style.',
        rating: 4.6, totalTrades: 15, createdAt: '2025-12-01T08:00:00Z',
        karmaPoints: 340, trustTier: 'silver', verifiedAt: '2025-12-10T00:00:00Z',
        citiesVisited: ['Barcelona', 'Berlin', 'Bangkok'],
        swapBuddyIds: ['u1', 'u4'], completedTrades: 10,
    },
    {
        id: 'u3', email: 'sofia@example.com', displayName: 'Sofía Rivera',
        avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Sofia',
        gender: 'female', preferredSizes: ['XS', 'S'], preferredStyles: ['dresses', 'accessories'],
        currentLocation: { lat: 19.4326, lng: -99.1332 }, currentCity: 'Mexico City', country: 'Mexico',
        bio: 'Artsy traveler 🎨 Always looking for unique pieces.',
        rating: 4.9, totalTrades: 31, createdAt: '2025-10-20T14:00:00Z',
        karmaPoints: 1250, trustTier: 'gold', verifiedAt: '2025-10-25T00:00:00Z',
        citiesVisited: ['Mexico City', 'Oaxaca', 'Lisbon', 'Paris', 'Tokyo', 'Bali'],
        swapBuddyIds: ['u7', 'u5'], completedTrades: 25,
    },
    {
        id: 'u4', email: 'kai@example.com', displayName: 'Kai Tanaka',
        avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Kai',
        gender: 'non-binary', preferredSizes: ['M', 'L'], preferredStyles: ['activewear', 'outerwear'],
        currentLocation: { lat: 35.6762, lng: 139.6503 }, currentCity: 'Tokyo', country: 'Japan',
        bio: 'Minimalist packer ✈️ One bag, maximum style.',
        rating: 4.7, totalTrades: 19, createdAt: '2026-01-05T09:00:00Z',
        karmaPoints: 520, trustTier: 'gold', verifiedAt: '2026-01-10T00:00:00Z',
        citiesVisited: ['Tokyo', 'Seoul', 'Bangkok', 'Chiang Mai'],
        swapBuddyIds: ['u2', 'u8'], completedTrades: 14,
    },
    {
        id: 'u5', email: 'zara@example.com', displayName: 'Zara Mensah',
        avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Zara',
        gender: 'female', preferredSizes: ['M'], preferredStyles: ['tops', 'bottoms', 'swimwear'],
        currentLocation: { lat: -33.8688, lng: 151.2093 }, currentCity: 'Sydney', country: 'Australia',
        bio: 'Surf & sun 🌊 Swapping winter for summer gear!',
        rating: 4.5, totalTrades: 11, createdAt: '2026-01-20T12:00:00Z',
        karmaPoints: 180, trustTier: 'silver', verifiedAt: '2026-01-25T00:00:00Z',
        citiesVisited: ['Sydney', 'Melbourne', 'Bali'],
        swapBuddyIds: ['u3'], completedTrades: 7,
    },
    {
        id: 'u6', email: 'marco@example.com', displayName: 'Marco Bianchi',
        avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Marco',
        gender: 'male', preferredSizes: ['M', 'L'], preferredStyles: ['bottoms', 'shoes'],
        currentLocation: { lat: 45.4642, lng: 9.19 }, currentCity: 'Milan', country: 'Italy',
        bio: 'Fashion capital traveler 🇮🇹 Sustainable style advocate.',
        rating: 4.4, totalTrades: 8, createdAt: '2026-02-01T07:00:00Z',
        karmaPoints: 90, trustTier: 'bronze',
        citiesVisited: ['Milan', 'Rome'], swapBuddyIds: [], completedTrades: 5,
    },
    {
        id: 'u7', email: 'ines@example.com', displayName: 'Inês Ferreira',
        avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Ines',
        gender: 'female', preferredSizes: ['S', 'M'], preferredStyles: ['dresses', 'swimwear'],
        currentLocation: { lat: 38.7223, lng: -9.1393 }, currentCity: 'Lisbon', country: 'Portugal',
        bio: 'Beach lover 🏖️ Trading layered looks for sundresses.',
        rating: 4.9, totalTrades: 27, createdAt: '2025-09-10T11:00:00Z',
        karmaPoints: 890, trustTier: 'gold', verifiedAt: '2025-09-15T00:00:00Z',
        citiesVisited: ['Lisbon', 'Porto', 'Paris', 'Barcelona', 'Marrakech'],
        swapBuddyIds: ['u1', 'u3', 'u0'], completedTrades: 21,
    },
    {
        id: 'u8', email: 'alex@example.com', displayName: 'Alex Park',
        avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Alex',
        gender: 'non-binary', preferredSizes: ['S', 'M'], preferredStyles: ['tops', 'accessories', 'activewear'],
        currentLocation: { lat: 37.5665, lng: 126.978 }, currentCity: 'Seoul', country: 'South Korea',
        bio: 'K-fashion enthusiast 🇰🇷 Mixing streetwear with trad.',
        rating: 4.8, totalTrades: 22, createdAt: '2025-11-25T06:00:00Z',
        karmaPoints: 610, trustTier: 'gold', verifiedAt: '2025-12-01T00:00:00Z',
        citiesVisited: ['Seoul', 'Tokyo', 'Osaka', 'Bangkok'],
        swapBuddyIds: ['u4'], completedTrades: 17,
    },
];

// ─── Mock Listings ───────────────────────────────────────────

export const LISTINGS: Listing[] = [
    {
        id: 'l1', userId: 'u1',
        title: 'Vintage Silk Blouse',
        description: 'Gorgeous ivory silk blouse from a Paris flea market. Perfect for warm evenings. Barely worn.',
        category: 'tops', size: 'S', genderTarget: 'womens', condition: 'like_new',
        brand: 'Sézane', colors: ['ivory', 'cream'],
        pricingType: 'fixed', price: 18, currency: 'EUR',
        location: { lat: 48.8566, lng: 2.3522 }, city: 'Paris', country: 'France',
        images: [
            { id: 'img1a', url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop', sortOrder: 0 },
            { id: 'img1b', url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=800&fit=crop', sortOrder: 1 },
        ],
        isActive: true, createdAt: '2026-02-10T14:00:00Z',
    },
    {
        id: 'l2', userId: 'u2',
        title: 'Weatherproof Trail Jacket',
        description: 'North Face shell, perfect for rainy hikes. Has ventilation zips. Packing light so letting this go.',
        category: 'outerwear', size: 'L', genderTarget: 'mens', condition: 'good',
        brand: 'The North Face', colors: ['navy', 'black'],
        pricingType: 'negotiable', price: 35, currency: 'EUR',
        location: { lat: 41.3874, lng: 2.1686 }, city: 'Barcelona', country: 'Spain',
        images: [
            { id: 'img2a', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop', sortOrder: 0 },
        ],
        isActive: true, createdAt: '2026-02-12T09:00:00Z', dropZoneId: 'dz2',
    },
    {
        id: 'l3', userId: 'u3',
        title: 'Embroidered Mexican Dress',
        description: 'Handmade embroidered cotton dress from Oaxaca. Beautiful floral patterns. One-of-a-kind.',
        category: 'dresses', size: 'S', genderTarget: 'womens', condition: 'new_with_tags',
        brand: 'Artisan', colors: ['white', 'multicolor'],
        pricingType: 'fixed', price: 25, currency: 'USD',
        location: { lat: 19.4326, lng: -99.1332 }, city: 'Mexico City', country: 'Mexico',
        images: [
            { id: 'img3a', url: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=800&fit=crop', sortOrder: 0 },
        ],
        isActive: true, createdAt: '2026-02-15T16:00:00Z',
    },
    {
        id: 'l4', userId: 'u4',
        title: 'Merino Wool Running Top',
        description: 'Ultra-light Smartwool base layer. Perfect for mountain stays. Odor-resistant.',
        category: 'activewear', size: 'M', genderTarget: 'unisex', condition: 'like_new',
        brand: 'Smartwool', colors: ['charcoal'],
        pricingType: 'free', price: null, currency: 'JPY',
        location: { lat: 35.6762, lng: 139.6503 }, city: 'Tokyo', country: 'Japan',
        images: [
            { id: 'img4a', url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=800&fit=crop', sortOrder: 0 },
        ],
        isActive: true, createdAt: '2026-02-18T08:00:00Z',
    },
    {
        id: 'l5', userId: 'u5',
        title: 'Tropical Print Board Shorts',
        description: 'Quick-dry board shorts with bold palm print. Great for Bondi vibes.',
        category: 'swimwear', size: 'M', genderTarget: 'mens', condition: 'good',
        brand: 'Rip Curl', colors: ['teal', 'coral'],
        pricingType: 'fixed', price: 12, currency: 'AUD',
        location: { lat: -33.8688, lng: 151.2093 }, city: 'Sydney', country: 'Australia',
        images: [
            { id: 'img5a', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=800&fit=crop', sortOrder: 0 },
        ],
        isActive: true, createdAt: '2026-02-19T10:00:00Z',
    },
    {
        id: 'l6', userId: 'u6',
        title: 'Italian Leather Loafers',
        description: 'Handcrafted in Florence. Cognac leather, size EU 43. A few scuffs but tons of life left.',
        category: 'shoes', size: 'L', genderTarget: 'mens', condition: 'fair',
        brand: 'Gucci', colors: ['cognac', 'brown'],
        pricingType: 'negotiable', price: 45, currency: 'EUR',
        location: { lat: 45.4642, lng: 9.19 }, city: 'Milan', country: 'Italy',
        images: [
            { id: 'img6a', url: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=600&h=800&fit=crop', sortOrder: 0 },
        ],
        isActive: true, createdAt: '2026-02-20T07:30:00Z',
    },
    {
        id: 'l7', userId: 'u7',
        title: 'Linen Wrap Sundress',
        description: 'Flowy linen dress perfect for Lisbon summers. Adjustable tie waist, side pockets!',
        category: 'dresses', size: 'M', genderTarget: 'womens', condition: 'like_new',
        brand: 'Zara', colors: ['terracotta'],
        pricingType: 'fixed', price: 15, currency: 'EUR',
        location: { lat: 38.7223, lng: -9.1393 }, city: 'Lisbon', country: 'Portugal',
        images: [
            { id: 'img7a', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop', sortOrder: 0 },
        ],
        isActive: true, createdAt: '2026-02-20T11:00:00Z', dropZoneId: 'dz4',
    },
    {
        id: 'l8', userId: 'u8',
        title: 'Oversized Streetwear Hoodie',
        description: 'Korean streetwear brand. Washed black, boxy fit. The comfiest hoodie for travel days.',
        category: 'tops', size: 'L', genderTarget: 'unisex', condition: 'good',
        brand: 'Ader Error', colors: ['washed-black'],
        pricingType: 'negotiable', price: 30, currency: 'KRW',
        location: { lat: 37.5665, lng: 126.978 }, city: 'Seoul', country: 'South Korea',
        images: [
            { id: 'img8a', url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop', sortOrder: 0 },
        ],
        isActive: true, createdAt: '2026-02-21T06:00:00Z',
    },
    {
        id: 'l9', userId: 'u1',
        title: 'Canvas Tote Bag',
        description: 'Sturdy organic cotton tote. Has an inner zip pocket. Great for markets & day trips.',
        category: 'accessories', size: 'ONE_SIZE', genderTarget: 'unisex', condition: 'new_with_tags',
        brand: 'Muji', colors: ['natural', 'beige'],
        pricingType: 'free', price: null, currency: 'EUR',
        location: { lat: 48.8566, lng: 2.3522 }, city: 'Paris', country: 'France',
        images: [
            { id: 'img9a', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=800&fit=crop', sortOrder: 0 },
        ],
        isActive: true, createdAt: '2026-02-21T08:00:00Z', dropZoneId: 'dz1',
    },
    {
        id: 'l10', userId: 'u3',
        title: 'Woven Straw Hat',
        description: 'Wide-brim sun hat, perfect for beach days or exploring ruins. Packs flat.',
        category: 'accessories', size: 'ONE_SIZE', genderTarget: 'unisex', condition: 'good',
        brand: 'Handmade', colors: ['straw', 'natural'],
        pricingType: 'fixed', price: 8, currency: 'USD',
        location: { lat: 19.4326, lng: -99.1332 }, city: 'Mexico City', country: 'Mexico',
        images: [
            { id: 'img10a', url: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=800&fit=crop', sortOrder: 0 },
        ],
        isActive: true, createdAt: '2026-02-21T09:00:00Z',
    },
    {
        id: 'l11', userId: 'u5',
        title: 'High-Waisted Cargo Pants',
        description: 'Olive cargo pants with adjustable hems. So many pockets for travel essentials.',
        category: 'bottoms', size: 'M', genderTarget: 'womens', condition: 'like_new',
        brand: 'Uniqlo', colors: ['olive'],
        pricingType: 'fixed', price: 20, currency: 'AUD',
        location: { lat: -33.8688, lng: 151.2093 }, city: 'Sydney', country: 'Australia',
        images: [
            { id: 'img11a', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop', sortOrder: 0 },
        ],
        isActive: true, createdAt: '2026-02-21T10:00:00Z',
    },
    {
        id: 'l12', userId: 'u4',
        title: 'Lightweight Down Vest',
        description: 'Packable Uniqlo down vest. Rolls into its own pocket. Surprisingly warm.',
        category: 'outerwear', size: 'M', genderTarget: 'unisex', condition: 'good',
        brand: 'Uniqlo', colors: ['black'],
        pricingType: 'fixed', price: 15, currency: 'JPY',
        location: { lat: 35.6762, lng: 139.6503 }, city: 'Tokyo', country: 'Japan',
        images: [
            { id: 'img12a', url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop', sortOrder: 0 },
        ],
        isActive: true, createdAt: '2026-02-21T11:00:00Z',
    },
];

// ─── Current User (your profile) ────────────────────────────

export const CURRENT_USER: User = {
    id: 'u0', email: 'you@ropa.trade', displayName: 'You',
    avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Traveler',
    gender: 'prefer-not-to-say', preferredSizes: ['M', 'L'],
    preferredStyles: ['tops', 'outerwear', 'bottoms'],
    currentLocation: { lat: 48.8566, lng: 2.3522 }, currentCity: 'Paris', country: 'France',
    bio: 'Exploring the world one swap at a time 🌎',
    rating: 4.7, totalTrades: 12, createdAt: '2025-08-01T00:00:00Z',
    karmaPoints: 420, trustTier: 'silver', verifiedAt: '2025-08-10T00:00:00Z',
    citiesVisited: ['Paris', 'Barcelona', 'Lisbon', 'Bangkok', 'Tokyo', 'Berlin'],
    swapBuddyIds: ['u1', 'u7', 'u4'], completedTrades: 8,
};

// ─── Mock Matches ────────────────────────────────────────────

export const MATCHES: Match[] = [
    {
        id: 'm1', userA: CURRENT_USER, userB: USERS[0],
        listingA: LISTINGS[3], listingB: LISTINGS[0],
        status: 'accepted',
        lastMessage: 'Hey! Want to meet at Café de Flore tomorrow? ☕',
        lastMessageAt: '2026-02-21T14:30:00Z', createdAt: '2026-02-20T18:00:00Z',
    },
    {
        id: 'm2', userA: CURRENT_USER, userB: USERS[6],
        listingA: LISTINGS[10], listingB: LISTINGS[6],
        status: 'pending',
        lastMessage: 'Love your style! Are you near Bairro Alto?',
        lastMessageAt: '2026-02-21T10:00:00Z', createdAt: '2026-02-21T09:00:00Z',
    },
    {
        id: 'm3', userA: CURRENT_USER, userB: USERS[3],
        listingA: LISTINGS[7], listingB: LISTINGS[3],
        status: 'completed',
        lastMessage: 'Thanks for the swap! Safe travels 🙏',
        lastMessageAt: '2026-02-19T20:00:00Z', createdAt: '2026-02-18T15:00:00Z',
    },
];

// ─── Drop Zones ──────────────────────────────────────────────

export const DROP_ZONES: DropZone[] = [
    {
        id: 'dz1', name: 'Le Marais Backpackers', type: 'hostel',
        address: '11 Rue du Temple, 75004 Paris', city: 'Paris', country: 'France',
        location: { lat: 48.8588, lng: 2.3513 },
        imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop',
        activeListings: 14, hours: '08:00–22:00',
        description: 'Swap shelf in the common room — browse before breakfast!',
        partnerSince: '2025-11-01',
    },
    {
        id: 'dz2', name: 'Nomad Hub Barcelona', type: 'coworking',
        address: 'Carrer de Pallars 85, 08018 Barcelona', city: 'Barcelona', country: 'Spain',
        location: { lat: 41.3976, lng: 2.1910 },
        imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&h=400&fit=crop',
        activeListings: 22, hours: '07:00–23:00',
        description: 'Dedicated rack by the coffee bar. Scan, grab, go.',
        partnerSince: '2025-12-15',
    },
    {
        id: 'dz3', name: 'Bangkok Bed Station', type: 'hostel',
        address: '113 Rambuttri Rd, Phra Nakhon, Bangkok', city: 'Bangkok', country: 'Thailand',
        location: { lat: 13.7633, lng: 100.4968 },
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop',
        activeListings: 31, hours: '24/7',
        description: 'Rooftop swap shelf with Khao San Road views 🌆',
        partnerSince: '2026-01-01',
    },
    {
        id: 'dz4', name: 'Alfama Coffee & Swap', type: 'cafe',
        address: 'Rua de São Miguel 23, 1100 Lisbon', city: 'Lisbon', country: 'Portugal',
        location: { lat: 38.7120, lng: -9.1300 },
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop',
        activeListings: 9, hours: '09:00–19:00',
        description: 'Cozy café in Alfama with a curated swap corner.',
        partnerSince: '2026-01-20',
    },
    {
        id: 'dz5', name: 'Berlin Kreuzberg Hostel', type: 'hostel',
        address: 'Oranienstraße 34, 10999 Berlin', city: 'Berlin', country: 'Germany',
        location: { lat: 52.5010, lng: 13.4230 },
        imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop',
        activeListings: 18, hours: '08:00–23:00',
        description: 'Vintage finds in the lobby. Kreuzberg style, naturally.',
        partnerSince: '2026-02-01',
    },
    {
        id: 'dz6', name: 'Shibuya Work Lounge', type: 'coworking',
        address: '1-21-3 Jinnan, Shibuya, Tokyo', city: 'Tokyo', country: 'Japan',
        location: { lat: 35.6620, lng: 139.6990 },
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
        activeListings: 12, hours: '09:00–21:00',
        description: 'Minimalist swap corner near the standing desks.',
        partnerSince: '2026-02-10',
    },
];

// ─── Swap Circles ────────────────────────────────────────────

export const SWAP_CIRCLES: SwapCircle[] = [
    {
        id: 'sc1', title: 'Paris Spring Swap Night',
        description: 'Bring 3–5 items you no longer need. Swap, sip wine, and meet fellow travelers in Le Marais.',
        city: 'Paris', country: 'France', venue: 'Le Marais Backpackers', venueType: 'hostel',
        date: '2026-03-01', time: '19:00–21:30',
        capacity: 30, attendeeCount: 22,
        attendeeAvatars: [USERS[0].avatarUrl, USERS[6].avatarUrl, CURRENT_USER.avatarUrl],
        hostUserId: 'u1',
        imageUrl: 'https://images.unsplash.com/photo-1529543544282-ea57407bc2f7?w=600&h=400&fit=crop',
        isFull: false, isPast: false,
        tags: ['Spring Collection', 'Wine & Swap', 'Tops & Dresses'],
    },
    {
        id: 'sc2', title: 'Barcelona Beach Swap',
        description: 'End-of-winter clearance! Meet at Nomad Hub and swap your layers for summer essentials.',
        city: 'Barcelona', country: 'Spain', venue: 'Nomad Hub Barcelona', venueType: 'coworking',
        date: '2026-03-08', time: '17:00–20:00',
        capacity: 25, attendeeCount: 25,
        attendeeAvatars: [USERS[1].avatarUrl, USERS[5].avatarUrl],
        hostUserId: 'u2',
        imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&h=400&fit=crop',
        isFull: true, isPast: false,
        tags: ['Summer Prep', 'Outerwear', 'Swimwear'],
    },
    {
        id: 'sc3', title: 'Tokyo Minimalist Exchange',
        description: 'Marie Kondo meets ROPA. Spark joy by swapping instead of throwing away. Max 5 items per person.',
        city: 'Tokyo', country: 'Japan', venue: 'Shibuya Work Lounge', venueType: 'coworking',
        date: '2026-03-15', time: '14:00–17:00',
        capacity: 20, attendeeCount: 11,
        attendeeAvatars: [USERS[3].avatarUrl, USERS[7].avatarUrl],
        hostUserId: 'u4',
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
        isFull: false, isPast: false,
        tags: ['Minimalism', 'Activewear', 'Kondo Method'],
    },
    {
        id: 'sc4', title: 'Lisbon Sunset Swap',
        description: 'Last month\'s event was a blast! We swapped 80+ items. Check out the photo gallery below.',
        city: 'Lisbon', country: 'Portugal', venue: 'Alfama Coffee & Swap', venueType: 'cafe',
        date: '2026-02-15', time: '18:00–20:30',
        capacity: 20, attendeeCount: 20,
        attendeeAvatars: [USERS[6].avatarUrl, USERS[2].avatarUrl, USERS[4].avatarUrl],
        hostUserId: 'u7',
        imageUrl: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&h=400&fit=crop',
        isFull: true, isPast: true,
        tags: ['Sunset Vibes', 'Dresses', '80+ Items'],
    },
];

// ─── Travel Feed Posts ───────────────────────────────────────

export const TRAVEL_POSTS: TravelPost[] = [
    {
        id: 'tp1', userId: 'u1', user: USERS[0],
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop',
        caption: 'Swapped my denim jacket for this gorgeous silk blouse at Le Marais Backpackers! 🤍 Feeling very Parisian now. The swap shelf there is a goldmine.',
        linkedListingId: 'l1', linkedListing: LISTINGS[0],
        likes: 47, commentCount: 8, city: 'Paris', country: 'France',
        createdAt: '2026-02-20T16:00:00Z', tags: ['Paris', 'VintageFind', 'DropZone'],
    },
    {
        id: 'tp2', userId: 'u4', user: USERS[3],
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop',
        caption: 'Minimalist exchange in Shibuya 🗾 Traded my running top for a down vest. One bag life never felt so warm.',
        linkedListingId: 'l12', linkedListing: LISTINGS[11],
        likes: 32, commentCount: 5, city: 'Tokyo', country: 'Japan',
        createdAt: '2026-02-19T14:00:00Z', tags: ['Tokyo', 'OneBagLife', 'Minimalist'],
    },
    {
        id: 'tp3', userId: 'u7', user: USERS[6],
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop',
        caption: 'Lisbon sunset swap was INCREDIBLE 🌅 Met 20 amazing travelers and came home with a whole new wardrobe. Can\'t wait for the next circle!',
        likes: 89, commentCount: 15, city: 'Lisbon', country: 'Portugal',
        createdAt: '2026-02-16T20:00:00Z', tags: ['Lisbon', 'SwapCircle', 'Sunset'],
    },
    {
        id: 'tp4', userId: 'u3', user: USERS[2],
        imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=600&fit=crop',
        caption: 'This handmade Oaxacan dress found a new home today 🌸 Swapped it for the cutest straw hat. Fashion is better when it travels.',
        linkedListingId: 'l3', linkedListing: LISTINGS[2],
        likes: 63, commentCount: 11, city: 'Mexico City', country: 'Mexico',
        createdAt: '2026-02-18T11:00:00Z', tags: ['MexicoCity', 'Handmade', 'CircularFashion'],
    },
    {
        id: 'tp5', userId: 'u2', user: USERS[1],
        imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=600&fit=crop',
        caption: 'Left my jacket at the Nomad Hub Drop Zone. Within 2 hours it was claimed! 🧥➡️ Someone\'s rainy day is sorted.',
        linkedListingId: 'l2', linkedListing: LISTINGS[1],
        likes: 28, commentCount: 4, city: 'Barcelona', country: 'Spain',
        createdAt: '2026-02-17T09:00:00Z', tags: ['Barcelona', 'DropZone', 'PayItForward'],
    },
    {
        id: 'tp6', userId: 'u5', user: USERS[4],
        imageUrl: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=600&h=600&fit=crop',
        caption: 'Bondi to Bali wardrobe swap complete! 🌊 Board shorts → sarong → sundress. Traveling light hits different.',
        likes: 41, commentCount: 7, city: 'Sydney', country: 'Australia',
        createdAt: '2026-02-15T13:00:00Z', tags: ['Sydney', 'Bondi', 'TravelLight'],
    },
    {
        id: 'tp7', userId: 'u8', user: USERS[7],
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=600&fit=crop',
        caption: 'K-fashion finds at Seoul swap circle 🇰🇷 This Ader Error hoodie? Swapped for a tee I got in Bangkok. The circle of style continues.',
        linkedListingId: 'l8', linkedListing: LISTINGS[7],
        likes: 55, commentCount: 9, city: 'Seoul', country: 'South Korea',
        createdAt: '2026-02-14T18:00:00Z', tags: ['Seoul', 'KFashion', 'Streetwear'],
    },
    {
        id: 'tp8', userId: 'u6', user: USERS[5],
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop',
        caption: 'Milan fashion week... on a ROPA budget 💅 These Gucci loafers? $45 negotiated down from a fellow traveler. Sustainable luxury.',
        linkedListingId: 'l6', linkedListing: LISTINGS[5],
        likes: 72, commentCount: 13, city: 'Milan', country: 'Italy',
        createdAt: '2026-02-20T10:00:00Z', tags: ['Milan', 'Luxury', 'SustainableFashion'],
    },
];

// ─── Karma Log ───────────────────────────────────────────────

export const KARMA_LOG: KarmaEntry[] = [
    { id: 'k1', userId: 'u0', action: 'complete_swap', points: 20, description: 'Completed swap with Kai Tanaka', createdAt: '2026-02-19T20:00:00Z' },
    { id: 'k2', userId: 'u0', action: 'leave_review', points: 5, description: 'Left a review for Kai', createdAt: '2026-02-19T20:05:00Z' },
    { id: 'k3', userId: 'u0', action: 'five_star_received', points: 15, description: 'Maya Chen gave you ⭐⭐⭐⭐⭐', createdAt: '2026-02-20T10:00:00Z' },
    { id: 'k4', userId: 'u0', action: 'list_free_item', points: 10, description: 'Listed "Canvas Tote Bag" for free', createdAt: '2026-02-21T08:00:00Z' },
    { id: 'k5', userId: 'u0', action: 'travel_post', points: 10, description: 'Shared a swap story', createdAt: '2026-02-21T09:00:00Z' },
    { id: 'k6', userId: 'u0', action: 'attend_circle', points: 30, description: 'Attended Lisbon Sunset Swap', createdAt: '2026-02-15T20:30:00Z' },
    { id: 'k7', userId: 'u0', action: 'refer_friend', points: 50, description: 'Referred Liam Okafor', createdAt: '2026-01-15T12:00:00Z' },
    { id: 'k8', userId: 'u0', action: 'complete_swap', points: 20, description: 'Completed swap with Inês Ferreira', createdAt: '2026-01-20T18:00:00Z' },
    { id: 'k9', userId: 'u0', action: 'complete_swap', points: 20, description: 'Completed swap with Maya Chen', createdAt: '2025-12-30T15:00:00Z' },
    { id: 'k10', userId: 'u0', action: 'list_free_item', points: 10, description: 'Listed "Old hiking boots" for free', createdAt: '2025-12-01T10:00:00Z' },
];

// ─── Utility ─────────────────────────────────────────────────

export function getUser(id: string): User | undefined {
    if (id === CURRENT_USER.id) return CURRENT_USER;
    return USERS.find((u) => u.id === id);
}

export function getUserListings(userId: string): Listing[] {
    return LISTINGS.filter((l) => l.userId === userId);
}

export function getListingsForFeed(excludeUserId: string): Listing[] {
    return LISTINGS.filter((l) => l.userId !== excludeUserId && l.isActive);
}

export function getDropZone(id: string): DropZone | undefined {
    return DROP_ZONES.find((dz) => dz.id === id);
}

export function getDropZonesByCity(city: string): DropZone[] {
    return DROP_ZONES.filter((dz) => dz.city === city);
}

export function getUpcomingCircles(): SwapCircle[] {
    return SWAP_CIRCLES.filter((sc) => !sc.isPast);
}

export function getPastCircles(): SwapCircle[] {
    return SWAP_CIRCLES.filter((sc) => sc.isPast);
}
