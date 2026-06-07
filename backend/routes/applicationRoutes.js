import express from "express";
import {
  submitApplication,
  getApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  deleteApplication,
} from "../controllers/doctorApplicationController.js";
import { authAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public
router.post("/", upload.single("image"), submitApplication);

// Admin only
router.get("/", authAdmin, getApplications);
router.get("/:id", authAdmin, getApplicationById);
router.put("/:id/approve", authAdmin, approveApplication);
router.put("/:id/reject", authAdmin, rejectApplication);
router.delete("/:id", authAdmin, deleteApplication);

export default router;
