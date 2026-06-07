import mongoose from "mongoose";
import "dotenv/config";
import doctorModel from "./models/doctorModel.js";
import userModel from "./models/userModel.js";

async function updateImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const doctors = await doctorModel.find();
  
  let maleIndex = 1;
  let femaleIndex = 1;
  
  for (const doc of doctors) {
    const user = await userModel.findOne({ email: doc.email });
    const gender = user?.gender || "Female"; // fallback
    
    let imagePath = "";
    if (gender === "Male") {
      imagePath = `/doctors/m${maleIndex}.png`;
      maleIndex = maleIndex === 1 ? 2 : 1; // toggle between m1 and m2
    } else {
      imagePath = `/doctors/f${femaleIndex}.png`;
      femaleIndex = femaleIndex === 1 ? 2 : 1; // toggle between f1 and f2
    }
    
    await doctorModel.findByIdAndUpdate(doc._id, { image: imagePath });
    if (user) {
      await userModel.findByIdAndUpdate(user._id, { image: imagePath });
    }
    console.log(`Updated ${doc.name} with ${imagePath}`);
  }
  
  console.log("Image update complete!");
  process.exit(0);
}

updateImages();
