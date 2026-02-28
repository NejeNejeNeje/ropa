'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import styles from './ReviewModal.module.css';

interface ReviewModalProps {
    matchId: string;
    otherUserName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReviewModal({ matchId, otherUserName, onClose, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState('');

    const reviewMutation = trpc.match.createReview.useMutation({
        onSuccess: () => {
            onSuccess();
            onClose();
        },
    });

    const handleSubmit = () => {
        if (rating === 0) return;
        reviewMutation.mutate({ matchId, rating, comment: comment.trim() || undefined });
    };

    const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing'];

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>✕</button>

                <div className={styles.header}>
                    <span className={styles.icon}>⭐</span>
                    <h2 className={styles.title}>Rate your swap</h2>
                    <p className={styles.subtitle}>How was trading with <strong>{otherUserName}</strong>?</p>
                </div>

                <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={`${styles.star} ${star <= (hovered || rating) ? styles.starFilled : ''}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            aria-label={`Rate ${star} stars`}
                        >
                            ★
                        </button>
                    ))}
                </div>

                {rating > 0 && (
                    <p className={styles.ratingLabel}>{LABELS[rating]}</p>
                )}

                <textarea
                    className={styles.comment}
                    placeholder="Add a comment (optional)…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    rows={3}
                />

                <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={rating === 0 || reviewMutation.isPending}
                >
                    {reviewMutation.isPending ? '⏳ Submitting…' : '✅ Submit Review'}
                </button>

                {reviewMutation.isError && (
                    <p className={styles.error}>Something went wrong. Try again.</p>
                )}

                <button className={styles.skipBtn} onClick={onClose}>Skip for now</button>
            </div>
        </div>
    );
}
