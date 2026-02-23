'use client';

import { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc-client';
import styles from './PostComposer.module.css';

interface PostComposerProps {
    onClose: () => void;
    onSuccess: () => void;
}

const TAGS = ['#outerwear', '#tops', '#bottoms', '#footwear', '#accessories', '#swimwear', '#vintage', '#minimalist', '#streetwear', '#sustainable'];

export default function PostComposer({ onClose, onSuccess }: PostComposerProps) {
    const [caption, setCaption] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const utils = trpc.useUtils();
    const createPost = trpc.community.createPost.useMutation({
        onSuccess: () => {
            utils.community.getFeed.invalidate();
            onSuccess();
        },
        onError: (err) => setError(err.message),
    });

    const uploadImage = async (file: File) => {
        setUploading(true);
        setPreview(URL.createObjectURL(file));
        try {
            const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                body: file,
                headers: { 'content-type': file.type },
            });
            const blob = await res.json() as { url: string };
            setImageUrl(blob.url);
        } catch {
            setError('Image upload failed. Try a different photo.');
            setPreview('');
        } finally {
            setUploading(false);
        }
    };

    const toggleTag = (tag: string) =>
        setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

    const handlePost = () => {
        if (!imageUrl) { setError('Add a photo first.'); return; }
        if (!caption.trim()) { setError('Add a caption.'); return; }
        if (!city.trim() || !country.trim()) { setError('Add your city and country.'); return; }

        createPost.mutate({
            imageUrl,
            caption: caption.trim(),
            city: city.trim(),
            country: country.trim(),
            tags: selectedTags.map((t) => t.replace('#', '')),
        });
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
                <div className={styles.handle} />

                <div className={styles.topRow}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <h2 className={styles.title}>New Post</h2>
                    <button
                        className={styles.postBtn}
                        onClick={handlePost}
                        disabled={createPost.isPending || uploading}
                    >
                        {createPost.isPending ? '⏳' : 'Share'}
                    </button>
                </div>

                {/* Image area */}
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }}
                />
                <div
                    className={styles.imageArea}
                    onClick={() => fileRef.current?.click()}
                    style={preview ? { backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                    {!preview && (
                        <div className={styles.imagePlaceholder}>
                            <span className={styles.cameraIcon}>📷</span>
                            <span className={styles.imageHint}>{uploading ? '⏳ Uploading…' : 'Tap to add photo'}</span>
                        </div>
                    )}
                    {preview && uploading && (
                        <div className={styles.uploadingOverlay}>⏳</div>
                    )}
                    {preview && !uploading && (
                        <button className={styles.changePhoto} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                            Change
                        </button>
                    )}
                </div>

                {/* Caption */}
                <textarea
                    className={styles.caption}
                    placeholder="Share your swap story… ✍️"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={280}
                    rows={3}
                />
                <span className={styles.charCount}>{caption.length}/280</span>

                {/* Location */}
                <div className={styles.locationRow}>
                    <input
                        className={styles.locationInput}
                        placeholder="📍 City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                    <input
                        className={styles.locationInput}
                        placeholder="🌍 Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    />
                </div>

                {/* Tags */}
                <div className={styles.tagsRow}>
                    {TAGS.map((tag) => (
                        <button
                            key={tag}
                            className={`${styles.tag} ${selectedTags.includes(tag) ? styles.tagActive : ''}`}
                            onClick={() => toggleTag(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {error && <p className={styles.error}>{error}</p>}
            </div>
        </div>
    );
}
