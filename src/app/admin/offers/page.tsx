



            <div className={styles.tableWrap}>
                <div className={styles.tableToolbar}>
                    <span className={styles.tableTitle}>All Offers</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Listing</th>
                            <th>Category</th>
                            <th>Buyer</th>
                            <th>Seller</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offers.length === 0 && (
                            <tr><td colSpan={8} className={styles.empty}>No offers found.</td></tr>
                        )}
                        {offers.map((o) => (
                            <tr key={o.id}>
                                <td className={styles.tdPrimary}>{o.listing.title}</td>
                                <td>{o.listing.category}</td>
                                <td>
                                    <Link href={`/admin/users/${o.buyer.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                        {o.buyer.name}
                                    </Link>
                                </td>
                                <td>
                                    <Link href={`/admin/users/${o.seller.id}`} className={styles.actionBtn} style={{ fontSize: '0.72rem' }}>
                                        {o.seller.name}
                                    </Link>
                                </td>
                                <td>{o.amount ? `€${o.amount}` : '—'}</td>
                                <td>
                                    <span className={`${styles.badge} ${o.offerType === 'swap' ? styles.badgeBlue : styles.badgeYellow}`}>
                                        {o.offerType}
                                    </span>
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${o.status === 'accepted' ? styles.badgeGreen :
                                            o.status === 'declined' ? styles.badgeRed :
                                                o.status === 'countered' ? styles.badgeBlue : styles.badgeGray
                                        }`}>{o.status}</span>
                                </td>
                                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}







