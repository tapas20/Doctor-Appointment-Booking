import express from "express";
import {
  addDoctor,
  getAllDoctors,
  updateDoctorAvailability,
  updateDoctorInfo,
  removeDoctor,
  getAllUsers,
  addUser,
  updateUserAdmin,
  removeUser,
  getAllAppointments,
  cancelAppointmentAdmin,
  getAdminDashboard,
  getAllTransactions,
  getAdminProfile,
  updateAdminProfile,
  getAllReviews,
  deleteReview,
} from "../controllers/adminController.js";
import { authAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(authAdmin); // All admin routes protected

router.get("/dashboard", getAdminDashboard);
router.post("/doctors", upload.single("image"), addDoctor);
router.get("/doctors", getAllDoctors);
router.put("/doctors/:id", updateDoctorAvailability);
router.put("/doctors/:id/update", upload.single("image"), updateDoctorInfo);
router.delete("/doctors/:id", removeDoctor);

router.post("/users", upload.single("image"), addUser);
router.get("/users", getAllUsers);
router.put("/users/:id/update", upload.single("image"), updateUserAdmin);
router.delete("/users/:id", removeUser);

router.get("/appointments", getAllAppointments);
router.put("/appointments/:id/cancel", cancelAppointmentAdmin);
router.get("/transactions", getAllTransactions);

router.get("/profile", getAdminProfile);
router.put("/profile", upload.single("image"), updateAdminProfile);

router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

export default router;
