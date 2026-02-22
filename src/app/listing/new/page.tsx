'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { ClothingCategory, ClothingSize, GenderTarget, Condition, PricingType, CATEGORY_LABELS, CONDITION_LABELS, SIZE_ORDER } from '@/data/types';
import styles from './new-listing.module.css';

export default function NewListingPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ClothingCategory>('tops');
    const [size, setSize] = useState<ClothingSize>('M');
    const [genderTarget, setGenderTarget] = useState<GenderTarget>('unisex');
    const [condition, setCondition] = useState<Condition>('good');
    const [brand, setBrand] = useState('');
    const [pricingType, setPricingType] = useState<PricingType>('fixed');
    const [price, setPrice] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className={styles.page}>
                <main className={styles.success}>
                    <span className={styles.successIcon}>✅</span>
                    <h2>Listed Successfully!</h2>
                    <p>Your <strong>{title}</strong> is now visible to nearby travelers.</p>
                    <div className={styles.successActions}>
                        <button className="btn btn-primary" onClick={() => setSubmitted(false)}>
                            List Another Item
                        </button>
                        <a href="/feed" className="btn btn-secondary">
                            Back to Feed
                        </a>
                    </div>
                </main>
                <Navigation />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={`${styles.header} glass-strong`}>
                <h1 className={styles.headerTitle}>➕ New Listing</h1>
            </header>

            <main className={styles.content}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Photo upload area */}
                    <div className={styles.photoArea}>
                        <div className={styles.photoSlot}>
                            <span className={styles.photoIcon}>📷</span>
                            <span className={styles.photoLabel}>Add Photos</span>
                            <span className={styles.photoHint}>Tap to upload (required)</span>
                        </div>
                    </div>

                    {/* Title */}
                    <div className={styles.field}>
                        <label className={styles.label}>Title *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g. Vintage Silk Blouse"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            maxLength={60}
                        />
                    </div>

                    {/* Description */}
                    <div className={styles.field}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={`input ${styles.textarea}`}
                            placeholder="Tell travelers about this item..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={500}
                        />
                        <span className={styles.charCount}>{description.length}/500</span>
                    </div>

                    {/* Category */}
                    <div className={styles.field}>
                        <label className={styles.label}>Category *</label>
                        <div className={styles.chipGrid}>
                            {(Object.keys(CATEGORY_LABELS) as ClothingCategory[]).map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`${styles.chip} ${category === cat ? styles.chipActive : ''}`}
                                    onClick={() => setCategory(cat)}
                                >
                                    {CATEGORY_LABELS[cat]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size */}
                    <div className={styles.field}>
                        <label className={styles.label}>Size *</label>
                        <div className={styles.chipGrid}>
                            {SIZE_ORDER.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className={`${styles.chip} ${styles.chipSmall} ${size === s ? styles.chipActive : ''}`}
                                    onClick={() => setSize(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gender target */}
                    <div className={styles.field}>
                        <label className={styles.label}>Gender *</label>
                        <div className={styles.chipGrid}>
                            {(['mens', 'womens', 'unisex'] as const).map((g) => (
                                <button
                                    key={g}
                                    type="button"
                                    className={`${styles.chip} ${genderTarget === g ? styles.chipActive : ''}`}
                                    onClick={() => setGenderTarget(g)}
                                >
                                    {g === 'mens' ? '👨 Mens' : g === 'womens' ? '👩 Womens' : '🧑 Unisex'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Condition */}
                    <div className={styles.field}>
                        <label className={styles.label}>Condition *</label>
                        <div className={styles.chipGrid}>
                            {(Object.keys(CONDITION_LABELS) as Condition[]).map((cond) => (
                                <button
                                    key={cond}
                                    type="button"
                                    className={`${styles.chip} ${condition === cond ? styles.chipActive : ''}`}
                                    onClick={() => setCondition(cond)}
                                >
                                    {CONDITION_LABELS[cond]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Brand */}
                    <div className={styles.field}>
                        <label className={styles.label}>Brand</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g. Nike, Zara, Handmade"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                        />
                    </div>

                    {/* Pricing */}
                    <div className={styles.field}>
                        <label className={styles.label}>Pricing *</label>
                        <div className={styles.chipGrid}>
                            {(['free', 'fixed', 'negotiable'] as const).map((pt) => (
                                <button
                                    key={pt}
                                    type="button"
                                    className={`${styles.chip} ${pricingType === pt ? styles.chipActive : ''}`}
                                    onClick={() => setPricingType(pt)}
                                >
                                    {pt === 'free' ? '🎁 Free' : pt === 'fixed' ? '💰 Fixed Price' : '🤝 Negotiable'}
                                </button>
                            ))}
                        </div>
                        {pricingType !== 'free' && (
                            <input
                                type="number"
                                className={`input ${styles.priceInput}`}
                                placeholder="Price (USD)"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                min="1"
                                max="999"
                            />
                        )}
                    </div>

                    {/* Submit */}
                    <button type="submit" className={`btn btn-primary btn-lg ${styles.submitBtn}`}>
                        🎒 List Item
                    </button>
                </form>
            </main>

            <Navigation />
        </div>
    );
}
