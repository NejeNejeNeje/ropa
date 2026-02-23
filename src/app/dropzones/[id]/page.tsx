'use client';

import { use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc-client';
import styles from './dropzone-detail.module.css';

const ZONE_TYPE_EMOJI: Record<string, string> = {
    hostel: '🏨',
    cafe: '☕',
    coworking: '💻',
    airport: '✈️',
    market: '🛍️',
};

export default function DropZoneDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: zone, isLoading } = trpc.dropZone.getById.useQuery(id);

    if (isLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>
                    <span className={styles.loadingIcon}>📦</span>
                    <p>Loading drop zone…</p>
                </div>
                <Navigation />
            </div>
        );
    }

    if (!zone) {
        return (
            <div className={styles.page}>
                <div className={styles.notFound}>
                    <span>😕</span>
                    <h2>Drop Zone not found</h2>
                    <button onClick={() => router.push('/dropzones')}>← Back</button>
                </div>
                <Navigation />
            </div>
        );
    }

    const listings = (zone as Record<string, unknown>).listings as Array<Record<string, unknown>> | undefined;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/dropzones')}>←</button>
                <span className={styles.headerTitle}>Drop Zone</span>
            </header>

            <main className={styles.main}>
                {/* Hero card */}
                <div className={styles.heroCard}>
                    <div className={styles.zoneType}>
                        {ZONE_TYPE_EMOJI[zone.type as string] || '📦'} {String(zone.type).charAt(0).toUpperCase() + String(zone.type).slice(1)}
                    </div>
                    <h1 className={styles.zoneName}>{zone.name as string}</h1>
                    <p className={styles.zoneAddress}>📍 {zone.address as string}, {zone.city as string}</p>

                    <div className={styles.statsRow}>
                        <div className={styles.stat}>
                            <span className={styles.statVal}>{zone.activeListings as number}</span>
                            <span className={styles.statLbl}>Items available</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statVal}>{(zone as Record<string, unknown>).rating ? `${(zone as Record<string, unknown>).rating as number}⭐` : '—'}</span>
                            <span className={styles.statLbl}>Rating</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statVal}>{(zone as Record<string, unknown>).isVerified ? '✅' : '—'}</span>
                            <span className={styles.statLbl}>Verified</span>
                        </div>
                    </div>
                </div>

                {/* Hours & Info */}
                <div className={styles.infoCard}>
                    {zone.hours && (
                        <div className={styles.infoRow}>
                            <span>🕐</span>
                            <span>{zone.hours as string}</span>
                        </div>
                    )}
                    <div className={styles.infoRow}>
                        <span>🗺️</span>
                        <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(`${zone.address as string}, ${zone.city as string}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.mapLink}
                        >
                            Open in Google Maps →
                        </a>
                    </div>
                    {zone.description && (
                        <div className={styles.infoRow}>
                            <span>ℹ️</span>
                            <span>{zone.description as string}</span>
                        </div>
                    )}
                </div>

                {/* Active listings */}
                {listings && listings.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>📦 Items Available Here</h2>
                        <div className={styles.listingGrid}>
                            {listings.map((listing) => {
                                const images = typeof listing.images === 'string' ? JSON.parse(listing.images as string) : [];
                                const imgUrl = images[0]?.url || '';
                                return (
                                    <div key={listing.id as string} className={styles.listingCard}>
                                        {imgUrl && (
                                            <div className={styles.listingImg} style={{ backgroundImage: `url(${imgUrl})` }} />
                                        )}
                                        <div className={styles.listingInfo}>
                                            <strong>{listing.title as string}</strong>
                                            <span>{listing.brand as string} · Size {listing.size as string}</span>
                                            <span className={styles.listingUser}>
                                                <Image src={(listing.user as Record<string, unknown>)?.image as string || ''} alt="" width={16} height={16} className={styles.userThumb} />
                                                {(listing.user as Record<string, unknown>)?.name as string}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {(!listings || listings.length === 0) && (
                    <div className={styles.empty}>
                        <span>📭</span>
                        <p>No items here yet — be the first to drop something!</p>
                    </div>
                )}
            </main>

            <Navigation />
        </div>
    );
}
