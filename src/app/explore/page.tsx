'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import styles from './explore.module.css';
import { DROP_ZONES, SWAP_CIRCLES, TRAVEL_POSTS } from '@/data/mockData';
import { DROP_ZONE_TYPE_LABELS, DropZoneType } from '@/data/types';
import { trpc } from '@/lib/trpc-client';
import { motion } from 'framer-motion';

const getTypeLabel = (type: string) => DROP_ZONE_TYPE_LABELS[type as DropZoneType] || { emoji: '📍', label: type };

export default function ExplorePage() {
    const { data: dzData } = trpc.dropZone.getAll.useQuery(undefined, { retry: false });
    const { data: circleData } = trpc.circle.getUpcoming.useQuery(undefined, { retry: false });
    const { data: postData } = trpc.community.getFeed.useQuery({}, { retry: false });

    const dropZones = dzData || DROP_ZONES;
    const upcomingCircles = circleData || SWAP_CIRCLES.filter((sc) => !sc.isPast);
    const travelPosts = postData?.posts || TRAVEL_POSTS;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>🌍 Explore</h1>
            </header>

            <motion.main
                className={styles.main}
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.15
                        }
                    }
                }}
            >
                {/* Drop Zones */}
                <motion.section
                    className={styles.section}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
                    }}
                >
                    <div className={styles.sectionHeader}>
                        <h2>📍 Drop Zones</h2>
                        <Link href="/dropzones" className={styles.seeAll}>See all →</Link>
                    </div>
                    <p className={styles.sectionSub}>Swap shelves at hostels & coworkings near you</p>
                    <div className={styles.horizontalScroll}>
                        {dropZones.slice(0, 4).map((dz) => {
                            const typeLabel = getTypeLabel(dz.type);
                            return (
                                <Link href="/dropzones" key={dz.id} className={styles.previewCard}>
                                    <div className={styles.previewImage} style={{ backgroundImage: `url(${dz.imageUrl})` }}>
                                        <span className={styles.typeBadge}>{typeLabel.emoji} {typeLabel.label}</span>
                                    </div>
                                    <div className={styles.previewInfo}>
                                        <strong>{dz.name}</strong>
                                        <span>📍 {dz.city} · {dz.activeListings} items</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </motion.section>

                {/* Swap Circles */}
                <motion.section
                    className={styles.section}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
                    }}
                >
                    <div className={styles.sectionHeader}>
                        <h2>🔄 Swap Circles</h2>
                        <Link href="/circles" className={styles.seeAll}>See all →</Link>
                    </div>
                    <p className={styles.sectionSub}>Group swap events in your city</p>
                    <div className={styles.circlesList}>
                        {upcomingCircles.slice(0, 2).map((sc) => {
                            const dateObj = new Date(sc.date);
                            const attendees = (sc as Record<string, unknown>).rsvps
                                ? ((sc as Record<string, unknown>).rsvps as unknown[]).length
                                : (sc as Record<string, unknown>).attendeeCount as number || 0;
                            return (
                                <Link href="/circles" key={sc.id} className={styles.circleCard}>
                                    <div className={styles.circleDate}>
                                        <span className={styles.circleDay}>{dateObj.getDate()}</span>
                                        <span className={styles.circleMonth}>{dateObj.toLocaleString('en', { month: 'short' })}</span>
                                    </div>
                                    <div className={styles.circleInfo}>
                                        <strong>{sc.title}</strong>
                                        <span>📍 {sc.venue} · {sc.city}</span>
                                        <span>🕐 {sc.time} · {attendees}/{sc.capacity} going</span>
                                    </div>
                                    {sc.isFull ? (
                                        <span className={styles.fullBadge}>Full</span>
                                    ) : (
                                        <span className={styles.rsvpBadge}>RSVP</span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </motion.section>

                {/* TravelSwap — accessible from Explore, no longer in main nav */}
                <motion.section
                    className={styles.section}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
                    }}
                >
                    <div className={styles.sectionHeader}>
                        <h2>🔄 Travel Requests</h2>
                        <Link href="/travelswap" className={styles.seeAll}>Open →</Link>
                    </div>
                    <p className={styles.sectionSub}>Need gear at your destination? Post what you need and what you can offer.</p>
                </motion.section>

                {/* Travel Feed */}
                <motion.section
                    className={styles.section}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
                    }}
                >
                    <div className={styles.sectionHeader}>
                        <h2>✨ Travel Feed</h2>
                        <Link href="/community" className={styles.seeAll}>See all →</Link>
                    </div>
                    <p className={styles.sectionSub}>Stories from the swap community</p>
                    <div className={styles.feedPreview}>
                        {travelPosts.slice(0, 3).map((post) => (
                            <Link href="/community" key={post.id} className={styles.feedCard}>
                                <div className={styles.feedImage} style={{ backgroundImage: `url(${post.imageUrl})` }}>
                                    <div className={styles.feedOverlay}>
                                        <span>❤️ {post.likes}</span>
                                        <span>💬 {post.commentCount}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.section>
            </motion.main>

            <Navigation />
        </div>
    );
}
