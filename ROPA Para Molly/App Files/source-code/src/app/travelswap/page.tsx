'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import SwapRequestCard from '@/components/SwapRequestCard';
import { trpc } from '@/lib/trpc-client';
import { ItemCategory, ITEM_CATEGORY_LABELS } from '@/data/types';
import styles from './travelswap.module.css';

const ALL_CATEGORIES: ItemCategory[] = [
    'outerwear', 'tops', 'bottoms', 'footwear', 'swimwear',
    'accessories', 'gear', 'books_guides', 'electronics', 'toiletries',
];

type ViewMode = 'create' | 'results';

export default function TravelSwapPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('create');
    const [selectedNeeds, setSelectedNeeds] = useState<Set<ItemCategory>>(new Set());
    const [selectedOffers, setSelectedOffers] = useState<Set<ItemCategory>>(new Set());
    const [city, setCity] = useState('');
    const [destination, setDestination] = useState('');
    const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

    // tRPC mutations/queries
    const createMutation = trpc.travelSwap.create.useMutation();
    const { data: matchData, isLoading: matchLoading } = trpc.travelSwap.findMatches.useQuery(
        { swapRequestId: activeRequestId! },
        { enabled: !!activeRequestId }
    );
    const { data: myRequests } = trpc.travelSwap.getMyRequests.useQuery(
        undefined,
        { retry: false }
    );

    const toggleCategory = (set: Set<ItemCategory>, category: ItemCategory) => {
        const next = new Set(set);
        if (next.has(category)) next.delete(category);
        else next.add(category);
        return next;
    };

    const handleSubmit = async () => {
        if (selectedNeeds.size === 0 || selectedOffers.size === 0 || !city) return;

        try {
            const result = await createMutation.mutateAsync({
                city,
                destination: destination || undefined,
                needs: Array.from(selectedNeeds).map((cat) => ({ category: cat })),
                offers: Array.from(selectedOffers).map((cat) => ({ category: cat })),
            });
            setActiveRequestId(result.id);
            setViewMode('results');
        } catch (err) {
            console.error('Failed to create swap request:', err);
        }
    };

    const handleReset = () => {
        setViewMode('create');
        setSelectedNeeds(new Set());
        setSelectedOffers(new Set());
        setActiveRequestId(null);
    };

    // If user has existing active requests, show option to view results
    const existingRequest = myRequests?.[0];

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={`${styles.header} glass-strong`}>
                <h1 className={styles.title}>
                    <span>🔄</span> TravelSwap
                </h1>
                <p className={styles.subtitle}>Need something? Have something extra? Find your match.</p>
            </header>

            {viewMode === 'create' ? (
                <main className={styles.content}>
                    {/* Existing request banner */}
                    {existingRequest && !activeRequestId && (
                        <button
                            className={styles.existingBanner}
                            onClick={() => {
                                setActiveRequestId(existingRequest.id);
                                setViewMode('results');
                            }}
                        >
                            📋 You have an active request — <strong>View matches →</strong>
                        </button>
                    )}

                    {/* City Input */}
                    <section className={styles.section}>
                        <label className={styles.label}>📍 Where are you?</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="e.g. Barcelona"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </section>

                    {/* Destination Input */}
                    <section className={styles.section}>
                        <label className={styles.label}>✈️ Where are you heading? <span className={styles.optional}>(optional)</span></label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="e.g. Zurich"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                    </section>

                    {/* Needs */}
                    <section className={styles.section}>
                        <label className={styles.label}>🔍 What do you need?</label>
                        <div className={styles.chipGrid}>
                            {ALL_CATEGORIES.map((cat) => {
                                const info = ITEM_CATEGORY_LABELS[cat];
                                const selected = selectedNeeds.has(cat);
                                return (
                                    <button
                                        key={cat}
                                        className={`${styles.chip} ${selected ? styles.chipSelectedNeed : ''}`}
                                        onClick={() => setSelectedNeeds(toggleCategory(selectedNeeds, cat))}
                                    >
                                        <span>{info.emoji}</span> {info.label}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedNeeds.size > 0 && (
                            <p className={styles.chipCount}>
                                {selectedNeeds.size} selected
                            </p>
                        )}
                    </section>

                    {/* Offers */}
                    <section className={styles.section}>
                        <label className={styles.label}>🎁 What can you offer?</label>
                        <div className={styles.chipGrid}>
                            {ALL_CATEGORIES.map((cat) => {
                                const info = ITEM_CATEGORY_LABELS[cat];
                                const selected = selectedOffers.has(cat);
                                return (
                                    <button
                                        key={cat}
                                        className={`${styles.chip} ${selected ? styles.chipSelectedOffer : ''}`}
                                        onClick={() => setSelectedOffers(toggleCategory(selectedOffers, cat))}
                                    >
                                        <span>{info.emoji}</span> {info.label}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedOffers.size > 0 && (
                            <p className={styles.chipCount}>
                                {selectedOffers.size} selected
                            </p>
                        )}
                    </section>

                    {/* Submit */}
                    <button
                        className={styles.submitBtn}
                        onClick={handleSubmit}
                        disabled={selectedNeeds.size === 0 || selectedOffers.size === 0 || !city || createMutation.isPending}
                    >
                        {createMutation.isPending ? '⏳ Finding matches...' : '🔍 Find Swaps'}
                    </button>
                </main>
            ) : (
                <main className={styles.content}>
                    {/* Results header */}
                    <div className={styles.resultsHeader}>
                        <button className={styles.backBtn} onClick={handleReset}>
                            ← New Request
                        </button>
                        <span className={styles.resultsCity}>📍 {matchData?.myRequest?.city || city}</span>
                    </div>

                    {matchLoading ? (
                        <div className={styles.loading}>
                            <span className={styles.loadingIcon}>🔄</span>
                            <p>Searching for matches...</p>
                        </div>
                    ) : (
                        <>
                            {/* Instant Matches */}
                            {matchData?.bilateral && matchData.bilateral.length > 0 && (
                                <section className={styles.resultSection}>
                                    <h2 className={styles.resultTitle}>
                                        🎯 Instant Matches
                                        <span className={styles.matchBadge}>{matchData.bilateral.length}</span>
                                    </h2>
                                    <p className={styles.resultDesc}>They have what you need AND need what you have!</p>
                                    <div className={styles.resultList}>
                                        {matchData.bilateral.map((req) => (
                                            <SwapRequestCard
                                                key={req.id}
                                                request={req}
                                                matchType="bilateral"
                                                myNeeds={matchData.myRequest?.needs.map((n) => n.category) || []}
                                                myOffers={matchData.myRequest?.offers.map((o) => o.category) || []}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Partial Matches */}
                            {matchData?.partial && matchData.partial.length > 0 && (
                                <section className={styles.resultSection}>
                                    <h2 className={styles.resultTitle}>
                                        🔍 Partial Matches
                                        <span className={styles.matchBadgePartial}>{matchData.partial.length}</span>
                                    </h2>
                                    <p className={styles.resultDesc}>They have something you need — offer them a swap!</p>
                                    <div className={styles.resultList}>
                                        {matchData.partial.map((req) => (
                                            <SwapRequestCard
                                                key={req.id}
                                                request={req}
                                                matchType="partial"
                                                myNeeds={matchData.myRequest?.needs.map((n) => n.category) || []}
                                                myOffers={matchData.myRequest?.offers.map((o) => o.category) || []}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* No Matches */}
                            {(!matchData?.bilateral?.length && !matchData?.partial?.length) && (
                                <div className={styles.noMatches}>
                                    <span className={styles.noMatchesIcon}>🌍</span>
                                    <h3>No matches yet</h3>
                                    <p>Your request is active! You&apos;ll be matched as more travelers post their needs.</p>
                                    <button className={styles.backBtnAlt} onClick={handleReset}>
                                        Edit Request
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            )}

            <Navigation />
        </div>
    );
}
