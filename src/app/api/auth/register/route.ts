import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
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

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
