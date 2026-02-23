'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import styles from './MeetupWidget.module.css';

interface MeetupWidgetProps {
    matchId: string;
    currentUserId: string;
    existingMeetup?: {
        venue: string;
        address: string;
        city: string;
        date: string;
        status: string;
        proposedBy: string;
    } | null;
    onUpdate: () => void;
}

export default function MeetupWidget({ matchId, currentUserId, existingMeetup, onUpdate }: MeetupWidgetProps) {
    const [open, setOpen] = useState(false);
    const [venue, setVenue] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [date, setDate] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const { data: dropZones } = trpc.dropZone.getAll.useQuery();

    const selectDropZone = (dz: Record<string, unknown>) => {
        setVenue(dz.name as string);
        setAddress(dz.address as string);
        setCity(dz.city as string);
    };

    const propose = async () => {
        if (!venue || !address || !city || !date) {
            setError('Fill in all fields.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const res = await fetch(`/api/matches/${matchId}/meetup`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ venue, address, city, date }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            setOpen(false);
            onUpdate();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const respond = async (action: 'confirm' | 'cancel') => {
        setSaving(true);
        try {
            await fetch(`/api/matches/${matchId}/meetup`, {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            onUpdate();
        } finally {
            setSaving(false);
        }
    };

    // Existing proposed meetup view
    if (existingMeetup && existingMeetup.status !== 'cancelled') {
        const isProposer = existingMeetup.proposedBy === currentUserId;
        const isConfirmed = existingMeetup.status === 'confirmed';

        return (
            <div className={styles.widget}>
                <div className={`${styles.meetupCard} ${isConfirmed ? styles.confirmed : styles.proposed}`}>
                    <span className={styles.meetupIcon}>{isConfirmed ? '✅' : '📅'}</span>
                    <div className={styles.meetupInfo}>
                        <strong>{existingMeetup.venue}</strong>
                        <span>{existingMeetup.address}, {existingMeetup.city}</span>
                        <span>{new Date(existingMeetup.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        <span className={styles.status}>{isConfirmed ? '✅ Confirmed!' : isProposer ? '⏳ Waiting for confirmation…' : '👆 They proposed a meetup!'}</span>
                    </div>
                </div>
                {!isConfirmed && !isProposer && (
                    <div className={styles.respondBtns}>
                        <button className={styles.confirmBtn} onClick={() => respond('confirm')} disabled={saving}>✅ Confirm Meetup</button>
                        <button className={styles.cancelBtn} onClick={() => respond('cancel')} disabled={saving}>❌ Decline</button>
                    </div>
                )}
                {!isConfirmed && (
                    <button className={styles.newMeetupBtn} onClick={() => setOpen(true)}>📅 Propose different time</button>
                )}
            </div>
        );
    }

    return (
        <div className={styles.widget}>
            {!open ? (
                <button className={styles.proposBtn} onClick={() => setOpen(true)}>
                    📅 Schedule Meetup
                </button>
            ) : (
                <div className={styles.form}>
                    <div className={styles.formHeader}>
                        <strong>📅 Propose a Meetup</strong>
                        <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
                    </div>

                    {/* Drop Zone quick-select */}
                    {dropZones && dropZones.length > 0 && (
                        <div className={styles.dzSection}>
                            <span className={styles.dzLabel}>📍 ROPA Drop Zones</span>
                            <div className={styles.dzList}>
                                {dropZones.slice(0, 6).map((dz) => (
                                    <button
                                        key={dz.id}
                                        className={`${styles.dzChip} ${venue === dz.name ? styles.dzChipActive : ''}`}
                                        onClick={() => selectDropZone(dz as unknown as Record<string, unknown>)}
                                    >
                                        {dz.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <input className={styles.input} placeholder="Venue name" value={venue} onChange={(e) => setVenue(e.target.value)} />
                    <input className={styles.input} placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    <input className={styles.input} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                    <input
                        className={styles.input}
                        type="datetime-local"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <button className={styles.sendBtn} onClick={propose} disabled={saving}>
                        {saving ? '⏳ Sending…' : '📨 Send Meetup Proposal'}
                    </button>
                </div>
            )}
        </div>
    );
}
