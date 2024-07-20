// import User from "../models/userModel.js";
// import Post from "../models/postModel.js";
// import { v2 as cloudinary } from "cloudinary";
// import Notification from "../models/notificationModel.js";

// export const createPost = async (req, res) => {
//   try {
//     const { text } = req.body;
//     let { img } = req.body;
//     const userId = req.user._id.toString();

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (!text && !img) {
//       return res.status(400).json({ error: "Post must have text or image" });
//     }

//     if (img) {
//       try {
//         const uploadedResponse = await cloudinary.uploader.upload(img);
//         img = uploadedResponse.secure_url;
//       } catch (error) {
//         console.error("Error uploading image:", error.message);
//         return res.status(500).json({ error: "Error uploading image" });
//       }
//     }

//     const newPost = new Post({
//       user: userId,
//       text,
//       img,
//     });

//     await newPost.save();
//     res.status(201).json(newPost);
//   } catch (error) {
//     console.error("Error in createPost controller:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const deletePost = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) {
//       return res.status(404).json({ error: "Post not found" });
//     }

//     if (post.user.toString() !== req.user._id.toString()) {
//       return res
//         .status(401)
//         .json({ error: "You are not authorized to delete this post" });
//     }

//     if (post.img) {
//       const imgId = post.img.split("/").pop().split(".")[0];
//       await cloudinary.uploader.destroy(imgId);
//     }

//     await Post.findByIdAndDelete(req.params.id);

//     res.status(200).json({ message: "Post deleted successfully" });
//   } catch (error) {
//     console.log("Error in deletePost controller: ", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const commentOnPost = async (req, res) => {
//   try {
//     const { text } = req.body;
//     const postId = req.params.id;
//     const userId = req.user._id;

//     // Check if the text field is provided
//     if (!text) {
//       return res.status(400).json({ error: "Text field is required" });
//     }

//     // Find the post by ID
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({ error: "Post not found" });
//     }

//     // Create the comment object
//     const comment = { user: userId, text };

//     // Add the comment to the post's comments array
//     post.comments.push(comment);

//     // Save the updated post
//     await post.save();

//     res.status(200).json({
//       message: "Comment added successfully",
//       post,
//       comment,
//     });
//   } catch (error) {
//     console.error("Error in commentOnPost controller:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const likeUnlikePost = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { id: postId } = req.params;

//     // Find the post by ID
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({ error: "Post not found" });
//     }

//     // Check if the user has already liked the post
//     const hasLiked = post.likes.includes(userId);

//     if (hasLiked) {
//       // Unlike post
//       await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
//       await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

//       // Remove like from the post's likes array
//       const updatedLikes = post.likes.filter(
//         (id) => id.toString() !== userId.toString()
//       );

//       res.status(200).json({
//         message: "Post unliked successfully",
//         likes: updatedLikes.length,
//         likedBy: updatedLikes,
//       });
//     } else {
//       // Like post
//       post.likes.push(userId);
//       await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
//       await post.save();

//       // Create a notification for the like
//       const notification = new Notification({
//         from: userId,
//         to: post.user,
//         type: "like",
//       });
//       await notification.save();

//       res.status(200).json({
//         message: "Post liked successfully",
//         likes: post.likes.length,
//         likedBy: post.likes,
//       });
//     }
//   } catch (error) {
//     console.error("Error in likeUnlikePost controller:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const getAllPosts = async (req, res) => {
//   try {
//     // Retrieve all posts, sorted by createdAt in descending order
//     const posts = await Post.find()
//       .sort({ createdAt: -1 })
//       .populate({
//         path: "user",
//         select: "-password", // Exclude password field from user
//       })
//       .populate({
//         path: "comments.user",
//         select: "-password", // Exclude password field from comment user
//       });

//     // Check if no posts were found
//     if (posts.length === 0) {
//       return res.status(200).json({ message: "No posts found", posts: [] });
//     }

//     // Return posts with populated user and comment details
//     res.status(200).json(posts);
//   } catch (error) {
//     console.error("Error in getAllPosts controller:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const getLikedPosts = async (req, res) => {
//   const userId = req.params.id;

//   try {
//     // Check if user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Fetch liked posts based on user's likedPosts array
//     const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
//       .sort({ createdAt: -1 }) // Sort by createdAt in descending order
//       .populate({
//         path: "user",
//         select: "-password", // Exclude password field from user
//       })
//       .populate({
//         path: "comments.user",
//         select: "-password", // Exclude password field from comment user
//       });

//     // Return liked posts with populated user and comment details
//     res.status(200).json(likedPosts);
//   } catch (error) {
//     console.error("Error in getLikedPosts controller:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const getFollowingPosts = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const following = user.following;

//     const feedPosts = await Post.find({ user: { $in: following } })
//       .sort({ createdAt: -1 })
//       .populate({
//         path: "user",
//         select: "-password",
//       })
//       .populate({
//         path: "comments.user",
//         select: "-password",
//       });

//     res.status(200).json(feedPosts);
//   } catch (error) {
//     console.log("Error in getFollowingPosts controller: ", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const getUserPosts = async (req, res) => {
//   try {
//     const { username } = req.params;

//     const user = await User.findOne({ username });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const posts = await Post.find({ user: user._id })
//       .sort({ createdAt: -1 })
//       .populate({
//         path: "user",
//         select: "-password",
//       })
//       .populate({
//         path: "comments.user",
//         select: "-password",
//       });

//     res.status(200).json(posts);
//   } catch (error) {
//     console.log("Error in getUserPosts controller: ", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notificationModel.js";

// Controller to create a new post
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure that at least text or image is provided
    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    // If an image is provided, upload it to Cloudinary
    if (img) {
      try {
        const uploadedResponse = await cloudinary.uploader.upload(img);
        img = uploadedResponse.secure_url;
      } catch (error) {
        console.error("Error uploading image:", error.message);
        return res.status(500).json({ error: "Error uploading image" });
      }
    }

    // Create and save the new post
    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to delete a post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Ensure the user is authorized to delete the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }

    // If the post has an image, delete it from Cloudinary
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    // Delete the post
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to add a comment to a post
export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    // Check if the text field is provided
    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Create the comment object
    const comment = { user: userId, text };

    // Add the comment to the post's comments array
    post.comments.push(comment);

    // Save the updated post
    await post.save();

    res.status(200).json({
      message: "Comment added successfully",
      post,
      comment,
    });
  } catch (error) {
    console.error("Error in commentOnPost controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to like or unlike a post
export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the user has already liked the post
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      // Unlike the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      // Update the post's likes array
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );

      res.status(200).json({
        message: "Post unliked successfully",
        likes: updatedLikes.length,
        likedBy: updatedLikes,
      });
    } else {
      // Like the post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      // Create a notification for the like
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      res.status(200).json({
        message: "Post liked successfully",
        likes: post.likes.length,
        likedBy: post.likes,
      });
    }
  } catch (error) {
    console.error("Error in likeUnlikePost controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to retrieve all posts
export const getAllPosts = async (req, res) => {
  try {
    // Retrieve all posts, sorted by createdAt in descending order
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password", // Exclude password field from user
      })
      .populate({
        path: "comments.user",
        select: "-password", // Exclude password field from comment user
      });

    // Check if no posts were found
    if (posts.length === 0) {
      return res.status(200).json({ message: "No posts found", posts: [] });
    }

    // Return posts with populated user and comment details
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getAllPosts controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to retrieve posts liked by a specific user
export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch liked posts based on user's likedPosts array
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .populate({
        path: "user",
        select: "-password", // Exclude password field from user
      })
      .populate({
        path: "comments.user",
        select: "-password", // Exclude password field from comment user
      });

    // Return liked posts with populated user and comment details
    res.status(200).json(likedPosts);
  } catch (error) {
    console.error("Error in getLikedPosts controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to retrieve posts from users the authenticated user is following
export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find the authenticated user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const following = user.following;

    // Retrieve posts from users the authenticated user is following
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to retrieve posts from a specific user
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Retrieve posts created by the user
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
