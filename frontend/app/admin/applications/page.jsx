"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { assets } from "@/lib/data";
import {
  FaUserMd,
  FaCheck,
  FaTimes,
  FaTrash,
  FaCopy,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaBriefcase,
  FaRupeeSign,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdLocalHospital } from "react-icons/md";

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected"];

const statusConfig = {
  pending: {
    label: "Pending",
    classes: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: FaClock,
  },
  approved: {
    label: "Approved",
    classes: "bg-green-100 text-green-700 border-green-200",
    icon: FaCheckCircle,
  },
  rejected: {
    label: "Rejected",
    classes: "bg-red-100 text-red-700 border-red-200",
    icon: FaTimesCircle,
  },
};

// ── Temp Password Modal ──────────────────────────────────────────────────────
function ApprovalSuccessModal({ doctorName, doctorEmail, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <FaCheckCircle className="text-green-500 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Application Approved!
        </h3>
        <p className="text-gray-500 text-sm mb-5">
          <span className="font-semibold text-gray-700">{doctorName}</span> has
          been granted Doctor access. They can now log in with their existing
          Prescripto account to access the Doctor Dashboard.
        </p>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-6 text-left">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
            What happens next
          </p>
          <ul className="space-y-1.5 text-sm text-emerald-800">
            <li className="flex items-start gap-2">
              <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
              Doctor record created from application data
            </li>
            <li className="flex items-start gap-2">
              <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
              Account role elevated to <strong>Doctor</strong>
            </li>
            <li className="flex items-start gap-2">
              <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
              Login with <strong>{doctorEmail}</strong> redirects to Doctor
              Dashboard automatically
            </li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#5f6FFF] hover:bg-[#4a5be8] text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ── Reject Reason Modal ──────────────────────────────────────────────────────
function RejectModal({ doctorName, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <FaTimesCircle className="text-red-500 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
          Reject Application
        </h3>
        <p className="text-gray-500 text-sm mb-5 text-center">
          Provide a reason for rejecting{" "}
          <span className="font-semibold text-gray-700">{doctorName}</span>
          &apos;s application.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="e.g. Incomplete credentials, unverified degree..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 placeholder-gray-400 resize-none mb-5 transition"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaTimes />
            )}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
function DeleteModal({ doctorName, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <FaTrash className="text-red-500 text-2xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Delete Application
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Are you sure you want to permanently delete the application from{" "}
          <span className="font-semibold text-gray-700">{doctorName}</span>?
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaTrash />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Application Card ──────────────────────────────────────────────────────────
function ApplicationCard({ app, onApprove, onReject, onDelete }) {
  const config = statusConfig[app.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const submittedDate = app.createdAt
    ? new Date(app.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Card header */}
      <div className="p-5 pb-0 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
            <Image
              src={app.image || assets.profile_pic}
              alt={app.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base leading-tight">
              {app.name}
            </h3>
            <p className="text-[#5f6FFF] text-sm font-medium">
              {app.speciality}
            </p>
          </div>
        </div>
        <span
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.classes} shrink-0`}
        >
          <StatusIcon className="text-xs" />
          {config.label}
        </span>
      </div>

      {/* Card body */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaEnvelope className="text-gray-400 shrink-0" />
            <span className="truncate">{app.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaPhone className="text-gray-400 shrink-0" />
            <span>{app.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaGraduationCap className="text-gray-400 shrink-0" />
            <span>{app.degree}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaBriefcase className="text-gray-400 shrink-0" />
            <span>{app.experience}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaRupeeSign className="text-gray-400 shrink-0" />
            <span>₹{app.fees} consultation</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaCalendarAlt className="text-gray-400 shrink-0" />
            <span>{submittedDate}</span>
          </div>
        </div>

        {app.about && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-4 border-t border-gray-50 pt-3">
            {app.about}
          </p>
        )}

        {app.status === "rejected" && app.rejectionReason && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs text-red-500 font-medium mb-0.5">
              Rejection Reason
            </p>
            <p className="text-xs text-red-700">{app.rejectionReason}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
          {app.status === "pending" && (
            <>
              <button
                onClick={() => onApprove(app)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm py-2.5 rounded-xl transition-colors"
              >
                <FaCheck className="text-xs" />
                Approve
              </button>
              <button
                onClick={() => onReject(app)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm py-2.5 rounded-xl transition-colors"
              >
                <FaTimes className="text-xs" />
                Reject
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(app)}
            className={`flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 hover:bg-red-50 text-sm py-2.5 px-4 rounded-xl transition-colors ${
              app.status === "pending" ? "" : "flex-1"
            }`}
            title="Delete application"
          >
            <FaTrash className="text-xs" />
            {app.status !== "pending" && "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminApplicationsPage() {
  const { aToken, backendUrl } = useAppContext();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  // Modals
  const [approvalModal, setApprovalModal] = useState(null); // { name, email }
  const [rejectModal, setRejectModal] = useState(null); // app object
  const [deleteModal, setDeleteModal] = useState(null); // app object

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/applications`, {
        headers: { atoken: aToken },
      });
      if (data.success) {
        setApplications(data.applications);
      } else {
        toast.error(data.message || "Failed to load applications");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Could not connect to server",
      );
    } finally {
      setLoading(false);
    }
  }, [aToken, backendUrl]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (app) => {
    setActionLoading(true);
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/applications/${app._id}/approve`,
        {},
        { headers: { atoken: aToken } },
      );
      if (data.success) {
        setApprovalModal({ name: app.name, email: app.email });
        fetchApplications();
      } else {
        toast.error(data.message || "Approval failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────────
  const handleRejectConfirm = async (reason) => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/applications/${rejectModal._id}/reject`,
        { reason },
        { headers: { atoken: aToken } },
      );
      if (data.success) {
        toast.success("Application rejected");
        setRejectModal(null);
        fetchApplications();
      } else {
        toast.error(data.message || "Rejection failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Rejection failed");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/applications/${deleteModal._id}`,
        { headers: { atoken: aToken } },
      );
      if (data.success) {
        toast.success("Application deleted");
        setDeleteModal(null);
        fetchApplications();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Derived counts & filtering ─────────────────────────────────────────────
  const counts = {
    All: applications.length,
    Pending: applications.filter((a) => a.status === "pending").length,
    Approved: applications.filter((a) => a.status === "approved").length,
    Rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const filtered = applications.filter((app) => {
    const matchesTab =
      activeTab === "All" || app.status === activeTab.toLowerCase();
    const matchesSearch =
      !search ||
      app.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.email?.toLowerCase().includes(search.toLowerCase()) ||
      app.speciality?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div>
      {/* Modals */}
      {approvalModal && (
        <ApprovalSuccessModal
          doctorName={approvalModal.name}
          doctorEmail={approvalModal.email}
          onClose={() => setApprovalModal(null)}
        />
      )}
      {rejectModal && (
        <RejectModal
          doctorName={rejectModal.name}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectModal(null)}
          loading={actionLoading}
        />
      )}
      {deleteModal && (
        <DeleteModal
          doctorName={deleteModal.name}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteModal(null)}
          loading={actionLoading}
        />
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Doctor Applications
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Review and manage incoming doctor registration requests
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="flex items-center gap-2 text-sm text-[#5f6FFF] border border-[#5f6FFF]/30 bg-[#5f6FFF]/5 hover:bg-[#5f6FFF]/10 px-4 py-2.5 rounded-xl font-medium transition-colors self-start sm:self-auto"
        >
          <MdLocalHospital />
          Refresh
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or speciality..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5f6FFF] focus:ring-2 focus:ring-[#5f6FFF]/10 text-gray-700 placeholder-gray-400 transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {counts[tab] > 0 && (
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab
                        ? tab === "Pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : tab === "Approved"
                            ? "bg-green-100 text-green-600"
                            : tab === "Rejected"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-500"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {counts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading applications...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaUserMd className="text-gray-300 text-3xl" />
          </div>
          <h3 className="text-gray-700 font-semibold mb-1">
            No applications found
          </h3>
          <p className="text-gray-400 text-sm max-w-xs">
            {search
              ? "Try adjusting your search or filter."
              : activeTab === "All"
                ? "No doctor applications have been submitted yet."
                : `There are no ${activeTab.toLowerCase()} applications.`}
          </p>
        </div>
      ) : (
        /* Application Cards Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((app) => (
            <ApplicationCard
              key={app._id}
              app={app}
              onApprove={handleApprove}
              onReject={(a) => setRejectModal(a)}
              onDelete={(a) => setDeleteModal(a)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
