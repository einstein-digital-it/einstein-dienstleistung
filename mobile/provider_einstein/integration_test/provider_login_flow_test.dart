import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:provider_einstein/app/api/provider_session.dart';
import 'package:provider_einstein/main.dart' as app;

const _email = String.fromEnvironment('PROVIDER_TEST_EMAIL');
const _password = String.fromEnvironment('PROVIDER_TEST_PASSWORD');

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets(
    'provider can sign in and reach the dashboard',
    (tester) async {
      await ProviderSession().clear();
      await app.main();
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(EditableText).at(0), _email);
      await tester.enterText(find.byType(EditableText).at(1), _password);
      await tester.tap(find.byType(FilledButton));
      await tester.pumpAndSettle(const Duration(seconds: 3));

      expect(find.textContaining('EinStein'), findsWidgets);
    },
    skip: _email.isEmpty || _password.isEmpty,
  );
}
