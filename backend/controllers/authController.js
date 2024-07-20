import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { createTokenAndSetCookie } from "../utils/createToken.js";

import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    // Destructure user details from the request body
    const { name, username, email, password } = req.body;

    // Validate email format using regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Check if username already exists in the database
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if email already exists in the database
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password.length < 4) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    // Hash the user's password with a salt round of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    // Log the user information before saving
    console.log("User created:", user);

    // Save the user to the database
    await user.save();
    console.log("User saved successfully");

    // Create token and set cookie
    createTokenAndSetCookie(user._id, res);

    // Respond with the created user's details (excluding password) and token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profileImg: user.profileImg,
      followers: user.followers,
      following: user.following,
      coverImg: user.coverImg,
      bio: user.bio,
      link: user.link,
    });
  } catch (error) {
    // Handle any errors that occur during the signup process
    console.error("Error in signup process:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to handle user login
export const login = async (req, res) => {
  try {
    // Destructure email and password from the request body
    const { email, password } = req.body;

    // Find the user in the database by email
    const user = await User.findOne({ email });

    // If user is not found or the password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Respond with a 400 status and an "Invalid credentials" message
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // If credentials are valid, create a token for the user
    createTokenAndSetCookie(user._id, res);

    // Respond with the user's details and the token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profileImg: user.profileImg,
      followers: user.followers,
      following: user.following,
      coverImg: user.coverImg,
      bio: user.bio,
      link: user.link,
    });
  } catch (error) {
    // Handle any errors that occur during the login process
    console.error("Error in login process:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the jwt cookie to logout the user
    res.clearCookie("jwt");

    // Respond with a success message
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    // Handle any errors that occur during logout
    console.error("Error logging out:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const validUser = async (req, res) => {
  try {
    // Check if req.user exists, indicating a valid user is authenticated
    if (!req.user) {
      return res
        .status(400)
        .json({ message: "Invalid request. User ID not found." });
    }

    // If req.user exists, respond with the user object
    res.status(200).json({ user: req.user });
  } catch (error) {
    // Handle any errors that occur during user validation
    console.error("Error validating user:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
