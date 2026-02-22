'use client';

import { useState } from 'react';
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

    const handleBidTypeChange = (type: BidType) => {
        setBidType(type);
        if (type === 'match') setAmount(askingPrice);
        else if (type === 'overbid') setAmount(Math.round(askingPrice * 1.2));
        else setAmount(Math.round(askingPrice * 0.8));
    };

    const handleSubmit = () => {
        if (amount <= 0) return;
        onSubmit(amount);
    };

    const amountDiff = amount - askingPrice;
    const diffLabel = amountDiff > 0
        ? `+${amountDiff} ${listing.currency} above asking`
        : amountDiff < 0
            ? `${amountDiff} ${listing.currency} below asking`
            : 'Matches asking price';

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
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
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.submitBtn} onClick={handleSubmit}>
                        Send Offer — {amount} {listing.currency}
                    </button>
                </div>

                <p className={styles.hint}>Seller has 24h to respond. Higher bids & closer distance = better match score.</p>
            </div>
        </div>
    );
}
