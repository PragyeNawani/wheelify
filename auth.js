import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

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
          console.log('🔐 Authorize attempt for:', credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials');
            return null;
          }

          await dbConnect();
          console.log('✅ Database connected');
          
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          console.log('👤 User found:', !!user);
          
          if (!user) {
            console.log('❌ No user found');
            return null;
          }

          if (!user.password) {
            console.log('❌ User has no password (Google user)');
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log('🔑 Password valid:', isValid);
          
          if (!isValid) {
            console.log('❌ Invalid password');
            return null;
          }

          console.log('✅ Authorization successful');
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role || 'user',
          };
        } catch (error) {
          console.error('❌ Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('🔄 SignIn callback - Provider:', account?.provider);
        
        if (account?.provider === 'google') {
          await dbConnect();
          console.log('✅ Database connected for Google signin');
          
          const existingUser = await User.findOne({ email: user.email });
          console.log('👤 Existing Google user:', !!existingUser);
          
          if (!existingUser) {
            console.log('➕ Creating new Google user');
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              googleId: profile?.sub,
              emailVerified: new Date(),
            });
            console.log('✅ Google user created');
          } else if (!existingUser.googleId) {
            console.log('🔗 Linking Google account to existing user');
            existingUser.googleId = profile?.sub;
            existingUser.image = user.image;
            existingUser.emailVerified = new Date();
            await existingUser.save();
            console.log('✅ Google account linked');
          }
        }
        
        console.log('✅ SignIn callback successful');
        return true;
      } catch (error) {
        console.error('❌ Sign in error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        console.log('✅ JWT token created for user:', user.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        console.log('✅ Session created for user:', session.user.email);
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
});