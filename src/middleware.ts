import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes only for regular users (not admins)
const USER_ROUTES = ['/feed', '/explore', '/matches', '/offers', '/profile', '/circles', '/community', '/dropzones', '/travelswap', '/listing'];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Read JWT token directly — works at the edge without DB
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
    });

    const role = token?.role as string | undefined;
    const isLoggedIn = !!token;

    // Admin trying to access any user-facing route → redirect to /admin
    if (role === 'admin' && USER_ROUTES.some((r) => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL('/admin', req.url));
    }

    // Regular user trying to access /admin → redirect to /feed
    if (isLoggedIn && role !== 'admin' && pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/feed', req.url));
    }

    // Unauthenticated user trying to access /admin → redirect to /login
    if (!isLoggedIn && pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

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
