import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    docId: { type: String, required: true },
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    userData: { type: Object, required: true }, // Store minimal user data for fast reads
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const reviewModel =
  mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;
