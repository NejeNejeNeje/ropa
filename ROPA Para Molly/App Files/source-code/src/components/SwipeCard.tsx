'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Listing, CONDITION_LABELS, CATEGORY_EMOJI, TRUST_TIER_CONFIG } from '@/data/types';
import { getDropZone } from '@/data/mockData';
import styles from './SwipeCard.module.css';
import { useState } from 'react';

interface SwipeCardProps {
    listing: Listing;
    onSwipe: (direction: 'left' | 'right') => void;
    isTop: boolean;
}

export default function SwipeCard({ listing, onSwipe, isTop }: SwipeCardProps) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
    const likeOpacity = useTransform(x, [20, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);
    const cardGlowGreen = useTransform(x, [0, 150], [0, 0.7]);
    const cardGlowRed = useTransform(x, [-150, 0], [0.7, 0]);
    const scale = useTransform(x, [-300, 0, 300], [0.96, 1, 0.96]);
    const [imgIndex, setImgIndex] = useState(0);
    const [exiting, setExiting] = useState(false);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        const threshold = 90;
        if (Math.abs(info.offset.x) > threshold) {
            setExiting(true);
            const direction = info.offset.x > 0 ? 'right' : 'left';
            setTimeout(() => onSwipe(direction), 250);
        }
    };

    const priceDisplay = listing.pricingType === 'free'
        ? 'FREE'
        : listing.pricingType === 'negotiable'
            ? `~${listing.price} ${listing.currency}`
            : `${listing.price} ${listing.currency}`;

    const trustConf = listing.user ? TRUST_TIER_CONFIG[listing.user.trustTier] : null;

    return (
        <motion.div
            className={`${styles.card} ${!isTop ? styles.cardBehind : ''}`}
            style={{
                x: isTop ? x : 0,
                rotate: isTop ? rotate : 0,
                scale: isTop ? scale : 0.95,
                zIndex: isTop ? 2 : 1,
            }}
            drag={isTop ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.75}
            onDragEnd={isTop ? handleDragEnd : undefined}
            animate={
                exiting
                    ? {
                        x: x.get() > 0 ? 450 : -450,
                        opacity: 0,
                        rotate: x.get() > 0 ? 20 : -20,
                        transition: { duration: 0.28, ease: 'easeIn' },
                    }
                    : {}
            }
            whileTap={isTop ? { cursor: 'grabbing' } : {}}
        >
            {/* Full-bleed image */}
            <div className={styles.imageContainer}>
                <img
                    src={listing.images[imgIndex]?.url}
                    alt={listing.title}
                    className={styles.image}
                    draggable={false}
                />

                {/* Dynamic edge glow for swipe direction */}
                {isTop && (
                    <>
                        <motion.div
                            className={styles.glowEdgeGreen}
                            style={{ opacity: cardGlowGreen }}
                        />
                        <motion.div
                            className={styles.glowEdgeRed}
                            style={{ opacity: cardGlowRed }}
                        />
                    </>
                )}

                {/* Gradient overlay — bottom info area */}
                <div className={styles.imageGradient} />

                {/* Image pagination dots at top */}
                {listing.images.length > 1 && (
                    <div className={styles.imageDots}>
                        {listing.images.map((_, i) => (
                            <button
                                key={i}
                                className={`${styles.imageDot} ${i === imgIndex ? styles.activeDot : ''}`}
                                onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                                aria-label={`View image ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Swipe indicators */}
                {isTop && (
                    <>
                        <motion.div
                            className={`${styles.indicator} ${styles.likeIndicator}`}
                            style={{ opacity: likeOpacity }}
                        >
                            <span className={styles.indicatorEmoji}>✨</span>
                            LOVE IT
                        </motion.div>
                        <motion.div
                            className={`${styles.indicator} ${styles.nopeIndicator}`}
                            style={{ opacity: nopeOpacity }}
                        >
                            <span className={styles.indicatorEmoji}>👋</span>
                            PASS
                        </motion.div>
                    </>
                )}

                {/* Price badge */}
                <div className={styles.topBadges}>
                    <span className={`badge ${listing.pricingType === 'free' ? 'badge-free' : 'badge-primary'}`}>
                        {priceDisplay}
                    </span>
                </div>

                {/* Info overlay — on the image */}
                <div className={styles.info}>
                    <div className={styles.infoMeta}>
                        <span className={styles.categoryTag}>
                            {CATEGORY_EMOJI[listing.category]} {listing.category}
                        </span>
                        <span className={styles.sizeTag}>{listing.size}</span>
                        <span className={`${styles.conditionTag} ${listing.condition === 'new_with_tags' ? styles.conditionNew : ''}`}>
                            {CONDITION_LABELS[listing.condition]}
                        </span>
                    </div>

                    <h3 className={styles.title}>{listing.title}</h3>
                    {listing.brand && <span className={styles.brand}>{listing.brand}</span>}

                    <div className={styles.footer}>
                        <div className={styles.location}>
                            📍 {listing.city}
                            {listing.dropZoneId && (() => {
                                const dz = getDropZone(listing.dropZoneId);
                                return dz ? <span className={styles.dropZoneBadge}> · 📦 {dz.name}</span> : null;
                            })()}
                        </div>
                        {listing.user && (
                            <div className={styles.user}>
                                <img
                                    src={listing.user.avatarUrl}
                                    alt={listing.user.displayName}
                                    className={styles.avatar}
                                />
                                <span className={styles.userName}>{listing.user.displayName}</span>
                                {trustConf && (
                                    <span
                                        className={styles.trustPill}
                                        style={{ color: trustConf.color, borderColor: `${trustConf.color}40`, background: `${trustConf.color}15` }}
                                    >
                                        {trustConf.emoji} {trustConf.label}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
