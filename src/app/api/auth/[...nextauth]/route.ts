import db from "@/lib/db";
import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
   providers: [
      CredentialsProvider({
         name: "credentials",
         credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
         },
         async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
               return null;
            }

            try {
               const [rows] = await db.execute(
                  "SELECT user_id, email, password_hash, name, role, is_active FROM Users WHERE email = ? AND is_active = TRUE",
                  [credentials.email]
               );

               const users = rows as any[];
               const user = users[0];

               if (!user) {
                  return null;
               }

               const isValidPassword = await bcrypt.compare(
                  credentials.password,
                  user.password_hash
               );

               if (!isValidPassword) {
                  return null;
               }

               return {
                  id: user.user_id.toString(),
                  email: user.email,
                  name: user.name,
                  role: user.role,
               };
            } catch (error) {
               console.error("Auth error:", error);
               return null;
            }
         },
      }),
   ],
   callbacks: {
      async jwt({ token, user }) {
         if (user) {
            token.role = user.role;
         }
         return token;
      },
      async session({ session, token }) {
         if (token) {
            session.user.id = token.sub;
            session.user.role = token.role;
         }
         return session;
      },
   },
   pages: {
      signIn: "/auth/signin",
   },
   secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
