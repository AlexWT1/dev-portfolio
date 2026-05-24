import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github' && account.access_token) {
        const existing = await prisma.account.findFirst({
          where: { userId: user.id!, provider: 'github' },
        });

        if (existing && existing.access_token !== account.access_token) {
          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: 'github',
                providerAccountId: account.providerAccountId,
              },
            },
            data: {
              access_token: account.access_token,
              refresh_token: account.refresh_token ?? existing.refresh_token,
              expires_at: account.expires_at ?? existing.expires_at,
              scope: account.scope ?? existing.scope,
              token_type: account.token_type ?? existing.token_type,
            },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/',
  },
});
