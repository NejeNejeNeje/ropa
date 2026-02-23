import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    // B1: Image upload via Vercel Blob
    // Requires BLOB_READ_WRITE_TOKEN in environment
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
            { error: 'Image upload not configured. Add BLOB_READ_WRITE_TOKEN to your environment.' },
            { status: 501 }
        );
    }

    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image must be under 8MB' }, { status: 400 });
    }

    const blob = await put(`listings/${Date.now()}-${file.name}`, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url });
}
