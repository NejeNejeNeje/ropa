// ─── Domain Types ────────────────────────────────────────────

export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories'
  | 'swimwear'
  | 'activewear';

export type ClothingSize =
  | 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | 'ONE_SIZE';

export type GenderTarget = 'mens' | 'womens' | 'unisex';

export type Condition =
  | 'new_with_tags'
  | 'like_new'
  | 'good'
  | 'fair'
  | 'well_loved';

export type PricingType = 'free' | 'fixed' | 'negotiable';

export type SwipeDirection = 'left' | 'right' | 'super';

export type MatchStatus = 'pending' | 'accepted' | 'completed' | 'expired' | 'disputed';

export type TrustTier = 'bronze' | 'silver' | 'gold';

export type DropZoneType = 'hostel' | 'coworking' | 'cafe';

export type KarmaAction =
  | 'list_free_item'
  | 'complete_swap'
  | 'attend_circle'
  | 'leave_review'
  | 'five_star_received'
  | 'refer_friend'
  | 'travel_post'
  | 'travelswap_complete';

// ─── TravelSwap Exchange Types ──────────────────────────────

export type ItemCategory =
  | 'outerwear'
  | 'tops'
  | 'bottoms'
  | 'footwear'
  | 'swimwear'
  | 'accessories'
  | 'gear'
  | 'books_guides'
  | 'electronics'
  | 'toiletries';

export type SwapRequestStatus = 'active' | 'matched' | 'completed' | 'expired' | 'cancelled';

export interface WishlistItem {
  id: string;
  swapRequestId: string;
  category: ItemCategory;
  description: string;
  sizeRange: string;
  isFlexible: boolean;
}

export interface OfferItem {
  id: string;
  swapRequestId: string;
  listingId?: string;
  category: ItemCategory;
  description: string;
  sizeRange: string;
}

export interface SwapRequest {
  id: string;
  userId: string;
  user?: User;
  city: string;
  destination: string;
  status: SwapRequestStatus;
  expiresAt?: string;
  createdAt: string;
  needs: WishlistItem[];
  offers: OfferItem[];
}

// ─── Core Entities ───────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  preferredSizes: ClothingSize[];
  preferredStyles: ClothingCategory[];
  currentLocation: { lat: number; lng: number };
  currentCity: string;
  country: string;
  bio: string;
  rating: number;
  totalTrades: number;
  createdAt: string;
  // ─── Phase 1 Fields ──────
  karmaPoints: number;
  trustTier: TrustTier;
  verifiedAt?: string;
  citiesVisited: string[];
  swapBuddyIds: string[];
  completedTrades: number;
}

export interface ListingImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface Listing {
  id: string;
  userId: string;
  user?: User;
  title: string;
  description: string;
  category: ClothingCategory;
  size: ClothingSize;
  genderTarget: GenderTarget;
  condition: Condition;
  brand: string;
  colors: string[];
  pricingType: PricingType;
  price: number | null;
  currency: string;
  location: { lat: number; lng: number };
  city: string;
  country: string;
  images: ListingImage[];
  isActive: boolean;
  createdAt: string;
  dropZoneId?: string;
}

export interface Swipe {
  id: string;
  swiperId: string;
  listingId: string;
  direction: SwipeDirection;
  createdAt: string;
}

