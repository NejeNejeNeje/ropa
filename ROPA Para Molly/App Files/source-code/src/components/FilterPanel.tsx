'use client';

import { ClothingCategory, ClothingSize, GenderTarget, Condition, CATEGORY_LABELS, CONDITION_LABELS, SIZE_ORDER } from '@/data/types';
import styles from './FilterPanel.module.css';

interface Filters {
    category: ClothingCategory | 'all';
    size: ClothingSize | 'all';
    gender: GenderTarget | 'all';
    condition: Condition | 'all';
    maxPrice: number;
    freeOnly: boolean;
}

interface FilterPanelProps {
    filters: Filters;
    onChange: (f: Filters) => void;
    onClose: () => void;
}

export default function FilterPanel({ filters, onChange, onClose }: FilterPanelProps) {
    const update = (key: keyof Filters, value: unknown) => {
        onChange({ ...filters, [key]: value });
    };

    return (
        <div className={`${styles.panel} glass-strong animate-slideUp`}>
            <div className={styles.header}>
                <h3>Filters</h3>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close filters">✕</button>
            </div>

            {/* Category */}
            <div className={styles.group}>
                <label className={styles.label}>Category</label>
                <div className={styles.chipGrid}>
                    <button
                        className={`${styles.chip} ${filters.category === 'all' ? styles.chipActive : ''}`}
                        onClick={() => update('category', 'all')}
                    >
                        All
                    </button>
                    {(Object.keys(CATEGORY_LABELS) as ClothingCategory[]).map((cat) => (
                        <button
                            key={cat}
                            className={`${styles.chip} ${filters.category === cat ? styles.chipActive : ''}`}
                            onClick={() => update('category', cat)}
                        >
                            {CATEGORY_LABELS[cat]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Size */}
            <div className={styles.group}>
                <label className={styles.label}>Size</label>
                <div className={styles.chipGrid}>
                    <button
                        className={`${styles.chip} ${filters.size === 'all' ? styles.chipActive : ''}`}
                        onClick={() => update('size', 'all')}
                    >
                        All
                    </button>
                    {SIZE_ORDER.map((size) => (
                        <button
                            key={size}
                            className={`${styles.chip} ${styles.chipSmall} ${filters.size === size ? styles.chipActive : ''}`}
                            onClick={() => update('size', size)}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gender */}
            <div className={styles.group}>
                <label className={styles.label}>Gender</label>
                <div className={styles.chipGrid}>
                    {(['all', 'womens', 'mens', 'unisex'] as const).map((g) => (
                        <button
                            key={g}
                            className={`${styles.chip} ${filters.gender === g ? styles.chipActive : ''}`}
                            onClick={() => update('gender', g)}
                        >
                            {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Condition */}
            <div className={styles.group}>
                <label className={styles.label}>Condition</label>
                <div className={styles.chipGrid}>
                    <button
                        className={`${styles.chip} ${filters.condition === 'all' ? styles.chipActive : ''}`}
                        onClick={() => update('condition', 'all')}
                    >
                        All
                    </button>
                    {(Object.keys(CONDITION_LABELS) as Condition[]).map((cond) => (
                        <button
                            key={cond}
                            className={`${styles.chip} ${filters.condition === cond ? styles.chipActive : ''}`}
                            onClick={() => update('condition', cond)}
                        >
                            {CONDITION_LABELS[cond]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className={styles.group}>
                <label className={styles.label}>
                    Max Price: <span className={styles.priceValue}>
                        {filters.maxPrice >= 100 ? 'Any' : `$${filters.maxPrice}`}
                    </span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.maxPrice}
                    onChange={(e) => update('maxPrice', parseInt(e.target.value))}
                    className={styles.slider}
                />
            </div>

            {/* Free only */}
            <div className={styles.group}>
                <label className={styles.toggle}>
                    <input
                        type="checkbox"
                        checked={filters.freeOnly}
                        onChange={(e) => update('freeOnly', e.target.checked)}
                    />
                    <span className={styles.toggleTrack}>
                        <span className={styles.toggleThumb} />
                    </span>
                    <span>Free items only</span>
                </label>
            </div>

            {/* Reset */}
            <button
                className={`btn btn-ghost ${styles.resetBtn}`}
                onClick={() => onChange({
                    category: 'all',
                    size: 'all',
                    gender: 'all',
                    condition: 'all',
                    maxPrice: 100,
                    freeOnly: false,
                })}
            >
                Reset All Filters
            </button>
        </div>
    );
}
