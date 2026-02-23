'use client';

import { useState } from 'react';
import styles from './MeetupSheet.module.css';

type MeetupStatus = 'proposed' | 'confirmed' | 'cancelled' | null;

interface MeetupSheetProps {
    matchId: string;
    currentUserId: string;
    proposedBy?: string | null;
    meetupVenue?: string | null;
    meetupAddress?: string | null;
    meetupCity?: string | null;
    meetupLat?: number | null;
    meetupLng?: number | null;
    meetupDate?: string | null;
    meetupStatus?: MeetupStatus;
    prefillCity?: string;            // from listing city
    onClose: () => void;
    onUpdated: () => void;           // refresh after change
}

function mapsUrl(lat?: number | null, lng?: number | null, address?: string | null, city?: string | null) {
    if (lat && lng) return `https://maps.google.com/?q=${lat},${lng}`;
    const query = [address, city].filter(Boolean).join(', ');
    return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

function appleMapsUrl(lat?: number | null, lng?: number | null, address?: string | null, city?: string | null) {
    if (lat && lng) return `https://maps.apple.com/?ll=${lat},${lng}`;
    const query = [address, city].filter(Boolean).join(', ');
    return `https://maps.apple.com/?q=${encodeURIComponent(query)}`;
}

export default function MeetupSheet({
    matchId, currentUserId, proposedBy,
    meetupVenue, meetupAddress, meetupCity, meetupLat, meetupLng, meetupDate, meetupStatus,
    prefillCity = '',
    onClose, onUpdated,
}: MeetupSheetProps) {
    const isProposer = proposedBy === currentUserId;
    const isPending = meetupStatus === 'proposed';
    const isConfirmed = meetupStatus === 'confirmed';
    const isCancelled = meetupStatus === 'cancelled';
    const canConfirm = isPending && !isProposer;

    // Propose form state
    const [venue, setVenue] = useState(meetupVenue || '');
    const [address, setAddress] = useState(meetupAddress || '');
    const [city, setCity] = useState(meetupCity || prefillCity);
    const [date, setDate] = useState(meetupDate ? meetupDate.slice(0, 16) : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const showForm = !meetupStatus || isCancelled;

    const handlePropose = async () => {
        if (!venue || !address || !city || !date) { setError('All fields are required.'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch(`/api/matches/${matchId}/meetup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ venue, address, city, date }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            onUpdated();
            onClose();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'confirm' | 'cancel') => {
        setLoading(true); setError('');
        try {
            const res = await fetch(`/api/matches/${matchId}/meetup`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            onUpdated();
            onClose();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={styles.sheet}>
                <div className={styles.handle} />

                {/* ── Header ─────────────────────────── */}
                <div className={styles.header}>
                    <span className={styles.headerEmoji}>📍</span>
                    <div>
                        <h2 className={styles.title}>Meetup Location</h2>
                        <p className={styles.subtitle}>
                            {isConfirmed ? 'Swap location confirmed ✅' :
                                isPending && isProposer ? 'Waiting for the other person to confirm' :
                                    isPending ? 'A meetup has been proposed for you' :
                                        'Propose where to meet for the swap'}
                        </p>
                    </div>
                    <button className={styles.close} onClick={onClose}>✕</button>
                </div>

                {/* ── Confirmed view ──────────────────── */}
                {isConfirmed && (
                    <div className={styles.confirmedCard}>
                        <div className={styles.confirmedVenue}>{meetupVenue}</div>
                        <div className={styles.confirmedAddress}>{meetupAddress}</div>
                        {meetupCity && <div className={styles.confirmedCity}>📍 {meetupCity}</div>}
                        {meetupDate && (
                            <div className={styles.confirmedDate}>
                                🗓️ {new Date(meetupDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                        <div className={styles.mapButtons}>
                            <a
                                href={mapsUrl(meetupLat, meetupLng, meetupAddress, meetupCity)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.mapBtn} ${styles.googleBtn}`}
                            >
                                🗺️ Google Maps
                            </a>
                            <a
                                href={appleMapsUrl(meetupLat, meetupLng, meetupAddress, meetupCity)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.mapBtn} ${styles.appleBtn}`}
                            >
                                🍎 Apple Maps
                            </a>
                        </div>
                    </div>
                )}

                {/* ── Pending view (proposer sees read-only) ── */}
                {isPending && (
                    <div className={styles.pendingCard}>
                        <div className={styles.pendingLabel}>Proposed meetup</div>
                        <div className={styles.confirmedVenue}>{meetupVenue}</div>
                        <div className={styles.confirmedAddress}>{meetupAddress}</div>
                        {meetupCity && <div className={styles.confirmedCity}>📍 {meetupCity}</div>}
                        {meetupDate && (
                            <div className={styles.confirmedDate}>
                                🗓️ {new Date(meetupDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                        {canConfirm && (
                            <div className={styles.actions}>
                                <button
                                    className={`${styles.btn} ${styles.btnConfirm}`}
                                    onClick={() => handleAction('confirm')}
                                    disabled={loading}
                                >
                                    ✅ Confirm meetup
                                </button>
                                <button
                                    className={`${styles.btn} ${styles.btnCancel}`}
                                    onClick={() => handleAction('cancel')}
                                    disabled={loading}
                                >
                                    ❌ Decline
                                </button>
                            </div>
                        )}
                        {isProposer && (
                            <div className={styles.waiting}>⏳ Waiting for the other person to confirm…</div>
                        )}
                    </div>
                )}

                {/* ── Propose form ─────────────────────── */}
                {showForm && (
                    <div className={styles.form}>
                        {isCancelled && (
                            <div className={styles.cancelledBanner}>Previous meetup was declined. Propose a new one below.</div>
                        )}
                        <div className={styles.field}>
                            <label className={styles.label}>Venue name *</label>
                            <input
                                className={styles.input}
                                placeholder="e.g. Selina Hostel, La Paloma Café"
                                value={venue}
                                onChange={e => setVenue(e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Address / Landmark *</label>
                            <input
                                className={styles.input}
                                placeholder="e.g. Calle del Sol, next to the market"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>City *</label>
                            <input
                                className={styles.input}
                                placeholder="e.g. Palomino, Colombia"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Date & Time *</label>
                            <input
                                type="datetime-local"
                                className={styles.input}
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                            />
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        <button
                            className={`${styles.btn} ${styles.btnConfirm}`}
                            onClick={handlePropose}
                            disabled={loading}
                        >
                            {loading ? 'Sending…' : '📍 Propose Meetup'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
