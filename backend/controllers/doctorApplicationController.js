import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import doctorApplicationModel from "../models/doctorApplicationModel.js";

// POST /api/applications  (public, optional image upload)
export const submitApplication = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // ── Validate required fields ────────────────────────────────────────────
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 8 characters.",
        });
    }

    // ── Block duplicate application or existing doctor account ──────────────
    const [existingApplication, existingDoctor] = await Promise.all([
      doctorApplicationModel.findOne({ email }),
      doctorModel.findOne({ email }),
    ]);
    if (existingApplication) {
      return res
        .status(409)
        .json({
          success: false,
          message: "An application with this email already exists.",
        });
    }
    if (existingDoctor) {
      return res
        .status(409)
        .json({
          success: false,
          message: "A doctor account with this email already exists.",
        });
    }

    // ── Create user account if one doesn't exist yet ────────────────────────
    // The doctor will use these credentials to log in after approval.
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await userModel.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role: "user", // elevated to "doctor" on approval
      });
    }

    // ── Upload profile photo ────────────────────────────────────────────────
    let imageUrl = "";
    if (imageFile) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "prescripto/applications", resource_type: "image" },
          (error, result) => (error ? reject(error) : resolve(result)),
        );
        stream.end(imageFile.buffer);
      });
      imageUrl = result.secure_url;
    }

    // ── Parse address ───────────────────────────────────────────────────────
    let parsedAddress = { line1: "", line2: "" };
    try {
      parsedAddress =
        typeof address === "string" ? JSON.parse(address) : address;
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "Invalid address format." });
    }

    // ── Save application ────────────────────────────────────────────────────
    await doctorApplicationModel.create({
      name,
      email,
      phone,
      image: imageUrl,
      speciality,
      degree,
      experience,
      about,
      fees: Number(fees),
      address: parsedAddress,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message:
        "Application submitted! We will review and get back to you within 48 hours.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/applications  (admin auth)
export const getApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const [applications, total, pending, approved, rejected] =
      await Promise.all([
        doctorApplicationModel.find(filter).sort({ createdAt: -1 }),
        doctorApplicationModel.countDocuments(),
        doctorApplicationModel.countDocuments({ status: "pending" }),
        doctorApplicationModel.countDocuments({ status: "approved" }),
        doctorApplicationModel.countDocuments({ status: "rejected" }),
      ]);

    res.json({
      success: true,
      applications,
      counts: { total, pending, approved, rejected },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/applications/:id  (admin auth)
export const getApplicationById = async (req, res) => {
  try {
    const application = await doctorApplicationModel.findById(req.params.id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }
    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/applications/:id/approve  (admin auth)
export const approveApplication = async (req, res) => {
  try {
    const application = await doctorApplicationModel.findById(req.params.id);
    if (!application)
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    if (application.status !== "pending")
      return res.status(400).json({
        success: false,
        message: `Application is already "${application.status}" and cannot be approved.`,
      });

    // ── Guard: doctor account must not already exist ─────────────────────
    const existingDoctor = await doctorModel.findOne({
      email: application.email,
    });
    if (existingDoctor) {
      application.status = "approved";
      application.reviewedAt = new Date();
      await application.save();
      return res.json({
        success: true,
        message: "Application approved. Doctor account already exists.",
      });
    }

    // ── Require the applicant to have a registered user account ──────────
    const userAccount = await userModel.findOne({ email: application.email });
    if (!userAccount) {
      return res.status(400).json({
        success: false,
        message:
          "No registered account found for this email. " +
          "The applicant must sign up on Prescripto before their application can be approved.",
      });
    }

    // ── Create doctor record re-using the user's existing password hash ───
    // This means the doctor logs in with the exact same credentials they
    // already use — no new password is generated or shared.
    const doctor = new doctorModel({
      name: application.name,
      email: application.email,
      password: userAccount.password, // same hash → same password
      image: application.image || userAccount.image || "",
      speciality: application.speciality,
      degree: application.degree,
      experience: application.experience,
      about: application.about,
      fees: application.fees,
      address: application.address,
      date: Date.now(),
      available: true,
      slots_booked: {},
    });
    await doctor.save();

    // ── Elevate the user's role and update their profile picture ─────
    await userModel.findByIdAndUpdate(userAccount._id, { 
      role: "doctor",
      image: application.image || userAccount.image || ""
    });

    // ── Mark application approved ─────────────────────────────────────────
    application.status = "approved";
    application.reviewedAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: `Approved! ${application.name} can now log in with their existing credentials to access the Doctor Dashboard.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/applications/:id/reject  (admin auth)
export const rejectApplication = async (req, res) => {
  try {
    const application = await doctorApplicationModel.findById(req.params.id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Application is already "${application.status}" and cannot be rejected.`,
      });
    }

    const { reason } = req.body;
    application.status = "rejected";
    application.rejectionReason =
      reason || "Application did not meet requirements";
    application.reviewedAt = new Date();
    await application.save();

    res.json({ success: true, message: "Application rejected." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/applications/:id  (admin auth)
export const deleteApplication = async (req, res) => {
  try {
    const application = await doctorApplicationModel.findByIdAndDelete(
      req.params.id,
    );
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }
    res.json({ success: true, message: "Application deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
