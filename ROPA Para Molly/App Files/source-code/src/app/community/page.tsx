'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import ShareSheet from '@/components/ShareSheet';
import PostComposer from '@/components/PostComposer';
import styles from './community.module.css';
import { TRAVEL_POSTS } from '@/data/mockData';
import { trpc } from '@/lib/trpc-client';

export default function CommunityPage() {
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [sharePost, setSharePost] = useState<{ id: string; imageUrl: string; caption: string; city: string; country: string; user?: unknown } | null>(null);
    const [showComposer, setShowComposer] = useState(false);
    const [posted, setPosted] = useState(false);

    const { data: feedData } = trpc.community.getFeed.useQuery({}, { retry: false });
    const likeMutation = trpc.community.toggleLike.useMutation();

    const posts = feedData?.posts || TRAVEL_POSTS;

    const toggleLike = (id: string) => {
        setLikedPosts((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
        likeMutation.mutate(id, { onError: () => { } });
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>✨ Travel Feed</h1>
                <button className={styles.newPostBtn} onClick={() => setShowComposer(true)}>📸 Share</button>
            </header>

            <main className={styles.main}>
                {posts.map((post) => {
                    const liked = likedPosts.has(post.id);
                    // Handle both DB format (user.name/image) and mock format (user.displayName/avatarUrl)
                    const user = post.user as Record<string, unknown> | undefined;
                    const userName = (user?.displayName || user?.name || '') as string;
                    const userAvatar = (user?.avatarUrl || user?.image || '') as string;

                    // Handle linked listing  
                    const linked = (post as Record<string, unknown>).linkedListing as Record<string, unknown> | undefined;
                    const linkedImages = linked?.images
                        ? (typeof linked.images === 'string' ? JSON.parse(linked.images as string) : linked.images) as { url: string }[]
                        : undefined;
                    const tags = typeof post.tags === 'string' ? JSON.parse(post.tags as string) : (post.tags || []);

                    return (
                        <article key={post.id} className={styles.post}>
                            <div className={styles.postAuthor}>
                                {userAvatar && (
                                    <Image src={userAvatar} alt={userName} width={36} height={36} className={styles.authorAvatar} />
                                )}
                                <div className={styles.authorInfo}>
                                    <strong>{userName}</strong>
                                    <span>📍 {post.city}, {post.country}</span>
                                </div>
                                <span className={styles.postTime}>{timeAgo(String(post.createdAt))}</span>
                            </div>

                            <div className={styles.postImage} style={{ backgroundImage: `url(${post.imageUrl})` }} onDoubleClick={() => toggleLike(post.id)} />

                            <div className={styles.postActions}>
                                <button className={`${styles.likeBtn} ${liked ? styles.liked : ''}`} onClick={() => toggleLike(post.id)}>
                                    {liked ? '❤️' : '🤍'} {post.likes + (liked ? 1 : 0)}
                                </button>
                                <button className={styles.shareBtn} onClick={() => setSharePost(post)}>🔗 Share</button>
                            </div>


                            <div className={styles.postCaption}>
                                <p><strong>{userName}</strong> {post.caption}</p>
                            </div>

                            <div className={styles.postTags}>
                                {tags.map((tag: string) => (
                                    <span key={tag} className={styles.tag}>#{tag}</span>
                                ))}
                            </div>

                            {linked && linkedImages && linkedImages.length > 0 && (
                                <div className={styles.linkedListing}>
                                    <div className={styles.linkedImage} style={{ backgroundImage: `url(${linkedImages[0]?.url ?? ''})` }} />
                                    <div className={styles.linkedInfo}>
                                        <span className={styles.linkedLabel}>🔗 Linked listing</span>
                                        <strong>{linked.title as string}</strong>
                                        <span>{linked.brand as string} · {linked.size as string}</span>
                                    </div>
                                </div>
                            )}
                        </article>
                    );
                })}
            </main>

            {sharePost && (
                <ShareSheet
                    post={{
                        id: sharePost.id,
                        imageUrl: sharePost.imageUrl,
                        caption: sharePost.caption,
                        city: sharePost.city,
                        country: sharePost.country,
                        user: sharePost.user as Record<string, unknown>,
                    }}
                    onClose={() => setSharePost(null)}
                />
            )}

            {showComposer && (
                <PostComposer
                    onClose={() => setShowComposer(false)}
                    onSuccess={() => {
                        setShowComposer(false);
                        setPosted(true);
                        setTimeout(() => setPosted(false), 3000);
                    }}
                />
            )}

            {posted && (
                <div style={{
                    position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
                    background: '#22c55e', color: '#fff', padding: '10px 20px',
                    borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem', zIndex: 200,
                    whiteSpace: 'nowrap',
                }}>
                    ✅ Posted! +10 karma
                </div>
            )}

            <Navigation />
        </div>
    );
}

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
}
