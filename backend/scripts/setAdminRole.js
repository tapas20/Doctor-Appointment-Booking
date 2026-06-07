import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;
const TARGET_EMAIL = "tapasjyoti@gmail.com";

await mongoose.connect(MONGO_URI);
console.log("Connected to MongoDB");

const result = await mongoose.connection
  .collection("users")
  .updateOne({ email: TARGET_EMAIL }, { $set: { role: "admin" } });

if (result.matchedCount === 0) {
  console.log(`No user found with email: ${TARGET_EMAIL}`);
} else {
  console.log(`✅ Role updated to "admin" for ${TARGET_EMAIL}`);
}

await mongoose.disconnect();
process.exit(0);
