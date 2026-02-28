import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const USER_ROUTES = ['/feed', '/explore', '/matches', '/offers', '/profile', '/circles', '/community', '/dropzones', '/travelswap', '/listing'];

/**
 * Edge middleware — lightweight auth + role guard.
 * 1. Checks for a NextAuth session cookie (JWT strategy).
 *    If missing → redirect to /login.
 * 2. Reads the admin role cookie set by the login API.
 *    Admin on user routes → redirect to /admin.
 *
 * We avoid importing auth/Prisma entirely to stay under Vercel's 1MB edge limit.
 * The actual DB-backed checks live in per-route layout.tsx files.
 */
export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── Auth guard ──────────────────────────────────────────────────
    // NextAuth v5 with JWT strategy sets one of these cookies:
    //   • Production (HTTPS): __Secure-authjs.session-token
    //   • Development (HTTP):  authjs.session-token
    const hasSession =
        req.cookies.has('authjs.session-token') ||
        req.cookies.has('__Secure-authjs.session-token');

    if (!hasSession) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Admin redirect ──────────────────────────────────────────────
    const adminRole = req.cookies.get('x-ropa-role')?.value;

    if (adminRole === 'admin' && USER_ROUTES.some((r) => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL('/admin', req.url));
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
    ],
};
