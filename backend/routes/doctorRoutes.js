import express from "express";
import {
  getDoctorList,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  completeAppointment,
  cancelAppointmentByDoctor,
  getDoctorDashboard,
  getDoctorReviews,
  getDoctorDashboardReviews,
  getDoctorTransactions,
} from "../controllers/doctorController.js";
import { authDoctor } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/list", getDoctorList);
router.get("/:docId/reviews", getDoctorReviews); // Public route
router.get("/profile", authDoctor, getDoctorProfile);
router.put("/profile", upload.single("image"), authDoctor, updateDoctorProfile);
router.get("/appointments", authDoctor, getDoctorAppointments);
router.put("/appointments/:id/complete", authDoctor, completeAppointment);
router.put("/appointments/:id/cancel", authDoctor, cancelAppointmentByDoctor);
router.get("/dashboard", authDoctor, getDoctorDashboard);
router.get("/reviews", authDoctor, getDoctorDashboardReviews);
router.get("/transactions", authDoctor, getDoctorTransactions);

export default router;