export interface Match {
  id: string;
  userA: User;
  userB: User;
  listingA: Listing;
  listingB: Listing;
  status: MatchStatus;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  imageUrl?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  matchId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ─── Phase 1 Feature Types ──────────────────────────────────

export interface DropZone {
  id: string;
  name: string;
  type: DropZoneType;
  address: string;
  city: string;
  country: string;
  location: { lat: number; lng: number };
  imageUrl: string;
  activeListings: number;
  hours: string;
  description: string;
  partnerSince: string;
}

export interface SwapCircle {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  venue: string;
  venueType: DropZoneType;
  date: string;
  time: string;
  capacity: number;
  attendeeCount: number;
  attendeeAvatars: string[];
  hostUserId: string;
  imageUrl: string;
  isFull: boolean;
  isPast: boolean;
  tags: string[];
}

export interface TravelPost {
  id: string;
  userId: string;
  user?: User;
  imageUrl: string;
  caption: string;
  linkedListingId?: string;
  linkedListing?: Listing;
  likes: number;
  commentCount: number;
  city: string;
  country: string;
  createdAt: string;
  tags: string[];
}

export interface KarmaEntry {
  id: string;
  userId: string;
  action: KarmaAction;
  points: number;
  description: string;
  createdAt: string;
}

// ─── Karma Config ────────────────────────────────────────────

export const KARMA_POINTS: Record<KarmaAction, number> = {
  list_free_item: 10,
  complete_swap: 20,
  attend_circle: 30,
  leave_review: 5,
  five_star_received: 15,
  refer_friend: 50,
  travel_post: 10,
  travelswap_complete: 40,
};

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, { label: string; emoji: string }> = {
  outerwear: { label: 'Outerwear', emoji: '🧥' },
  tops: { label: 'Tops', emoji: '👕' },
  bottoms: { label: 'Bottoms', emoji: '👖' },
  footwear: { label: 'Footwear', emoji: '👟' },
  swimwear: { label: 'Swimwear', emoji: '🩱' },
  accessories: { label: 'Accessories', emoji: '🎒' },
  gear: { label: 'Gear', emoji: '🏕️' },
  books_guides: { label: 'Books & Guides', emoji: '📖' },
  electronics: { label: 'Electronics', emoji: '🔌' },
  toiletries: { label: 'Toiletries', emoji: '🧴' },
};

export const KARMA_TIERS = [
  { name: '🌱 Seedling', min: 0, perks: 'Basic access' },
  { name: '🌿 Explorer', min: 100, perks: 'Advanced filters' },
  { name: '🌳 Nomad', min: 500, perks: '3 free Boosts/month' },
  { name: '🌍 Legend', min: 2000, perks: 'ROPA+ free 1 month' },
] as const;

export const TRUST_TIER_CONFIG: Record<TrustTier, { label: string; emoji: string; color: string; requirement: string }> = {
  bronze: { label: 'Bronze', emoji: '🛡️', color: '#cd7f32', requirement: 'Email verified' },
  silver: { label: 'Silver', emoji: '🛡️', color: '#c0c0c0', requirement: 'Photo ID verified' },
  gold: { label: 'Gold', emoji: '🛡️', color: '#ffd700', requirement: '10+ swaps, 4.5+ rating' },
};

// ─── UI Helpers ──────────────────────────────────────────────

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  tops: '👕 Tops',
  bottoms: '👖 Bottoms',
  dresses: '👗 Dresses',
  outerwear: '🧥 Outerwear',
  shoes: '👟 Shoes',
  accessories: '🎒 Accessories',
  swimwear: '🩱 Swimwear',
  activewear: '🏃 Activewear',
};

export const CATEGORY_EMOJI: Record<ClothingCategory, string> = {
  tops: '👕',
  bottoms: '👖',
  dresses: '👗',
  outerwear: '🧥',
  shoes: '👟',
  accessories: '🎒',
  swimwear: '🩱',
  activewear: '🏃',
};

export const SIZE_ORDER: ClothingSize[] = [
  'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'ONE_SIZE',
];

export const CONDITION_LABELS: Record<Condition, string> = {
  new_with_tags: 'New with Tags',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  well_loved: 'Well Loved',
};

export const CONDITION_COLORS: Record<Condition, string> = {
  new_with_tags: '#10b981',
  like_new: '#34d399',
  good: '#fbbf24',
  fair: '#f97316',
  well_loved: '#ef4444',
};

export const DROP_ZONE_TYPE_LABELS: Record<DropZoneType, { label: string; emoji: string }> = {
  hostel: { label: 'Hostel', emoji: '🏨' },
  coworking: { label: 'Coworking', emoji: '💻' },
  cafe: { label: 'Café', emoji: '☕' },
};
