'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { assets } from '@/lib/data';
import { FaRupeeSign, FaFileInvoiceDollar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function DoctorTransactions() {
  const { dToken, backendUrl } = useAppContext();
  const [transactions, setTransactions] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/transactions`, {
        headers: { dtoken: dToken },
      });
      if (data.success) {
        setTransactions(data.transactions);
        setTotalEarnings(data.totalEarnings);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [dToken, backendUrl]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8 flex items-center gap-5 max-w-sm">
        <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center">
          <FaRupeeSign className="text-emerald-600 text-3xl" />
        </div>
        <div>
          <div className="text-sm text-gray-500 font-medium mb-1">Total Lifetime Earnings</div>
          <div className="text-3xl font-bold text-gray-800">₹{totalEarnings}</div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FaFileInvoiceDollar className="text-gray-400" /> Payment History
          </h3>
          <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
            {transactions.length} Transactions
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['#', 'Patient', 'Amount', 'Date & Time', 'Payment Status', 'Visit Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx, i) => (
                <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-500 font-medium">{i + 1}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        <Image 
                          src={tx.userData?.image || assets.profile_pic} 
                          alt="" 
                          width={36} 
                          height={36} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{tx.userData?.name || 'Unknown Patient'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold text-emerald-600">₹{tx.amount}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap font-medium">
                    {tx.slotDate?.replace(/_/g, '/')} <span className="text-gray-400 mx-1">•</span> {tx.slotTime}
                  </td>
                  <td className="px-5 py-4">
                    {tx.payment ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-600 font-medium border border-emerald-100">
                        <FaCheckCircle className="text-[10px]" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-50 text-amber-600 font-medium border border-amber-100">
                        <FaTimesCircle className="text-[10px]" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {tx.cancelled ? (
                      <span className="px-2.5 py-1 rounded-full text-xs bg-red-50 text-red-600 font-medium border border-red-100">Cancelled</span>
                    ) : tx.isCompleted ? (
                      <span className="px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-600 font-medium border border-blue-100">Completed</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600 font-medium border border-gray-200">Upcoming</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {transactions.length === 0 && (
            <div className="text-center py-16 flex flex-col items-center justify-center bg-gray-50/30">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <FaFileInvoiceDollar className="text-gray-300 text-2xl" />
              </div>
              <h4 className="text-gray-800 font-medium mb-1">No transactions found</h4>
              <p className="text-sm text-gray-500 max-w-sm">
                When patients complete their appointments and payments, the transactions will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
