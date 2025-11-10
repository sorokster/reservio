import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_ENDPOINTS } from "@/src/services/api.config";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
            credentials: "include",
          });

          const data = await res.json();

          if (res.ok && data.status === "success") {
            // Note: Django session cookie is set on the server side
            // Client will need to call Django login endpoint directly to get cookie in browser
            return {
              id: data.id,
              username: data.username,
              email: data.email,
              first_name: data.first_name,
              last_name: data.last_name,
              groups: data.groups || [],
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.groups = (user as any).groups || [];
      }
      
      // Update session when updateSession() is called
      // The data passed to updateSession() is available in the session parameter
      if (trigger === "update" && session) {
        // Update token with new user data from session
        if (session.id !== undefined) token.id = session.id;
        if (session.username !== undefined) token.username = session.username;
        if (session.email !== undefined) token.email = session.email;
        if (session.first_name !== undefined) token.first_name = session.first_name;
        if (session.last_name !== undefined) token.last_name = session.last_name;
        if (session.groups !== undefined) token.groups = session.groups;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.first_name = token.first_name as string;
        session.user.last_name = token.last_name as string;
        session.user.groups = (token.groups as string[]) || [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

