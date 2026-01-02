const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3001";

async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });

  const text = await res.text();
  
  if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
    throw { status: res.status, data: { message: "Server returned HTML. Check backend error handling.", preview: text.slice(0, 120) } };
  }

  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw { status: res.status, data };
  }
  return data as T;
}

export const api = {
  createPatient: (body: { firstName: string; lastName: string; mrn: string; dob: string }) =>
    http<{
      id: string;
      warning?: {
        code: string;
        message: string;
        existingPatientId?: string;
        existingMrn?: string;
      };
    }>("/patients", { method: "POST", body: JSON.stringify(body) }),

  createProvider: (body: { name: string; npi: string }) =>
    http<{ id: string }>("/providers", { method: "POST", body: JSON.stringify(body) }),

  createOrder: (body: {
    patientId: string;
    providerId: string;
    medicationName: string;
    primaryDiagnosis: string;
    additionalDiagnoses: string[];
    medicationHistory: string[];
    patientRecordsText: string;
  }) => http<{ id: string }>("/orders", { method: "POST", body: JSON.stringify(body) }),

  generateCarePlan: (orderId: string) =>
    http<{ id: string; orderId: string; generator: string }>(`/orders/${orderId}/care-plan`, {
      method: "POST",
    }),

  downloadCarePlanUrl: (orderId: string) => `${API_BASE}/orders/${orderId}/care-plan/download`,
};
