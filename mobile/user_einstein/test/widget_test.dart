import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:user_einstein/main.dart';

void main() {
  tearDown(Get.reset);

  Future<void> pumpApp(WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const EinsteinUserApp());
  }

  Future<void> signIn(WidgetTester tester) async {
    await tester.enterText(find.byType(EditableText).at(0), 'customer@example.com');
    await tester.enterText(find.byType(EditableText).at(1), '11111111');
    final signInButton = find.widgetWithText(FilledButton, 'Sign in');
    await tester.ensureVisible(signInButton);
    await tester.tap(signInButton);
    await tester.pump(const Duration(milliseconds: 500));
    await tester.pumpAndSettle();
  }

  testWidgets('shows the EinStein login screen', (tester) async {
    await pumpApp(tester);

    expect(find.text('Welcome to EinStein Institut'), findsOneWidget);
    expect(find.text('Sign in'), findsOneWidget);
    expect(find.text('Continue with Google'), findsOneWidget);
  });

  testWidgets('navigates from login to home and offers', (tester) async {
    await pumpApp(tester);

    await signIn(tester);

    expect(find.text('Customer Dashboard'), findsOneWidget);

    await tester.tap(find.text('Offers').first);
    await tester.pumpAndSettle();

    expect(find.text('Angebote bei EinStein Institut'), findsOneWidget);
  });

  testWidgets('opens profile, notification settings, and payment flows', (tester) async {
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

    final payNowButton = find.widgetWithText(FilledButton, 'Pay now - 142.80 EUR');
    await tester.ensureVisible(payNowButton);
    await tester.pumpAndSettle();
    await tester.tap(payNowButton);
    await tester.pump(const Duration(milliseconds: 700));
    await tester.pumpAndSettle();
    expect(find.text('Payment successful'), findsOneWidget);
  });

  testWidgets('creates a local booking and shows it in my bookings', (tester) async {
    await pumpApp(tester);
    await signIn(tester);

    await tester.tap(find.widgetWithText(FilledButton, 'New booking'));
    await tester.pumpAndSettle();
    expect(find.text('Dienstleistung buchen'), findsOneWidget);

    final prepareButton = find.widgetWithText(FilledButton, 'Buchung vorbereiten');
    await tester.ensureVisible(prepareButton);
    await tester.pumpAndSettle();
    await tester.tap(prepareButton);
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pumpAndSettle();

    expect(find.text('Meine Buchungen'), findsOneWidget);
    expect(find.text('ES-2053'), findsOneWidget);
    expect(find.text('90 EUR'), findsOneWidget);
  });

  testWidgets('persists notification settings during navigation', (tester) async {
    await pumpApp(tester);
    await signIn(tester);

    await tester.tap(find.text('Profile').last);
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('Notification settings'), 220);
    await tester.tap(find.text('Notification settings'));
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(find.text('Email notifications'), 220);
    final emailSwitch = find.widgetWithText(SwitchListTile, 'Email notifications');
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
    final persistedEmailSwitch = find.widgetWithText(SwitchListTile, 'Email notifications');
    expect(tester.widget<SwitchListTile>(persistedEmailSwitch).value, isFalse);
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

    await tester.enterText(find.byType(EditableText).first, 'I need help changing my appointment.');
    await tester.tap(find.widgetWithText(FilledButton, 'Send request'));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pumpAndSettle();

    expect(find.text('SUP-1001 sent successfully'), findsOneWidget);
    expect(find.text('Received'), findsWidgets);
    await tester.pump(const Duration(seconds: 4));
  });
}
