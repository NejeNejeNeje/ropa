'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

    // CHAT-1: Use match.getMessages for the full thread, not match.getAll (which only returns 1 msg)
    // CHAT-2: Poll every 3 seconds so both sides see new messages without a refresh
    const { data: messages = [], refetch } = trpc.match.getMessages.useQuery(
        matchId ?? '',
        {
            enabled: !!matchId,
            retry: false,
            refetchInterval: 3000,        // CHAT-2: live polling
        }
    );

    // Partner info from the matches list — lightweight context pass via getAll
    const { data: matchData } = trpc.match.getAll.useQuery(undefined, { retry: false });
    const match = (matchData as Record<string, unknown>[] | undefined)?.find(
        (m) => (m as { id: string }).id === matchId
    ) as Record<string, unknown> | undefined;

    const other = (match?.userB as Record<string, unknown> | undefined);
    const otherName = (other?.name || other?.displayName || 'Swap partner') as string;
    const otherAvatar = (other?.image || other?.avatarUrl || '') as string;

    const sendMutation = trpc.message.send.useMutation({
        onSuccess: () => { refetch(); setBody(''); },
    });
    const markReadMutation = trpc.message.markRead.useMutation();

    const [body, setBody] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Mark messages read on open
    useEffect(() => {
        if (matchId) markReadMutation.mutate(matchId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // CHAT-7: Auto-resize textarea as user types
    const handleBodyChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBody(e.target.value);
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
        }
    }, []);

    const handleSend = () => {
        if (!body.trim() || !matchId) return;
        sendMutation.mutate({ matchId, body: body.trim() });
        // Reset height after send
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
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
                    {otherAvatar && (
                        <img src={otherAvatar} alt={otherName} className={styles.headerAvatar} />
                    )}
                    <div>
                        <span className={styles.partnerName}>{otherName}</span>
                        <span className={styles.matchStatus}>
                            {match?.status as string ?? 'active'}
                        </span>
                    </div>
                </div>
            </header>

            <main className={styles.messages}>
                {messages.length === 0 && (
                    <div className={styles.emptyChat}>
                        <span>👋</span>
                        <p>Start the conversation! Agree on a meetup time and place.</p>
                    </div>
                )}
                {(messages as Record<string, unknown>[]).map((msg) => {
                    const isMe = (msg.senderId as string) === currentUserId;
                    const sender = msg.sender as Record<string, unknown> | undefined;
                    return (
                        <div key={msg.id as string} className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                            {!isMe && sender && (
                                <img
                                    src={(sender.image || sender.avatarUrl || '') as string}
                                    alt={(sender.name || '') as string}
                                    className={styles.senderAvatar}
                                />
                            )}
                            <div className={styles.bubbleContent}>
                                <p className={styles.bubbleText}>{msg.body as string}</p>
                                <span className={styles.bubbleTime}>
                                    {new Date(msg.createdAt as string).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && (msg.isRead ? ' ✓✓' : ' ✓')}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </main>

            <div className={styles.inputBar}>
                <textarea
                    ref={textareaRef}
                    className={styles.input}
                    placeholder="Message…"
                    value={body}
                    onChange={handleBodyChange}
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
