import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createTokenAndSetCookie } from "../utils/createToken.js";
import User from "../models/userModel.js";

export const signup = async (req, res) => {
  try {
    // Destructure user details from the request body
    const { fullName, username, email, password } = req.body;

    // Validate required fields
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format using regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
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

    // Validate password length
    if (password.length < 4) {
      return res
        .status(400)
        .json({ message: "Password must be at least 4 characters long" });
    }

    // Hash the user's password with a salt round of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Create token and set cookie (assuming createTokenAndSetCookie function is defined elsewhere)
      createTokenAndSetCookie(newUser._id, res);
      // Save the user to the database
      await newUser.save();
      // Respond with the created user's details (excluding password)
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        profileImg: newUser.profileImg,
        followers: newUser.followers,
        following: newUser.following,
        coverImg: newUser.coverImg,
        bio: newUser.bio,
        link: newUser.link,
      });
    } else {
      // Respond with a 500 status and an "Internal server error" message
      res.status(500).json({ message: "Server error" });
    }
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
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password are required" });
    }

    // Find the user in the database by email
    const user = await User.findOne({ username });

    // If user is not found or the password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // If credentials are valid, create a token for the user
    createTokenAndSetCookie(user._id, res);

    // Respond with the user's details (excluding sensitive information)
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
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
    // Check if the jwt cookie exists
    if (!req.cookies.jwt) {
      return res.status(400).json({ message: "No active session found" });
    }

    // Clear the jwt cookie to logout the user
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    // Log success message
    console.log("User logged out successfully");

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
    // Ensure req.user exists, which should be set by the authorizedUser middleware
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized: No user found in request" });
    }

    // Find the user by ID and exclude the password field
    const user = await User.findById(req.user._id).select("-password");

    // If user not found, respond with 404 Not Found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Respond with the user object
    res.status(200).json(user);
  } catch (error) {
    // Log any unexpected errors
    console.error("Error in getMe controller:", error);

    // Respond with a 500 Internal Server Error
    res.status(500).json({ error: "Internal Server Error" });
  }
};
