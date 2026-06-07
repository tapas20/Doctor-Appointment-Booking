'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { assets } from '@/lib/data';
import Link from 'next/link';
import { FaRupeeSign, FaCalendarAlt, FaUsers, FaCheckCircle, FaTimes, FaUserCircle } from 'react-icons/fa';

export default function DoctorDashboard() {
  const { dToken, backendUrl } = useAppContext();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDash = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
        headers: { dtoken: dToken },
      });
      if (data.success) setDashData(data.dashData);
      else toast.error(data.message);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  }, [dToken, backendUrl]);

  useEffect(() => { fetchDash(); }, [fetchDash]);

  const handleComplete = async (id) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/doctor/appointments/${id}/complete`,
        {},
        { headers: { dtoken: dToken } }
      );
      if (data.success) { toast.success('Marked as completed'); fetchDash(); }
      else toast.error(data.message);
    } catch { toast.error('Failed to update'); }
  };

  const handleCancel = async (id) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/doctor/appointments/${id}/cancel`,
        {},
        { headers: { dtoken: dToken } }
      );
      if (data.success) { toast.success('Appointment cancelled'); fetchDash(); }
      else toast.error(data.message);
    } catch { toast.error('Failed to cancel'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Earnings', value: `₹${dashData?.earnings ?? 0}`, icon: FaRupeeSign, light: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Total Appointments', value: dashData?.totalAppointments ?? 0, icon: FaCalendarAlt, light: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Total Patients', value: dashData?.totalPatients ?? 0, icon: FaUsers, light: 'bg-purple-50', text: 'text-purple-600' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h2>
        <Link href="/doctor/profile" className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium shadow-sm">
          <FaUserCircle /> Edit Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className={`${stat.light} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`${stat.text} text-xl`} />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Latest Appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Latest Appointments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['#', 'Patient', 'Age', 'Date & Time', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dashData?.latestAppointments?.map((appt, i) => {
                const dob = appt.userData?.dob;
                const age = dob ? Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000)) : '—';
                return (
                  <tr key={appt._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                          <Image src={appt.userData?.image || assets.profile_pic} alt="" width={32} height={32} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{appt.userData?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{age}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {appt.slotDate?.replace(/_/g, '/')} {appt.slotTime}
                    </td>
                    <td className="px-5 py-4">
                      {appt.cancelled ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-600 font-medium">Cancelled</span>
                      ) : appt.isCompleted ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-600 font-medium">Completed</span>
                      ) : appt.payment ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600 font-medium">Paid</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-600 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {!appt.cancelled && !appt.isCompleted && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleComplete(appt._id)}
                            className="text-emerald-500 hover:text-emerald-700 transition-colors"
                            title="Complete"
                          >
                            <FaCheckCircle />
                          </button>
                          <button
                            onClick={() => handleCancel(appt._id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Cancel"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!dashData?.latestAppointments?.length && (
            <div className="text-center py-10 text-gray-400">No appointments yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
