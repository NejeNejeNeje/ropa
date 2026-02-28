'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import styles from './circles.module.css';
import { SWAP_CIRCLES, getUser } from '@/data/mockData';
import { trpc } from '@/lib/trpc-client';

export default function CirclesPage() {
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
    const [rsvpCircles, setRsvpCircles] = useState<Set<string>>(new Set());

    const { data: upcomingData } = trpc.circle.getUpcoming.useQuery(undefined, { retry: false });
    const { data: pastData } = trpc.circle.getPast.useQuery(undefined, { retry: false });
    const rsvpMutation = trpc.circle.rsvp.useMutation();

    const upcoming = upcomingData || SWAP_CIRCLES.filter((sc) => !sc.isPast);
    const past = pastData || SWAP_CIRCLES.filter((sc) => sc.isPast);
    const circles = tab === 'upcoming' ? upcoming : past;

    const handleRSVP = (id: string) => {
        setRsvpCircles((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
        rsvpMutation.mutate(id, { onError: () => { } });
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>🔄 Swap Circles</h1>
                <span className={styles.count}>{upcoming.length} upcoming</span>
            </header>

            <main className={styles.main}>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${tab === 'upcoming' ? styles.tabActive : ''}`} onClick={() => setTab('upcoming')}>
                        Upcoming ({upcoming.length})
                    </button>
                    <button className={`${styles.tab} ${tab === 'past' ? styles.tabActive : ''}`} onClick={() => setTab('past')}>
                        Past ({past.length})
                    </button>
                </div>

                <div className={styles.circleList}>
                    {circles.map((sc) => {
                        const host = (sc as Record<string, unknown>).host
                            ? { displayName: ((sc as Record<string, unknown>).host as Record<string, unknown>).name as string, avatarUrl: ((sc as Record<string, unknown>).host as Record<string, unknown>).image as string }
                            : getUser(sc.hostUserId);
                        const isRsvp = rsvpCircles.has(sc.id);
                        const rsvpCount = (sc as Record<string, unknown>).rsvps
                            ? ((sc as Record<string, unknown>).rsvps as unknown[]).length
                            : (sc as Record<string, unknown>).attendeeCount as number || 0;
                        const capacityPercent = (rsvpCount / sc.capacity) * 100;
                        const avatars = (sc as Record<string, unknown>).attendeeAvatars as string[] ||
                            ((sc as Record<string, unknown>).rsvps as Record<string, unknown>[] || [])
                                .slice(0, 3).map((r) => (r.user as Record<string, unknown>)?.image as string || '');
                        const tags = typeof sc.tags === 'string' ? JSON.parse(sc.tags) : (sc.tags || []);

                        return (
                            <Link key={sc.id} href={`/circles/${sc.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                                <div className={styles.card}>
                                    <div
                                        className={styles.cardImage}
                                        style={{
                                            backgroundImage: sc.imageUrl
                                                ? `url(${sc.imageUrl})`
                                                : 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(6,182,212,0.15) 100%)',
                                        }}
                                    >
                                        {sc.isPast && <span className={styles.pastBadge}>Completed</span>}
                                        {sc.isFull && !sc.isPast && <span className={styles.fullBadge}>Full</span>}
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div className={styles.cardDateRow}>
                                            <div className={styles.dateBlock}>
                                                <span className={styles.dateDay}>{new Date(sc.date).getDate()}</span>
                                                <span className={styles.dateMonth}>{new Date(sc.date).toLocaleString('en', { month: 'short' })}</span>
                                            </div>
                                            <div className={styles.cardTitleBlock}>
                                                <h3>{sc.title}</h3>
                                                <span className={styles.cardLocation}>📍 {sc.venue}, {sc.city}</span>
                                                <span className={styles.cardTime}>🕐 {sc.time}</span>
                                            </div>
                                        </div>
                                        <p className={styles.cardDesc}>{sc.description}</p>

                                        <div className={styles.tags}>
                                            {tags.map((tag: string) => (
                                                <span key={tag} className={styles.tag}>#{tag}</span>
                                            ))}
                                        </div>

                                        <div className={styles.capacityRow}>
                                            <div className={styles.attendees}>
                                                {avatars.slice(0, 3).map((av: string, i: number) => (
                                                    av ? <Image key={i} src={av} alt="attendee" width={24} height={24} className={styles.attendeeAvatar} style={{ marginLeft: i > 0 ? '-8px' : 0 }} /> : null
                                                ))}
                                                <span className={styles.attendeeCount}>+{Math.max(0, rsvpCount - 3)} going</span>
                                            </div>
                                            <div className={styles.capacityBar}>
                                                <div className={styles.capacityFill} style={{ width: `${capacityPercent}%`, background: capacityPercent >= 100 ? '#ef4444' : 'var(--accent-primary)' }} />
                                            </div>
                                            <span className={styles.capacityText}>{rsvpCount}/{sc.capacity}</span>
                                        </div>

                                        {host && host.avatarUrl && (
                                            <div className={styles.hostRow}>
                                                <Image src={host.avatarUrl} alt={host.displayName} width={20} height={20} className={styles.hostAvatar} />
                                                <span>Hosted by <strong>{host.displayName}</strong></span>
                                            </div>
                                        )}

                                        {!sc.isPast && (
                                            <button
                                                className={`${styles.rsvpBtn} ${isRsvp ? styles.rsvpActive : ''} ${sc.isFull && !isRsvp ? styles.rsvpDisabled : ''}`}
                                                onClick={(e) => { e.preventDefault(); !sc.isFull && handleRSVP(sc.id); }}
                                                disabled={sc.isFull && !isRsvp}
                                            >
                                                {isRsvp ? "✅ You're going!" : sc.isFull ? 'Waitlist' : '🎉 RSVP Now'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </main>

            <Navigation />
        </div>
    );
}
