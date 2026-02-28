import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email';

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

        // Build reset URL
        const resetUrl = `${process.env.AUTH_URL || 'https://ropa-trade.vercel.app'}/reset-password?token=${token}`;
        console.log(`[PASSWORD RESET] ${email} → ${resetUrl}`);

        // Send email via centralized email service (fire-and-forget)
        const { subject, html } = emailTemplates.passwordReset(resetUrl);
        sendEmail({ to: email, subject, html }).catch(() => { });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
