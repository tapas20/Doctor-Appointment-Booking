import mongoose from "mongoose";
import "dotenv/config";
import doctorModel from "./models/doctorModel.js";
import userModel from "./models/userModel.js";

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const doctors = await doctorModel.find({ phone: { $exists: false } });
  let count = 0;
  for (const doc of doctors) {
    // try to get from userModel if it exists
    const user = await userModel.findOne({ email: doc.email });
    const phoneToSet = (user && user.phone) ? user.phone : "0000000000";
    await doctorModel.findByIdAndUpdate(doc._id, { phone: phoneToSet });
    count++;
  }
  console.log(`Fixed ${count} doctors.`);
  process.exit(0);
}
fix();
