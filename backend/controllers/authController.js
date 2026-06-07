import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register  — creates a new patient account
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    if (!validator.isEmail(email))
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address." });
    if (password.length < 8)
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 8 characters.",
        });
    const exists = await userModel.findOne({ email });
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "Email already registered." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();
    const token = generateToken({ id: user._id, role: "user" });
    res
      .status(201)
      .json({
        success: true,
        token,
        role: "user",
        message: "Account created successfully.",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/login  — Unified RBAC login
 * Resolution order: admin (env) → doctor (DB) → user (DB)
 * Returns { success, token, role } so the client can route accordingly.
 */
export const unifiedLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });

    // ── 1. Check userModel first (Admin or Patient) ─────────────────────────
    const user = await userModel.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials." });
      const role = user.role || "user";
      
      if (role === "doctor") {
        const doctor = await doctorModel.findOne({ email });
        if (!doctor) {
          return res.status(404).json({ success: false, message: "Doctor profile missing." });
        }
        const token = generateToken({ id: doctor._id, role: "doctor" });
        return res.json({
          success: true,
          token,
          role: "doctor",
          message: "Welcome, Dr. " + doctor.name.split(" ").slice(-1)[0] + "!",
        });
      }

      const token = generateToken({ id: user._id, role });
      const greeting =
        role === "admin" ? "Welcome back, Admin!" : "Logged in successfully!";
      return res.json({ success: true, token, role, message: greeting });
    }

    // ── 2. Admin fallback (env-based bootstrap) ─────────────────────────────
    if (email === process.env.ADMIN_EMAIL) {
      if (password !== process.env.ADMIN_PASSWORD)
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials." });
      
      // Bootstrap the admin into the DB
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new userModel({
        name: "System Administrator",
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
      });
      await newAdmin.save();

      const token = generateToken({ id: newAdmin._id, role: "admin" });
      return res.json({
        success: true,
        token,
        role: "admin",
        message: "Welcome, Admin!",
      });
    }

    // ── 3. Doctor check ─────────────────────────────────────────────────────
    const doctor = await doctorModel.findOne({ email });
    if (doctor) {
      const isMatch = await bcrypt.compare(password, doctor.password);
      if (!isMatch)
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials." });
      const token = generateToken({ id: doctor._id, role: "doctor" });
      return res.json({
        success: true,
        token,
        role: "doctor",
        message: "Welcome, Dr. " + doctor.name.split(" ").slice(-1)[0] + "!",
      });
    }

    return res
      .status(404)
      .json({ success: false, message: "No account found with this email." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Keep individual endpoints for backward compatibility
export const loginUser = unifiedLogin;
export const loginDoctor = unifiedLogin;
export const loginAdmin = unifiedLogin;
