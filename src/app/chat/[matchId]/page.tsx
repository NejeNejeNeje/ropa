'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc-client';
import styles from './chat.module.css';

export default function ChatPage() {
    const { matchId } = useParams<{ matchId: string }>();
    const { data: session } = useSession();
    const currentUserId = (session?.user as { id?: string } | undefined)?.id ?? '';

    const { data: matchData, refetch } = trpc.match.getAll.useQuery(undefined, { retry: false });
    const sendMutation = trpc.message.send.useMutation({
        onSuccess: () => { refetch(); setBody(''); },
    });
    const markReadMutation = trpc.message.markRead.useMutation();

    const match = (matchData as Record<string, unknown>[] | undefined)?.find(
        (m) => (m as { id: string }).id === matchId
    ) as Record<string, unknown> | undefined;

    const messages = (match?.messages as Record<string, unknown>[] | undefined) ?? [];
    const other = (match?.userB as Record<string, unknown> | undefined);
    const otherName = (other?.name || other?.displayName || 'Swap partner') as string;

    const [body, setBody] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    // Mark messages read on open
    useEffect(() => {
        if (matchId) markReadMutation.mutate(matchId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSend = () => {
        if (!body.trim() || !matchId) return;
        sendMutation.mutate({ matchId, body: body.trim() });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/matches" className={styles.back}>← Back</Link>
                <div className={styles.headerInfo}>
                    <span className={styles.partnerName}>{otherName}</span>
                    <span className={styles.matchStatus}>
                        {match?.status as string ?? 'active'}
                    </span>
                </div>
            </header>

            <main className={styles.messages}>
                {messages.length === 0 && (
                    <div className={styles.emptyChat}>
                        <span>👋</span>
                        <p>Start the conversation! Agree on a meetup time and place.</p>
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = (msg.senderId as string) === currentUserId;
                    return (
                        <div key={msg.id as string} className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                            <p className={styles.bubbleText}>{msg.body as string}</p>
                            <span className={styles.bubbleTime}>
                                {new Date(msg.createdAt as string).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                {isMe && (msg.isRead ? ' ✓✓' : ' ✓')}
                            </span>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </main>

            <div className={styles.inputBar}>
                <textarea
                    className={styles.input}
                    placeholder="Message…"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    maxLength={1000}
                />
                <button
                    className={styles.sendBtn}
                    onClick={handleSend}
                    disabled={!body.trim() || sendMutation.isPending}
                    aria-label="Send"
                >
                    ➤
                </button>
            </div>

            <Navigation />
        </div>
    );
}
