'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { assets } from '@/lib/data';
import { FaStar, FaTrash, FaUserMd } from 'react-icons/fa';

export default function AdminReviews() {
  const { aToken, backendUrl } = useAppContext();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/reviews`, {
        headers: { atoken: aToken },
      });
      if (data.success) {
        setReviews(data.reviews);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [aToken, backendUrl]);

  useEffect(() => {
    if (aToken) {
      fetchReviews();
    }
  }, [aToken, fetchReviews]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/reviews/${id}`, {
        headers: { atoken: aToken }
      });
      if (data.success) {
        toast.success(data.message);
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#5f6FFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Review Management</h2>
          <p className="text-gray-500 text-sm mt-1">Monitor and manage patient reviews across the platform.</p>
        </div>
        <div className="bg-[#5f6FFF]/10 text-[#5f6FFF] px-4 py-2 rounded-full font-semibold">
          {reviews.length} Total Reviews
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={review.userData?.image || assets.profile_pic} alt="" width={32} height={32} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium text-gray-800 text-sm whitespace-nowrap">{review.userData?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
                      <FaUserMd className="text-[#5f6FFF]" />
                      {review.doctorData?.name || 'Unknown Doctor'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span className="font-bold text-gray-800">{review.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-xs truncate" title={review.comment}>
                      {review.comment}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                      title="Delete Review"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No reviews found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
