import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
import 'package:user_einstein/app/controllers/payment_controller.dart';
import 'package:user_einstein/app/controllers/documents_controller.dart';
import 'package:user_einstein/app/controllers/forms_controller.dart';
import 'package:user_einstein/app/lang/app_translations.dart';
import 'package:user_einstein/app/models/customer_document.dart';
import 'package:user_einstein/app/models/managed_client.dart';
import 'package:user_einstein/app/routes/app_routes.dart';
import 'package:user_einstein/app/views/client_workspace_view.dart';

/// In-memory stand-in for the Laravel API, so flows that now go through the
/// server (bookings, Stripe checkout) can be exercised in widget tests.
class _FakeBackend {
  final bookings = <Map<String, dynamic>>[
    {
      'id': 'ES-2050',
      'service_name': 'Behoerden & Formularhilfe',
      'category': 'forms',
      'date': '2026-11-02',
      'time': '10:00',
      'address': 'Frankfurt',
      'status': 'pending',
      'payment_status': 'unpaid',
      'price': 120,
    },
  ];
  final createdBookings = <Map<String, dynamic>>[];
  final checkoutBookingIds = <String>[];
  var accountDeleted = false;

  final documents = <Map<String, dynamic>>[
    {
      'id': 7,
      'folder': 'auslaenderbehoerde',
      'title': 'Residence permit expires soon',
      'original_name': 'brief.pdf',
      'size': 40960,
      'created_at': '2026-11-01T09:00:00Z',
      'uploaded_by': 'customer',
      'ai_status': 'done',
      'sender': 'Auslaenderbehoerde Frankfurt',
      'summary': 'Your residence permit ends in two months.',
      'translation': 'Dear customer, your residence permit ends soon.',
      'translation_language': 'en',
    },
  ];

  /// Raw multipart bodies of document uploads.
  final uploads = <String>[];
  final savedFormData = <Map<String, dynamic>>[];
  bool aboActive = false;

  static const _forms = {
    'email': 'customer@example.com',
    'personal': [
      {
        'key': 'full_name',
        'type': 'text',
        'required': true,
        'label': {'en': 'Full name', 'de': 'Vollstaendiger Name'},
      },
    ],
    'forms': [
      {
        'key': 'jobcenter_change',
        'folder': 'jobcenter',
        'authority': 'Jobcenter Frankfurt',
        'recipient_field': 'jobcenter_email',
        'title': {'en': 'Report a change', 'de': 'Veraenderungsmitteilung'},
        'description': {'en': 'Tell the Jobcenter what changed.'},
        'fields': [
          {
            'key': 'customer_number',
            'type': 'text',
            'required': true,
            'label': {'en': 'Customer number'},
          },
        ],
        'subject': 'Veraenderungsmitteilung - Kundennummer {{customer_number}}',
        'body': 'Sehr geehrte Damen und Herren,\nmein Name ist {{full_name}}.',
        'conditional': {},
      },
    ],
    'data': {},
    'suggestions': {},
  };

  Map<String, dynamic>? _booking(String id) {
    for (final booking in bookings) {
      if (booking['id'] == id) return booking;
    }
    return null;
  }

  http.Response _json(Object data, [int status = 200]) => http.Response(
    jsonEncode({'data': data}),
    status,
    headers: {'content-type': 'application/json'},
  );

