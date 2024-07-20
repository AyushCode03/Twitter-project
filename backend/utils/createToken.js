import jwt from "jsonwebtoken";

export const createTokenAndSetCookie = (userId, res) => {
  try {
    // Ensure JWT secret is set
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }

    // Create the JWT token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Set the JWT token as a cookie
    res.cookie("jwt", token, {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development", // Secure in production
    });

    // Log success message
    console.log("Token created and set as cookie successfully");
  } catch (error) {
    // Handle errors during token creation
    console.error("Error creating token and setting cookie:", error.message);
    res.status(500).json({ message: "Error creating token" });
  }
};
