'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import styles from './OfferSheet.module.css';

type BidType = 'underbid' | 'match' | 'overbid';

interface OfferSheetProps {
    listing: {
        id: string;
        title: string;
        brand: string;
        price: number | null;
        currency: string;
        imageUrl: string;
    };
    onSubmit: (amount: number) => void;
    onClose: () => void;
}

export default function OfferSheet({ listing, onSubmit, onClose }: OfferSheetProps) {
    const askingPrice = listing.price || 0;
    const [bidType, setBidType] = useState<BidType>('match');
    const [amount, setAmount] = useState(askingPrice);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleBidTypeChange = (type: BidType) => {
        setBidType(type);
        if (type === 'match') setAmount(askingPrice);
        else if (type === 'overbid') setAmount(Math.round(askingPrice * 1.2));
        else setAmount(Math.round(askingPrice * 0.8));
    };

    const handleSubmit = async () => {
        if (amount <= 0 || isSubmitting) return;
        setIsSubmitting(true);
        try {
            // We await onSubmit if it is an async function (or wrap in Promise if needed)
            await onSubmit(amount);
        } finally {
            setIsSubmitting(false);
        }
    };

    const amountDiff = amount - askingPrice;
    const diffLabel = amountDiff > 0
        ? `+${amountDiff} ${listing.currency} above asking`
        : amountDiff < 0
            ? `${amountDiff} ${listing.currency} below asking`
            : 'Matches asking price';

    return (
        <AnimatePresence>
            <motion.div
                className={styles.backdrop}
                onClick={onClose}
                initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
                exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                transition={{ duration: 0.3 }}
            >
                <motion.div
                    className={styles.sheet}
                    onClick={(e) => e.stopPropagation()}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                    <div className={styles.handle} />

                    <div className={styles.listingPreview}>
                        <div className={styles.listingThumb} style={{ backgroundImage: `url(${listing.imageUrl})` }} />
                        <div className={styles.listingInfo}>
                            <strong>{listing.title}</strong>
                            <span>{listing.brand}</span>
                            <span className={styles.askingPrice}>
                                Asking: {askingPrice} {listing.currency}
                            </span>
                        </div>
                    </div>

                    <h3 className={styles.sheetTitle}>Make an Offer</h3>

                    <div className={styles.bidSelector}>
                        <button
                            className={`${styles.bidOption} ${bidType === 'underbid' ? styles.bidActive : ''} ${styles.bidUnder}`}
                            onClick={() => handleBidTypeChange('underbid')}
                        >
                            <span className={styles.bidIcon}>📉</span>
                            <span>Underbid</span>
                        </button>
                        <button
                            className={`${styles.bidOption} ${bidType === 'match' ? styles.bidActive : ''} ${styles.bidMatch}`}
                            onClick={() => handleBidTypeChange('match')}
                        >
                            <span className={styles.bidIcon}>🤝</span>
                            <span>Match</span>
                        </button>
                        <button
                            className={`${styles.bidOption} ${bidType === 'overbid' ? styles.bidActive : ''} ${styles.bidOver}`}
                            onClick={() => handleBidTypeChange('overbid')}
                        >
                            <span className={styles.bidIcon}>🔥</span>
                            <span>Overbid</span>
                        </button>
                    </div>

                    <div className={styles.priceInput}>
                        <label>Your Offer</label>
                        <div className={styles.inputWrap}>
                            <span className={styles.currencySymbol}>{listing.currency === 'EUR' ? '€' : '$'}</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                min={1}
                                className={styles.amountInput}
                            />
                        </div>
                        <span className={`${styles.diffLabel} ${amountDiff > 0 ? styles.diffPositive : amountDiff < 0 ? styles.diffNegative : ''}`}>
                            {diffLabel}
                        </span>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>Cancel</button>
                        <button className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
                            {isSubmitting ? (
                                <Loader2 className="spinner" size={18} />
                            ) : (
                                `Send Offer — ${amount} ${listing.currency}`
                            )}
                        </button>
                    </div>

                    <p className={styles.hint}>Seller has 24h to respond. Higher bids & closer distance = better match score.</p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
