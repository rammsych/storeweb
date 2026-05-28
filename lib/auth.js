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
        email: {
          label: 'Email',
          type: 'email',
        },

        password: {
          label: 'Password',
          type: 'password',
        },

        store: {
          label: 'Store',
          type: 'text',
        },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error(
              'Debes ingresar email y contraseña.'
            );
          }

          const email = credentials.email
            .toLowerCase()
            .trim();

          const password = credentials.password;

          const store = credentials.store
            ?.toLowerCase()
            .trim();

          const user = await prisma.user.findFirst({
            where: {
              email,
              ...(store
                ? {
                  OR: [
                    {
                      company: {
                        slug: store,
                      },
                    },
                    {
                      role: 'SUPER_ADMIN',
                    },
                  ],
                }
                : {
                  role: 'SUPER_ADMIN',
                }),
            },
            include: {
              company: true,
            },
          });

          if (!user) {
            return null;
          }

          if (user.isActive === false) {
            throw new Error('USER_DISABLED');
          }

          if (
            store &&
            user.role !== 'SUPER_ADMIN' &&
            user.company?.slug !== store
          ) {
            throw new Error('USER_NOT_IN_STORE');
          }

          const isValid = await compare(
            password,
            user.password
          );

          if (!isValid) {
            return null;
          }

          return {
            id: String(user.id),
            name: user.name || '',
            email: user.email,
            role: user.role,

            companyId: user.companyId
              ? String(user.companyId)
              : null,

            companySlug: user.company?.slug || null,

            phone: user.phone || null,
          };
        } catch (error) {
          console.error('AUTH ERROR:', error);
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id);

        token.phone = user.phone || null;

        token.role = user.role;

        token.companyId = user.companyId
          ? String(user.companyId)
          : null;

        token.companySlug =
          user.companySlug || null;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);

        session.user.phone =
          token.phone || null;

        session.user.role = token.role;

        session.user.companyId = token.companyId
          ? String(token.companyId)
          : null;

        session.user.companySlug =
          token.companySlug || null;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};