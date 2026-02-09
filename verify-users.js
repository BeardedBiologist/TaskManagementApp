import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./server/src/models/User.js";

dotenv.config({ path: "./server/.env" });

const verifyUsers = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");

    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    users.forEach((user) => {
      console.log("--------------------------------");
      console.log(`ID: ${user._id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name?.first} ${user.name?.last}`);
      console.log(`Password Hash Present: ${!!user.password}`);
      console.log(`Workspaces: ${user.workspaces?.length}`);
    });

    if (users.length === 0) {
      console.log(
        "WARNING: No users found! Migration might have failed or DB was empty.",
      );
    }

    process.exit(0);
  } catch (err) {
    console.error("Error verifying users:", err);
    process.exit(1);
  }
};

verifyUsers();
