import { useEffect, useState } from 'react';
import { listTripFares, deleteTripFare } from '../../utils/adminApi';

export default function PricingTable({ refreshKey }: { refreshKey: number }) {
  const [page, setPage] = useState<any>();

  useEffect(() => {
    listTripFares(0, 20).then(setPage).catch(console.error);
  }, [refreshKey]);

  if (!page) return null;
  const rows = page.content || [];

  return (
    <div className="bg-white p-4 shadow rounded">
      <div className="font-semibold mb-2">Trip Fare Overrides</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Zone</th>
              <th className="p-2">Category</th>
              <th className="p-2">Base</th>
              <th className="p-2">PerKm</th>
              <th className="p-2">TimeRate</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t: any) => (
              <tr key={t.id} className="border-b">
                <td className="p-2">{t.zone?.name || t.zone?.id}</td>
                <td className="p-2">{t.vehicleCategory?.name || t.vehicleCategory?.type}</td>
                <td className="p-2">{t.baseFare}</td>
                <td className="p-2">{t.baseFarePerKm}</td>
                <td className="p-2">{t.timeRatePerMinOverride ?? '-'}</td>
                <td className="p-2">
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={async () => {
                      if (!window.confirm('Delete this override?')) return;
                      await deleteTripFare(t.id);
                      const refreshed = await listTripFares(0, 20);
                      setPage(refreshed);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}