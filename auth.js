import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import connectDB from "./lib/mongodb";
import User from "./models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn Callback - User:', user.email);
      await connectDB();
      
      try {
        let existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          existingUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: new Date(),
          });
          console.log('Created new user with ID:', existingUser._id.toString());
        } else {
          console.log('Found existing user with ID:', existingUser._id.toString());
        }
        
        // Store the MongoDB _id in the user object
        user.mongoId = existingUser._id.toString();
        user.role = existingUser.role;
        
        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      console.log('JWT Callback triggered');
      console.log('Has account?', !!account);
      console.log('Has user?', !!user);
      
      // Initial sign in
      if (user) {
        console.log('Adding user data to token');
        // If we stored mongoId in signIn callback
        if (user.mongoId) {
          token.id = user.mongoId;
          token.role = user.role || 'user';
        } else {
          // Fallback: fetch from database
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role || 'user';
          }
        }
      }
      
      console.log('Token ID:', token.id);
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback - Token ID:', token.id);
      
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role || 'user';
      }
      
      console.log('Final session user ID:', session?.user?.id);
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
  debug: true, // Enable debug mode
});