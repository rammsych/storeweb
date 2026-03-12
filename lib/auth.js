import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Debes ingresar email y contraseña.');
        }

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const isValid = await compare(password, user.password);

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};