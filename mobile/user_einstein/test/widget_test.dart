import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:user_einstein/main.dart';
import 'package:user_einstein/app/api/api_client.dart';
import 'package:user_einstein/app/api/auth_session.dart';
import 'package:user_einstein/app/api/customer_api_service.dart';
import 'package:user_einstein/app/controllers/customer_clients_controller.dart';
import 'package:user_einstein/app/lang/app_translations.dart';
import 'package:user_einstein/app/models/managed_client.dart';
import 'package:user_einstein/app/routes/app_routes.dart';
import 'package:user_einstein/app/views/client_workspace_view.dart';

void main() {
  tearDown(Get.reset);

  Future<void> pumpApp(WidgetTester tester, {bool useEnglish = true}) async {
    SharedPreferences.setMockInitialValues({});
    final session = AuthSession();
    Get.put<AuthSession>(session, permanent: true);
    final client = ApiClient(
      session: session,
      httpClient: MockClient((request) async {
        final path = request.url.path;
        if (path.endsWith('/auth/login') || path.endsWith('/auth/register')) {
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          final email = body['email']?.toString() ?? 'customer@example.com';
          final name = body['name']?.toString() ?? 'Customer User';
          return http.Response(
            jsonEncode({
              'data': {
                'user': {
                  'id': 1,
                  'name': name,
                  'full_name': name,
                  'email': email,
                  'role': 'user',
                  'preferred_language': 'en',
                },
                'session': {'token': 'test-token'},
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        }
        return http.Response(
          '{"message":"Not available in widget test."}',
          503,
        );
      }),
    );
    Get.put<ApiClient>(client, permanent: true);
    Get.put<CustomerApiService>(CustomerApiService(client), permanent: true);
    await tester.pumpWidget(
      EinsteinUserApp(
        initialLocale: useEnglish ? const Locale('en') : const Locale('ar'),
      ),
    );
    await tester.pumpAndSettle();
  }

  Future<void> signIn(WidgetTester tester) async {
    Get.toNamed(AppRoutes.login);
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byType(EditableText).at(0),
      'customer@example.com',
    );
    await tester.enterText(find.byType(EditableText).at(1), '11111111');
    final signInButton = find.widgetWithText(FilledButton, 'Sign in');
    await tester.ensureVisible(signInButton);
    await tester.tap(signInButton);
    await tester.pump(const Duration(milliseconds: 500));
    await tester.pumpAndSettle();
    await tester.pump(const Duration(seconds: 4));
    await tester.pumpAndSettle();
  }

  testWidgets('allows a guest to browse home and protects booking', (tester) async {
    await pumpApp(tester, useEnglish: false);

    expect(
      find.text(
        '\u0627\u0644\u062a\u0646\u0638\u064a\u0645 \u0648\u0627\u0644\u0625\u062f\u0627\u0631\u0629',
      ),
      findsWidgets,
    );
    await tester.tap(find.text('\u0627\u062d\u062c\u0632 \u0627\u0644\u0622\u0646'));
    await tester.pumpAndSettle();
    expect(find.text('\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644'), findsOneWidget);
  });

  testWidgets('starts with Arabic as the default application language', (
    tester,
  ) async {
    await pumpApp(tester, useEnglish: false);

    expect(Get.locale?.languageCode, 'ar');
    expect(
      Directionality.of(tester.element(find.byType(Scaffold).first)),
      TextDirection.rtl,
    );
  });

  testWidgets('navigates from login to home and offers', (tester) async {
    await pumpApp(tester);

    await signIn(tester);

    expect(Get.find<AuthSession>().isAuthenticated, isTrue);
    expect(find.text('Customer Dashboard'), findsOneWidget);

    await tester.tap(find.text('Offers').first);
    await tester.pumpAndSettle();

    expect(find.text('Offers from EinStein Institut'), findsOneWidget);
  });

  testWidgets('registers a user and stores the issued session token', (
    tester,
  ) async {
    await pumpApp(tester);

    Get.toNamed(AppRoutes.login);
    await tester.pumpAndSettle();
    final signUpButton = find.text('Sign up');
    await tester.ensureVisible(signUpButton);
    await tester.tap(signUpButton);
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(EditableText).at(0), 'New Customer');
    await tester.enterText(
      find.byType(EditableText).at(1),
      'new.customer@example.com',
    );
    await tester.enterText(find.byType(EditableText).at(2), '11111111');
    final createAccountButton = find.widgetWithText(
      FilledButton,
      'Create account',
    );
    await tester.ensureVisible(createAccountButton);
    await tester.tap(createAccountButton);
    await tester.pumpAndSettle();
    await tester.pump(const Duration(seconds: 4));
    await tester.pumpAndSettle();

    expect(Get.find<AuthSession>().isAuthenticated, isTrue);
    expect(find.text('Customer Dashboard'), findsOneWidget);
  });

  testWidgets('opens the customer dashboard when a session is restored', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({});
    final session = AuthSession();
    await session.save(token: 'restored-token', email: 'customer@example.com');
    Get.put<AuthSession>(session, permanent: true);
    final client = ApiClient(
      session: session,
      httpClient: MockClient(
        (_) async =>
            http.Response('{"message":"Not available in widget test."}', 503),
      ),
    );
    Get.put<ApiClient>(client, permanent: true);
    Get.put<CustomerApiService>(CustomerApiService(client), permanent: true);

    await tester.pumpWidget(const EinsteinUserApp(initialLocale: Locale('en')));
    await tester.pumpAndSettle();

    expect(find.text('Customer Dashboard'), findsOneWidget);
  });

  testWidgets('opens profile, notification settings, and payment flows', (
    tester,
  ) async {
    await pumpApp(tester);

    await signIn(tester);

    await tester.tap(find.text('Profile').last);
    await tester.pumpAndSettle();
    expect(find.text('Customer User'), findsOneWidget);

    await tester.scrollUntilVisible(find.text('Notification settings'), 220);
    await tester.tap(find.text('Notification settings'));
    await tester.pumpAndSettle();
    expect(find.text('Notification Settings'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.arrow_back_rounded).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('My').last);
    await tester.pumpAndSettle();
    final payButton = find.widgetWithText(FilledButton, 'Pay');
    await tester.ensureVisible(payButton);
    await tester.pumpAndSettle();
    await tester.tap(payButton);
    await tester.pumpAndSettle();
    expect(find.text('Secure payment'), findsOneWidget);

    final payNowButton = find.widgetWithText(
      FilledButton,
      'Pay now - 142.80 EUR',
    );
    await tester.ensureVisible(payNowButton);
    await tester.pumpAndSettle();
    await tester.tap(payNowButton);
    await tester.pump(const Duration(milliseconds: 700));
    await tester.pumpAndSettle();
    expect(find.text('Payment successful'), findsOneWidget);
  });

  testWidgets('creates a local booking and shows it in my bookings', (
    tester,
  ) async {
    await pumpApp(tester);
    await signIn(tester);

    await tester.tap(find.widgetWithText(FilledButton, 'New booking'));
    await tester.pumpAndSettle();
    expect(find.text('Book a service'), findsOneWidget);

    final prepareButton = find.widgetWithText(FilledButton, 'Prepare booking');
    await tester.ensureVisible(prepareButton);
    await tester.pumpAndSettle();
    await tester.tap(prepareButton);
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pumpAndSettle();

    expect(find.text('My Bookings'), findsOneWidget);
    expect(find.text('ES-2053'), findsOneWidget);
    expect(find.text('90 EUR'), findsOneWidget);
  });

  testWidgets('persists notification settings during navigation', (
    tester,
  ) async {
    await pumpApp(tester);
    await signIn(tester);

    await tester.tap(find.text('Profile').last);
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('Notification settings'), 220);
    await tester.tap(find.text('Notification settings'));
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(find.text('Email notifications'), 220);
    final emailSwitch = find.widgetWithText(
      SwitchListTile,
      'Email notifications',
    );
    expect(tester.widget<SwitchListTile>(emailSwitch).value, isTrue);
    await tester.tap(emailSwitch);
    await tester.pumpAndSettle();
    expect(tester.widget<SwitchListTile>(emailSwitch).value, isFalse);

    await tester.tap(find.byIcon(Icons.arrow_back_rounded).first);
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('Notification settings'), 220);
    await tester.tap(find.text('Notification settings'));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('Email notifications'), 220);
    final persistedEmailSwitch = find.widgetWithText(
      SwitchListTile,
      'Email notifications',
    );
    expect(tester.widget<SwitchListTile>(persistedEmailSwitch).value, isFalse);
  });

  testWidgets('switches app language between English and Arabic', (
    tester,
  ) async {
    await pumpApp(tester);
    expect(find.text('Organisation & Administration'), findsWidgets);

    await pumpApp(tester, useEnglish: false);
    expect(Get.locale?.languageCode, 'ar');
  });

  testWidgets('updates profile information locally', (tester) async {
    await pumpApp(tester);
    await signIn(tester);

    await tester.tap(find.text('Profile').last);
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Edit profile'));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(EditableText).at(0), 'Mira Customer');
    await tester.enterText(find.byType(EditableText).at(1), '+49 171 222333');
    await tester.enterText(find.byType(EditableText).at(2), 'Berlin');
    await tester.tap(find.widgetWithText(FilledButton, 'Save changes'));
    await tester.pumpAndSettle();

    expect(find.text('Mira Customer'), findsOneWidget);
    expect(find.text('+49 171 222333'), findsOneWidget);
    expect(find.text('Berlin'), findsOneWidget);
  });

  testWidgets('submits a customer service request locally', (tester) async {
    await pumpApp(tester);
    await signIn(tester);

    await tester.tap(find.text('Profile').last);
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('Customer service'), 220);
    await tester.tap(find.text('Customer service'));
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byType(EditableText).first,
      'I need help changing my appointment.',
    );
    await tester.tap(find.widgetWithText(FilledButton, 'Send request'));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pumpAndSettle();

    expect(find.text('SUP-1001 sent successfully'), findsOneWidget);
    expect(find.text('Received'), findsWidgets);
    await tester.pump(const Duration(seconds: 4));
  });

  testWidgets('renders a separate client workspace with structured tabs', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({});
    final session = AuthSession();
    Get.put<AuthSession>(session, permanent: true);
    Get.put<ApiClient>(ApiClient(session: session), permanent: true);
    Get.put<CustomerApiService>(
      CustomerApiService(Get.find<ApiClient>()),
      permanent: true,
    );
    final controller = Get.put(ClientWorkspaceController(clientId: '1'));
    controller.workspace.value = ClientWorkspace(
      client: const ManagedClient(
        id: '1',
        fullName: 'Mueller GmbH',
        companyName: 'Mueller Software',
        email: 'mueller@example.com',
        phone: '+49 170 111111',
        language: 'de',
        status: 'active',
        notes: 'Use our company tone.',
        communicationsCount: 1,
        openRequestsCount: 1,
        filesCount: 1,
        openInvoicesCount: 1,
      ),
      communications: const [],
      requests: const [
        ClientRequest(
          id: '10',
          number: 'CR-100',
          subject: 'Prepare a quote',
          description: 'Send it by email.',
          status: 'open',
          priority: 'high',
          assignedTo: null,
          dueAt: null,
        ),
      ],
      files: const [],
      invoices: const [],
      history: const [],
    );

    await tester.pumpWidget(
      GetMaterialApp(
        translations: AppTranslations(),
        locale: const Locale('en'),
        fallbackLocale: const Locale('en'),
        home: const ClientWorkspaceView(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Mueller GmbH'), findsOneWidget);
    expect(find.text('Communication'), findsOneWidget);
    expect(find.text('Prepare a quote'), findsNothing);

    await tester.tap(find.text('Requests'));
    await tester.pumpAndSettle();

    expect(find.text('Prepare a quote'), findsOneWidget);
    expect(find.text('CR-100'), findsOneWidget);
  });
}
