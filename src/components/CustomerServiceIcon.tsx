'use client';

import { useState } from 'react';

export default function CustomerServiceIcon() {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <>
            <button
                onClick={() => {
                    setShowTooltip(true);
                    setTimeout(() => setShowTooltip(false), 2000);
                }}
                aria-label="Customer service"
                style={{
                    position: 'fixed',
                    bottom: '90px', // above nav bar
                    left: '16px',
                    zIndex: 50,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 150ms ease, box-shadow 150ms ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.08)';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(139, 92, 246, 0.45)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.3)';
                }}
            >
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </button>

            {showTooltip && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '144px',
                        left: '16px',
                        zIndex: 51,
                        padding: '8px 14px',
                        borderRadius: '10px',
                        background: 'rgba(30, 27, 25, 0.95)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        backdropFilter: 'blur(8px)',
                        fontSize: '0.78rem',
                        color: '#c084fc',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        animation: 'fadeIn 200ms ease-out',
                    }}
                >
                    💬 Coming soon!
                </div>
            )}
        </>
    );
}
