'use client';

import { useState, useCallback } from 'react';
import SwipeCard from '@/components/SwipeCard';
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
}

const DEFAULT_FILTERS: Filters = {
    category: 'all',
    size: 'all',
    gender: 'all',
    condition: 'all',
    maxPrice: 100,
    freeOnly: false,
};

export default function FeedPage() {
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
    const [matchedListing, setMatchedListing] = useState<Listing | null>(null);
    const [likeCount, setLikeCount] = useState(0);
    const [skipCount, setSkipCount] = useState(0);
    const [offerListing, setOfferListing] = useState<Listing | null>(null);
    const [offerSent, setOfferSent] = useState(false);

    // Live data from tRPC
    const { data: feedData } = trpc.listing.getFeed.useQuery(
        { limit: 50 },
        { retry: false }
    );
    const swipeMutation = trpc.swipe.create.useMutation();
    const offerMutation = trpc.offer.create.useMutation();

    // Use live data if available, fallback to mock
    const rawListings = feedData?.listings
        ? feedData.listings.map((l) => ({
            ...l,
            images: typeof l.images === 'string' ? JSON.parse(l.images) : l.images,
            user: l.user ? {
                ...l.user,
                avatarUrl: l.user.image || '',
                displayName: l.user.name,
                trustTier: (l.user.trustTier || 'bronze') as 'bronze' | 'silver' | 'gold',
                citiesVisited: typeof l.user.citiesVisited === 'string' ? JSON.parse(l.user.citiesVisited) : [],
                swapBuddyIds: [],
            } : undefined,
            dropZoneId: l.dropZoneId || undefined,
        }))
        : LISTINGS
            .filter((l) => l.userId !== CURRENT_USER.id && l.isActive)
            .map((l) => ({ ...l, user: USERS.find((u) => u.id === l.userId) }));

    // Apply client-side filters
    const enrichedListings = (rawListings as Listing[]).filter((l) => {
        if (swipedIds.has(l.id)) return false;
        if (filters.category !== 'all' && l.category !== filters.category) return false;
        if (filters.size !== 'all' && l.size !== filters.size) return false;
        if (filters.gender !== 'all' && l.genderTarget !== filters.gender) return false;
        if (filters.condition !== 'all' && l.condition !== filters.condition) return false;
        if (filters.freeOnly && l.pricingType !== 'free') return false;
        if (l.price !== null && l.price !== undefined && l.price > filters.maxPrice) return false;
        return true;
    });

    const handleSwipe = useCallback((direction: 'left' | 'right') => {
        const current = enrichedListings[0];
        if (!current) return;

        if (direction === 'right' && current.pricingType !== 'free' && current.price) {
            // Show offer sheet for priced items
            setOfferListing(current);
            return;
        }

        setSwipedIds((prev) => new Set(prev).add(current.id));

        // Send swipe to backend
        swipeMutation.mutate(
            { listingId: current.id, direction: direction === 'right' ? 'RIGHT' : 'LEFT' },
            {
                onSuccess: (result) => {
                    if (result.matched) {
                        setTimeout(() => setMatchedListing(current), 400);
                    }
                },
            }
        );

        if (direction === 'right') {
            setLikeCount((c) => c + 1);
        } else {
            setSkipCount((c) => c + 1);
        }
    }, [enrichedListings, swipeMutation]);

    const handleOfferSubmit = useCallback((amount: number) => {
        if (!offerListing) return;
        offerMutation.mutate(
            { listingId: offerListing.id, amount, currency: offerListing.currency || 'USD' },
            {
                onSuccess: () => {
                    setSwipedIds((prev) => new Set(prev).add(offerListing.id));
                    setLikeCount((c) => c + 1);
                    setOfferSent(true);
                    setTimeout(() => setOfferSent(false), 2000);
                },
            }
        );
        setOfferListing(null);
    }, [offerListing, offerMutation]);

    const activeCount = Object.entries(filters).filter(
        ([key, val]) => key === 'freeOnly' ? val : val !== 'all' && val !== 100
    ).length;

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={`${styles.header} glass-strong`}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.logo}>
                        <img src="/ropa-logo.png" alt="ROPA" width={32} height={32} style={{ borderRadius: '50%', verticalAlign: 'middle', marginRight: '8px' }} /> ROPA
                    </h1>
                </div>
                <div className={styles.headerCenter}>
                    <span className={styles.cityBadge}>📍 Nearby</span>
                </div>
                <div className={styles.headerRight}>
                    <button
                        className={`${styles.filterBtn} ${activeCount > 0 ? styles.filterActive : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        aria-label="Toggle filters"
                    >
                        ⚙️ {activeCount > 0 && <span className={styles.filterCount}>{activeCount}</span>}
                    </button>
                </div>
            </header>

            {/* Filter Panel */}
            {showFilters && (
                <FilterPanel
                    filters={filters}
                    onChange={setFilters}
                    onClose={() => setShowFilters(false)}
                />
            )}

            {/* Card Stack */}
            <main className={styles.cardArea}>
                {enrichedListings.length > 0 ? (
                    <div className={styles.cardStack}>
                        {enrichedListings.slice(0, 3).map((listing, i) => (
                            <SwipeCard
                                key={listing.id}
                                listing={listing}
                                onSwipe={handleSwipe}
                                isTop={i === 0}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>🌎</span>
                        <h3>No more clothes nearby!</h3>
                        <p>Check back later or adjust your filters to see more.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setFilters(DEFAULT_FILTERS);
                                setSwipedIds(new Set());
                            }}
                        >
                            Reset & Refresh
                        </button>
                    </div>
                )}
            </main>

            {/* Action Buttons */}
            {enrichedListings.length > 0 && (
                <div className={styles.actions}>
                    <button
                        className={`${styles.actionBtn} ${styles.skipBtn}`}
                        onClick={() => handleSwipe('left')}
                        aria-label="Skip"
                    >
                        ✕
                    </button>
                    <button
                        className={`${styles.actionBtn} ${styles.superBtn}`}
                        onClick={() => handleSwipe('right')}
                        aria-label="Super Like"
                    >
                        ⭐
                    </button>
                    <button
                        className={`${styles.actionBtn} ${styles.likeBtn}`}
                        onClick={() => handleSwipe('right')}
                        aria-label="Like"
                    >
                        ♥
                    </button>
                </div>
            )}

            {/* Stats bar */}
            <div className={styles.statsBar}>
                <span>👍 {likeCount} liked</span>
                <span>•</span>
                <span>👋 {skipCount} passed</span>
                <span>•</span>
                <span>📦 {enrichedListings.length} left</span>
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
