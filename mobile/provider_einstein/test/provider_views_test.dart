import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:provider_einstein/app/api/api_client.dart';
import 'package:provider_einstein/app/api/provider_api_service.dart';
import 'package:provider_einstein/app/api/provider_session.dart';
import 'package:provider_einstein/app/controllers/provider_auth_controller.dart';
import 'package:provider_einstein/app/controllers/provider_store_controller.dart';
import 'package:provider_einstein/app/lang/app_translations.dart';
import 'package:provider_einstein/app/models/provider_notification.dart';
import 'package:provider_einstein/app/models/provider_profile.dart';
import 'package:provider_einstein/app/models/provider_dashboard.dart';
import 'package:provider_einstein/app/views/provider_earnings_view.dart';
import 'package:provider_einstein/app/views/provider_notifications_view.dart';
import 'package:provider_einstein/app/views/provider_workspace_view.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    Get.testMode = true;
    Get.reset();
    SharedPreferences.setMockInitialValues({});
  });

  tearDown(Get.reset);

  ProviderStoreController installStore(MockClient client) {
    final session = ProviderSession();
    final api = ProviderApiService(
      ApiClient(session: session, httpClient: client),
    );
    final store = ProviderStoreController(api);
    Get.put<ProviderSession>(session);
    Get.put<ProviderApiService>(api);
    Get.put<ProviderStoreController>(store);
    Get.put<ProviderAuthController>(
      ProviderAuthController(api: api, session: session, store: store),
    );
    return store;
  }

  Widget app(Widget home) => GetMaterialApp(
    translations: AppTranslations(),
    locale: const Locale('en'),
    home: home,
  );

  testWidgets('dashboard shows provider metrics and available requests', (
    tester,
  ) async {
    final store = installStore(
      MockClient((_) async => http.Response('{"data":[]}', 200)),
    );
    store.profile.value = const ProviderProfile(
      id: 1,
      fullName: 'Provider One',
      email: 'provider@example.com',
      status: 'approved',
      loginEnabled: true,
    );
    store.summary.value = const ProviderSummary(
      upcoming: 2,
      completed: 4,
      totalEarnings: 240,
      thisMonth: 80,
    );

    await tester.pumpWidget(app(const ProviderWorkspaceView()));

    expect(find.textContaining('Provider One'), findsOneWidget);
    expect(find.text('240 EUR'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('available_requests'.tr),
      240,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('available_requests'.tr), findsOneWidget);
  });

  testWidgets('notifications screen renders the stored notification', (
    tester,
  ) async {
    final store = installStore(
      MockClient((_) async => http.Response('{"data":[]}', 200)),
    );
    store.notifications.assignAll(const [
      ProviderNotification(
        id: '1',
        type: 'new_booking_request',
        isRead: true,
        titleEn: 'New request',
        messageEn: 'A booking is ready.',
      ),
    ]);

    await tester.pumpWidget(app(const ProviderNotificationsView()));

    expect(find.text('New request'), findsOneWidget);
    expect(find.text('A booking is ready.'), findsOneWidget);
  });

  testWidgets('earnings report renders totals and invoice transaction', (
    tester,
  ) async {
    final store = installStore(
      MockClient((request) async {
        expect(request.url.path, '/api/provider/earnings');
        return http.Response(
          '{"data":{"year":2026,"summary":{"total_earned":120,"paid_amount":100,"pending_amount":20,"completed_services":2},"items":[{"id":"booking-1","kind":"booking","reference":"ES-1","customer_name":"Customer","service_name":"Forms","date":"2026-08-18","amount":120,"payment_status":"paid","status":"completed","invoice_url":"/storage/invoice.pdf"}]}}',
          200,
        );
      }),
    );

    await tester.pumpWidget(app(const ProviderEarningsView()));
    await tester.pumpAndSettle();

    expect(find.text('120.00 EUR'), findsOneWidget);
    expect(find.text('transactions'.tr), findsOneWidget);
    expect(store.earningsReport.value?.items, hasLength(1));
    expect(store.earningsReport.value?.items.single.serviceName, 'Forms');
  });
}
