import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToDatabase();

          const admin = await Admin.findOne({
            email: (credentials.email as string).toLowerCase().trim(),
          }).lean();

          if (!admin) {
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            admin.password
          );

          if (!isValid) {
            return null;
          }

          return {
            id: admin._id.toString(),
            email: admin.email,
            name: "Admin",
            role: admin.role,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
