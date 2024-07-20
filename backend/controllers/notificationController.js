import Notification from "../models/notificationModel.js";

// Function to retrieve notifications for the authenticated user
export const getNotifications = async (req, res) => {
  try {
    // Extract user ID from the request object
    const userId = req.user._id;

    // Fetch notifications where 'to' field matches the user ID
    // Populate the 'from' field with username and profile image
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    // Mark all notifications as read
    await Notification.updateMany({ to: userId }, { read: true });

    // Respond with the fetched notifications
    res.status(200).json(notifications);
  } catch (error) {
    // Log the error and respond with a 500 status code
    console.log("Error in getNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to delete all notifications for the authenticated user
export const deleteNotifications = async (req, res) => {
  try {
    // Extract user ID from the request object
    const userId = req.user._id;

    // Delete all notifications where 'to' field matches the user ID
    await Notification.deleteMany({ to: userId });

    // Respond with a success message
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    // Log the error and respond with a 500 status code
    console.log("Error in deleteNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
