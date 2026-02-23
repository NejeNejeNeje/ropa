'use client';

import { use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc-client';
import styles from './circle-detail.module.css';

export default function CircleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: circle, isLoading } = trpc.circle.getById.useQuery(id);
    const rsvpMutation = trpc.circle.rsvp.useMutation();
    const cancelMutation = trpc.circle.cancelRsvp.useMutation();

    if (isLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>
                    <span className={styles.loadingIcon}>🔄</span>
                    <p>Loading event…</p>
                </div>
                <Navigation />
            </div>
        );
    }

    if (!circle) {
        return (
            <div className={styles.page}>
                <div className={styles.notFound}>
                    <span>😕</span>
                    <h2>Circle not found</h2>
                    <button onClick={() => router.push('/circles')}>← Back to Circles</button>
                </div>
                <Navigation />
            </div>
        );
    }

    const tags: string[] = typeof circle.tags === 'string' ? JSON.parse(circle.tags) : [];
    const rsvpCount = circle.rsvps?.length ?? 0;
    const spotsLeft = circle.capacity - rsvpCount;
    const date = new Date(circle.date);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/circles')}>←</button>
                <span className={styles.headerTitle}>Swap Circle</span>
            </header>

            <div className={styles.hero} style={{ backgroundImage: `url(${circle.imageUrl})` }}>
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <div className={styles.venueTypeBadge}>{circle.venueType}</div>
                    <h1 className={styles.title}>{circle.title}</h1>
                </div>
            </div>

            <main className={styles.main}>
                {/* Date & Venue */}
                <div className={styles.infoCard}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoIcon}>📅</span>
                        <div>
                            <strong>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
                            <span className={styles.infoSub}>{circle.time}</span>
                        </div>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoIcon}>📍</span>
                        <div>
                            <strong>{circle.venue}</strong>
                            <span className={styles.infoSub}>{circle.city}, {circle.country}</span>
                        </div>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoIcon}>👥</span>
                        <div>
                            <strong>{rsvpCount} / {circle.capacity} attending</strong>
                            <span className={styles.infoSub}>{spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>About this event</h2>
                    <p className={styles.description}>{circle.description}</p>
                    <div className={styles.tags}>
                        {tags.map((t) => <span key={t} className={styles.tag}>#{t}</span>)}
                    </div>
                </div>

                {/* Host */}
                {circle.host && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Hosted by</h2>
                        <div className={styles.hostRow}>
                            <Image src={circle.host.image || ''} alt={circle.host.name} width={44} height={44} className={styles.hostAvatar} />
                            <div>
                                <strong>{circle.host.name}</strong>
                                <span className={styles.hostCity}>📍 {circle.host.currentCity}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Attendees */}
                {circle.rsvps && circle.rsvps.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Who's going</h2>
                        <div className={styles.attendees}>
                            {circle.rsvps.slice(0, 8).map((r) => (
                                <Image key={r.userId} src={r.user.image || ''} alt={r.user.name} width={36} height={36} className={styles.attendeeAvatar} title={r.user.name} />
                            ))}
                            {rsvpCount > 8 && <span className={styles.moreAttendees}>+{rsvpCount - 8}</span>}
                        </div>
                    </div>
                )}

                {/* RSVP */}
                <div className={styles.rsvpBar}>
                    {circle.isFull ? (
                        <button className={styles.rsvpBtnFull} disabled>😔 Full — Join Waitlist</button>
                    ) : circle.isPast ? (
                        <button className={styles.rsvpBtnPast} disabled>This event has passed</button>
                    ) : (
                        <button
                            className={styles.rsvpBtn}
                            onClick={() => rsvpMutation.mutate(id)}
                            disabled={rsvpMutation.isPending}
                        >
                            {rsvpMutation.isPending ? '⏳ Reserving…' : rsvpMutation.isSuccess ? '✅ You\'re in!' : '🎉 RSVP — I\'m Going'}
                        </button>
                    )}
                </div>
            </main>

            <Navigation />
        </div>
    );
}
