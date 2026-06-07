"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import RelatedDoctors from "@/components/RelatedDoctors";
import { assets } from "@/lib/data";
import {
  FaCheckCircle,
  FaMapMarkerAlt,
  FaUserMd,
  FaGraduationCap,
  FaBriefcase,
  FaClock,
  FaStar,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaCreditCard,
  FaTimes
} from 'react-icons/fa';

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function generateSlots() {
  const slots = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const daySlots = [];
    const startHour = i === 0 ? Math.max(today.getHours() + 1, 10) : 10;
    for (let h = startHour; h < 18; h++) {
      for (let m = 0; m < 60; m += 30) {
        if (h === 17 && m > 0) break;
        const time = new Date(date);
        time.setHours(h, m, 0, 0);
        daySlots.push({
          datetime: time,
          time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      }
    }
    slots.push(daySlots);
  }
  return slots;
}

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function AppointmentPage() {
  const { docId } = useParams();
  const router = useRouter();
  const { doctors, currencySymbol, token, userData, backendUrl, fetchDoctors } = useAppContext();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [docReviews, setDocReviews] = useState([]);
  
  // Review state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Booking state
  const [booking, setBooking] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (doctors.length > 0) {
      const doc = doctors.find((d) => d._id === docId);
      setDocInfo(doc || null);
      setDocSlots(generateSlots());
      setLoading(false);
    }
  }, [docId, doctors]);

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/${docId}/reviews`);
      if (data.success) setDocReviews(data.reviews);
    } catch (error) {
      console.error(error);
    }
  }, [backendUrl, docId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async () => {
    if (!token) {
      toast.info("Please login to write a review");
      router.push("/login");
      return;
    }
    if (!reviewRating || !reviewComment) return toast.warning("Rating and comment are required");
    setSubmittingReview(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/doctor/${docId}/review`,
        { rating: reviewRating, comment: reviewComment },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setReviewModalOpen(false);
        fetchReviews(); // Refresh reviews list
        fetchDoctors(); // Refresh doctor's average rating
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePreBookCheck = () => {
    if (!token) {
      toast.info("Please login to book an appointment");
      router.push("/login");
      return;
    }
    if (!slotTime) {
      toast.warning("Please select a time slot");
      return;
    }
    // Open payment selection modal
    setShowPaymentModal(true);
  };

  const executeBookingAndPayment = async (payOnline) => {
    const date = docSlots[slotIndex]?.[0]?.datetime;
    if (!date) return;

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const slotDate = `${day}_${month}_${year}`;

    setBooking(true);
    try {
      // 1. Create the appointment
      const { data } = await axios.post(
        `${backendUrl}/api/user/appointments/book`,
        { docId, slotDate, slotTime },
        { headers: { token } }
      );

      if (!data.success) {
        toast.error(data.message || "Booking failed");
        setBooking(false);
        setShowPaymentModal(false);
        return;
      }
      
      // Update global context so the slot is immediately greyed out if the user comes back
      await fetchDoctors();

      const appointmentId = data.appointmentId;

      // 2. If Cash, just redirect
      if (!payOnline) {
        toast.success("Appointment booked successfully!");
        setShowPaymentModal(false);
        router.push("/my-appointments");
        return;
      }

      // 3. If Online, initiate Razorpay
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Razorpay SDK failed to load. Appointment booked as Cash.");
        router.push("/my-appointments");
        return;
      }

      const orderRes = await axios.post(
        `${backendUrl}/api/user/payment/razorpay`,
        { appointmentId },
        { headers: { token } }
      );

      if (!orderRes.data.success) {
        toast.error(orderRes.data.message || "Payment initialization failed. Booked as Cash.");
        router.push("/my-appointments");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderRes.data.order.amount,
        currency: orderRes.data.order.currency,
        name: "Prescripto",
        description: "Appointment Payment",
        order_id: orderRes.data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${backendUrl}/api/user/payment/verify`,
              response,
              { headers: { token } }
            );
            if (verifyRes.data.success) {
              toast.success("Payment successful!");
              router.push("/my-appointments");
            } else {
              toast.error("Payment verification failed. Please check 'My Appointments' to retry.");
              router.push("/my-appointments");
            }
          } catch {
            toast.error("Payment verification failed. Please check 'My Appointments' to retry.");
            router.push("/my-appointments");
          }
        },
        prefill: { name: userData?.name, email: userData?.email },
        theme: { color: "#5f6FFF" },
        modal: {
          ondismiss: function() {
             toast.info("Payment cancelled. You can pay later from My Appointments.");
             router.push("/my-appointments");
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      setShowPaymentModal(false);

    } catch (err) {
      toast.error(err?.response?.data?.message || "Booking failed");
      setBooking(false);
      setShowPaymentModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#5f6FFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!docInfo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <FaUserMd className="text-gray-300 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Doctor Not Found</h2>
          <p className="text-gray-500 mb-6">The doctor you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push("/doctors")}
            className="bg-[#5f6FFF] text-white px-6 py-3 rounded-full hover:bg-[#4a5bef] transition-colors"
          >
            Browse All Doctors
          </button>
        </div>
      </div>
    );
  }

  const selectedDay = docSlots[slotIndex];
  const selectedDate = selectedDay?.[0]?.datetime;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative">
      {/* Doctor Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-end justify-center p-0 md:p-4 relative min-h-64">
            <Image
              src={docInfo.image || assets.profile_pic}
              alt={docInfo.name}
              width={240}
              height={280}
              className="w-full md:w-56 object-cover object-top"
            />
          </div>

          <div className="flex-1 p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {docInfo.name}
                  <FaCheckCircle className="text-[#5f6FFF] text-lg" />
                </h1>
                <p className="text-[#5f6FFF] font-medium mt-1">{docInfo.speciality}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 bg-[#5f6FFF]/10 px-3 py-1.5 rounded-full">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold text-gray-700">{docInfo.averageRating || "0.0"}</span>
                  <span className="text-xs text-[#5f6FFF] ml-1 font-medium">({docInfo.reviewCount || 0})</span>
                </div>
                <button
                  onClick={() => {
                    if (!token) {
                      toast.info("Please login to write a review");
                      router.push("/login");
                      return;
                    }
                    setReviewRating(5);
                    setReviewComment("");
                    setReviewModalOpen(true);
                  }}
                  className="text-xs font-semibold text-[#5f6FFF] hover:underline flex items-center gap-1"
                >
                  Write a Review
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaGraduationCap className="text-[#5f6FFF]" />
                <span>{docInfo.degree || "MBBS"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaBriefcase className="text-[#5f6FFF]" />
                <span>{docInfo.experience} experience</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaMapMarkerAlt className="text-[#5f6FFF]" />
                <span>{docInfo.address?.line1}</span>
              </div>
            </div>

            {docInfo.about && (
              <div className="mb-5">
                <h3 className="font-semibold text-gray-700 mb-2">About</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{docInfo.about}</p>
              </div>
            )}

            <div className="flex items-center gap-2 bg-[#5f6FFF]/5 px-4 py-3 rounded-xl inline-flex">
              <span className="text-gray-600 text-sm">Appointment fee:</span>
              <span className="font-bold text-[#5f6FFF] text-lg">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaCalendarCheck className="text-[#5f6FFF]" />
          Book Your Appointment
        </h2>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-3">Select Date</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {docSlots.map((daySlots, idx) => {
              const date = daySlots[0]?.datetime;
              if (!date) return null;
              const isToday = idx === 0;
              const isSelected = idx === slotIndex;
              return (
                <button
                  key={idx}
                  onClick={() => { setSlotIndex(idx); setSlotTime(""); }}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all min-w-16 ${
                    isSelected
                      ? "bg-[#5f6FFF] text-white border-[#5f6FFF] shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#5f6FFF]/50"
                  }`}
                >
                  <span className="text-xs font-medium">{daysOfWeek[date.getDay()]}</span>
                  <span className="text-xl font-bold">{date.getDate()}</span>
                  <span className="text-xs">{months[date.getMonth()]}</span>
                  {isToday && (
                    <span className={`text-xs font-medium ${isSelected ? "text-white/80" : "text-[#5f6FFF]"}`}>Today</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
            <FaClock className="text-[#5f6FFF]" />
            Available Times
            {selectedDate && (
              <span className="text-[#5f6FFF] font-semibold">
                — {daysOfWeek[selectedDate.getDay()]}, {months[selectedDate.getMonth()]} {selectedDate.getDate()}
              </span>
            )}
          </p>
          {selectedDay && selectedDay.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedDay.map((slot, i) => {
                const day = selectedDate.getDate().toString().padStart(2, "0");
                const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
                const year = selectedDate.getFullYear();
                const slotDateStr = `${day}_${month}_${year}`;
                
                // Robust normalization to handle narrow no-break space (U+202F) and case differences
                const normalizeTime = (t) => t ? t.replace(/\u202F/g, ' ').toLowerCase().trim() : '';
                const normalizedSlotTime = normalizeTime(slot.time);
                
                const isBooked = docInfo.slots_booked?.[slotDateStr]?.some(
                  (bookedTime) => normalizeTime(bookedTime) === normalizedSlotTime
                );

                return (
                  <button
                    key={i}
                    onClick={() => !isBooked && setSlotTime(slot.time)}
                    disabled={isBooked}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      isBooked
                        ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-80 line-through"
                        : slotTime === slot.time
                        ? "bg-[#5f6FFF] text-white border-[#5f6FFF] shadow-md cursor-pointer"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#5f6FFF]/50 cursor-pointer"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No slots available for this day.</p>
          )}
        </div>

        <button
          onClick={handlePreBookCheck}
          disabled={!slotTime}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#5f6FFF] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#4a5bef] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <FaCalendarCheck /> Book Appointment
        </button>

        {!token && (
          <p className="mt-3 text-sm text-gray-500">
            <button onClick={() => router.push("/login")} className="text-[#5f6FFF] font-medium hover:underline">
              Login
            </button> to book an appointment.
          </p>
        )}
      </div>

      {/* Patient Reviews */}
      {docReviews.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaStar className="text-yellow-400" />
            Patient Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docReviews.map((review) => (
              <div key={review._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-50 flex-shrink-0">
                  <Image src={review.userData?.image || assets.profile_pic} alt="" width={48} height={48} className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    {review.userData?.name || "Patient"}
                    <span className="text-xs font-normal text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </h4>
                  <div className="flex gap-0.5 my-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar key={star} size={12} className={star <= review.rating ? "text-yellow-400" : "text-gray-200"} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 italic leading-relaxed">"{review.comment}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <RelatedDoctors speciality={docInfo.speciality} docId={docId} />

      {/* Payment Selection Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Complete Booking
              </h3>
              <button
                onClick={() => !booking && setShowPaymentModal(false)}
                disabled={booking}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-6 text-sm">
                How would you like to pay for your appointment with <span className="font-semibold text-gray-800">Dr. {docInfo?.name}</span>?
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => executeBookingAndPayment(true)}
                  disabled={booking}
                  className="w-full flex items-center justify-between px-5 py-4 border-2 border-[#5f6FFF] bg-[#5f6FFF]/5 rounded-xl hover:bg-[#5f6FFF]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#5f6FFF] text-white flex items-center justify-center shadow-md">
                      <FaCreditCard size={18} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#5f6FFF]">Pay Online</p>
                      <p className="text-xs text-gray-500 font-medium">Secure credit/debit card, UPI</p>
                    </div>
                  </div>
                  <div className="text-[#5f6FFF] font-bold bg-white px-3 py-1 rounded-full shadow-sm">
                    {currencySymbol}{docInfo?.fees}
                  </div>
                </button>

                <button
                  onClick={() => executeBookingAndPayment(false)}
                  disabled={booking}
                  className="w-full flex items-center justify-between px-5 py-4 border-2 border-gray-200 bg-white rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                      <FaMoneyBillWave size={18} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-700">Pay at Clinic</p>
                      <p className="text-xs text-gray-500 font-medium">Pay via cash or card later</p>
                    </div>
                  </div>
                </button>
              </div>

              {booking && (
                <div className="mt-6 flex items-center justify-center text-[#5f6FFF] text-sm font-medium animate-pulse gap-2">
                  <div className="w-4 h-4 border-2 border-[#5f6FFF] border-t-transparent rounded-full animate-spin" />
                  Processing booking...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#5f6FFF] px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Rate your Visit
              </h3>
              <button
                onClick={() => !submittingReview && setReviewModalOpen(false)}
                disabled={submittingReview}
                className="text-white/80 hover:text-white p-1 rounded-full transition-colors disabled:opacity-50"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4 text-sm">
                How was your experience with Dr. {docInfo?.name}?
              </p>
              
              <div className="flex gap-2 mb-6 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <FaStar
                      size={32}
                      className={star <= reviewRating ? "text-yellow-400" : "text-gray-200"}
                    />
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share your experience
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="The doctor was very professional..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF]/20 focus:border-[#5f6FFF] transition-all resize-none h-28"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setReviewModalOpen(false)}
                  disabled={submittingReview}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !reviewComment.trim()}
                  className="flex-1 px-4 py-2.5 bg-[#5f6FFF] text-white rounded-xl font-medium hover:bg-[#4a5bef] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingReview && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
