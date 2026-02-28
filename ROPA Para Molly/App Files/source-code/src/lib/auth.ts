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
        async jwt({ token, user, trigger, session: sessionData }) {
            // Bake user fields into the JWT at login time
            if (user) {
                token.id = user.id;
                token.role = (user as Record<string, unknown>).role as string;
                // Fetch karma/tier once at login — baked into token for fast reads
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id! },
                    select: { karmaPoints: true, trustTier: true, role: true },
                });
                if (dbUser) {
                    token.karmaPoints = dbUser.karmaPoints;
                    token.trustTier = dbUser.trustTier;
                    token.role = dbUser.role;
                }
            }
            // Explicit update trigger (called when session() is invoked with a new value)
            if (trigger === 'update' && sessionData) {
                const update = sessionData as Record<string, unknown>;
                if (typeof update.karmaPoints === 'number') token.karmaPoints = update.karmaPoints;
                if (typeof update.trustTier === 'string') token.trustTier = update.trustTier;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = (token.id as string) || (token.sub as string);
                const u = session.user as unknown as Record<string, unknown>;
                u.role = token.role as string;
                u.karmaPoints = token.karmaPoints as number;
                u.trustTier = token.trustTier as string;
            }
            return session;
        },
    },
});
