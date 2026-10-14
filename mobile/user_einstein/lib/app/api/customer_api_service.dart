import '../models/booking_item.dart';
import '../models/customer_profile.dart';
import '../models/managed_client.dart';
import '../models/notification_item.dart';
import '../models/offer_package.dart';
import '../models/service_item.dart';
import '../models/support_request.dart';
import 'api_client.dart';

class CustomerApiService {
  const CustomerApiService(this.client);

  final ApiClient client;

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final data = await client.post(
      'auth/login',
      body: {'email': email, 'password': password},
    );
    return Map<String, dynamic>.from(data as Map);
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final data = await client.post(
      'auth/register',
      body: {'name': name, 'email': email, 'password': password},
    );
    return Map<String, dynamic>.from(data as Map);
  }

  Future<void> logout() async {
    await client.post('auth/logout');
  }

  Future<CustomerProfile> profile(String email) async {
    final data = await client.get('profile', query: {'email': email});
    return CustomerProfile.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<CustomerProfile> updateProfile(CustomerProfile profile) async {
    final data = await client.patch('profile', body: profile.toApiJson());
    return CustomerProfile.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<Map<String, dynamic>> dashboard(String email) async {
    final data = await client.get(
      'customer/dashboard',
      query: {'email': email},
    );
    return Map<String, dynamic>.from(data as Map);
  }

  Future<List<ServiceItem>> services() async {
    final data = await client.get('public/services');
    return (data as List)
        .map(
          (item) =>
              ServiceItem.fromJson(Map<String, dynamic>.from(item as Map)),
        )
        .toList();
  }

  Future<List<OfferPackage>> offers() async {
    final data = await client.get('public/offers');
    return (data as List)
        .map(
          (item) =>
              OfferPackage.fromJson(Map<String, dynamic>.from(item as Map)),
        )
        .toList();
  }

  Future<List<BookingItem>> bookings(String email) async {
    final data = await client.get('customer/bookings', query: {'email': email});
    return (data as List)
        .map(
          (item) =>
              BookingItem.fromJson(Map<String, dynamic>.from(item as Map)),
        )
        .toList();
  }

  Future<BookingItem> createBooking(Map<String, dynamic> payload) async {
    final data = await client.post('bookings', body: payload);
    return BookingItem.fromJson(Map<String, dynamic>.from(data as Map));
  }

  /// "Vertraege hier kuendigen" (§ 312k BGB) — works without login.
  Future<Map<String, dynamic>> submitCancellation(
    Map<String, dynamic> payload,
  ) async {
    final data = await client.post('public/cancellations', body: payload);
    return Map<String, dynamic>.from(data as Map);
  }

  /// Starts Stripe Checkout and returns the URL of the hosted payment page.
  Future<String> startCheckout(String bookingId, String lang) async {
    final data = await client.post(
      'payments/bookings/$bookingId/checkout',
      body: {'lang': lang},
    );
    return (Map<String, dynamic>.from(data as Map))['url'].toString();
  }

  Future<BookingItem> paymentBooking(String bookingId) async {
    final data = await client.get('payments/bookings/$bookingId');
    return BookingItem.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<BookingItem> updatePaymentStatus(
    String bookingId,
    String status,
  ) async {
    final data = await client.patch(
      'payments/bookings/$bookingId/status',
      body: {'payment_status': status},
    );
    return BookingItem.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<List<NotificationItem>> notifications(String email) async {
    final data = await client.get(
      'customer/notifications',
      query: {'email': email},
    );
    return (data as List)
        .map(
          (item) =>
              NotificationItem.fromJson(Map<String, dynamic>.from(item as Map)),
        )
        .toList();
  }

  Future<List<NotificationItem>> markAllNotificationsRead(String email) async {
    final data = await client.patch(
      'customer/notifications/mark-all-read',
      body: {'email': email},
    );
    return (data as List)
        .map(
          (item) =>
              NotificationItem.fromJson(Map<String, dynamic>.from(item as Map)),
        )
        .toList();
  }

  Future<Map<String, dynamic>> notificationPreferences(String email) async {
    final data = await client.get(
      'customer/notification-preferences',
      query: {'email': email},
    );
    return Map<String, dynamic>.from(data as Map);
  }

  Future<Map<String, dynamic>> updateNotificationPreferences(
    Map<String, dynamic> payload,
  ) async {
    final data = await client.put(
      'customer/notification-preferences',
      body: payload,
    );
    return Map<String, dynamic>.from(data as Map);
  }

  Future<Map<String, dynamic>> customerSupport() async {
    final data = await client.get('customer-support');
    return Map<String, dynamic>.from(data as Map);
  }

  Future<SupportRequest> createSupportRequest(
    Map<String, dynamic> payload,
  ) async {
    final data = await client.post('customer-support/requests', body: payload);
    return SupportRequest.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<List<ManagedClient>> managedClients() async {
    final data = await client.get('customer/clients');
    return (data as List)
        .map(
          (item) =>
              ManagedClient.fromJson(Map<String, dynamic>.from(item as Map)),
        )
        .toList();
  }

  Future<ManagedClient> createManagedClient(
    Map<String, dynamic> payload,
  ) async {
    final data = await client.post('customer/clients', body: payload);
    return ManagedClient.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<ClientWorkspace> managedClient(String id) async {
    final data = await client.get('customer/clients/$id');
    return ClientWorkspace.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<void> createClientCommunication(
    String id,
    Map<String, dynamic> payload,
  ) async {
    await client.post('customer/clients/$id/communications', body: payload);
  }

  Future<void> createClientRequest(
    String id,
    Map<String, dynamic> payload,
  ) async {
    await client.post('customer/clients/$id/requests', body: payload);
  }

  Future<void> updateClientRequest(
    String clientId,
    String requestId,
    Map<String, dynamic> payload,
  ) async {
    await client.patch(
      'customer/clients/$clientId/requests/$requestId',
      body: payload,
    );
  }

  Future<void> createClientFile(String id, Map<String, dynamic> payload) async {
    await client.post('customer/clients/$id/files', body: payload);
  }

  Future<void> createClientInvoice(
    String id,
    Map<String, dynamic> payload,
  ) async {
    await client.post('customer/clients/$id/invoices', body: payload);
  }
}
