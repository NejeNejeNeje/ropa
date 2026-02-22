import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Routes only for regular users (not admins)
const USER_ROUTES = ['/feed', '/explore', '/matches', '/offers', '/profile', '/circles', '/community', '/dropzones', '/travelswap', '/listing'];

export default auth((req) => {
    const { pathname } = req.nextUrl;
    // req.auth is the decoded token payload (set by jwt callback) — no DB call
    const token = req.auth as { user?: { role?: string } } | null;
    const role = token?.user?.role;
    const isLoggedIn = !!token;

    // Admin trying to access any user-facing route → redirect to /admin
    if (role === 'admin' && USER_ROUTES.some((r) => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL('/admin', req.url));
    }

    // Regular logged-in user trying to access /admin → redirect to /feed
    if (isLoggedIn && role !== 'admin' && pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/feed', req.url));
    }

    // Unauthenticated user trying to access /admin → redirect to /login
    if (!isLoggedIn && pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/feed/:path*',
        '/explore/:path*',
        '/matches/:path*',
        '/offers/:path*',
        '/profile/:path*',
        '/circles/:path*',
        '/community/:path*',
        '/dropzones/:path*',
        '/travelswap/:path*',
        '/listing/:path*',
        '/admin/:path*',
    ],
};
