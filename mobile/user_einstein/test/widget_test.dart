import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:user_einstein/main.dart';

void main() {
  testWidgets('shows the EinStein login screen', (tester) async {
    await tester.pumpWidget(const EinsteinUserApp());

    expect(find.text('Welcome to EinStein Institut'), findsOneWidget);
    expect(find.text('Sign in'), findsOneWidget);
    expect(find.text('Continue with Google'), findsOneWidget);
  });

  testWidgets('navigates from login to home and offers', (tester) async {
    await tester.pumpWidget(const EinsteinUserApp());

    await tester.enterText(find.byType(EditableText).at(0), 'customer@example.com');
    await tester.enterText(find.byType(EditableText).at(1), '11111111');
    final signInButton = find.widgetWithText(FilledButton, 'Sign in');
    await tester.ensureVisible(signInButton);
    await tester.tap(signInButton);
    await tester.pump(const Duration(milliseconds: 500));
    await tester.pumpAndSettle();

    expect(find.text('Customer Dashboard'), findsOneWidget);

    await tester.tap(find.text('Offers').first);
    await tester.pumpAndSettle();

    expect(find.text('Angebote bei EinStein Institut'), findsOneWidget);
  });

  testWidgets('opens profile, notification settings, and payment flows', (tester) async {
    await tester.pumpWidget(const EinsteinUserApp());

    await tester.enterText(find.byType(EditableText).at(0), 'customer@example.com');
    await tester.enterText(find.byType(EditableText).at(1), '11111111');
    final signInButton = find.widgetWithText(FilledButton, 'Sign in');
    await tester.ensureVisible(signInButton);
    await tester.tap(signInButton);
    await tester.pump(const Duration(milliseconds: 500));
    await tester.pumpAndSettle();

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
  });
}
