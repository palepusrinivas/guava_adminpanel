import { useEffect, useState } from 'react';
import { fetchRecentTransactions } from '../../utils/adminApi';

export default function RecentTransactions() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetchRecentTransactions(20).then(setRows).catch(console.error); }, []);
  return (
    <div className="bg-white p-4 shadow rounded">
      <div className="font-semibold mb-2">Recent Transactions</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">ID</th>
              <th className="p-2">Ride</th>
              <th className="p-2">User</th>
              <th className="p-2">Driver</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-2">{t.id}</td>
                <td className="p-2">{t.rideId}</td>
                <td className="p-2">{t.userId}</td>
                <td className="p-2">{t.driverId}</td>
                <td className="p-2">{t.amount} {t.currency}</td>
                <td className="p-2">{t.status}</td>
                <td className="p-2">{t.createdAt?.replace('T', ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}