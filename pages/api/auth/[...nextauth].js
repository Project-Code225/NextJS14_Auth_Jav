import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '../../../utils/connectDB';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

connectDB();

export default NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const { email, password } = credentials;
        console.log('Authorizing user:', email);
        const user = await User.findOne({ email });
        if (!user) {
          console.log('No user found with this email');
          throw new Error('No user found with this email');
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          console.log('Invalid password');
          throw new Error('Invalid password');
        }
        const token = jwt.sign(
          { email: user.email, id: user._id },
          process.env.NEXTAUTH_SECRET,
          { expiresIn: '5m' }
        );
        console.log('User authorized:', email);
        return { email: user.email, id: user._id, token };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 5 * 60, // 5 minutes
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        accessToken: token.accessToken
      };
      return session;
    }
  }
});