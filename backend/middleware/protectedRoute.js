import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const authorizedUser = async (req, res, next) => {
  try {
    // Retrieve the token from cookies
    const token = req.cookies.jwt;

    // If no token is provided, respond with 401 Unauthorized
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      } else if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Unauthorized: Token expired" });
      } else {
        throw err;
      }
    }

    // Find the user by ID and exclude the password field
    const user = await User.findById(decoded.userId).select("-password");

    // If user is not found, respond with 404 Not Found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Attach the user to the request object and proceed to the next middleware
    req.user = user;
    next();
  } catch (err) {
    // Log any unexpected errors
    console.error("Error in authorizedUser middleware:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
