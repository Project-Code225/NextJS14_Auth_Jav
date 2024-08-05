import connectDB from '../../utils/connectDB';
import User from '../../models/User';
import bcrypt from 'bcryptjs';

connectDB();

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    email,
    password: hashedPassword,
  });

  await user.save();

  res.status(201).json({ message: 'User created' });
};
