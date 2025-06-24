import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendResponse } from '../utility/responseHelper.js';
import { generateToken } from '../utility/jwt.js';

// ✅ SIGNUP
export const signUpUser = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return sendResponse(res, false, 400, "Email and password are required");
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, false, 409, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: email.trim(),
      password: hashedPassword,
      name: name || '',
    });

    await newUser.save();

    const token = generateToken({ id: newUser._id });

    return sendResponse(res, true, 201, "User registered successfully", {
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
      token,
    });
  } catch (err) {
    return sendResponse(res, false, 500, "Server error", err);
  }
};

// ✅ LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendResponse(res, false, 400, "Email and password are required");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, false, 401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, false, 401, "Invalid credentials");
    }

    const token = generateToken({ id: user._id });

    return sendResponse(res, true, 200, "Login successful", {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (err) {
    return sendResponse(res, false, 500, "Server error", err);
  }
};
