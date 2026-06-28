import test from "node:test";
import assert from "node:assert/strict";
import {
  adminServicesApi,
  customerRequestsApi,
  paymentsApi,
  priceAdminApi,
  providerApprovalsApi,
  providersApi,
  revenueReportsApi,
  seoSettingsApi,
  usersApi,
} from "../src/api/backendClient.js";

test("admin backend client exposes the required page APIs", () => {
  assert.equal(typeof adminServicesApi.listServices, "function");
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
