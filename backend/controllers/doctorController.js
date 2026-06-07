import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import reviewModel from "../models/reviewModel.js";

// GET /api/doctor/list (public)
export const getDoctorList = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({ available: true })
      .select("-password -email");
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/doctor/profile
export const getDoctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const doctor = await doctorModel.findById(docId).select("-password");
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found." });
    res.json({ success: true, profileData: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/doctor/profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const { 
      docId, name, speciality, degree, experience, fees, address, available, about, phone 
    } = req.body;
    const imageFile = req.file;
    const updateData = {
      fees,
      address: JSON.parse(address),
      available: available === 'true' || available === true,
      about,
    };
    if (name) updateData.name = name;
    if (speciality) updateData.speciality = speciality;
    if (degree) updateData.degree = degree;
    if (experience) updateData.experience = experience;
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
    await doctorModel.findByIdAndUpdate(docId, updateData);

    // Sync changes with userModel
    const doc = await doctorModel.findById(docId);
    if (doc) {
      const userUpdateData = {};
      if (updateData.name) userUpdateData.name = updateData.name;
      if (updateData.phone) userUpdateData.phone = updateData.phone;
      if (updateData.image) userUpdateData.image = updateData.image;
      
      if (Object.keys(userUpdateData).length > 0) {
        await userModel.findOneAndUpdate({ email: doc.email }, userUpdateData);
      }
    }
    
    res.json({ success: true, message: "Profile updated." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/doctor/appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel
      .find({ docId })
      .sort({ date: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/doctor/appointments/:id/complete
export const completeAppointment = async (req, res) => {
  try {
    const { docId } = req.body;
    const { id } = req.params;
    const appointment = await appointmentModel.findById(id);
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found." });
    if (appointment.docId !== docId)
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized." });
    await appointmentModel.findByIdAndUpdate(id, { isCompleted: true });
    res.json({ success: true, message: "Appointment marked as completed." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/doctor/appointments/:id/cancel
export const cancelAppointmentByDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    const { id } = req.params;
    const appointment = await appointmentModel.findById(id);
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found." });
    if (appointment.docId !== docId)
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized." });
    await appointmentModel.findByIdAndUpdate(id, { cancelled: true });
    // Release slot
    const doctor = await doctorModel.findById(docId);
    const slots_booked = doctor.slots_booked;
    if (slots_booked[appointment.slotDate]) {
      slots_booked[appointment.slotDate] = slots_booked[
        appointment.slotDate
      ].filter((s) => s !== appointment.slotTime);
    }
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment cancelled." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/doctor/dashboard
export const getDoctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });
    const earnings = appointments
      .filter((a) => a.payment && !a.cancelled)
      .reduce((sum, a) => sum + a.amount, 0);
    const totalAppointments = appointments.length;
    const totalPatients = [...new Set(appointments.map((a) => a.userId))].length;
    const latestAppointments = appointments
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);
    res.json({
      success: true,
      dashData: { earnings, totalAppointments, totalPatients, latestAppointments },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/doctor/:docId/reviews (public)
export const getDoctorReviews = async (req, res) => {
  try {
    const { docId } = req.params;
    const reviews = await reviewModel.find({ docId, isApproved: true }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/doctor/reviews (protected)
export const getDoctorDashboardReviews = async (req, res) => {
  try {
    const { docId } = req.body;
    const reviews = await reviewModel.find({ docId }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/doctor/transactions
export const getDoctorTransactions = async (req, res) => {
  try {
    const { docId } = req.body;
    const transactions = await appointmentModel
      .find({ docId, payment: true })
      .sort({ date: -1 });
      
    const totalEarnings = transactions
      .filter((a) => !a.cancelled)
      .reduce((sum, a) => sum + a.amount, 0);
      
    res.json({ success: true, transactions, totalEarnings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
