import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Find valid token
        const resetRecord = await prisma.passwordReset.findFirst({
            where: { token, expiresAt: { gt: new Date() } },
        });

        if (!resetRecord) {
            return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
        }

        // Update password
        const hashed = await hash(password, 12);
        await prisma.user.update({
            where: { id: resetRecord.userId },
            data: { password: hashed },
        });

        // Delete the used token
        await prisma.passwordReset.delete({ where: { id: resetRecord.id } });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
