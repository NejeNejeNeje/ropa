'use client';

import {
    useState,
    useMemo,
    useCallback,
    useRef,
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent,
} from 'react';
import Link from 'next/link';
import { Heart, SlidersHorizontal, X } from 'lucide-react';
import FilterPanel from '@/components/FilterPanel';
import MatchNotification from '@/components/MatchNotification';
import OfferSheet from '@/components/OfferSheet';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc-client';
import { Listing, ClothingCategory, ClothingSize, GenderTarget, Condition } from '@/data/types';
import { LISTINGS, USERS, CURRENT_USER } from '@/data/mockData';
import styles from './feed.module.css';

export interface Filters {
    category: ClothingCategory | 'all';
    size: ClothingSize | 'all';
    gender: GenderTarget | 'all';
    condition: Condition | 'all';
    maxPrice: number;
    freeOnly: boolean;
    brand: string | 'all';
    colors: string[];
}

const DEFAULT_FILTERS: Filters = {
    category: 'all',
    size: 'all',
    gender: 'all',
    condition: 'all',
    maxPrice: 100,
    freeOnly: false,
    brand: 'all',
    colors: [],
};

const ITEMS_PER_PAGE = 9;
const FEED_BATCH_FETCH_LIMIT = ITEMS_PER_PAGE * 12;

type LocationMode = 'all' | 'current' | 'next' | 'both';

const safeJsonParse = <T,>(val: unknown, fallback: T): T => {
    if (typeof val !== 'string') return (val as T) ?? fallback;
    try { return JSON.parse(val) as T; } catch { return fallback; }
};

