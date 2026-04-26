'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { SlidersHorizontal, Heart, DollarSign } from 'lucide-react';
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

type LocationMode = 'all' | 'current' | 'next' | 'both';

export default function FeedPage() {
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationMode, setLocationMode] = useState<LocationMode>('all');
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
    const [matchedListing, setMatchedListing] = useState<Listing | null>(null);
    const [likeCount, setLikeCount] = useState(0);
    const [offerListing, setOfferListing] = useState<Listing | null>(null);
    const [offerSent, setOfferSent] = useState(false);
    const [page, setPage] = useState(0);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [batchUndoIds, setBatchUndoIds] = useState<string[] | null>(null);
    const [showSwipeHint, setShowSwipeHint] = useState(false);
    const swipeState = useRef<{ x: number; y: number; lock: 'h' | 'v' | null } | null>(null);
    const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Client-only: read localStorage after mount to avoid SSR/hydration mismatch.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!window.localStorage.getItem('ropa.feed.swipeHintSeen')) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowSwipeHint(true);
        }
    }, []);

    // Clear pending undo timer on unmount to avoid setState-on-unmounted warnings.
    useEffect(() => {
        return () => {
            if (undoTimer.current) clearTimeout(undoTimer.current);
        };
    }, []);

    const dismissSwipeHint = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('ropa.feed.swipeHintSeen', '1');
        }
        setShowSwipeHint(false);
    }, []);

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
            radiusKm: 300, // spec default was 200; widened to 300 for better coverage
        };
    }, [locationMode, me]);

    // Live data from tRPC
    const { data: feedData, isLoading: feedLoading } = trpc.listing.getFeed.useQuery(
        { limit: 50, ...geoParams },
        { retry: false }
    );
    const swipeMutation = trpc.swipe.create.useMutation();
    const unswipeMutation = trpc.swipe.unswipe.useMutation();
    const offerMutation = trpc.offer.create.useMutation();

    // Use live data if available, fallback to mock
    const safeJsonParse = <T,>(val: unknown, fallback: T): T => {
        if (typeof val !== 'string') return (val as T) ?? fallback;
        try { return JSON.parse(val) as T; } catch { return fallback; }
    };

    const rawListings = feedData?.listings
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
        : LISTINGS
            .filter((l) => l.userId !== CURRENT_USER.id && l.isActive)
            .map((l) => ({ ...l, user: USERS.find((u) => u.id === l.userId) }));

    // Apply client-side filters + search
    const filteredListings = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return (rawListings as Listing[]).filter((l) => {
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
    }, [rawListings, filters, searchQuery]);

    const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
    const pageListings = filteredListings.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const handleLike = useCallback((listing: Listing) => {
        if (showSwipeHint) dismissSwipeHint();
        if (likedIds.has(listing.id)) return; // Already liked

        setLikedIds((prev) => new Set(prev).add(listing.id));
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
    }, [likedIds, swipeMutation, showSwipeHint, dismissSwipeHint]);

    const handleLikeAll = useCallback((listings: Listing[]) => {
        const newlyLiked: string[] = [];
        listings.forEach((listing) => {
            if (likedIds.has(listing.id)) return;
            newlyLiked.push(listing.id);
            setLikedIds((prev) => new Set(prev).add(listing.id));
            setLikeCount((c) => c + 1);
            swipeMutation.mutate(
                { listingId: listing.id, direction: 'RIGHT' },
                {
                    onSuccess: (result) => {
                        if (result.matched) setMatchedListing(listing);
                    },
                }
            );
        });
        if (newlyLiked.length > 0) {
            // Subsequent batches replace the undoable set — older batches are committed.
            setBatchUndoIds(newlyLiked);
            if (undoTimer.current) clearTimeout(undoTimer.current);
            undoTimer.current = setTimeout(() => setBatchUndoIds(null), 5000);
        }
    }, [likedIds, swipeMutation]);

    const handleUndoBatch = useCallback(() => {
        if (!batchUndoIds || batchUndoIds.length === 0) return;
        const ids = new Set(batchUndoIds);
        setLikedIds((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => next.delete(id));
            return next;
        });
        setLikeCount((c) => Math.max(0, c - batchUndoIds.length));
        // Server-side reversal: unswipe transactionally flips swipe direction to LEFT
        // and deletes any Match row that involves this listing + the current user.
        batchUndoIds.forEach((id) => {
            unswipeMutation.mutate({ listingId: id });
        });
        if (undoTimer.current) clearTimeout(undoTimer.current);
        setBatchUndoIds(null);
    }, [batchUndoIds, unswipeMutation]);

    const handleBuy = useCallback((listing: Listing) => {
        if (showSwipeHint) dismissSwipeHint();
        if (listing.pricingType === 'free') {
            handleLike(listing);
            return;
        }
        setOfferListing(listing);
    }, [handleLike, showSwipeHint, dismissSwipeHint]);

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

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        const t = e.touches[0];
        swipeState.current = { x: t.clientX, y: t.clientY, lock: null };
        setIsDragging(true);
        if (showSwipeHint) dismissSwipeHint();
    }, [showSwipeHint, dismissSwipeHint]);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        const s = swipeState.current;
        if (!s) return;
        const dx = e.touches[0].clientX - s.x;
        const dy = e.touches[0].clientY - s.y;
        if (s.lock === null && (Math.abs(dx) > 12 || Math.abs(dy) > 12)) {
            s.lock = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
        }
        if (s.lock === 'h') setSwipeOffset(dx);
    }, []);

    const onTouchEnd = useCallback(() => {
        const s = swipeState.current;
        const offset = swipeOffset;
        swipeState.current = null;
        setSwipeOffset(0);
        setIsDragging(false);
        if (!s || s.lock !== 'h') return;
        const SWIPE_THRESHOLD = 100;
        if (offset > SWIPE_THRESHOLD) {
            handleLikeAll(pageListings);
            if (page + 1 < totalPages) setPage((p) => p + 1);
        } else if (offset < -SWIPE_THRESHOLD) {
            if (page + 1 < totalPages) setPage((p) => p + 1);
        }
    }, [swipeOffset, pageListings, handleLikeAll, page, totalPages]);

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
                                onClick={() => { setLocationMode(mode); setPage(0); }}
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
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                    onFocus={() => { if (showSwipeHint) dismissSwipeHint(); }}
                    className={styles.searchInput}
                />
                {searchQuery && (
                    <button className={styles.searchClear} onClick={() => { setSearchQuery(''); setPage(0); }}>✕</button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <FilterPanel
                    filters={filters}
                    onChange={(f) => { setFilters(f); setPage(0); }}
                    onClose={() => setShowFilters(false)}
                />
            )}

            {/* Grid */}
            <main
                className={styles.gridArea}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
            >
                {Math.abs(swipeOffset) > 30 && (
                    <div
                        className={`${styles.swipeHint} ${swipeOffset > 0 ? styles.swipeHintRight : styles.swipeHintLeft}`}
                        style={{ opacity: Math.min(Math.abs(swipeOffset) / 100, 1) }}
                    >
                        {swipeOffset > 0 ? '❤️ Add all to favorites' : '→ Skip'}
                    </div>
                )}
                {showSwipeHint && !feedLoading && pageListings.length > 0 && (
                    <div className={styles.swipeOnboarding}>
                        <span>💡 Swipe right to favorite all on this page · Swipe left to skip</span>
                        <button
                            className={styles.swipeOnboardingClose}
                            onClick={dismissSwipeHint}
                            aria-label="Dismiss hint"
                        >
                            ✕
                        </button>
                    </div>
                )}
                <div
                    className={styles.swipeWrap}
                    style={{
                        transform: `translateX(${swipeOffset}px)`,
                        transition: isDragging ? 'none' : 'transform 250ms ease',
                    }}
                >
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
                ) : pageListings.length > 0 ? (
                    <>
                        <div className={styles.grid}>
                            {pageListings.map((listing) => {
                                const priceDisplay = listing.pricingType === 'free'
                                    ? 'FREE'
                                    : listing.pricingType === 'negotiable'
                                        ? `~$${listing.price}`
                                        : `$${listing.price}`;

                                return (
                                    <div key={listing.id} className={styles.gridCard}>
                                        <a href={`/listing/${listing.id}`} className={styles.gridCardImage}>
                                            <img
                                                src={listing.images[0]?.url}
                                                alt={listing.title}
                                                draggable={false}
                                            />
                                            <span className={styles.gridPriceBadge}>{priceDisplay}</span>
                                        </a>
                                        <div className={styles.gridCardInfo}>
                                            <span className={styles.gridCardTitle}>{listing.title}</span>
                                            <span className={styles.gridCardMeta}>
                                                {listing.size} · {listing.brand || listing.category}
                                            </span>
                                        </div>
                                        <div className={styles.gridCardActions}>
                                            <button
                                                className={`${styles.gridActionBtn} ${styles.heartBtn} ${likedIds.has(listing.id) ? styles.heartActive : ''}`}
                                                onClick={() => handleLike(listing)}
                                                aria-label="Like"
                                            >
                                                <Heart
                                                    size={20}
                                                    fill={likedIds.has(listing.id) ? 'currentColor' : 'none'}
                                                    strokeWidth={2}
                                                />
                                            </button>
                                            <button
                                                className={`${styles.gridActionBtn} ${styles.buyBtn}`}
                                                onClick={() => handleBuy(listing)}
                                                aria-label="Make offer"
                                            >
                                                <DollarSign size={20} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    className={styles.pageBtn}
                                    disabled={page === 0}
                                    onClick={() => { if (showSwipeHint) dismissSwipeHint(); setPage((p) => p - 1); }}
                                >
                                    Previous
                                </button>
                                <span>{page + 1} / {totalPages}</span>
                                <button
                                    className={styles.pageBtn}
                                    disabled={page + 1 >= totalPages}
                                    onClick={() => { if (showSwipeHint) dismissSwipeHint(); setPage((p) => p + 1); }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
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
                                    setPage(0);
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
                </div>
            </main>

            {/* Stats bar */}
            <div className={styles.statsBar}>
                <span>❤️ {likeCount} liked</span>
                <span>•</span>
                <span>📦 {filteredListings.length} items</span>
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

            {/* Batch-like undo toast */}
            {batchUndoIds && batchUndoIds.length > 0 && (
                <div className={styles.undoToast}>
                    <span>❤️ Liked {batchUndoIds.length} {batchUndoIds.length === 1 ? 'item' : 'items'}</span>
                    <button className={styles.undoBtn} onClick={handleUndoBatch}>Undo</button>
                </div>
            )}

            <Navigation />
        </div>
    );
}
