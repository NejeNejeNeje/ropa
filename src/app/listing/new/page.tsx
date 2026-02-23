'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc-client';
import { ClothingCategory, ClothingSize, GenderTarget, Condition, PricingType, CATEGORY_LABELS, CONDITION_LABELS, SIZE_ORDER } from '@/data/types';
import styles from './new-listing.module.css';

export default function NewListingPage() {
    const router = useRouter();
    const { data: session } = useSession();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ClothingCategory>('tops');
    const [size, setSize] = useState<ClothingSize>('M');
    const [genderTarget, setGenderTarget] = useState<GenderTarget>('unisex');
    const [condition, setCondition] = useState<Condition>('good');
    const [brand, setBrand] = useState('');
    const [pricingType, setPricingType] = useState<PricingType>('fixed');
    const [price, setPrice] = useState('');
    const [city, setCity] = useState((session?.user as { currentCity?: string } | null)?.currentCity || '');
    const [country, setCountry] = useState((session?.user as { country?: string } | null)?.country || '');
    const [error, setError] = useState('');

    const createMutation = trpc.listing.create.useMutation({
        onSuccess: () => router.push('/feed'),
        onError: (err) => setError(err.message),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!city.trim() || !country.trim()) {
            setError('City and country are required so travelers can find you.');
            return;
        }
        createMutation.mutate({
            title,
            description,
            category,
            size,
            genderTarget,
            condition,
            brand: brand || undefined,
            pricingType,
            price: pricingType !== 'free' && price ? parseFloat(price) : null,
            city: city.trim(),
            country: country.trim(),
            images: [],          // image upload — coming soon
        });
    };

    return (
        <div className={styles.page}>
            <header className={`${styles.header} glass-strong`}>
                <h1 className={styles.headerTitle}>➕ New Listing</h1>
            </header>

            <main className={styles.content}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Photo upload area — informational until storage is wired */}
                    <div className={styles.photoArea}>
                        <div className={styles.photoSlot}>
                            <span className={styles.photoIcon}>📷</span>
                            <span className={styles.photoLabel}>Add Photos</span>
                            <span className={styles.photoHint}>Image upload coming soon</span>
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

                    {/* Location */}
                    <div className={styles.field}>
                        <label className={styles.label}>Your Location *</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="City (e.g. Palomino)"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                style={{ flex: 1 }}
                            />
                            <input
                                type="text"
                                className="input"
                                placeholder="Country (e.g. Colombia)"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                required
                                style={{ flex: 1 }}
                            />
                        </div>
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
                                max="9999"
                            />
                        )}
                    </div>

                    {error && (
                        <p style={{ color: '#f87171', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>{error}</p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className={`btn btn-primary btn-lg ${styles.submitBtn}`}
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? 'Listing…' : '🎒 List Item'}
                    </button>
                </form>
            </main>

            <Navigation />
        </div>
    );
}