  Future<http.Response> handle(http.Request request) async {
    final path = request.url.path.replaceFirst(RegExp(r'^.*/api/'), '');
    final method = request.method;

    if (path == 'auth/login' || path == 'auth/register') {
      final body = jsonDecode(request.body) as Map<String, dynamic>;
      final email = body['email']?.toString() ?? 'customer@example.com';
      final name = body['name']?.toString() ?? 'Customer User';
      return _json({
        'user': {
          'id': 1,
          'name': name,
          'full_name': name,
          'email': email,
          'role': 'user',
          'preferred_language': 'en',
        },
        'session': {'token': 'test-token'},
      });
    }
    if (method == 'DELETE' && path == 'auth/account') {
      final body = jsonDecode(request.body) as Map<String, dynamic>;
      if (body['password'] != '11111111') {
        return http.Response(
          '{"message":"The password is incorrect."}',
          422,
          headers: {'content-type': 'application/json'},
        );
      }
      accountDeleted = true;
      return http.Response('', 204);
    }
    if (method == 'GET' && path == 'customer/dashboard') {
      return _json({
        'summary': {
          'open_payments': bookings
              .where((item) => item['payment_status'] != 'paid')
              .length,
        },
        'upcoming_bookings': bookings,
        'notifications': const [],
      });
    }
    if (method == 'GET' && path == 'customer/bookings') {
      return _json(bookings);
    }
    if (method == 'POST' && path == 'bookings') {
      final payload = jsonDecode(request.body) as Map<String, dynamic>;
      createdBookings.add(payload);
      final booking = {
        ...payload,
        'id': 'ES-${2050 + bookings.length}',
        'status': 'pending',
        'payment_status': 'unpaid',
      };
      bookings.insert(0, booking);
      return _json(booking, 201);
    }
    if (method == 'GET' && path == 'customer/documents') {
      return _json({'folders': documentFolders, 'documents': documents});
    }
    if (method == 'POST' && path == 'customer/documents') {
      uploads.add(utf8.decode(request.bodyBytes, allowMalformed: true));
      final doc = {
        'id': 100 + uploads.length,
        'folder': 'sonstiges',
        'title': 'scan',
        'original_name': 'scan.jpg',
        'size': 3,
        'uploaded_by': 'customer',
        // No AI key on this server: stored unsorted, nothing to poll
        'ai_status': 'none',
      };
      documents.insert(0, doc);
      return _json(doc, 201);
    }
    if (method == 'GET' && path == 'customer/reminders') {
      return _json(const []);
    }
    if (method == 'GET' && path == 'customer/subscription') {
      return _json({'active': aboActive, 'status': aboActive ? 'active' : 'none', 'ends_at': null, 'price': 5, 'vat_included': true});
    }
    if (method == 'GET' && path == 'customer/forms') {
      return _json(_forms);
    }
    if (method == 'PUT' && path == 'customer/form-data') {
      savedFormData.add(jsonDecode(request.body) as Map<String, dynamic>);
      return _json({'ok': true});
    }
    final checkout = RegExp(
      r'^payments/bookings/([^/]+)/checkout$',
    ).firstMatch(path);
    if (method == 'POST' && checkout != null) {
      checkoutBookingIds.add(checkout.group(1)!);
      return _json({'url': 'https://checkout.stripe.test/session'});
    }
    final payment = RegExp(r'^payments/bookings/([^/]+)$').firstMatch(path);
    if (method == 'GET' && payment != null) {
      final booking = _booking(payment.group(1)!);
      if (booking != null) return _json(booking);
    }
    return http.Response('{"message":"Not available in widget test."}', 503);
  }

  /// What the Stripe webhook does on the server after a successful payment.
  void markPaid(String id) {
    _booking(id)!['payment_status'] = 'paid';
  }
}

