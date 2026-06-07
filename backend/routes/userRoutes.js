import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserAppointments,
  cancelAppointment,
  bookAppointment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  addReview,
} from "../controllers/userController.js";
import { authUser } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/profile", authUser, getUserProfile);
router.put("/profile", upload.single("image"), authUser, updateUserProfile);
router.get("/appointments", authUser, getUserAppointments);
router.post("/appointments/book", authUser, bookAppointment);
router.put("/appointments/:id/cancel", authUser, cancelAppointment);
router.post("/payment/razorpay", authUser, createRazorpayOrder);
router.post("/payment/verify", authUser, verifyRazorpayPayment);
router.post("/doctor/:docId/review", authUser, addReview);

export default router;
