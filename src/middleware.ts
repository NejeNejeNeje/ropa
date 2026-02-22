import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Routes that are only for regular users (not admins)
const USER_ROUTES = ['/feed', '/explore', '/matches', '/offers', '/profile', '/circles', '/community', '/dropzones', '/travelswap', '/listing'];

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const role = (req.auth?.user as { role?: string } | undefined)?.role;
    const isLoggedIn = !!req.auth?.user;

    // If admin tries to access any user-facing route → redirect to /admin
    if (role === 'admin' && USER_ROUTES.some((r) => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL('/admin', req.url));
    }

    // If regular user tries to access /admin → redirect to /feed
    if (isLoggedIn && role !== 'admin' && pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/feed', req.url));
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