void main() {
  late _FakeBackend backend;

  tearDown(Get.reset);

  Future<void> pumpApp(WidgetTester tester, {bool useEnglish = true}) async {
    SharedPreferences.setMockInitialValues({});
    backend = _FakeBackend();
    final session = AuthSession();
    Get.put<AuthSession>(session, permanent: true);
    final client = ApiClient(
      session: session,
      httpClient: MockClient(backend.handle),
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

  // GetX keeps snackbars in a static queue that Get.reset does not clear. A
  // snackbar still open when a test ends makes Get.back() in later tests close
  // that stale snackbar instead of the current page, so let them finish.
  Future<void> waitForSnackbars(WidgetTester tester) async {
    for (var i = 0; i < 10 && Get.isSnackbarOpen; i++) {
      await tester.pump(const Duration(seconds: 1));
    }
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
    await waitForSnackbars(tester);
  }

  testWidgets('allows a guest to browse home and protects booking', (
    tester,
  ) async {
    await pumpApp(tester, useEnglish: false);

    expect(
      find.text(
        '\u0627\u0644\u062a\u0646\u0638\u064a\u0645 \u0648\u0627\u0644\u0625\u062f\u0627\u0631\u0629',
      ),
      findsWidgets,
    );
    await tester.tap(
      find.text('\u0627\u062d\u062c\u0632 \u0627\u0644\u0622\u0646'),
    );
    await tester.pumpAndSettle();
    expect(
      find.text(
        '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
      ),
      findsOneWidget,
    );
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

  testWidgets('navigates from login to home and the customer tabs', (
    tester,
  ) async {
    await pumpApp(tester);

    await signIn(tester);

    expect(Get.find<AuthSession>().isAuthenticated, isTrue);
    expect(find.text('Welcome back'), findsOneWidget);

    await tester.tap(find.text('Bookings').last);
    await tester.pumpAndSettle();
    expect(find.text('My Bookings'), findsOneWidget);

    // The offers page is still reachable
    Get.toNamed(AppRoutes.offers);
    await tester.pumpAndSettle();
    expect(find.text('Offers from EinStein'), findsOneWidget);
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
    await tester.pump(const Duration(milliseconds: 500));
    await tester.pumpAndSettle();
    await waitForSnackbars(tester);

    expect(Get.find<AuthSession>().isAuthenticated, isTrue);
    expect(find.text('Welcome back'), findsOneWidget);
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

    expect(find.text('Welcome back'), findsOneWidget);
  });

  testWidgets('opens profile, notification settings, and payment flows', (
    tester,
  ) async {
    final launchedUrls = <String>[];
    final messenger =
        TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger;
    const urlLauncher = MethodChannel('plugins.flutter.io/url_launcher');
    messenger.setMockMethodCallHandler(urlLauncher, (call) async {
      final args = call.arguments;
      if (args is Map && args['url'] != null) {
        launchedUrls.add(args['url'].toString());
      }
      return true;
    });
    addTearDown(() => messenger.setMockMethodCallHandler(urlLauncher, null));

    await pumpApp(tester);

    await signIn(tester);

    await tester.tap(find.text('Account').last);
    await tester.pumpAndSettle();
    expect(find.text('Customer User'), findsOneWidget);

    await tester.scrollUntilVisible(find.text('Notification settings'), 220);
    await tester.tap(find.text('Notification settings'));
    await tester.pumpAndSettle();
    expect(find.text('Notification Settings'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.arrow_back_rounded).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Bookings').last);
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

    // Payment happens on the Stripe page; the app only opens it.
    expect(backend.checkoutBookingIds, ['ES-2050']);
    expect(launchedUrls, ['https://checkout.stripe.test/session']);
    expect(find.text('Payment successful'), findsNothing);

    // The Stripe webhook marks the booking paid; the customer checks again.
    backend.markPaid('ES-2050');
    final checkStatusButton = find.text('Check payment status');
    await tester.ensureVisible(checkStatusButton);
    await tester.tap(checkStatusButton);
    await tester.pumpAndSettle();
    expect(find.text('Payment successful'), findsOneWidget);
    expect(Get.find<PaymentController>().isPaid.value, isTrue);
  });

  testWidgets('creates a booking through the API and shows it in my bookings', (
    tester,
  ) async {
    await pumpApp(tester);
    await signIn(tester);

    await tester.tap(find.text('Book a service'));
    await tester.pumpAndSettle();
    expect(find.text('Book a service'), findsOneWidget);

    final prepareButton = find.widgetWithText(FilledButton, 'Prepare booking');
    await tester.ensureVisible(prepareButton);
    await tester.pumpAndSettle();
    await tester.tap(prepareButton);
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pumpAndSettle();

    expect(backend.createdBookings, hasLength(1));
    expect(backend.createdBookings.single['category'], 'forms');
    expect(
      backend.createdBookings.single['customer_email'],
      'customer@example.com',
    );
    expect(find.text('My Bookings'), findsOneWidget);
    expect(find.text('ES-2051'), findsOneWidget);
    expect(find.text('ES-2050'), findsOneWidget);
  });

  testWidgets('persists notification settings during navigation', (
    tester,
  ) async {
    await pumpApp(tester);
    await signIn(tester);

    await tester.tap(find.text('Account').last);
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

    await tester.tap(find.text('Account').last);
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

  testWidgets('deletes the account after the password is confirmed', (
    tester,
  ) async {
    await pumpApp(tester);
    await signIn(tester);

    await tester.tap(find.text('Account').last);
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('Privacy policy'), 220);
    expect(find.text('Privacy policy'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Delete account'), 220);
    await tester.tap(find.text('Delete account'));
    await tester.pumpAndSettle();

    // Wrong password: the account stays.
    await tester.enterText(find.byType(TextField).last, 'wrong');
    await tester.tap(find.text('Delete permanently'));
    await tester.pumpAndSettle();
    expect(find.text('The password is incorrect.'), findsOneWidget);
    expect(backend.accountDeleted, isFalse);

    await tester.enterText(find.byType(TextField).last, '11111111');
    await tester.tap(find.text('Delete permanently'));
    await tester.pumpAndSettle();

    expect(backend.accountDeleted, isTrue);
    expect(Get.find<AuthSession>().isAuthenticated, isFalse);
    expect(find.widgetWithText(FilledButton, 'Sign in'), findsOneWidget);
    await waitForSnackbars(tester);
  });

  testWidgets('submits a customer service request locally', (tester) async {
    await pumpApp(tester);
    await signIn(tester);

    await tester.tap(find.text('Account').last);
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

  testWidgets('My file: opens a sorted letter and uploads a new one', (
    tester,
  ) async {
    await pumpApp(tester);
    await signIn(tester);

    await tester.tap(find.text('My file').last);
    await tester.pumpAndSettle();
    expect(find.text('All your letters, sorted by authority.'), findsOneWidget);
    // Without the Abo, sorting & translation is offered for 5 € a month
    expect(find.text('Sorting & translation'), findsOneWidget);
    expect(find.text('5,00 € / month incl. VAT · cancel any time'), findsOneWidget);
    expect(find.text('Subscribe'), findsOneWidget);

    // The letter sits in its authority's folder
    final folder = find.text('Immigration office');
    await tester.scrollUntilVisible(
      folder,
      200,
      scrollable: find.byType(Scrollable).first,
    );
    // Lift it clear of the bottom navigation bar
    await tester.drag(find.byType(Scrollable).first, const Offset(0, -200));
    await tester.pumpAndSettle();
    await tester.tap(folder);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Residence permit expires soon'));
    await tester.pumpAndSettle();
    expect(
      find.text('Your residence permit ends in two months.'),
      findsOneWidget,
    );
    expect(find.textContaining('Auslaenderbehoerde Frankfurt'), findsOneWidget);
    // The translation is open by default and can be folded away
    const translation = 'Dear customer, your residence permit ends soon.';
    expect(find.text(translation), findsOneWidget);
    await tester.tap(find.text('Translation'));
    await tester.pumpAndSettle();
    expect(find.text(translation), findsNothing);

    // Back on "My file", the upload button offers camera, photos and PDF
    Get.back();
    await tester.pumpAndSettle();
    Get.back();
    await tester.pumpAndSettle();
    expect(Get.currentRoute, AppRoutes.documents);
    await tester.drag(find.byType(Scrollable).first, const Offset(0, 2000));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Upload a letter'));
    await tester.pumpAndSettle();
    expect(find.text('Take a photo'), findsOneWidget);
    expect(find.text('Choose a file (PDF)'), findsOneWidget);
    Get.back();
    await tester.pumpAndSettle();

    // The picker itself is native, so upload the picked bytes directly
    final docs = Get.find<DocumentsController>();
    await tester.runAsync(() => docs.upload([1, 2, 3], 'scan.jpg'));
    await tester.pumpAndSettle();
    await waitForSnackbars(tester);

    expect(backend.uploads, hasLength(1));
    final body = backend.uploads.single;
    expect(body, contains('name="folder"\r\n\r\nauto'));
    expect(body, contains('filename="scan.jpg"'));
    // No title is sent: the server must name the file itself
    expect(body, isNot(contains('name="title"')));
    expect(docs.documents.first.title, 'scan');

    // Once Stripe confirms the Abo, the card says it is active
    backend.aboActive = true;
    await tester.runAsync(docs.loadSubscription);
    await tester.pumpAndSettle();
    expect(find.text('Sorting & translation is active'), findsOneWidget);
    expect(find.text('Subscribe'), findsNothing);
  });

  testWidgets('Applications: fills a form and shows the German letter', (
    tester,
  ) async {
    await pumpApp(tester);
    await signIn(tester);

    await tester.tap(find.text('Applications').last);
    await tester.pumpAndSettle();
    expect(find.text('Report a change'), findsOneWidget);
    expect(find.text('2 details missing'), findsOneWidget);

    await tester.tap(find.text('Report a change'));
    await tester.pumpAndSettle();
    expect(find.text('Jobcenter Frankfurt'), findsOneWidget);
    final sendButton = find.ancestor(
      of: find.text('2 details missing'),
      matching: find.byWidgetPredicate((w) => w is ButtonStyleButton),
    );
    expect(tester.widget<ButtonStyleButton>(sendButton).onPressed, isNull);

    await tester.enterText(
      find.widgetWithText(TextField, 'Full name *'),
      'Mira Customer',
    );
    await tester.pumpAndSettle();
    expect(find.text('1 details missing'), findsOneWidget);
    await tester.enterText(
      find.widgetWithText(TextField, 'Customer number *'),
      '123A456',
    );
    await tester.pumpAndSettle();

    // Everything filled: ready to send, letter filled in German
    expect(find.text('Create PDF and send'), findsOneWidget);
    expect(
      find.text('Veraenderungsmitteilung - Kundennummer 123A456'),
      findsOneWidget,
    );
    expect(find.textContaining('mein Name ist Mira Customer.'), findsOneWidget);
    final forms = Get.find<FormsController>();
    expect(forms.missing(forms.byKey('jobcenter_change')!), isEmpty);
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
