import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';

// In production, wire this to Resend/SendGrid to email the link.
// For now, the token is returned in the response (dev mode) and logged.
export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({ success: true });
        }

        // Generate secure token
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store token in DB (upsert to handle repeated requests)
        await prisma.passwordReset.upsert({
            where: { userId: user.id },
            create: { userId: user.id, token, expiresAt },
            update: { token, expiresAt },
        });

        // In production: send email with reset link
        // For dev: log it
        const resetUrl = `${process.env.AUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        console.log(`[PASSWORD RESET] ${email} → ${resetUrl}`);

        // If RESEND_API_KEY is configured, send the email
        if (process.env.RESEND_API_KEY) {
            try {
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: process.env.EMAIL_FROM || 'ROPA <noreply@ropa.trade>',
                        to: email,
                        subject: 'Reset your ROPA password',
                        html: `
                            <h2>Reset Your Password</h2>
                            <p>Click the link below to reset your ROPA password. This link expires in 1 hour.</p>
                            <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#c8a86b;color:#000;text-decoration:none;border-radius:8px;font-weight:bold;">
                                Reset Password
                            </a>
                            <p style="color:#888;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
                        `,
                    }),
                });
            } catch (emailErr) {
                console.error('[PASSWORD RESET] Email send failed:', emailErr);
            }
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
