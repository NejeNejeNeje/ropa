import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { recalcTrustTier } from '@/lib/karma';
import { sendEmail, emailTemplates } from '@/lib/email';

// Simple in-memory rate limiter for registration (per email, 5 attempts/hour)
const regAttempts = new Map<string, { count: number; resetAt: number }>();
const REG_LIMIT = 5;
const REG_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Rate limiting
        const now = Date.now();
        const key = (email as string).toLowerCase().trim();
        const entry = regAttempts.get(key);
        if (entry && now < entry.resetAt) {
            if (entry.count >= REG_LIMIT) {
                return NextResponse.json({ error: 'Too many registration attempts. Try again later.' }, { status: 429 });
            }
            entry.count++;
        } else {
            regAttempts.set(key, { count: 1, resetAt: now + REG_WINDOW_MS });
        }


        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const hashed = await hash(password, 12);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashed,
                name,
                image: `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
            },
        });

        // Award welcome karma
        await prisma.karmaEntry.create({
            data: {
                userId: user.id,
                action: 'welcome_bonus',
                points: 50,
                description: 'Welcome to ROPA! 🎒',
            },
        });
        await prisma.user.update({
            where: { id: user.id },
            data: { karmaPoints: 50 },
        });
        await recalcTrustTier(prisma, user.id);

        // Fire-and-forget welcome email
        const loginUrl = `${process.env.AUTH_URL || 'https://ropa-trade.vercel.app'}/login`;
        const { subject, html } = emailTemplates.welcome(name, loginUrl);
        sendEmail({ to: email, subject, html }).catch(() => { });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
