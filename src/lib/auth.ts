import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import 'dotenv/config';

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
    },
    providers: [
        // B2: Google Sign-In — activates when GOOGLE_CLIENT_ID is set in env
        ...(process.env.GOOGLE_CLIENT_ID ? [GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })] : []),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) return null;

                const isValid = await compare(credentials.password as string, user.password);
                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: (user as Record<string, unknown>).role as string,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as Record<string, unknown>).role as string;
            }
            // Always keep role in the token for middleware access
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
                const u = session.user as unknown as Record<string, unknown>;
                // Always set role from token first — safe for edge/middleware
                u.role = token.role as string;
                // Enrich with fresh DB data when NOT at the edge (DB unavailable at edge)
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: { karmaPoints: true, trustTier: true, role: true },
                    });
                    if (dbUser) {
                        u.role = dbUser.role; // DB is source of truth when available
                        u.karmaPoints = dbUser.karmaPoints;
                        u.trustTier = dbUser.trustTier;
                    }
                } catch {
                    // Edge runtime — DB unavailable, role already set from token above
                }
            }
            return session;
        },
    },
});
