'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import styles from './profile.module.css';
import { CURRENT_USER, KARMA_LOG, USERS } from '@/data/mockData';
import { KARMA_TIERS, TRUST_TIER_CONFIG, CATEGORY_LABELS, TrustTier, ClothingCategory } from '@/data/types';
import { trpc } from '@/lib/trpc-client';
import { signOut } from 'next-auth/react';

export default function ProfilePage() {
    const { data: meData } = trpc.user.me.useQuery(undefined, { retry: false });
    const { data: karmaData } = trpc.karma.getLog.useQuery(undefined, { retry: false });
    const { data: buddiesData } = trpc.user.getSwapBuddies.useQuery(undefined, { retry: false });

    // Map DB user to display format, fallback to mock
    const user = meData ? {
        displayName: meData.name || '',
        avatarUrl: meData.image || '',
        bio: meData.bio || '',
        currentCity: meData.currentCity || '',
        country: meData.country || '',
        rating: meData.rating,
        totalTrades: meData.totalTrades,
        completedTrades: meData.completedTrades,
        karmaPoints: meData.karmaPoints,
        trustTier: (meData.trustTier || 'bronze') as TrustTier,
        citiesVisited: typeof meData.citiesVisited === 'string' ? JSON.parse(meData.citiesVisited) : [],
        preferredSizes: typeof meData.preferredSizes === 'string' ? JSON.parse(meData.preferredSizes) : [],
        preferredStyles: typeof meData.preferredStyles === 'string' ? JSON.parse(meData.preferredStyles) : [],
    } : CURRENT_USER;

    const karmaLog = karmaData || KARMA_LOG;
    const buddies = buddiesData
        ? buddiesData.map((b: Record<string, unknown>) => ({
            id: b.id as string,
            displayName: (b.name || '') as string,
            avatarUrl: (b.image || '') as string,
            currentCity: (b.currentCity || '') as string,
            trustTier: ((b.trustTier || 'bronze') as TrustTier),
        }))
        : USERS.filter((u) => CURRENT_USER.swapBuddyIds.includes(u.id));

    // Karma calculations
    const currentKarmaTier = [...KARMA_TIERS].reverse().find((t) => user.karmaPoints >= t.min) || KARMA_TIERS[0];
    const nextKarmaTier = KARMA_TIERS.find((t) => t.min > user.karmaPoints);
    const karmaProgress = nextKarmaTier
        ? ((user.karmaPoints - currentKarmaTier.min) / (nextKarmaTier.min - currentKarmaTier.min)) * 100
        : 100;
    const trustConfig = TRUST_TIER_CONFIG[user.trustTier];

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>👤 Profile</h1>
            </header>

            <main className={styles.main}>
                {/* Profile Card */}
                <div className={styles.profileCard}>
                    <div className={styles.avatarWrap}>
                        <Image src={user.avatarUrl} alt={user.displayName} width={80} height={80} className={styles.avatar} />
                        <span className={styles.trustBadge} style={{ background: trustConfig.color }}>{trustConfig.emoji}</span>
                    </div>
                    <div className={styles.profileInfo}>
                        <h2>{user.displayName}</h2>
                        <span className={styles.location}>📍 {user.currentCity}, {user.country}</span>
                        <p className={styles.bio}>{user.bio}</p>
                    </div>
                </div>

                {/* SwapShield Trust */}
                <div className={styles.trustCard}>
                    <div className={styles.trustHeader}>
                        <h3>🛡️ SwapShield</h3>
                        <span className={styles.tierBadge} style={{ borderColor: trustConfig.color, color: trustConfig.color }}>{trustConfig.label}</span>
                    </div>
                    <div className={styles.trustTiers}>
                        {(['bronze', 'silver', 'gold'] as const).map((tier) => {
                            const conf = TRUST_TIER_CONFIG[tier];
                            const isActive = tier === user.trustTier;
                            const isCompleted = user.trustTier === 'gold' || (user.trustTier === 'silver' && tier === 'bronze');
                            return (
                                <div key={tier} className={`${styles.tierStep} ${isActive ? styles.tierActive : ''} ${isCompleted ? styles.tierDone : ''}`}>
                                    <span className={styles.tierDot} style={{ borderColor: conf.color, background: isActive || isCompleted ? conf.color : 'transparent' }}>{isCompleted ? '✓' : ''}</span>
                                    <span className={styles.tierName}>{conf.label}</span>
                                    <span className={styles.tierReq}>{conf.requirement}</span>
                                </div>
                            );
                        })}
                    </div>
                    {user.trustTier !== 'gold' && (
                        <button className={styles.upgradeBtn}>⬆️ Upgrade to {TRUST_TIER_CONFIG[user.trustTier === 'bronze' ? 'silver' : 'gold'].label}</button>
                    )}
                </div>

                {/* Stats */}
                <div className={styles.statsRow}>
                    <div className={styles.stat}><span className={styles.statValue}>⭐ {user.rating}</span><span className={styles.statLabel}>Rating</span></div>
                    <div className={styles.stat}><span className={styles.statValue}>{user.totalTrades}</span><span className={styles.statLabel}>Trades</span></div>
                    <div className={styles.stat}><span className={styles.statValue}>{user.completedTrades}</span><span className={styles.statLabel}>Completed</span></div>
                    <div className={styles.stat}><span className={styles.statValue}>{user.citiesVisited.length}</span><span className={styles.statLabel}>Cities</span></div>
                </div>

                {/* Karma Points */}
                <div className={styles.karmaCard}>
                    <div className={styles.karmaHeader}>
                        <h3>{currentKarmaTier.name}</h3>
                        <span className={styles.karmaPoints}>{user.karmaPoints} pts</span>
                    </div>
                    <div className={styles.karmaBar}>
                        <div className={styles.karmaFill} style={{ width: `${karmaProgress}%` }} />
                    </div>
                    {nextKarmaTier && (
                        <p className={styles.karmaSub}>{nextKarmaTier.min - user.karmaPoints} pts to {nextKarmaTier.name} — {nextKarmaTier.perks}</p>
                    )}
                    <div className={styles.karmaLog}>
                        <h4>Recent Activity</h4>
                        {karmaLog.slice(0, 5).map((entry) => (
                            <div key={entry.id} className={styles.karmaEntry}>
                                <span className={styles.karmaAction}>{entry.description}</span>
                                <span className={styles.karmaAmount}>+{entry.points}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Passport */}
                <div className={styles.passportCard}>
                    <h3>🌍 Passport</h3>
                    <div className={styles.stamps}>
                        {user.citiesVisited.map((city: string) => (
                            <div key={city} className={styles.stamp}>
                                <span className={styles.stampCity}>{city}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Swap Buddies */}
                <div className={styles.buddiesCard}>
                    <h3>🤝 Swap Buddies</h3>
                    <p className={styles.buddiesSub}>{buddies.length} travelers you&apos;ve connected with</p>
                    <div className={styles.buddyList}>
                        {buddies.map((buddy) => (
                            <div key={buddy.id} className={styles.buddy}>
                                <Image src={buddy.avatarUrl} alt={buddy.displayName} width={40} height={40} className={styles.buddyAvatar} />
                                <div className={styles.buddyInfo}>
                                    <strong>{buddy.displayName}</strong>
                                    <span>📍 {buddy.currentCity}</span>
                                </div>
                                <span className={styles.buddyTrust} style={{ color: TRUST_TIER_CONFIG[buddy.trustTier as TrustTier].color }}>
                                    {TRUST_TIER_CONFIG[buddy.trustTier as TrustTier].emoji}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preferences */}
                <div className={styles.prefsCard}>
                    <h3>Preferences</h3>
                    <div className={styles.prefRow}>
                        <span className={styles.prefLabel}>Sizes</span>
                        <div className={styles.prefBadges}>
                            {user.preferredSizes.map((s: string) => (
                                <span key={s} className={styles.prefBadge}>{s}</span>
                            ))}
                        </div>
                    </div>
                    <div className={styles.prefRow}>
                        <span className={styles.prefLabel}>Styles</span>
                        <div className={styles.prefBadges}>
                            {user.preferredStyles.map((s: string) => (
                                <span key={s} className={styles.prefBadge}>{CATEGORY_LABELS[s as ClothingCategory] || s}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Settings */}
                <div className={styles.settingsCard}>
                    <h3>Settings</h3>
                    {[
                        { icon: '🔔', label: 'Notifications', value: 'On' },
                        { icon: '🌍', label: 'Location Sharing', value: 'Fuzzy (±500m)' },
                        { icon: '🔒', label: 'Privacy', value: 'Standard' },
                        { icon: '🌙', label: 'Theme', value: 'Dark' },
                        { icon: '🌐', label: 'Language', value: 'English' },
                    ].map((setting) => (
                        <div key={setting.label} className={styles.settingRow}>
                            <span>{setting.icon} {setting.label}</span>
                            <span className={styles.settingValue}>{setting.value}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.actions}>
                    <Link href="/profile/edit" className={styles.editBtn}>✏️ Edit Profile</Link>
                    <button className={styles.signOutBtn} onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</button>
                </div>
            </main>

            <Navigation />
        </div>
    );
}
