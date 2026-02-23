import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * B3: Stripe Checkout pre-wire.
 * Activated automatically when STRIPE_SECRET_KEY is present.
 * Without the key, returns 501 with guidance — free swaps continue to work.
 */
export async function POST(req: Request) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
            { error: 'Payments not configured. Add STRIPE_SECRET_KEY to your environment.' },
            { status: 501 }
        );
    }

    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offerId } = await req.json() as { offerId: string };
    const offer = await prisma.offer.findUnique({
        where: { id: offerId },
        include: { listing: true },
    });

    if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-01-28.clover' });

    const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: offer.currency.toLowerCase(),
                unit_amount: Math.round(offer.amount * 100),
                product_data: {
                    name: offer.listing.title,
                    description: `ROPA swap — ${offer.listing.brand ?? ''} ${offer.listing.size}`.trim(),
                },
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.AUTH_URL}/matches?paid=true`,
        cancel_url: `${process.env.AUTH_URL}/offers`,
        metadata: { offerId, buyerId: session.user.id as string },
    });

    return NextResponse.json({ url: checkoutSession.url });
}
