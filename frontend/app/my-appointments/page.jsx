"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { assets } from "@/lib/data";
import {
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaMoneyBillWave,
  FaTimes,
  FaCheckCircle,
  FaHourglassHalf,
  FaStar,
} from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";

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

const StatusBadge = ({ appointment }) => {
  if (appointment.cancelled) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        Cancelled
      </span>
    );
  }
  if (appointment.isCompleted) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Completed
      </span>
    );
  }
  if (appointment.payment) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
        Paid
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
      Pending
    </span>
  );
};

export default function MyAppointmentsPage() {
  const router = useRouter();
  const { token, userData, backendUrl, authLoaded } = useAppContext();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Review state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDocId, setReviewDocId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message || "Failed to load appointments");
      }
    } catch (err) {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  }, [token, backendUrl]);

  useEffect(() => {
    if (!authLoaded) return;
    if (!token) {
      window.location.replace("/login");
      return;
    }
    fetchAppointments();
  }, [token, router, fetchAppointments, authLoaded]);

  const handleCancel = async (appointmentId) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    setActionLoading(appointmentId);
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/user/appointments/${appointmentId}/cancel`,
        {},
        { headers: { token } },
      );
      if (data.success) {
        toast.success("Appointment cancelled");
        fetchAppointments();
      } else {
        toast.error(data.message || "Cancellation failed");
      }
    } catch (err) {
      toast.error("Cancellation failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewComment) return toast.warning("Rating and comment are required");
    setSubmittingReview(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/doctor/${reviewDocId}/review`,
        { rating: reviewRating, comment: reviewComment },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setReviewModalOpen(false);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePayment = async (appointmentId, amount) => {
    const loaded = await loadRazorpay();
    if (!loaded) return toast.error("Razorpay SDK failed to load");

    setActionLoading(appointmentId);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment/razorpay`,
        { appointmentId },
        { headers: { token } },
      );
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Prescripto",
        description: "Appointment Payment",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${backendUrl}/api/user/payment/verify`,
              response,
              { headers: { token } },
            );
            if (verifyRes.data.success) {
              toast.success("Payment successful!");
              fetchAppointments();
            } else {
              toast.error("Payment verification failed");
            }
          } catch {
            toast.error("Payment verification failed");
          }
        },
        prefill: { name: userData?.name, email: userData?.email },
        theme: { color: "#5f6FFF" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Payment initiation failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (!authLoaded || !token) return null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#5f6FFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#5f6FFF]/10 p-3 rounded-xl">
            <MdHealthAndSafety className="text-[#5f6FFF] text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              My Appointments
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your scheduled visits
            </p>
          </div>
        </div>
        <div className="bg-[#5f6FFF]/10 text-[#5f6FFF] px-4 py-1.5 rounded-full text-sm font-semibold">
          {appointments.length} Total
        </div>
      </div>

      {/* Appointments List */}
      {appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appt) => {
            const doc = appt.docData || {};
            const isActive = !appt.cancelled && !appt.isCompleted;
            const isActioning = actionLoading === appt._id;
            return (
              <div
                key={appt._id}
                className={`bg-white rounded-xl border overflow-hidden transition-all ${
                  appt.cancelled
                    ? "border-red-100 opacity-75"
                    : "border-gray-100 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="p-5 flex flex-col sm:flex-row gap-5">
                  {/* Doctor Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-blue-50">
                      <Image
                        src={doc.image || assets.profile_pic}
                        alt={doc.name || "Doctor"}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                          <FaUserMd className="text-[#5f6FFF] text-sm" />
                          {doc.name || "Unknown Doctor"}
                        </h3>
                        <p className="text-[#5f6FFF] text-sm font-medium">
                          {doc.speciality}
                        </p>
                      </div>
                      <StatusBadge appointment={appt} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCalendarAlt className="text-[#5f6FFF]" />
                        <span>{appt.slotDate?.replace(/_/g, " ") || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaClock className="text-[#5f6FFF]" />
                        <span>{appt.slotTime || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaMoneyBillWave className="text-[#5f6FFF]" />
                        <span>₹{doc.fees || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isActive && (
                  <div className="bg-gray-50 px-5 py-3 flex justify-end gap-3 border-t border-gray-100">
                    {!appt.payment && (
                      <button
                        onClick={() => handlePayment(appt._id, doc.fees)}
                        disabled={isActioning}
                        className="flex items-center gap-2 px-4 py-2 bg-[#5f6FFF] text-white rounded-lg text-sm font-medium hover:bg-[#4a5bef] transition-colors disabled:opacity-50"
                      >
                        {isActioning ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaMoneyBillWave />
                        )}
                        Pay Online
                      </button>
                    )}
                    {appt.payment && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium px-4 py-2">
                        <FaCheckCircle /> Payment Done
                      </div>
                    )}
                    <button
                      onClick={() => handleCancel(appt._id)}
                      disabled={isActioning}
                      className="flex items-center gap-2 px-4 py-2 border border-red-400 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {isActioning ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaTimes />
                      )}
                      Cancel
                    </button>
                  </div>
                )}

                {appt.isCompleted && (
                  <div className="bg-green-50 px-5 py-3 border-t border-green-100 flex items-center justify-between text-green-700 text-sm">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle /> Appointment completed
                    </div>
                    <button
                      onClick={() => {
                        setReviewDocId(doc._id);
                        setReviewRating(5);
                        setReviewComment("");
                        setReviewModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center gap-1"
                    >
                      <FaStar className="text-yellow-500" /> Write Review
                    </button>
                  </div>
                )}

                {appt.cancelled && (
                  <div className="bg-red-50 px-5 py-3 border-t border-red-100 flex items-center gap-2 text-red-600 text-sm">
                    <FaTimes /> Appointment cancelled
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaHourglassHalf className="text-[#5f6FFF] text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Appointments Yet
          </h3>
          <p className="text-gray-500 mb-6">
            You haven&apos;t booked any appointments yet.
          </p>
          <button
            onClick={() => router.push("/doctors")}
            className="bg-[#5f6FFF] text-white px-6 py-3 rounded-full font-medium hover:bg-[#4a5bef] transition-colors"
          >
            Find a Doctor
          </button>
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
                How was your experience with the doctor?
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
