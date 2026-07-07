import test from "node:test";
import assert from "node:assert/strict";
import {
  adminServicesApi,
  adminDashboardApi,
  authApi,
  bookingsApi,
  chatApi,
  customerSupportApi,
  customerApi,
  customerRequestsApi,
  paymentsApi,
  paymentApi,
  providerDashboardApi,
  providerDocumentsApi,
  priceAdminApi,
  publicApi,
  profileApi,
  providerApprovalsApi,
  providersApi,
  revenueReportsApi,
  seoSettingsApi,
  uploadApi,
  usersApi,
} from "../src/api/backendClient.js";

test("admin backend client exposes the required page APIs", () => {
  assert.equal(typeof adminServicesApi.listServices, "function");
  assert.equal(typeof authApi.login, "function");
  assert.equal(typeof authApi.register, "function");
  assert.equal(typeof authApi.getCurrentUser, "function");
  assert.equal(typeof authApi.logout, "function");
  assert.equal(typeof adminDashboardApi.getDashboard, "function");
  assert.equal(typeof bookingsApi.listBookings, "function");
  assert.equal(typeof bookingsApi.getBooking, "function");
  assert.equal(typeof bookingsApi.createBooking, "function");
  assert.equal(typeof bookingsApi.createServiceExtension, "function");
  assert.equal(typeof bookingsApi.authorizeServiceExtensionPayment, "function");
  assert.equal(typeof uploadApi.uploadFiles, "function");
  assert.equal(typeof profileApi.getProfile, "function");
  assert.equal(typeof profileApi.updateProfile, "function");
  assert.equal(typeof customerApi.getDashboard, "function");
  assert.equal(typeof customerApi.listBookings, "function");
  assert.equal(typeof customerApi.listNotifications, "function");
  assert.equal(typeof customerApi.markAllNotificationsRead, "function");
  assert.equal(typeof customerApi.getNotificationPreferences, "function");
  assert.equal(typeof customerApi.updateNotificationPreferences, "function");
  assert.equal(typeof customerSupportApi.getSupportContent, "function");
  assert.equal(typeof customerSupportApi.createRequest, "function");
  assert.equal(typeof paymentApi.getBooking, "function");
  assert.equal(typeof paymentApi.updatePaymentStatus, "function");
  assert.equal(typeof providerDashboardApi.getDashboard, "function");
  assert.equal(typeof providerDashboardApi.handleBookingAction, "function");
  assert.equal(typeof providerDashboardApi.updateProfile, "function");
  assert.equal(typeof providerDashboardApi.updateDocuments, "function");
  assert.equal(typeof providerDocumentsApi.listDocuments, "function");
  assert.equal(typeof providerDocumentsApi.createDocument, "function");
  assert.equal(typeof providerDocumentsApi.deleteDocument, "function");
  assert.equal(typeof chatApi.respond, "function");
  assert.equal(typeof publicApi.listServices, "function");
  assert.equal(typeof publicApi.listPricing, "function");
  assert.equal(typeof publicApi.getHome, "function");
  assert.equal(typeof publicApi.getOffers, "function");
  assert.equal(typeof publicApi.getRatings, "function");
  assert.equal(typeof publicApi.listReviews, "function");
  assert.equal(typeof publicApi.createReview, "function");
  assert.equal(typeof priceAdminApi.listPriceGroups, "function");
  assert.equal(typeof paymentsApi.listPayments, "function");
  assert.equal(typeof paymentsApi.updatePaymentStatus, "function");
  assert.equal(typeof paymentsApi.refundPayment, "function");
  assert.equal(typeof paymentsApi.deleteUnpaidBooking, "function");
  assert.equal(typeof revenueReportsApi.getRevenueReport, "function");
  assert.equal(typeof providerApprovalsApi.listApplications, "function");
  assert.equal(typeof providerApprovalsApi.approveProvider, "function");
  assert.equal(typeof providerApprovalsApi.rejectProvider, "function");
  assert.equal(typeof providerApprovalsApi.requestWelcomeEmail, "function");
  assert.equal(typeof providersApi.listProviders, "function");
  assert.equal(typeof providersApi.getProvider, "function");
  assert.equal(typeof providersApi.createProvider, "function");
  assert.equal(typeof usersApi.updateUser, "function");
  assert.equal(typeof usersApi.deleteUser, "function");
  assert.equal(typeof customerRequestsApi.listRequests, "function");
  assert.equal(typeof customerRequestsApi.createRequest, "function");
  assert.equal(typeof customerRequestsApi.updateRequest, "function");
  assert.equal(typeof customerRequestsApi.acceptRequest, "function");
  assert.equal(typeof customerRequestsApi.rejectRequest, "function");
  assert.equal(typeof customerRequestsApi.deleteRequest, "function");
  assert.equal(typeof seoSettingsApi.listSettings, "function");
  assert.equal(typeof seoSettingsApi.getSettingByPage, "function");
  assert.equal(typeof seoSettingsApi.createSetting, "function");
  assert.equal(typeof seoSettingsApi.updateSetting, "function");
  assert.equal(typeof seoSettingsApi.deleteSetting, "function");
});
