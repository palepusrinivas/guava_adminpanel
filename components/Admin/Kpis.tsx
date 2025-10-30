import { useEffect, useState } from 'react';
import { fetchKpis } from '../../utils/adminApi';

export default function Kpis() {
  const [kpis, setKpis] = useState<any>();
  useEffect(() => { fetchKpis(30).then(setKpis).catch(console.error); }, []);
  if (!kpis) return null;
  return (
    <div className="grid grid-cols-4 gap-4">
      <Kpi title="Active Customers (30d)" value={kpis.activeCustomers} />
      <Kpi title="Active Drivers (30d)" value={kpis.activeDrivers} />
      <Kpi title="Earnings (All-time)" value={`₹ ${Number(kpis.totalEarningsAllTime).toFixed(2)}`} />
      <Kpi title="Earnings (30d)" value={`₹ ${Number(kpis.totalEarnings30d).toFixed(2)}`} />
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: any }) {
  return (
    <div className="p-4 rounded bg-white shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}