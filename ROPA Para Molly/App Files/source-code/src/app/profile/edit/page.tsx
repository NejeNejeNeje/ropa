'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc-client';
import styles from './edit.module.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const STYLES = [
    { value: 'tops', label: '👕 Tops' },
    { value: 'bottoms', label: '👖 Bottoms' },
    { value: 'outerwear', label: '🧥 Outerwear' },
    { value: 'dresses', label: '👗 Dresses' },
    { value: 'footwear', label: '👟 Footwear' },
    { value: 'accessories', label: '👜 Accessories' },
    { value: 'swimwear', label: '🩱 Swimwear' },
    { value: 'activewear', label: '🏃 Activewear' },
];

export default function EditProfilePage() {
    const router = useRouter();
    const { data: me, isLoading } = trpc.user.me.useQuery(undefined, { retry: false });
    const updateMutation = trpc.user.updateProfile.useMutation({
        onSuccess: () => router.push('/profile'),
    });

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [currentCity, setCurrentCity] = useState('');
    const [country, setCountry] = useState('');
    const [sizes, setSizes] = useState<string[]>([]);
    const [stylePrefs, setStylePrefs] = useState<string[]>([]);

    useEffect(() => {
        if (me) {
            setName(me.name || '');
            setBio(me.bio || '');
            setCurrentCity(me.currentCity || '');
            setCountry(me.country || '');
            const safeParse = (val: unknown): string[] => {
                if (Array.isArray(val)) return val as string[];
                if (typeof val === 'string' && val) {
                    try { return JSON.parse(val); } catch { return []; }
                }
                return [];
            };
            setSizes(safeParse(me.preferredSizes));
            setStylePrefs(safeParse(me.preferredStyles));
        }
    }, [me]);

    const toggleChip = <T extends string>(arr: T[], val: T): T[] =>
        arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

    const handleSave = () => {
        updateMutation.mutate({
            name,
            bio,
            currentCity,
            country,
            preferredSizes: sizes,
            preferredStyles: stylePrefs,
        });
    };

    if (isLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>Loading your profile…</div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/profile')}>← Back</button>
                <h1>✏️ Edit Profile</h1>
            </header>

            <main className={styles.main}>
                <div className={styles.field}>
                    <label className={styles.label}>Display Name</label>
                    <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Bio</label>
                    <textarea className={styles.textarea} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell travelers about yourself…" rows={3} />
                </div>

                <div className={styles.fieldRow}>
                    <div className={styles.field}>
                        <label className={styles.label}>📍 City</label>
                        <input className={styles.input} value={currentCity} onChange={(e) => setCurrentCity(e.target.value)} placeholder="e.g. Paris" />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>🌍 Country</label>
                        <input className={styles.input} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. France" />
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>👗 Preferred Sizes</label>
                    <div className={styles.chips}>
                        {SIZES.map((s) => (
                            <button
                                key={s}
                                className={`${styles.chip} ${sizes.includes(s) ? styles.chipActive : ''}`}
                                onClick={() => setSizes(toggleChip(sizes, s))}
                            >{s}</button>
                        ))}
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>✨ Style Preferences</label>
                    <div className={styles.chips}>
                        {STYLES.map((s) => (
                            <button
                                key={s.value}
                                className={`${styles.chip} ${stylePrefs.includes(s.value) ? styles.chipActive : ''}`}
                                onClick={() => setStylePrefs(toggleChip(stylePrefs, s.value))}
                            >{s.label}</button>
                        ))}
                    </div>
                </div>

                <button
                    className={styles.saveBtn}
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                >
                    {updateMutation.isPending ? '⏳ Saving…' : '✅ Save Changes'}
                </button>

                {updateMutation.isError && (
                    <p className={styles.error}>Something went wrong. Please try again.</p>
                )}
            </main>

            <Navigation />
        </div>
    );
}
