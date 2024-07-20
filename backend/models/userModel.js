import mongoose from "mongoose";

// Define the schema for the User collection
const userSchema = new mongoose.Schema(
  {
    // Basic information
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLenght: 4 },

    // Optional profile details
    profileImg: {
      type: String,
      default: "",
    },

    // Social features
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],
    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],

    // Additional profile customization
    coverImg: { type: String, default: "" },
    bio: { type: String, default: "" },
    link: { type: String, default: "" },
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
  },

  // Enable timestamps for automatic createdAt and updatedAt fields
  { timestamps: true }
);

// Create a model based on the schema
const User = mongoose.model("User", userSchema);

export default User;
