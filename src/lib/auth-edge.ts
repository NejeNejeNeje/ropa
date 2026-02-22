/**
 * Lightweight NextAuth config for middleware (edge-compatible, no Prisma).
 * The full auth.ts uses Prisma in session callback — can't run at the edge.
 * This version only uses the JWT token to determine role.
 */
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const { auth: middlewareAuth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    session: { strategy: 'jwt' },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize() { return null; }, // Not used in middleware
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as Record<string, unknown>).role as string;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                const u = session.user as unknown as Record<string, unknown>;
                u.id = token.id as string;
                u.role = token.role as string; // Only token-based, no DB
            }
            return session;
        },
    },
});
