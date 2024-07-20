import mongoose from "mongoose";

// Define the schema for a tweet
const postSchema = new mongoose.Schema(
  {
    // Reference to the User model to associate a tweet with a specific user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // A tweet must be associated with a user
    },
    // The text content of the tweet
    text: {
      type: String,
      // Optional field: a tweet can be just an image or both text and image
    },
    // URL or path to the image associated with the tweet
    img: {
      type: String,
      // Optional field: a tweet can be just text or both text and image
    },
    // Array of user IDs who have liked the tweet
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model for likes
      },
    ],
    // Array of comments on the tweet
    comments: [
      {
        // The text content of the comment
        text: {
          type: String,
          required: true, // Each comment must have text
        },
        // Reference to the User model to associate a comment with a specific user
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true, // Each comment must be associated with a user
        },
      },
    ],
    retweets: [
      {
        // The text content of the retweet
        text: {
          type: String,
          required: true, // Each comment must have text
        },
        // Reference to the User model to associate a comment with a specific user
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true, // Each comment must be associated with a user
        },
      },
    ],
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create a model for the tweet schema
const Post = mongoose.model("Post", postSchema);

export default Post;
