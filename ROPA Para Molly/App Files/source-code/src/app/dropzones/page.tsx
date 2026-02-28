'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import styles from './dropzones.module.css';
import { DROP_ZONES } from '@/data/mockData';
import { DROP_ZONE_TYPE_LABELS, DropZoneType } from '@/data/types';
import { trpc } from '@/lib/trpc-client';

const getTypeLabel = (type: string) => DROP_ZONE_TYPE_LABELS[type as DropZoneType] || { emoji: '📍', label: type };

export default function DropZonesPage() {
    const [selectedCity, setSelectedCity] = useState('All');
    const [scanningId, setScanningId] = useState<string | null>(null);

    const { data: dzData } = trpc.dropZone.getAll.useQuery(undefined, { retry: false });
    const dropZones = dzData || DROP_ZONES;
    const cities = ['All', ...Array.from(new Set(dropZones.map((dz) => dz.city)))];

    const filtered = selectedCity === 'All'
        ? dropZones
        : dropZones.filter((dz) => dz.city === selectedCity);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>📍 Drop Zones</h1>
                <span className={styles.count}>{dropZones.length} partner locations</span>
            </header>

            <main className={styles.main}>
                <div className={styles.cityFilter}>
                    {cities.map((city) => (
                        <button
                            key={city}
                            className={`${styles.cityChip} ${selectedCity === city ? styles.cityChipActive : ''}`}
                            onClick={() => setSelectedCity(city)}
                        >
                            {city}
                        </button>
                    ))}
                </div>

                <div className={styles.infoBar}>
                    <span>💡</span>
                    <p>Visit a Drop Zone, scan the QR code on the shelf, and instantly list or claim items!</p>
                </div>

                <div className={styles.zoneList}>
                    {filtered.map((dz) => {
                        const typeLabel = getTypeLabel(dz.type);
                        return (
                            <Link key={dz.id} href={`/dropzones/${dz.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                                <div className={styles.zoneCard}>
                                    <div className={styles.zoneImage} style={{ backgroundImage: `url(${dz.imageUrl})` }}>
                                        <span className={styles.zoneBadge}>{typeLabel.emoji} {typeLabel.label}</span>
                                    </div>
                                    <div className={styles.zoneBody}>
                                        <div className={styles.zoneTop}>
                                            <h3>{dz.name}</h3>
                                            <span className={styles.listingCount}>{dz.activeListings} items</span>
                                        </div>
                                        <p className={styles.zoneAddress}>📍 {dz.address}</p>
                                        <p className={styles.zoneDesc}>{dz.description}</p>
                                        <div className={styles.zoneMeta}>
                                            <span>🕐 {dz.hours}</span>
                                            <span>Partner since {new Date(dz.partnerSince).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div className={styles.zoneActions}>
                                            <button
                                                className={styles.scanBtn}
                                                onClick={(e) => { e.preventDefault(); setScanningId(dz.id); setTimeout(() => setScanningId(null), 2000); }}
                                            >
                                                {scanningId === dz.id ? '✅ Ready to scan!' : '📱 Scan QR Code'}
                                            </button>
                                            <button className={styles.dirBtn} onClick={(e) => e.preventDefault()}>🗺️ Directions</button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>🗺️</span>
                        <h3>No Drop Zones in {selectedCity} yet</h3>
                        <p>Know a great hostel or coworking space? Suggest a partner location!</p>
                        <button className={styles.suggestBtn}>Suggest a Location</button>
                    </div>
                )}
            </main>

            <Navigation />
        </div>
    );
}
