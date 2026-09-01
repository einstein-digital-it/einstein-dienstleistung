import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:provider_einstein/app/api/api_client.dart';
import 'package:provider_einstein/app/api/provider_api_service.dart';
import 'package:provider_einstein/app/api/provider_session.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('persists the provider session locally', () async {
    SharedPreferences.setMockInitialValues({});
    final session = ProviderSession();

    await session.save(
      token: 'provider-token',
      email: 'provider@example.com',
      providerId: 42,
    );

    final restored = ProviderSession();
    await restored.load();

    expect(restored.isAuthenticated, isTrue);
    expect(restored.email, 'provider@example.com');
    expect(restored.providerId, 42);
  });

  test('sends a provider application without a bearer token', () async {
    SharedPreferences.setMockInitialValues({});
    final client = ApiClient(
      session: ProviderSession(),
      httpClient: MockClient((request) async {
        expect(request.method, 'POST');
        expect(request.url.path, '/api/auth/provider/register');
        expect(request.headers.containsKey('authorization'), isFalse);
        expect(
          request.body,
          '{"full_name":"Pending Provider","email":"pending@example.com","password":"Provider123","phone":"55555"}',
        );
        return http.Response(
          '{"data":{"provider":{"id":9,"status":"pending","login_enabled":false}}}',
          201,
        );
      }),
    );

    final result = await ProviderApiService(client).register(
      fullName: 'Pending Provider',
      email: 'pending@example.com',
      password: 'Provider123',
      phone: '55555',
    );

    expect(result['provider']['status'], 'pending');
  });

  test('loads the provider dashboard with the saved bearer token', () async {
    SharedPreferences.setMockInitialValues({});
    final session = ProviderSession();
    await session.save(
      token: 'provider-token',
      email: 'provider@example.com',
      providerId: 42,
    );
    final client = ApiClient(
      session: session,
      httpClient: MockClient((request) async {
        expect(request.url.path, '/api/provider/dashboard');
        expect(request.headers['authorization'], 'Bearer provider-token');
        return http.Response(
          '{"data":{"provider":{"id":42,"full_name":"Provider One","email":"provider@example.com","status":"approved","login_enabled":true},"bookings":[],"summary":{"upcoming":1,"completed":2,"total_earnings":120,"this_month":70}}}',
          200,
          headers: {'content-type': 'application/json'},
        );
      }),
    );

    final dashboard = await ProviderApiService(client).dashboard();

    expect(dashboard.provider?.fullName, 'Provider One');
    expect(dashboard.summary.completed, 2);
    expect(dashboard.summary.totalEarnings, 120);
  });

  test('sends provider booking actions with the bearer token', () async {
    SharedPreferences.setMockInitialValues({});
    final session = ProviderSession();
    await session.save(
      token: 'provider-token',
      email: 'provider@example.com',
      providerId: 42,
    );
    final client = ApiClient(
      session: session,
      httpClient: MockClient((request) async {
        expect(request.method, 'PATCH');
        expect(request.url.path, '/api/provider/bookings/11/action');
        expect(request.headers['authorization'], 'Bearer provider-token');
        expect(request.body, '{"action":"accept"}');
        return http.Response('{"data":{"id":11}}', 200);
      }),
    );

    await ProviderApiService(client).bookingAction('11', 'accept');
  });

  test('creates an extension request from the provider workspace', () async {
    SharedPreferences.setMockInitialValues({});
    final session = ProviderSession();
    await session.save(
      token: 'provider-token',
      email: 'provider@example.com',
      providerId: 42,
    );
    final client = ApiClient(
      session: session,
      httpClient: MockClient((request) async {
        expect(request.method, 'POST');
        expect(request.url.path, '/api/service-extensions');
        expect(request.headers['authorization'], 'Bearer provider-token');
        return http.Response(
          '{"data":{"id":3,"status":"pending","payment_status":"unpaid","customer_name":"Customer"}}',
          201,
          headers: {'content-type': 'application/json'},
        );
      }),
    );

    final extension = await ProviderApiService(client).createExtension({
      'customer_name': 'Customer',
      'customer_email': 'customer@example.com',
    });

    expect(extension.id, '3');
    expect(extension.status, 'pending');
  });

  test('loads and marks provider notifications as read', () async {
    SharedPreferences.setMockInitialValues({});
    final session = ProviderSession();
    await session.save(
      token: 'provider-token',
      email: 'provider@example.com',
      providerId: 42,
    );
    final client = ApiClient(
      session: session,
      httpClient: MockClient((request) async {
        expect(request.headers['authorization'], 'Bearer provider-token');
        if (request.method == 'GET') {
          expect(request.url.path, '/api/provider/notifications');
          return http.Response(
            '{"data":[{"id":7,"type":"new_booking_request","title_en":"New request","is_read":false}]}',
            200,
          );
        }
        expect(request.method, 'PATCH');
        expect(request.url.path, '/api/provider/notifications/7/read');
        return http.Response(
          '{"data":{"id":7,"type":"new_booking_request","is_read":true}}',
          200,
        );
      }),
    );
    final api = ProviderApiService(client);

    final notifications = await api.notifications();
    final marked = await api.markNotificationRead('7');

    expect(notifications.single.id, '7');
    expect(notifications.single.isRead, isFalse);
    expect(marked.isRead, isTrue);
  });
}
