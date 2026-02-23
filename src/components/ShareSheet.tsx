'use client';

import { useState } from 'react';
import { generateStoryCard } from '@/lib/StoryCardGenerator';
import styles from './ShareSheet.module.css';

interface ShareSheetProps {
    post: {
        id: string;
        imageUrl: string;
        caption: string;
        city: string;
        country: string;
        user?: { name?: string; displayName?: string } | Record<string, unknown>;
    };
    onClose: () => void;
}

export default function ShareSheet({ post, onClose }: ShareSheetProps) {
    const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
    const [copied, setCopied] = useState(false);

    const userName = (post.user as Record<string, unknown>)?.name as string
        || (post.user as Record<string, unknown>)?.displayName as string
        || 'ROPA Traveler';

    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://ropa-trade.vercel.app';

    const handleInstagramShare = async () => {
        setStatus('generating');
        try {
            const file = await generateStoryCard({
                imageUrl: post.imageUrl,
                userName,
                caption: post.caption,
                city: post.city,
                country: post.country,
            });

            // Mobile: try Web Share API with files
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `${userName} on ROPA`,
                });
                setStatus('done');
            } else {
                // Desktop fallback: download the card
                const url = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                a.click();
                URL.revokeObjectURL(url);
                setStatus('done');
            }
        } catch (err) {
            // User cancelled share — treat as success silently
            if ((err as Error).name === 'AbortError') {
                setStatus('idle');
            } else {
                setStatus('error');
            }
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback: select text
        }
    };

    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|Android/i.test(navigator.userAgent);

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
                <div className={styles.handle} />

                <h2 className={styles.title}>Share this post</h2>

                {/* Instagram Stories button */}
                <button
                    className={styles.mainBtn}
                    onClick={handleInstagramShare}
                    disabled={status === 'generating'}
                >
                    <span className={styles.mainBtnIcon}>📸</span>
                    <div className={styles.mainBtnText}>
                        <strong>
                            {status === 'generating' ? 'Creating story card…' :
                                status === 'done' ? (isMobile ? 'Shared! ✅' : 'Downloaded! ✅') :
                                    status === 'error' ? 'Try again' :
                                        'Share to Instagram Stories'}
                        </strong>
                        <span>
                            {isMobile
                                ? 'Opens your Instagram app — pick Stories'
                                : 'Downloads a story card to upload manually'}
                        </span>
                    </div>
                    <span className={styles.igGradient}>IG</span>
                </button>

                {status === 'done' && !isMobile && (
                    <p className={styles.hint}>
                        Open Instagram → Your Story → upload the downloaded image 📲
                    </p>
                )}

                {/* Copy link */}
                <button className={styles.secondaryBtn} onClick={handleCopyLink}>
                    <span>{copied ? '✅ Copied!' : '🔗 Copy link'}</span>
                </button>

                <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}
