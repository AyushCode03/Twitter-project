import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import { v2 as cloudinary } from "cloudinary";

export const userProfile = async (req, res) => {
  // Destructure username from request parameters
  const { username } = req.params;

  // Ensure username is provided
  if (!username) {
    return res.status(400).json({ error: "Bad request: Username is required" });
  }

  try {
    // Find the user by username and exclude the password field
    const user = await User.findOne({ username }).select("-password");

    // If user not found, respond with 404 Not Found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Respond with the user object
    res.status(200).json(user);
  } catch (error) {
    // Log any unexpected errors with detailed information
    console.error("Error in userProfile:", error);

    // Respond with a 500 Internal Server Error
    res.status(500).json({ error: error.message });
  }
};

export const suggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch the list of users followed by the current user
    const currentUser = await User.findById(userId).select("following");

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch random users excluding the current user and already followed users
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId, $nin: currentUser.following },
        },
      },
      { $sample: { size: 10 } },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    const filteredUsers = users.filter(
      (user) => !currentUser.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => {
      user.password = null;
    });

    // Respond with the suggested users
    res.status(200).json(suggestedUsers);
  } catch (error) {
    // Log any unexpected errors
    console.error("Error in suggestedUsers:", error);

    // Respond with a 500 Internal Server Error
    res.status(500).json({ error: error.message });
  }
};

export const followingUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      // Send notification to the user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.error("Error in followingUser:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Function to update the user's profile
export const updateUserProfile = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    // Find the user by ID
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password change requirements
    if (
      (currentPassword && !newPassword) ||
      (newPassword && !currentPassword)
    ) {
      return res.status(400).json({
        error:
          "Both current and new passwords must be provided for a password change",
      });
    }

    // Handle password update
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      if (newPassword.length < 4) {
        return res
          .status(400)
          .json({ error: "New password must be at least 4 characters long" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Handle profile image update
    if (profileImg) {
      if (user.profileImg) {
        const publicId = user.profileImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const uploadResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadResponse.secure_url;
    }

    // Handle cover image update
    if (coverImg) {
      if (user.coverImg) {
        const publicId = user.coverImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const uploadResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadResponse.secure_url;
    }

    // Update user fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    // Save the updated user
    user = await user.save();

    // Remove password from the response
    user.password = undefined;

    // Respond with the updated user
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateUserProfile:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
