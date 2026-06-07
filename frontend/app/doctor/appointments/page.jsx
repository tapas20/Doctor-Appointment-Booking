'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { assets } from '@/lib/data';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

const filters = ['All', 'Pending', 'Completed', 'Cancelled'];

export default function DoctorAppointmentsPage() {
  const { dToken, backendUrl } = useAppContext();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchAppointments = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, {
        headers: { dtoken: dToken },
      });
      if (data.success) setAppointments(data.appointments.reverse());
      else toast.error(data.message);
    } catch { toast.error('Failed to fetch appointments'); }
    finally { setLoading(false); }
  }, [dToken, backendUrl]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleComplete = async (id) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/doctor/appointments/${id}/complete`,
        {},
        { headers: { dtoken: dToken } }
      );
      if (data.success) { toast.success('Marked as completed'); fetchAppointments(); }
      else toast.error(data.message);
    } catch { toast.error('Failed to update'); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/doctor/appointments/${id}/cancel`,
        {},
        { headers: { dtoken: dToken } }
      );
      if (data.success) { toast.success('Appointment cancelled'); fetchAppointments(); }
      else toast.error(data.message);
    } catch { toast.error('Failed to cancel'); }
  };

  const filtered = appointments.filter((a) => {
    if (filter === 'Cancelled') return a.cancelled;
    if (filter === 'Completed') return a.isCompleted && !a.cancelled;
    if (filter === 'Pending') return !a.isCompleted && !a.cancelled;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
          <p className="text-gray-500 text-sm">{appointments.length} total appointments</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['#', 'Patient', 'Payment', 'Age', 'Date & Time', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((appt, i) => {
                const dob = appt.userData?.dob;
                const age = dob ? Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000)) : '—';
                return (
                  <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={appt.userData?.image || assets.profile_pic} alt="" width={32} height={32} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{appt.userData?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${appt.payment ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {appt.payment ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{age}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {appt.slotDate?.replace(/_/g, '/')} {appt.slotTime}
                    </td>
                    <td className="px-4 py-3">
                      {appt.cancelled ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-600 font-medium">Cancelled</span>
                      ) : appt.isCompleted ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-600 font-medium">Completed</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-600 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!appt.cancelled && !appt.isCompleted && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleComplete(appt._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                          >
                            <FaCheckCircle /> Complete
                          </button>
                          <button
                            onClick={() => handleCancel(appt._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                          >
                            <FaTimes /> Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">No appointments found</div>
          )}
        </div>
      </div>
    </div>
  );
}
