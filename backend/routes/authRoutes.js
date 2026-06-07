import express from "express";
import {
  registerUser,
  loginUser,
  loginDoctor,
  loginAdmin,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/doctor/login", loginDoctor);
router.post("/admin/login", loginAdmin);

export default router;
