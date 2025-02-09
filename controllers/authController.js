import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// In-memory token blacklist
const tokenBlacklist = new Set();

// Function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Middleware to check if token is blacklisted
export const checkBlacklist = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: "Token is invalid (logged out)" });
  }
  next();
};

// @desc Logout user (Blacklist token)
// @route POST /api/auth/logout
// @access Private
export const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "No token provided" });

    tokenBlacklist.add(token); // Add token to blacklist
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Guest Login (Limited Access)
// @route   POST /api/auth/guest
// @access  Public
export const guestLogin = async (req, res) => {
  try {
    const guestUser = {
      _id: "guest-user-id",
      name: "Guest User",
      email: "guest@example.com",
      token: generateToken("guest-user-id"),
    };

    res.json(guestUser);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
