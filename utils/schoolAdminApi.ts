import adminAxios from "./axiosConfig";

const BASE_URL = "/api/admin/school";

// ========== STATISTICS ==========
export async function getSchoolStatistics() {
  const response = await adminAxios.get(`${BASE_URL}/stats`);
  return response.data;
}

// ========== INSTITUTIONS ==========
export async function getAllInstitutions() {
  const response = await adminAxios.get(`${BASE_URL}/institutions`);
  return response.data;
}

export async function getInstitution(id: number) {
  const response = await adminAxios.get(`${BASE_URL}/institutions/${id}`);
  return response.data;
}

// ========== BRANCHES ==========
export async function getAllBranches(institutionId?: number) {
  const url = institutionId 
    ? `${BASE_URL}/branches?institutionId=${institutionId}`
    : `${BASE_URL}/branches`;
  const response = await adminAxios.get(url);
  return response.data;
}

export async function getBranch(id: number) {
  const response = await adminAxios.get(`${BASE_URL}/branches/${id}`);
  return response.data;
}

// ========== BUSES ==========
export async function getAllBuses(branchId?: number) {
  const url = branchId 
    ? `${BASE_URL}/buses?branchId=${branchId}`
    : `${BASE_URL}/buses`;
  const response = await adminAxios.get(url);
  return response.data;
}

export async function getBus(id: number) {
  const response = await adminAxios.get(`${BASE_URL}/buses/${id}`);
  return response.data;
}

export async function getBusActivation(busId: number) {
  const response = await adminAxios.get(`${BASE_URL}/buses/${busId}/activation`);
  return response.data;
}

export async function activateBus(busId: number) {
  const response = await adminAxios.post(`${BASE_URL}/buses/${busId}/activate`);
  return response.data;
}

// ========== PARENT REQUESTS ==========
export async function getAllParentRequests(status?: string, branchId?: number) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (branchId) params.append("branchId", branchId.toString());
  const url = params.toString() 
    ? `${BASE_URL}/parent-requests?${params.toString()}`
    : `${BASE_URL}/parent-requests`;
  const response = await adminAxios.get(url);
  return response.data;
}

export async function getParentRequest(id: number) {
  const response = await adminAxios.get(`${BASE_URL}/parent-requests/${id}`);
  return response.data;
}

export async function acceptParentRequest(id: number, busId?: number, stopId?: number) {
  const response = await adminAxios.put(
    `${BASE_URL}/parent-requests/${id}/accept`,
    { busId, stopId }
  );
  return response.data;
}

export async function rejectParentRequest(id: number) {
  const response = await adminAxios.put(`${BASE_URL}/parent-requests/${id}/reject`);
  return response.data;
}

// ========== STUDENTS ==========
export async function getAllStudents(branchId?: number, busId?: number) {
  const params = new URLSearchParams();
  if (branchId) params.append("branchId", branchId.toString());
  if (busId) params.append("busId", busId.toString());
  const url = params.toString() 
    ? `${BASE_URL}/students?${params.toString()}`
    : `${BASE_URL}/students`;
  const response = await adminAxios.get(url);
  return response.data;
}

export async function getStudent(id: number) {
  const response = await adminAxios.get(`${BASE_URL}/students/${id}`);
  return response.data;
}

// ========== TRACKING ==========
export async function getBusTracking(busId: number, limit: number = 10) {
  const response = await adminAxios.get(`${BASE_URL}/tracking/bus/${busId}?limit=${limit}`);
  return response.data;
}

export async function getActiveTracking() {
  const response = await adminAxios.get(`${BASE_URL}/tracking/active`);
  return response.data;
}

// ========== ALERTS ==========
export async function getAllAlerts(page: number = 0, size: number = 20) {
  const response = await adminAxios.get(`${BASE_URL}/alerts?page=${page}&size=${size}`);
  return response.data;
}

export async function getRecentAlerts(hours: number = 24) {
  const response = await adminAxios.get(`${BASE_URL}/alerts/recent?hours=${hours}`);
  return response.data;
}

// ========== DRIVERS ==========
export async function getAllDrivers() {
  const response = await adminAxios.get(`${BASE_URL}/drivers`);
  return response.data;
}

export async function getDriver(id: number) {
  const response = await adminAxios.get(`${BASE_URL}/drivers/${id}`);
  return response.data;
}

