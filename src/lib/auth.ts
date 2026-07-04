import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const admin = await db.admin.findUnique({
          where: { email: credentials.email as string },
        });
        if (!admin) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          admin.passwordHash
        );
        if (!valid) return null;

        return { id: admin.id, email: admin.email };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
