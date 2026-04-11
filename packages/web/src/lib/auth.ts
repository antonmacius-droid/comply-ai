/**
 * NextAuth configuration for Comply AI.
 *
 * Supports:
 * - Google OAuth (when GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET are set)
 * - Credentials (email/password) for development/self-hosted
 *
 * Session stores the user's orgId for multi-tenant data isolation.
 */

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth — production
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Credentials — development / self-hosted
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@company.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // In development: accept any email with password "comply"
        // In production: validate against DB (when connected)
        if (!credentials?.email) return null;

        const devPassword = process.env.AUTH_DEV_PASSWORD || "comply";
        if (process.env.NODE_ENV !== "production") {
          if (credentials.password === devPassword) {
            return {
              id: "dev_user",
              email: credentials.email,
              name: credentials.email.split("@")[0],
              orgId: "default",
            };
          }
        }

        // TODO: validate against DB when Postgres is connected
        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.orgId = (user as { orgId?: string }).orgId || "default";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { orgId?: string }).orgId = token.orgId as string;
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === "production" ? undefined : "comply-ai-dev-secret-DO-NOT-USE-IN-PRODUCTION"),
};
