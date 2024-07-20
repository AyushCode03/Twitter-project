import mongoose from "mongoose";

// Function to connect to MongoDB database
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using Mongoose
    const connect = await mongoose.connect(process.env.MONGO_URI);

    // If connection is successful, log the host of the connected database
    console.log(`MongoDB connected...${connect.connection.host} 😌`);
  } catch (error) {
    // If an error occurs during connection, log the error message
    console.error("Error connecting to MongoDB:", error.message);
    // Exit the process with failure status
    process.exit(1);
  }
};

export default connectDB;
