import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Connect to DB first
          await dbConnect();
          
          // Dynamically import User model AFTER connection
          const User = (await import('@/models/User')).default;
          
          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            throw new Error('No user found with this email');
          }

          // Add your password verification here if needed
          // const bcrypt = require('bcryptjs');
          // const isValid = await bcrypt.compare(credentials.password, user.password);
          // if (!isValid) throw new Error('Invalid password');

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect();
          
          // Dynamically import User model
          const User = (await import('@/models/User')).default;
          
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              emailVerified: new Date(),
            });
          }
          
          return true;
        } catch (error) {
          console.error('Sign in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        try {
          await dbConnect();
          
          // Dynamically import User model
          const User = (await import('@/models/User')).default;
          
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('JWT callback error:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});