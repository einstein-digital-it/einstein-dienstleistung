const API_BASE_URL = import.meta.env?.VITE_BACKEND_API_URL || "http://127.0.0.1:8000/api";

function getAuthToken() {
  try {
    return localStorage.getItem("einstein_auth_token") || "";
  } catch {
    return "";
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.message || `Backend request failed (${response.status})`);
    // Lets pages react to a specific case, e.g. "email_not_verified"
    error.status = response.status;
    error.code = payload?.code;
    error.data = payload?.data;
    throw error;
  }

  return payload?.data ?? payload;
}

async function uploadRequest(path, formData) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || `Backend request failed (${response.status})`);
  }

  return payload?.data ?? payload;
}

function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

export const bookingsApi = {
  listBookings: (filters = {}) => request(`/bookings${toQuery({ limit: 200, ...filters })}`),
  getBooking: (id) => request(`/bookings/${id}`),
  createBooking: (data) => request("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  updateBooking: (id, data) => request(`/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  deleteBooking: (id) => request(`/bookings/${id}`, {
    method: "DELETE",
  }),
  listServiceExtensions: (filters = {}) => request(`/service-extensions${toQuery({ limit: 200, ...filters })}`),
  createServiceExtension: (data) => request("/service-extensions", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  updateServiceExtension: (id, data) => request(`/service-extensions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  authorizeServiceExtensionPayment: (id) => request(`/service-extensions/${id}/authorize-payment`, {
    method: "POST",
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
  listServices: (filters = {}) => request(`/admin/services${toQuery(filters)}`),
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

export const uploadApi = {
  uploadFiles: (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files[]", file));
    return uploadRequest("/uploads", formData);
  },
};

export const authApi = {
  login: (data) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  register: (data) => request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  verifyEmail: (data) => request("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  resendVerification: (email) => request("/auth/verify-email/resend", {
    method: "POST",
    body: JSON.stringify({ email }),
  }),
  // Uses the stored login token; the server never looks a user up by email
  getCurrentUser: () => request("/auth/me"),
  logout: () => request("/auth/logout", {
    method: "POST",
  }),
};

export const profileApi = {
  getProfile: (email) => request(`/profile${toQuery({ email })}`),
  updateProfile: (data) => request("/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
};

export const customerApi = {
  getDashboard: (email) => request(`/customer/dashboard${toQuery({ email })}`),
  listBookings: (email, filters = {}) => request(`/customer/bookings${toQuery({ email, ...filters })}`),
  listNotifications: (email) => request(`/customer/notifications${toQuery({ email })}`),
  createNotification: (data) => request("/customer/notifications", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  markNotificationRead: (id) => request(`/customer/notifications/${id}/read`, {
    method: "PATCH",
  }),
  markAllNotificationsRead: (email) => request("/customer/notifications/mark-all-read", {
    method: "PATCH",
    body: JSON.stringify({ email }),
  }),
  deleteReadNotifications: (email) => request(`/customer/notifications/read${toQuery({ email })}`, {
    method: "DELETE",
  }),
  getNotificationPreferences: (email) => request(`/customer/notification-preferences${toQuery({ email })}`),
  updateNotificationPreferences: (data) => request("/customer/notification-preferences", {
    method: "PUT",
    body: JSON.stringify(data),
  }),
};

export const paymentApi = {
  getBooking: (id) => request(`/payments/bookings/${id}`),
  // Stripe Checkout: returns { url } of the hosted payment page
  startCheckout: (id, lang = "de") => request(`/payments/bookings/${id}/checkout`, {
    method: "POST",
    body: JSON.stringify({ lang }),
  }),
  updatePaymentStatus: (id, paymentStatus) => request(`/payments/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ payment_status: paymentStatus }),
  }),
};

export const publicApi = {
  listServices: () => request("/public/services"),
  listPricing: () => request("/public/pricing"),
  getHome: () => request("/public/home"),
  getOffers: () => request("/public/offers"),
  getRatings: () => request("/public/ratings"),
  listReviews: (filters = {}) => request(`/public/reviews${toQuery(filters)}`),
  createReview: (data) => request("/public/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  // § 312k BGB cancellation ("Verträge hier kündigen") — no login required
  submitCancellation: (data) => request("/public/cancellations", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

export const customerSupportApi = {
  getSupportContent: () => request("/customer-support"),
  createRequest: (data) => request("/customer-support/requests", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

export const chatApi = {
  respond: (data) => request("/chat/respond", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

export const adminDashboardApi = {
  getDashboard: () => request("/admin/dashboard"),
};

export const clientWorkspaceAdminApi = {
  list: (filters = {}) => request(`/admin/client-workspaces${toQuery(filters)}`),
  get: (id) => request(`/admin/client-workspaces/${id}`),
  updateRequest: (clientId, requestId, data) => request(
    `/admin/client-workspaces/${clientId}/requests/${requestId}`,
    { method: "PATCH", body: JSON.stringify(data) },
  ),
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

// "Meine Unterlagen": a customer's documents sorted into folders (private files)
async function fetchBlob(path) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(`Download failed (${response.status})`);
  return response.blob();
}

async function downloadFile(path, fileName) {
  const blob = await fetchBlob(path);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "document";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export const customerDocumentsApi = {
  list: () => request("/customer/documents"),
  translate: (id, lang) => request(`/customer/documents/${id}/translate`, { method: "POST", body: JSON.stringify({ lang }) }),
  // Unterlagen-Abo: automatic sorting + translation (monthly, VAT included)
  subscription: () => request("/customer/subscription"),
  subscribe: (lang) => request("/customer/subscription/checkout", { method: "POST", body: JSON.stringify({ lang }) }),
  cancelSubscription: () => request("/customer/subscription/cancel", { method: "POST", body: "{}" }),
  reminders: (email) => request(`/customer/reminders${toQuery({ email })}`),
  updateReminder: (id, payload) => request(`/customer/reminders/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  upload: ({ file, folder, title, note, lang }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    if (lang) formData.append("lang", lang);
    if (title) formData.append("title", title);
    if (note) formData.append("note", note);
    return uploadRequest("/customer/documents", formData);
  },
  download: (doc) => downloadFile(`/customer/documents/${doc.id}/download`, doc.original_name),
  blob: (doc) => fetchBlob(`/customer/documents/${doc.id}/download`),
  // Files the customer creates; the AI sorts their papers into numbered folders
  cases: () => request("/customer/files"),
  createCase: (name) => request("/customer/files", { method: "POST", body: JSON.stringify({ name }) }),
  caseDetail: (id) => request(`/customer/files/${id}`),
  deleteCase: (id) => request(`/customer/files/${id}`, { method: "DELETE" }),
  uploadToCase: (id, { file, lang }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "auto");
    if (lang) formData.append("lang", lang);
    return uploadRequest(`/customer/files/${id}/documents`, formData);
  },
  remove: (id) => request(`/customer/documents/${id}`, { method: "DELETE" }),
  // admin
  adminCustomers: () => request("/admin/customer-documents"),
  adminList: (email) => request(`/admin/customer-documents${toQuery({ email })}`),
  adminUpload: ({ email, file, folder, title, note }) => {
    const formData = new FormData();
    formData.append("user_email", email);
    formData.append("file", file);
    formData.append("folder", folder);
    if (title) formData.append("title", title);
    if (note) formData.append("note", note);
    return uploadRequest("/admin/customer-documents", formData);
  },
};
