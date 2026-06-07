import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";
import validator from "validator";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";
import reviewModel from "../models/reviewModel.js";

// POST /api/admin/doctors - Add Doctor
export const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address ||
      !imageFile
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields including image are required.",
      });
    }
    if (!validator.isEmail(email))
      return res
        .status(400)
        .json({ success: false, message: "Invalid email." });
    if (password.length < 8)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 chars.",
      });
    const exists = await doctorModel.findOne({ email });
    if (exists)
      return res.status(409).json({
        success: false,
        message: "Doctor with this email already exists.",
      });
    const hashedPassword = await bcrypt.hash(password, 10);
    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "prescripto/doctors", resource_type: "image" },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(imageFile.buffer);
    });
    const doctor = new doctorModel({
      name,
      email,
      password: hashedPassword,
      image: result.secure_url,
      speciality,
      degree,
      experience,
      about,
      fees: Number(fees),
      address: JSON.parse(address),
      date: Date.now(),
      available: true,
    });
    await doctor.save();
    res
      .status(201)
      .json({ success: true, message: "Doctor added successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find().select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/doctors/:id - Update Doctor Availability (legacy support)
export const updateDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;
    await doctorModel.findByIdAndUpdate(id, { available });
    res.json({ success: true, message: "Doctor availability updated." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/doctors/:id/update - Update Doctor Profile completely
export const updateDoctorInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, speciality, degree, experience, fees, address, available, about, phone } = req.body;
    const imageFile = req.file;

    const updateData = {};
    if (name) updateData.name = name;
    if (speciality) updateData.speciality = speciality;
    if (degree) updateData.degree = degree;
    if (experience) updateData.experience = experience;
    if (fees) updateData.fees = Number(fees);
    if (address) updateData.address = JSON.parse(address);
    if (available !== undefined) updateData.available = available === 'true' || available === true;
    if (about) updateData.about = about;
    if (phone) updateData.phone = phone;

    if (imageFile) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "prescripto/doctors", resource_type: "image" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(imageFile.buffer);
      });
      updateData.image = result.secure_url;
    }

    await doctorModel.findByIdAndUpdate(id, updateData);

    // Sync changes with userModel
    const doc = await doctorModel.findById(id);
    if (doc) {
      const userUpdateData = {};
      if (updateData.name) userUpdateData.name = updateData.name;
      if (updateData.phone) userUpdateData.phone = updateData.phone;
      if (updateData.image) userUpdateData.image = updateData.image;
      
      if (Object.keys(userUpdateData).length > 0) {
        await userModel.findOneAndUpdate({ email: doc.email }, userUpdateData);
      }
    }

    res.json({ success: true, message: "Doctor profile updated." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/doctors/:id
export const removeDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await doctorModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Doctor removed successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/users - Add User
export const addUser = async (req, res) => {
  try {
    const { name, email, password, phone, gender, dob } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email." });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 chars." });
    }

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let imageUrl = "https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man.jpg";

    if (imageFile) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "prescripto/users", resource_type: "image" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(imageFile.buffer);
      });
      imageUrl = result.secure_url;
    }

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      phone: phone || "000-000-0000",
      gender: gender || "Not Selected",
      dob: dob || "Not Selected",
      image: imageUrl,
      role: "user",
    });

    await user.save();
    res.status(201).json({ success: true, message: "User added successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/users/:id/update - Update User Profile
export const updateUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, gender, dob, email, password } = req.body;
    const imageFile = req.file;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;
    if (dob) updateData.dob = dob;
    if (email) updateData.email = email;

    if (password) {
       updateData.password = await bcrypt.hash(password, 10);
    }

    if (imageFile) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "prescripto/users", resource_type: "image" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(imageFile.buffer);
      });
      updateData.image = result.secure_url;
    }

    await userModel.findByIdAndUpdate(id, updateData);
    res.json({ success: true, message: "User profile updated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/users/:id
export const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, delete all appointments for this user to prevent orphaned records
    await appointmentModel.deleteMany({ userId: id });
    
    // Then delete the user
    await userModel.findByIdAndDelete(id);
    
    res.json({ success: true, message: "User and associated appointments removed." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/appointments
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel.find().sort({ date: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/appointments/:id/cancel
export const cancelAppointmentAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await appointmentModel.findById(id);
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found." });
    await appointmentModel.findByIdAndUpdate(id, { cancelled: true });
    const { docId, slotDate, slotTime } = appointment;
    const doctor = await doctorModel.findById(docId);
    if (doctor) {
      const slots_booked = doctor.slots_booked;
      if (slots_booked[slotDate]) {
        slots_booked[slotDate] = slots_booked[slotDate].filter(
          (s) => s !== slotTime
        );
      }
      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    }
    res.json({ success: true, message: "Appointment cancelled." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/dashboard
export const getAdminDashboard = async (req, res) => {
  try {
    const [doctors, users, appointments] = await Promise.all([
      doctorModel.countDocuments(),
      userModel.countDocuments(),
      appointmentModel.find().sort({ date: -1 }),
    ]);
    const totalAppointments = appointments.length;
    const totalRevenue = appointments
      .filter((a) => a.payment && !a.cancelled)
      .reduce((sum, a) => sum + a.amount, 0);
    const latestAppointments = appointments.slice(0, 10);
    res.json({
      success: true,
      dashData: {
        doctors,
        users,
        appointments: totalAppointments,
        totalRevenue,
        latestAppointments,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await appointmentModel
      .find({ payment: true })
      .sort({ updatedAt: -1 });
    const totalRevenue = transactions
      .filter(t => !t.cancelled)
      .reduce((sum, t) => sum + t.amount, 0);
    res.json({ success: true, transactions, totalRevenue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.find().sort({ createdAt: -1 });
    
    // Fetch doctor info for each review to display names
    const populatedReviews = await Promise.all(reviews.map(async (r) => {
      const doc = await doctorModel.findById(r.docId).select("name");
      return {
        ...r.toObject(),
        doctorData: doc ? { name: doc.name } : { name: "Unknown Doctor" }
      };
    }));

    res.json({ success: true, reviews: populatedReviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await reviewModel.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Update doctor's aggregate rating
    const docId = review.docId;
    const allReviews = await reviewModel.find({ docId, isApproved: true });
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0 ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : 0;

    await doctorModel.findByIdAndUpdate(docId, {
      reviewCount: totalReviews,
      averageRating: parseFloat(averageRating),
    });

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/profile
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.adminId;
    let adminData = await userModel.findById(adminId).select("-password");
    if (!adminData && adminId === "admin") {
      // Fallback for edge cases where token is "admin" but not in DB
      adminData = {
        name: "System Administrator",
        email: process.env.ADMIN_EMAIL,
        role: "admin",
      };
    }
    res.json({ success: true, profileData: adminData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/profile
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.adminId;
    const { name, phone, email, password } = req.body;
    const imageFile = req.file;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (imageFile) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "prescripto/admin", resource_type: "image" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(imageFile.buffer);
      });
      updateData.image = result.secure_url;
    }

    // Must ensure it's updating an actual DB record
    if (adminId === "admin") {
       return res.status(400).json({ success: false, message: "Please log out and log back in to enable profile editing." });
    }

    await userModel.findByIdAndUpdate(adminId, updateData);
    res.json({ success: true, message: "Admin profile updated." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
