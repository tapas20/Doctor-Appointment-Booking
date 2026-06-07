import mongoose from "mongoose";

const doctorApplicationSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    email:       { type: String, required: true, unique: true },
    phone:       { type: String, required: true },
    image:       { type: String, default: "" },           // Cloudinary URL
    speciality:  { type: String, required: true },
    degree:      { type: String, required: true },
    experience:  { type: String, required: true },
    about:       { type: String, required: true },
    fees:        { type: Number, required: true },
    address:     { type: Object, default: { line1: "", line2: "" } },
    status:      { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String, default: "" },
    reviewedAt:  { type: Date },
    reviewedBy:  { type: String, default: "admin" },
  },
  { timestamps: true }
);

const doctorApplicationModel =
  mongoose.models.doctorApplication ||
  mongoose.model("doctorApplication", doctorApplicationSchema);

export default doctorApplicationModel;
