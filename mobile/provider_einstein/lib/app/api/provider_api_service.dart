import '../models/provider_dashboard.dart';
import '../models/provider_document.dart';
import '../models/provider_earnings_report.dart';
import '../models/provider_notification.dart';
import '../models/service_extension.dart';
import '../models/uploaded_file.dart';
import 'package:file_picker/file_picker.dart';
import 'api_client.dart';

class ProviderApiService {
  const ProviderApiService(this.client);

  final ApiClient client;

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final data = await client.post(
      'auth/provider/login',
      body: {'email': email, 'password': password},
    );
    return Map<String, dynamic>.from(data as Map);
  }

  Future<Map<String, dynamic>> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
  }) async {
    final data = await client.post(
      'auth/provider/register',
      body: {
        'full_name': fullName,
        'email': email,
        'password': password,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
      },
    );
    return Map<String, dynamic>.from(data as Map);
  }

  Future<void> logout() async {
    await client.post('auth/logout');
  }

  Future<ProviderDashboard> dashboard() async {
    final data = await client.get('provider/dashboard');
    return ProviderDashboard.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<ProviderEarningsReport> earnings({int? year}) async {
    final data = await client.get(
      'provider/earnings',
      query: {'year': year?.toString()},
    );
    return ProviderEarningsReport.fromJson(
      Map<String, dynamic>.from(data as Map),
    );
  }

  Future<void> bookingAction(String bookingId, String action) async {
    await client.patch(
      'provider/bookings/$bookingId/action',
      body: {'action': action},
    );
  }

  Future<void> updateBookingDocuments(
    String bookingId,
    List<String> documentUrls,
  ) async {
    await client.patch(
      'provider/bookings/$bookingId/documents',
      body: {'document_urls': documentUrls},
    );
  }

  Future<List<UploadedFile>> uploadFiles(List<PlatformFile> files) async {
    final filesData = await client.uploadFiles(files);
    return filesData
        .map(
          (item) => UploadedFile.fromJson({
            ...item,
            'url': client.absoluteUrl(item['url']?.toString() ?? ''),
          }),
        )
        .toList();
  }

  String absoluteUrl(String value) => client.absoluteUrl(value);

  Future<void> updateProfile(
    int providerId,
    Map<String, dynamic> payload,
  ) async {
    await client.patch('provider/profile/$providerId', body: payload);
  }

  Future<List<ProviderDocument>> documents() async {
    final data = await client.get('provider-documents');
    return (data as List)
        .map(
          (item) =>
              ProviderDocument.fromJson(Map<String, dynamic>.from(item as Map)),
        )
        .toList();
  }

  Future<ProviderDocument> createDocument(Map<String, dynamic> payload) async {
    final data = await client.post('provider-documents', body: payload);
    return ProviderDocument.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<void> deleteDocument(String id) =>
      client.delete('provider-documents/$id');

  Future<List<ProviderNotification>> notifications() async {
    final data = await client.get('provider/notifications');
    return (data as List)
        .map(
          (item) => ProviderNotification.fromJson(
            Map<String, dynamic>.from(item as Map),
          ),
        )
        .toList();
  }

  Future<ProviderNotification> markNotificationRead(String id) async {
    final data = await client.patch('provider/notifications/$id/read');
    return ProviderNotification.fromJson(
      Map<String, dynamic>.from(data as Map),
    );
  }

  Future<List<ProviderNotification>> markAllNotificationsRead() async {
    final data = await client.patch('provider/notifications/read-all');
    return (data as List)
        .map(
          (item) => ProviderNotification.fromJson(
            Map<String, dynamic>.from(item as Map),
          ),
        )
        .toList();
  }

  Future<List<ServiceExtension>> extensions() async {
    final data = await client.get('service-extensions');
    return (data as List)
        .map(
          (item) =>
              ServiceExtension.fromJson(Map<String, dynamic>.from(item as Map)),
        )
        .toList();
  }

  Future<ServiceExtension> createExtension(Map<String, dynamic> payload) async {
    final data = await client.post('service-extensions', body: payload);
    return ServiceExtension.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<ServiceExtension> updateExtension(
    String id,
    Map<String, dynamic> payload,
  ) async {
    final data = await client.patch('service-extensions/$id', body: payload);
    return ServiceExtension.fromJson(Map<String, dynamic>.from(data as Map));
  }
}
