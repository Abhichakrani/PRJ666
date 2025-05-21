// pages/api/auth/register.js
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { validatePassword, validateEmail } from '@/lib/validation/auth';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: passwordValidation.message 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already in use' 
      });
    }

    // Create new user
    const user = await User.create({ email, password, name });

    return res.status(201).json({ 
      success: true, 
      data: { id: user._id, email: user.email } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}