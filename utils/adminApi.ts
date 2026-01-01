import { config } from './config';
import adminAxios from './axiosConfig';

const base = config.API_BASE_URL;

// Analytics API
export async function fetchKpis(windowDays = 30) {
  const r = await fetch(`${base}/api/admin/analytics/kpis?windowDays=${windowDays}`);
  if (!r.ok) throw new Error('Failed to load KPIs');
  return r.json();
}

export async function fetchZoneStats(windowDays = 7) {
  const r = await fetch(`${base}/api/admin/analytics/zones?windowDays=${windowDays}`);
  if (!r.ok) throw new Error('Failed to load zones');
  return r.json();
}

export async function fetchRecentTrips(limit = 20) {
  const r = await fetch(`${base}/api/admin/analytics/recent-trips?limit=${limit}`);
  if (!r.ok) throw new Error('Failed to load trips');
  return r.json();
}

export async function fetchRecentTransactions(limit = 20) {
  const r = await fetch(`${base}/api/admin/analytics/recent-transactions?limit=${limit}`);
  if (!r.ok) throw new Error('Failed to load transactions');
  return r.json();
}

// Pricing API
export async function listTripFares(page = 0, size = 20) {
  const response = await adminAxios.get('/api/admin/pricing/trip-fares', {
    params: { page, size }
  });
  return response.data;
}

export async function upsertTripFare(payload: any) {
  const response = await adminAxios.post('/api/admin/pricing/trip-fares', payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

export async function deleteTripFare(id: string) {
  await adminAxios.delete('/api/admin/pricing/trip-fares', {
    params: { id }
  });
}