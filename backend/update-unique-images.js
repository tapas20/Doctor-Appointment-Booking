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
    let gender = "Female"; // fallback
    if (user && user.gender === "Male") gender = "Male";
    if (doc.name === "Dr. Tapas") gender = "Male"; // Ensure Tapas is male
    
    let imagePath = "";
    if (gender === "Male") {
      imagePath = `/doctors/m${maleIndex}.png`;
      maleIndex = (maleIndex % 5) + 1; // cycle through 1 to 5
    } else {
      imagePath = `/doctors/f${femaleIndex}.png`;
      femaleIndex = (femaleIndex % 7) + 1; // cycle through 1 to 7
    }
    
    await doctorModel.findByIdAndUpdate(doc._id, { image: imagePath });
    if (user) {
      await userModel.findByIdAndUpdate(user._id, { image: imagePath });
    }
    console.log(`Updated ${doc.name} with ${imagePath}`);
  }
  
  console.log("Unique Image update complete!");
  process.exit(0);
}

updateImages();
