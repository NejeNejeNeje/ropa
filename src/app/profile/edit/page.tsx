'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import LocationInput from '@/components/LocationInput';
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
    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);
    const [destination, setDestination] = useState('');
    const [destinationDate, setDestinationDate] = useState('');
    const [destLat, setDestLat] = useState<number | null>(null);
    const [destLng, setDestLng] = useState<number | null>(null);
    const [destCountry, setDestCountry] = useState('');
    const [sizes, setSizes] = useState<string[]>([]);
    const [stylePrefs, setStylePrefs] = useState<string[]>([]);

    useEffect(() => {
        if (me) {
            setName(me.name || '');
            setBio(me.bio || '');
            setCurrentCity(me.currentCity || '');
            setCountry(me.country || '');
            setLat(me.lat || 0);
            setLng(me.lng || 0);
            setDestination(me.destination || '');
            setDestinationDate(me.destinationDate ? new Date(me.destinationDate).toISOString().split('T')[0] : '');
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
            lat,
            lng,
            destination: destination || '',
            destinationDate: destinationDate ? new Date(destinationDate).toISOString() : null,
            destLat,
            destLng,
            destCountry,
            preferredSizes: sizes,
            preferredStyles: stylePrefs,
        });
    };

    if (isLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>Loading your profile...</div>
            </div>
        );
    }

    const locationDisplay = currentCity && country ? `${currentCity}, ${country}` : currentCity || country || '';
    const destDisplay = destination || '';

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/profile')}>← Back</button>
                <h1>Edit Profile</h1>
            </header>

            <main className={styles.main}>
                <div className={styles.field}>
                    <label className={styles.label}>Display Name</label>
                    <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Bio</label>
                    <textarea className={styles.textarea} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell travelers about yourself..." rows={3} />
                </div>

                {/* Current Location */}
                <div className={styles.locationSection}>
                    <label className={styles.label}>📍 Current Location</label>
                    <LocationInput
                        value={locationDisplay}
                        onSelect={(result) => {
                            setCurrentCity(result.city);
                            setCountry(result.country);
                            setLat(result.lat);
                            setLng(result.lng);
                        }}
                        onClear={() => {
                            setCurrentCity('');
                            setCountry('');
                            setLat(0);
                            setLng(0);
                        }}
                        placeholder="Search your current city..."
                    />
                </div>

                {/* Next Destination */}
                <div className={styles.locationSection}>
                    <label className={styles.label}>✈️ Next Destination</label>
                    <LocationInput
                        value={destDisplay}
                        onSelect={(result) => {
                            setDestination(`${result.city}, ${result.country}`);
                            setDestLat(result.lat);
                            setDestLng(result.lng);
                            setDestCountry(result.country);
                        }}
                        onClear={() => {
                            setDestination('');
                            setDestinationDate('');
                            setDestLat(null);
                            setDestLng(null);
                            setDestCountry('');
                        }}
                        placeholder="Where are you heading next?"
                    />
                    {destination && (
                        <div className={styles.dateField}>
                            <label className={styles.dateLabel}>When?</label>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={destinationDate}
                                onChange={(e) => setDestinationDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    )}
                    <p className={styles.hint}>Optional — helps travelers in your next city find you</p>
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
                    <label className={styles.label}>Style Preferences</label>
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
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>

                {updateMutation.isError && (
                    <p className={styles.error}>Something went wrong. Please try again.</p>
                )}
            </main>

            <Navigation />
        </div>
    );
}
