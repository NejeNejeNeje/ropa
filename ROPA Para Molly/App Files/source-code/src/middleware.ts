import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const USER_ROUTES = ['/feed', '/explore', '/matches', '/offers', '/profile', '/circles', '/community', '/dropzones', '/travelswap', '/listing'];

/**
 * Lightweight middleware — reads the admin role cookie set by the login API.
 * We avoid importing auth/Prisma entirely to stay under Vercel's 1MB edge limit.
 * The actual auth guard is in `/admin/layout.tsx` (server-side, full Prisma access).
 * This middleware only handles the UX redirect for admins landing on user pages.
 */
export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Check for admin role flag — set as a plain cookie on login
    const adminRole = req.cookies.get('x-ropa-role')?.value;

    // Admin on user routes → redirect to /admin
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
