import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/utils/store/store';
import { getAnalyticsStats } from '@/utils/reducers/adminReducers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ZoneChart() {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get stats for last 7 days
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 7);
        
        const response = await dispatch(getAnalyticsStats({ 
          from: from.toISOString().split('T')[0],
          to: to.toISOString().split('T')[0]
        }));
        
        if (getAnalyticsStats.fulfilled.match(response)) {
          // Format data for chart, assuming response has zone-wise data
          const chartData = response.payload.zones?.map((zone: any) => ({
            zone: zone.name || zone.id,
            trips: zone.totalTrips,
            revenue: zone.totalRevenue
          })) || [];
          setData(chartData);
        } else {
          setError('Failed to load zone stats');
        }
      } catch (error) {
        console.error('Error loading zone stats:', error);
        setError('Error loading zone stats');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="bg-white p-4 shadow rounded">
        <div className="font-semibold mb-2">Zone-wise Trips (7d)</div>
        <div className="h-[300px] w-full flex items-center justify-center">
          <div className="text-gray-500">Loading zone data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 shadow rounded">
        <div className="font-semibold mb-2">Zone-wise Trips (7d)</div>
        <div className="h-[300px] w-full flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 shadow rounded">
      <div className="font-semibold mb-2">Zone-wise Trips (7d)</div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="zone" />
          <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
          <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
          <Tooltip />
          <Bar yAxisId="left" dataKey="trips" fill="#2563eb" name="Trips" />
          <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}