const API_BASE_URL = import.meta.env?.VITE_BACKEND_API_URL || "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || `Backend request failed (${response.status})`);
  }

  return payload?.data ?? payload;
}

export const bookingsApi = {
  listBookings: () => request("/bookings?limit=200"),
  updateBooking: (id, data) => request(`/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  deleteBooking: (id) => request(`/bookings/${id}`, {
    method: "DELETE",
  }),
  listServiceExtensions: () => request("/service-extensions?limit=200"),
  updateServiceExtension: (id, data) => request(`/service-extensions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
};

export const reportsApi = {
  listBookingReports: () => request("/reports/bookings?limit=200"),
  confirmBooking: (id, data) => request(`/reports/bookings/${id}/confirm`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
};

export const usersApi = {
  listUsers: (filters = {}) => {
    const params = new URLSearchParams({ limit: "500" });
    if (filters.search) params.set("search", filters.search);
    if (filters.role) params.set("role", filters.role);
    return request(`/admin/users?${params.toString()}`);
  },
  updateUser: (id, data) => request(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  deleteUser: (id) => request(`/admin/users/${id}`, {
    method: "DELETE",
  }),
  listUserNotifications: () => request("/admin/user-notifications"),
  markAllSeen: (emails) => request("/admin/user-notifications/mark-all-seen", {
    method: "POST",
    body: JSON.stringify({ emails }),
  }),
};

export const adminServicesApi = {
  listServices: () => request("/admin/services"),
  createService: (data) => request("/admin/services", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  updateService: (id, data) => request(`/admin/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  deleteService: (id) => request(`/admin/services/${id}`, {
    method: "DELETE",
  }),
};

export const priceAdminApi = {
  listPriceGroups: () => request("/admin/price-groups"),
  createPriceGroup: (data) => request("/admin/price-groups", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  updatePriceGroup: (id, data) => request(`/admin/price-groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  deletePriceGroup: (id) => request(`/admin/price-groups/${id}`, {
    method: "DELETE",
  }),
};

export const paymentsApi = {
  listPayments: () => request("/admin/payments?limit=500"),
  updatePaymentStatus: (id, paymentStatus) => request(`/admin/payments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ payment_status: paymentStatus }),
  }),
  refundPayment: (id, refundReason) => request(`/admin/payments/${id}/refund`, {
    method: "PATCH",
    body: JSON.stringify({ refund_reason: refundReason }),
  }),
  deleteUnpaidBooking: (id) => request(`/admin/payments/${id}/delete-unpaid`, {
    method: "DELETE",
  }),
};

export const revenueReportsApi = {
  getRevenueReport: (year) => request(`/admin/revenue-reports?year=${encodeURIComponent(year)}`),
};

export const providerApprovalsApi = {
  listApplications: (status = "pending") => request(`/admin/provider-applications?status=${encodeURIComponent(status)}`),
  approveProvider: (id) => request(`/admin/provider-applications/${id}/approve`, {
    method: "PATCH",
  }),
  rejectProvider: (id) => request(`/admin/provider-applications/${id}/reject`, {
    method: "PATCH",
  }),
  requestWelcomeEmail: (id) => request(`/admin/provider-applications/${id}/welcome-email-request`, {
    method: "POST",
  }),
};

export const providersApi = {
  listProviders: (status = "all") => request(`/admin/providers?status=${encodeURIComponent(status)}`),
  getProvider: (id) => request(`/admin/providers/${id}`),
  createProvider: (data) => request("/admin/providers", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  updateProvider: (id, data) => request(`/admin/providers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  deleteProvider: (id) => request(`/admin/providers/${id}`, {
    method: "DELETE",
  }),
};

export const customerRequestsApi = {
  listRequests: (status = "all") => request(`/customer-requests?status=${encodeURIComponent(status)}`),
  createRequest: (data) => request("/customer-requests", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  updateRequest: (id, data) => request(`/customer-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  acceptRequest: (id) => request(`/customer-requests/${id}/accept`, {
    method: "PATCH",
  }),
  rejectRequest: (id) => request(`/customer-requests/${id}/reject`, {
    method: "PATCH",
  }),
  deleteRequest: (id) => request(`/customer-requests/${id}`, {
    method: "DELETE",
  }),
};

export const seoSettingsApi = {
  listSettings: () => request("/admin/seo-settings"),
  getSettingByPage: (pageName) => request(`/seo-settings/page/${encodeURIComponent(pageName)}`),
  createSetting: (data) => request("/admin/seo-settings", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  updateSetting: (id, data) => request(`/admin/seo-settings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  deleteSetting: (id) => request(`/admin/seo-settings/${id}`, {
    method: "DELETE",
  }),
};
