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
    const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
    const likeOpacity = useTransform(x, [0, 80], [0, 1]);
    const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);
    const scale = useTransform(x, [-300, 0, 300], [0.95, 1, 0.95]);
    const [imgIndex, setImgIndex] = useState(0);
    const [exiting, setExiting] = useState(false);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        const threshold = 100;
        if (Math.abs(info.offset.x) > threshold) {
            setExiting(true);
            const direction = info.offset.x > 0 ? 'right' : 'left';
            setTimeout(() => onSwipe(direction), 200);
        }
    };

    const priceDisplay = listing.pricingType === 'free'
        ? 'FREE'
        : listing.pricingType === 'negotiable'
            ? `~${listing.price} ${listing.currency}`
            : `${listing.price} ${listing.currency}`;

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
            dragElastic={0.8}
            onDragEnd={isTop ? handleDragEnd : undefined}
            animate={
                exiting
                    ? {
                        x: x.get() > 0 ? 400 : -400,
                        opacity: 0,
                        transition: { duration: 0.3 },
                    }
                    : {}
            }
            whileTap={isTop ? { cursor: 'grabbing' } : {}}
        >
            {/* Image */}
            <div className={styles.imageContainer}>
                <img
                    src={listing.images[imgIndex]?.url}
                    alt={listing.title}
                    className={styles.image}
                    draggable={false}
                />

                {/* Image pagination dots */}
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
                            LIKE ✨
                        </motion.div>
                        <motion.div
                            className={`${styles.indicator} ${styles.nopeIndicator}`}
                            style={{ opacity: nopeOpacity }}
                        >
                            NOPE 👋
                        </motion.div>
                    </>
                )}

                {/* Top badges */}
                <div className={styles.topBadges}>
                    <span className={`badge ${listing.pricingType === 'free' ? 'badge-free' : 'badge-primary'}`}>
                        {priceDisplay}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className={styles.info}>
                <div className={styles.infoHeader}>
                    <h3 className={styles.title}>{listing.title}</h3>
                    <span className={styles.brand}>{listing.brand}</span>
                </div>

                <div className={styles.tags}>
                    <span className="badge">
                        {CATEGORY_EMOJI[listing.category]} {listing.category}
                    </span>
                    <span className="badge">{listing.size}</span>
                    <span className="badge" style={{ color: listing.condition === 'new_with_tags' ? 'var(--color-success)' : undefined }}>
                        {CONDITION_LABELS[listing.condition]}
                    </span>
                    <span className="badge">{listing.genderTarget}</span>
                </div>

                <p className={styles.description}>{listing.description}</p>

                <div className={styles.footer}>
                    <div className={styles.location}>
                        📍 {listing.city}, {listing.country}
                        {listing.dropZoneId && (() => {
                            const dz = getDropZone(listing.dropZoneId);
                            return dz ? <span className={styles.dropZoneBadge}>📦 {dz.name}</span> : null;
                        })()}
                    </div>
                    <div className={styles.user}>
                        {listing.user && (
                            <>
                                <img
                                    src={listing.user.avatarUrl}
                                    alt={listing.user.displayName}
                                    className={styles.avatar}
                                />
                                <span className={styles.userName}>{listing.user.displayName}</span>
                                <span className={styles.rating}>⭐ {listing.user.rating}</span>
                                <span
                                    className={styles.trustIcon}
                                    style={{ color: TRUST_TIER_CONFIG[listing.user.trustTier].color }}
                                    title={TRUST_TIER_CONFIG[listing.user.trustTier].label}
                                >
                                    🛡️
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
