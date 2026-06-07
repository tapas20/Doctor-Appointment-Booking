import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import Razorpay from "razorpay";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import reviewModel from "../models/reviewModel.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// GET /api/user/profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    res.json({ success: true, userData: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/user/profile
export const updateUserProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, gender, dob } = req.body;
    const imageFile = req.file;
    if (!name || !phone || !gender || !dob) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    const updateData = {
      name,
      phone,
      address: JSON.parse(address),
      gender,
      dob,
    };
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
    await userModel.findByIdAndUpdate(userId, updateData);
    res.json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/user/appointments
export const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel
      .find({ userId })
      .sort({ date: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/user/appointments/:id/cancel
export const cancelAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;
    const appointment = await appointmentModel.findById(id);
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found." });
    if (appointment.userId !== userId)
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action." });
    await appointmentModel.findByIdAndUpdate(id, { cancelled: true });
    // Release the slot
    const { docId, slotDate, slotTime } = appointment;
    const doctor = await doctorModel.findById(docId);
    const slots_booked = doctor.slots_booked;
    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (s) => s !== slotTime
      );
    }
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment cancelled." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/appointments/book
export const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found." });
    if (!docData.available)
      return res
        .status(400)
        .json({ success: false, message: "Doctor not available." });
    // Check if slot is already taken
    let slots_booked = docData.slots_booked;
    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res
        .status(409)
        .json({ success: false, message: "Slot already booked." });
    }
    // Book the slot
    if (!slots_booked[slotDate]) slots_booked[slotDate] = [];
    slots_booked[slotDate].push(slotTime);
    const userData = await userModel.findById(userId).select("-password");
    const appointmentData = {
      userId,
      docId,
      userData,
      docData: docData.toObject(),
      amount: docData.fees,
      slotDate,
      slotTime,
      date: Date.now(),
    };
    const appointment = new appointmentModel(appointmentData);
    await appointment.save();
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.status(201).json({
      success: true,
      message: "Appointment booked.",
      appointmentId: appointment._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/payment/razorpay
export const createRazorpayOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.cancelled) {
      return res.status(400).json({
        success: false,
        message: "Invalid or cancelled appointment.",
      });
    }
    if (appointment.payment) {
      return res.status(400).json({
        success: false,
        message: "Appointment is already paid.",
      });
    }
    const order = await razorpay.orders.create({
      amount: appointment.amount * 100, // in paise
      currency: "INR",
      receipt: appointmentId,
    });
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      razorpayOrderId: order.id,
    });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/payment/verify
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed." });
    }
    await appointmentModel.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { payment: true, razorpayPaymentId: razorpay_payment_id }
    );
    res.json({ success: true, message: "Payment verified successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/doctor/:docId/review
export const addReview = async (req, res) => {
  try {
    const { userId } = req.body;
    const { docId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: "Rating and comment are required." });
    }

    // Verify user had a completed appointment with this doctor
    const completedAppointment = await appointmentModel.findOne({
      userId,
      docId,
      isCompleted: true,
    });

    if (!completedAppointment) {
      return res.status(403).json({ success: false, message: "You can only review doctors you have had a completed appointment with." });
    }

    // Check if review already exists
    const existingReview = await reviewModel.findOne({ userId, docId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this doctor." });
    }

    const userData = await userModel.findById(userId).select("name image");

    const review = new reviewModel({
      docId,
      userId,
      rating,
      comment,
      userData: { name: userData.name, image: userData.image },
    });

    await review.save();

    // Update doctor's aggregate rating
    const allReviews = await reviewModel.find({ docId, isApproved: true });
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0 ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : 0;

    await doctorModel.findByIdAndUpdate(docId, {
      reviewCount: totalReviews,
      averageRating: parseFloat(averageRating),
    });

    res.status(201).json({ success: true, message: "Review submitted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