export default function FeedPage() {
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationMode, setLocationMode] = useState<LocationMode>('all');
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const [matchedListing, setMatchedListing] = useState<Listing | null>(null);
    const [likeCount, setLikeCount] = useState(0);
    const [offerListing, setOfferListing] = useState<Listing | null>(null);
    const [offerSent, setOfferSent] = useState(false);
    const batchSwipeStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
    const suppressCardClickRef = useRef(false);

    // User profile — needed for geo coords
    const { data: me } = trpc.user.me.useQuery(undefined, { retry: false });

    // Build geo params based on location toggle
    const geoParams = useMemo(() => {
        if (locationMode === 'all') return {};
        return {
            locationMode: locationMode as 'current' | 'next' | 'both' | 'all',
            nearLat: me?.lat ?? undefined,
            nearLng: me?.lng ?? undefined,
            destLat: (me?.destLat ?? undefined) as number | undefined,
            destLng: (me?.destLng ?? undefined) as number | undefined,
            radiusKm: 300,
        };
    }, [locationMode, me]);

    // Live data from tRPC
    const {
        data: feedData,
        isLoading: feedLoading,
        error: feedError,
        refetch: refetchFeed,
    } = trpc.listing.getFeed.useQuery(
        { limit: FEED_BATCH_FETCH_LIMIT, ...geoParams },
        { retry: false }
    );
    const swipeMutation = trpc.swipe.create.useMutation();
    const offerMutation = trpc.offer.create.useMutation();

    const useMockListings =
        process.env.NODE_ENV === 'development' &&
        !feedLoading &&
        !feedError &&
        !feedData?.listings;

    const rawListings = useMemo(() => (
        feedData?.listings
            ? feedData.listings.map((l) => ({
                ...l,
                images: safeJsonParse<{ url: string; id: string; sortOrder: number }[]>(l.images, []),
                colors: safeJsonParse<string[]>(l.colors, []),
                user: l.user ? {
                    ...l.user,
                    avatarUrl: l.user.image || '',
                    displayName: l.user.name,
                    trustTier: (l.user.trustTier || 'bronze') as 'bronze' | 'silver' | 'gold',
                    citiesVisited: safeJsonParse<string[]>(l.user.citiesVisited, []),
                    swapBuddyIds: [],
                } : undefined,
                dropZoneId: l.dropZoneId || undefined,
            }))
            : useMockListings
                ? LISTINGS
                    .filter((l) => l.userId !== CURRENT_USER.id && l.isActive)
                    .map((l) => ({ ...l, user: USERS.find((u) => u.id === l.userId) }))
                : []
    ), [feedData, useMockListings]);

    // Apply client-side filters + search
    const filteredListings = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return (rawListings as Listing[]).filter((l) => {
            if (dismissedIds.has(l.id)) return false;
            // Search query
            if (query) {
                const haystack = `${l.title} ${l.description} ${l.brand || ''}`.toLowerCase();
                if (!haystack.includes(query)) return false;
            }
            // Category
            if (filters.category !== 'all' && l.category !== filters.category) return false;
            // Size
            if (filters.size !== 'all' && l.size !== filters.size) return false;
            // Gender
            if (filters.gender !== 'all' && l.genderTarget !== filters.gender) return false;
            // Condition
            if (filters.condition !== 'all' && l.condition !== filters.condition) return false;
            // Brand
            if (filters.brand !== 'all') {
                if (filters.brand === 'Vintage / Unknown') {
                    if (l.brand && l.brand.trim() !== '') return false;
                } else {
                    if (l.brand?.toLowerCase() !== filters.brand.toLowerCase()) return false;
                }
            }
            // Colors (multi-select)
            if (filters.colors.length > 0) {
                const listingColors = (l.colors || []).map((c: string) => c.toLowerCase());
                const hasMatch = filters.colors.some(fc => listingColors.includes(fc.toLowerCase()));
                if (!hasMatch) return false;
            }
            // Price
            if (filters.freeOnly && l.pricingType !== 'free') return false;
            if (l.price !== null && l.price !== undefined && l.price > filters.maxPrice) return false;
            return true;
        });
    }, [rawListings, dismissedIds, filters, searchQuery]);

    const visibleListings = useMemo(
        () => filteredListings.slice(0, ITEMS_PER_PAGE),
        [filteredListings]
    );

    const currentPageListings = visibleListings;

    const handleLike = useCallback((listing: Listing) => {
        if (likedIds.has(listing.id)) return; // Already liked

        setLikedIds((prev) => new Set(prev).add(listing.id));
        setDismissedIds((prev) => new Set(prev).add(listing.id));
        setLikeCount((c) => c + 1);

        swipeMutation.mutate(
            { listingId: listing.id, direction: 'RIGHT' },
            {
                onSuccess: (result) => {
                    if (result.matched) {
                        setMatchedListing(listing);
                    }
                },
            }
        );
    }, [likedIds, swipeMutation]);

    const advanceBatch = useCallback((direction: 'LEFT' | 'RIGHT') => {
        const batch = currentPageListings;
        if (batch.length === 0) return;

        setDismissedIds((prev) => {
            const next = new Set(prev);
            batch.forEach((listing) => next.add(listing.id));
            return next;
        });

        if (direction === 'RIGHT') {
            const newLikes = batch.filter((listing) => !likedIds.has(listing.id));
            if (newLikes.length > 0) {
                setLikedIds((prev) => {
                    const next = new Set(prev);
                    newLikes.forEach((listing) => next.add(listing.id));
                    return next;
                });
                setLikeCount((count) => count + newLikes.length);
            }
        }

        batch.forEach((listing) => {
            swipeMutation.mutate(
                { listingId: listing.id, direction },
                {
                    onSuccess: (result) => {
                        if (direction === 'RIGHT' && result.matched) {
                            setMatchedListing(listing);
                        }
                    },
                }
            );
        });
    }, [currentPageListings, likedIds, swipeMutation]);

    const resetFeedWindow = useCallback(() => {
        setDismissedIds(new Set());
    }, []);

    const handleBatchPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
        if (event.button !== 0) return;
        const target = event.target as HTMLElement;
        if (target.closest('button, input, textarea, select')) return;

        batchSwipeStartRef.current = {
            x: event.clientX,
            y: event.clientY,
            pointerId: event.pointerId,
        };
        event.currentTarget.setPointerCapture?.(event.pointerId);
    }, []);

    const handleBatchPointerUp = useCallback((event: PointerEvent<HTMLElement>) => {
        const start = batchSwipeStartRef.current;
        batchSwipeStartRef.current = null;
        if (!start || start.pointerId !== event.pointerId) return;

        event.currentTarget.releasePointerCapture?.(event.pointerId);
        const deltaX = event.clientX - start.x;
        const deltaY = event.clientY - start.y;
        const isBatchSwipe = Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
        if (!isBatchSwipe) return;

        suppressCardClickRef.current = true;
        window.setTimeout(() => {
            suppressCardClickRef.current = false;
        }, 0);
        advanceBatch(deltaX > 0 ? 'RIGHT' : 'LEFT');
    }, [advanceBatch]);

    const handleBatchClickCapture = useCallback((event: MouseEvent<HTMLElement>) => {
        if (!suppressCardClickRef.current) return;
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleBatchKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
        if (event.target !== event.currentTarget) return;

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            advanceBatch('RIGHT');
        }
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            advanceBatch('LEFT');
        }
    }, [advanceBatch]);

    const handleBatchPointerCancel = useCallback(() => {
        batchSwipeStartRef.current = null;
    }, []);

    const handleBuy = useCallback((listing: Listing) => {
        setOfferListing(listing);
    }, []);

    const handleOfferSubmit = useCallback((amount: number) => {
        if (!offerListing) return;
        offerMutation.mutate(
            { listingId: offerListing.id, amount, currency: offerListing.currency || 'USD' },
            {
                onSuccess: () => {
                    setLikedIds((prev) => new Set(prev).add(offerListing.id));
                    setLikeCount((c) => c + 1);
                    setOfferSent(true);
                    setTimeout(() => setOfferSent(false), 2000);
                },
            }
        );
        setOfferListing(null);
    }, [offerListing, offerMutation]);

    const activeCount = Object.entries(filters).filter(
        ([key, val]) => {
            if (key === 'freeOnly') return val;
            if (key === 'colors') return (val as string[]).length > 0;
            return val !== 'all' && val !== 100;
        }
    ).length;

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={`${styles.header} glass-strong`}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.logo}>
                        <img src="/ropa-logo.png" alt="ROPA" width={26} height={26} style={{ borderRadius: '50%' }} /> ROPA
                    </h1>
                </div>
                <div className={styles.headerCenter}>
                    <div className={styles.locationToggle}>
                        {([
                            { mode: 'all', label: '🌐 All' },
                            { mode: 'current', label: '📍 Here' },
                            { mode: 'next', label: '✈️ Next' },
                            { mode: 'both', label: '🌍 Both' },
                        ] as const).map(({ mode, label }) => (
                            <button
                                key={mode}
                                className={`${styles.locationBtn} ${locationMode === mode ? styles.locationBtnActive : ''}`}
                                onClick={() => { setLocationMode(mode); resetFeedWindow(); }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <button
                        className={`${styles.filterBtn} ${activeCount > 0 ? styles.filterActive : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        aria-label="Toggle filters"
                    >
                        <SlidersHorizontal size={18} />
                        {activeCount > 0 && <span className={styles.filterCount}>{activeCount}</span>}
                    </button>
                </div>
            </header>

            {/* Search Bar */}
            <div className={styles.searchBar}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); resetFeedWindow(); }}
                    className={styles.searchInput}
                />
                {searchQuery && (
                    <button type="button" className={styles.searchClear} onClick={() => { setSearchQuery(''); resetFeedWindow(); }}>✕</button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <FilterPanel
                    filters={filters}
                    onChange={(f) => { setFilters(f); resetFeedWindow(); }}
                    onClose={() => setShowFilters(false)}
                />
            )}

            {/* Grid */}
            <main className={styles.gridArea}>
                {feedLoading ? (
                    <div className={styles.grid}>
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={styles.skeletonImage} />
                                <div className={styles.skeletonInfo}>
                                    <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
                                    <div className={`${styles.skeletonLine} ${styles.skeletonMeta}`} />
                                </div>
                                <div className={styles.skeletonActions} />
                            </div>
                        ))}
                    </div>
                ) : feedError && !useMockListings ? (
                    <div className={styles.emptyWrap}>
                        <div className={styles.empty}>
                            <span className={styles.emptyIcon}>⚠️</span>
                            <h3>Couldn&apos;t load listings</h3>
                            <p>Check your connection and try again.</p>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => void refetchFeed()}
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                ) : currentPageListings.length > 0 ? (
                    <>
                        <div className={styles.batchShell}>
                            <button
                                type="button"
                                className={`${styles.desktopBatchAction} ${styles.desktopBatchSkip}`}
                                onClick={() => advanceBatch('LEFT')}
                                aria-label={`Skip ${currentPageListings.length} visible listings`}
                            >
                                <X size={28} aria-hidden="true" />
                            </button>

                            <div className={styles.pageViewport}>
                                <div
                                    className={styles.pageTrack}
                                    aria-label="Browse listings pages"
                                >
                                    <section
                                        className={styles.pagePanel}
                                        aria-label="Swipe listing batch"
                                        tabIndex={0}
                                        onPointerDown={handleBatchPointerDown}
                                        onPointerUp={handleBatchPointerUp}
                                        onPointerCancel={handleBatchPointerCancel}
                                        onClickCapture={handleBatchClickCapture}
                                        onKeyDown={handleBatchKeyDown}
                                    >
                                        <div className={styles.grid}>
                                            {currentPageListings.map((listing) => {
                                                const priceDisplay = listing.pricingType === 'free'
                                                    ? 'FREE'
                                                    : listing.pricingType === 'negotiable'
                                                        ? `~$${listing.price}`
                                                        : `$${listing.price}`;

                                                return (
                                                    <div key={listing.id} className={styles.gridCard}>
                                                        <Link href={`/listing/${listing.id}`} className={styles.gridCardImage}>
                                                            <img
                                                                src={listing.images[0]?.url}
                                                                alt={listing.title}
                                                                draggable={false}
                                                            />
                                                            <span className={styles.gridPriceBadge}>{priceDisplay}</span>
                                                        </Link>
                                                        <div className={styles.gridCardInfo}>
                                                            <span className={styles.gridCardTitle}>{listing.title}</span>
                                                            <span className={styles.gridCardMeta}>
                                                                {listing.size} · {listing.brand || listing.category}
                                                            </span>
                                                        </div>
                                                        <div className={styles.gridCardActions}>
                                                            <button
                                                                type="button"
                                                                className={`${styles.gridActionBtn} ${styles.heartBtn} ${likedIds.has(listing.id) ? styles.heartActive : ''}`}
                                                                onClick={() => handleLike(listing)}
                                                                aria-label={`Like ${listing.title}`}
                                                            >
                                                                {likedIds.has(listing.id) ? '❤️' : '🤍'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`${styles.gridActionBtn} ${styles.buyBtn}`}
                                                                onClick={() => handleBuy(listing)}
                                                                aria-label={`Make an offer for ${listing.title}`}
                                                            >
                                                                💲
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={`${styles.desktopBatchAction} ${styles.desktopBatchLike}`}
                                onClick={() => advanceBatch('RIGHT')}
                                aria-label={`Favorite ${currentPageListings.length} visible listings`}
                            >
                                <Heart size={28} aria-hidden="true" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyWrap}>
                        <div className={styles.empty}>
                            <span className={styles.emptyIcon}>📦</span>
                            <h3>No listings found</h3>
                            <p>Try adjusting your search or filters to find more items.</p>
                            <button
                                className="btn btn-primary"
                                style={{ marginBottom: '0.5rem' }}
                                onClick={() => {
                                    setFilters(DEFAULT_FILTERS);
                                    setSearchQuery('');
                                    resetFeedWindow();
                                }}
                            >
                                Clear Search & Filters
                            </button>
                            <a href="/listing/new" className="btn" style={{ background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                ➕ List an Item
                            </a>
                        </div>
                    </div>
                )}
            </main>

            {/* Stats bar */}
            <div className={styles.statsBar}>
                <span>❤️ {likeCount} liked</span>
                <span>•</span>
                <span>📦 {currentPageListings.length} shown</span>
            </div>

            {/* Match notification */}
            {matchedListing && (
                <MatchNotification
                    listing={matchedListing}
                    onClose={() => setMatchedListing(null)}
                />
            )}

            {/* Offer sheet */}
            {offerListing && (
                <OfferSheet
                    listing={{
                        id: offerListing.id,
                        title: offerListing.title,
                        brand: offerListing.brand || '',
                        price: offerListing.price,
                        currency: offerListing.currency || 'USD',
                        imageUrl: offerListing.images?.[0]?.url || '',
                    }}
                    onSubmit={handleOfferSubmit}
                    onClose={() => setOfferListing(null)}
                />
            )}

            {/* Offer sent toast */}
            {offerSent && (
                <div className={styles.toast}>🎉 Offer sent! Seller has 24h to respond.</div>
            )}

            <Navigation />
        </div>
    );
}
