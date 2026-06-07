'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppContext } from '@/context/AppContext';
import { FaRupeeSign } from 'react-icons/fa';

export default function AdminTransactionsPage() {
  const { aToken, backendUrl } = useAppContext();
  const [transactions, setTransactions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/transactions`, {
        headers: { atoken: aToken },
      });
      if (data.success) {
        setTransactions(data.transactions || []);
        setTotalRevenue(data.totalRevenue || 0);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [aToken, backendUrl]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Transactions</h2>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-3 rounded-xl">
            <FaRupeeSign className="text-xl" />
          </div>
          <div>
            <p className="text-white/80 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <p className="text-white/70 text-sm mt-2">{transactions.length} transactions processed</p>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['#', 'Patient', 'Doctor', 'Date', 'Amount', 'Payment ID', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((txn, i) => (
                <tr key={txn._id || i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-700">{txn.userData?.name || txn.patientName || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{txn.docData?.name || txn.doctorName || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : txn.date || '—'}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-700">₹{txn.amount || txn.docData?.fees || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 font-mono text-xs">{txn.razorpayPaymentId || '—'}</td>
                  <td className="px-5 py-4">
                    {txn.cancelled ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                        Refunded
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                        Paid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="text-center py-12 text-gray-400">No transactions yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
