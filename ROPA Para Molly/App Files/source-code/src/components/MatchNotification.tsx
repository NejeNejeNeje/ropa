'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Listing } from '@/data/types';
import styles from './MatchNotification.module.css';
import Link from 'next/link';

interface MatchNotificationProps {
    listing: Listing;
    onClose: () => void;
}

export default function MatchNotification({ listing, onClose }: MatchNotificationProps) {
    return (
        <AnimatePresence>
            <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                {/* Confetti */}
                <div className={styles.confettiContainer}>
                    {Array.from({ length: 30 }).map((_, i) => (
                        <span
                            key={i}
                            className={styles.confetti}
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 3}s`,
                                backgroundColor: ['#f97316', '#06b6d4', '#8b5cf6', '#10b981', '#fbbf24', '#ef4444'][i % 6],
                                width: `${6 + Math.random() * 8}px`,
                                height: `${6 + Math.random() * 8}px`,
                            }}
                        />
                    ))}
                </div>

                <motion.div
                    className={styles.card}
                    initial={{ scale: 0.5, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.matchIcon}>🎉</div>
                    <h2 className={styles.title}>
                        It&apos;s a <span className="text-gradient">Match!</span>
                    </h2>
                    <p className={styles.subtitle}>
                        You and <strong>{listing.user?.displayName}</strong> both liked each other&apos;s items!
                    </p>

                    <div className={styles.items}>
                        <div className={styles.itemPreview}>
                            <img
                                src={listing.images[0]?.url}
                                alt={listing.title}
                                className={styles.itemImage}
                            />
                            <span className={styles.itemLabel}>{listing.title}</span>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Link href="/matches" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                            💬 Send a Message
                        </Link>
                        <button className="btn btn-ghost" onClick={onClose}>
                            Keep Swiping
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
