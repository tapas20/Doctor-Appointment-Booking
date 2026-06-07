import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man.jpg",
    },
    phone: { type: String, default: "000-000-0000" },
    address: { type: Object, default: { line1: "", line2: "" } },
    gender: { type: String, default: "Not Selected" },
    dob: { type: String, default: "Not Selected" },
    role: { type: String, enum: ["user", "admin", "doctor"], default: "user" },
  },
  { timestamps: true },
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
