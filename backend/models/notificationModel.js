import mongoose from "mongoose";

// Define the schema for notifications
const notificationSchema = new mongoose.Schema(
  {
    // Sender of the notification, referencing the User model
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Receiver of the notification, referencing the User model
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Type of notification, can be 'like' or 'follow'
    type: { type: String, required: true, enum: ["like", "follow"] },

    // Indicates if the notification has been read
    read: { type: Boolean, default: false },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Create the Notification model from the schema
const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
