import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const USER_ROUTES = ['/feed', '/explore', '/matches', '/offers', '/profile', '/circles', '/community', '/dropzones', '/travelswap', '/listing'];

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const role = (req.auth?.user as { role?: string } | undefined)?.role;
    const isLoggedIn = !!req.auth;

    // Admin → redirect to /admin from any user route
    if (role === 'admin' && USER_ROUTES.some((r) => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL('/admin', req.url));
    }

    // Regular user → block /admin, go to /feed
    if (isLoggedIn && role !== 'admin' && pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/feed', req.url));
    }

    // Unauthenticated → redirect /admin to /login
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
