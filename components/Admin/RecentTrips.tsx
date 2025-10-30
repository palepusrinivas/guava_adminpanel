import { useEffect, useState } from 'react';
import { fetchRecentTrips } from '../../utils/adminApi';

export default function RecentTrips() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetchRecentTrips(20).then(setRows).catch(console.error); }, []);
  return (
    <div className="bg-white p-4 shadow rounded">
      <div className="font-semibold mb-2">Recent Trips</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">ID</th>
              <th className="p-2">User</th>
              <th className="p-2">Driver</th>
              <th className="p-2">From</th>
              <th className="p-2">To</th>
              <th className="p-2">Fare</th>
              <th className="p-2">Status</th>
              <th className="p-2">Start</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rideId} className="border-b">
                <td className="p-2">{r.rideId}</td>
                <td className="p-2">{r.userId || '-'}</td>
                <td className="p-2">{r.driverId || '-'}</td>
                <td className="p-2">{r.pickupArea || '-'}</td>
                <td className="p-2">{r.destinationArea || '-'}</td>
                <td className="p-2">{r.fare ?? '-'}</td>
                <td className="p-2">{r.status || '-'}</td>
                <td className="p-2">{r.startTime?.replace('T', ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}