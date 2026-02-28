import { ITEM_CATEGORY_LABELS, ItemCategory } from '@/data/types';
import styles from './SwapRequestCard.module.css';

interface SwapRequestCardProps {
    request: {
        id: string;
        city: string;
        destination: string;
        needs: { category: string; description: string }[];
        offers: { category: string; description: string }[];
        user: {
            id: string;
            name: string;
            image: string | null;
            karmaPoints: number;
            trustTier: string;
            currentCity: string;
        } | null;
    };
    matchType: 'bilateral' | 'partial';
    myNeeds: string[];
    myOffers: string[];
}

export default function SwapRequestCard({ request, matchType, myNeeds, myOffers }: SwapRequestCardProps) {
    // Highlight categories that match your needs/offers
    const matchingOffers = request.offers.filter((o) => myNeeds.includes(o.category));
    const matchingNeeds = request.needs.filter((n) => myOffers.includes(n.category));

    const getCategoryLabel = (cat: string) => {
        const info = ITEM_CATEGORY_LABELS[cat as ItemCategory];
        return info ? `${info.emoji} ${info.label}` : cat;
    };

    return (
        <div className={`${styles.card} ${matchType === 'bilateral' ? styles.bilateral : styles.partial}`}>
            {/* User info */}
            <div className={styles.userRow}>
                <div className={styles.avatar}>
                    {request.user?.image ? (
                        <img src={request.user.image} alt="" className={styles.avatarImg} />
                    ) : (
                        <span className={styles.avatarFallback}>
                            {request.user?.name?.[0] || '?'}
                        </span>
                    )}
                </div>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{request.user?.name || 'Traveler'}</span>
                    <span className={styles.userMeta}>
                        ⭐ {request.user?.karmaPoints || 0} karma
                        {request.destination && ` · → ${request.destination}`}
                    </span>
                </div>
                {matchType === 'bilateral' && (
                    <span className={styles.matchLabel}>🎯 Match!</span>
                )}
            </div>

            {/* What they have (that you need) */}
            <div className={styles.itemRow}>
                <span className={styles.itemLabel}>Has:</span>
                <div className={styles.itemChips}>
                    {request.offers.map((o, i) => (
                        <span
                            key={i}
                            className={`${styles.itemChip} ${matchingOffers.includes(o) ? styles.chipMatch : ''}`}
                        >
                            {getCategoryLabel(o.category)}
                        </span>
                    ))}
                </div>
            </div>

            {/* What they need (that you have) */}
            <div className={styles.itemRow}>
                <span className={styles.itemLabel}>Needs:</span>
                <div className={styles.itemChips}>
                    {request.needs.map((n, i) => (
                        <span
                            key={i}
                            className={`${styles.itemChip} ${matchingNeeds.includes(n) ? styles.chipYouHave : ''}`}
                        >
                            {getCategoryLabel(n.category)}
                        </span>
                    ))}
                </div>
            </div>

            {/* Action */}
            <button className={styles.actionBtn}>
                {matchType === 'bilateral' ? '🔄 Swap Now' : '💬 Offer Something'}
            </button>
        </div>
    );
}
