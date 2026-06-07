'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { assets } from '@/lib/data';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

export default function DoctorReviews() {
  const { dToken, backendUrl } = useAppContext();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/reviews`, {
        headers: { dtoken: dToken },
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
  }, [dToken, backendUrl]);

  useEffect(() => {
    if (dToken) {
      fetchReviews();
    }
  }, [dToken, fetchReviews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const averageRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Patient Reviews</h2>
          <p className="text-gray-500 text-sm mt-1">See what your patients are saying about you.</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Average Rating</div>
            <div className="flex items-center gap-1.5">
              <FaStar className="text-yellow-400 text-xl" />
              <span className="text-xl font-bold text-gray-800">{averageRating}</span>
              <span className="text-sm font-medium text-gray-400">/ 5</span>
            </div>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Reviews</div>
            <div className="text-xl font-bold text-gray-800">{reviews.length}</div>
          </div>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
              <FaQuoteLeft className="absolute top-6 right-6 text-emerald-50 text-4xl transform -rotate-12 group-hover:text-emerald-100 transition-colors" />
              
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={review.userData?.image || assets.profile_pic}
                    alt=""
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{review.userData?.name || 'Unknown Patient'}</h4>
                  <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex gap-1 mb-3 relative z-10">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} size={14} className={star <= review.rating ? "text-yellow-400" : "text-gray-200"} />
                ))}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed relative z-10 italic">
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaStar className="text-emerald-400 text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No Reviews Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            You haven't received any patient reviews yet. Provide great service and they'll start coming in!
          </p>
        </div>
      )}
    </div>
  );
}
