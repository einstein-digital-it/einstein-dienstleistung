import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:user_einstein/app/api/auth_session.dart';
import 'package:user_einstein/app/models/customer_profile.dart';

void main() {
  test('a first start opens in Arabic', () async {
    SharedPreferences.setMockInitialValues({});
    final session = AuthSession();
    await session.load();
    expect(session.localeCode, 'ar');
  });

  test('Ukrainian is remembered after a restart', () async {
    SharedPreferences.setMockInitialValues({});
    await AuthSession().saveLocale('uk');
    final restarted = AuthSession();
    await restarted.load();
    expect(restarted.localeCode, 'uk');
  });

  test('missing or unknown languages never turn the app German', () {
    expect(normalizeLanguageLabel(''), 'Arabic');
    expect(normalizeLanguageLabel('fr'), 'Arabic');
    expect(languageCodeFromLabel(''), 'ar');
    // No app texts in Turkish or Spanish yet: English is closer than German
    expect(normalizeLanguageLabel('tr'), 'English');
    expect(languageCodeFromLabel('es'), 'en');
    // Real choices still work
    expect(normalizeLanguageLabel('de'), 'Deutsch');
    expect(languageCodeFromLabel('Deutsch'), 'de');
    expect(languageCodeFromLabel('Ukrainian'), 'uk');
    expect(CustomerProfile.fromJson(const {'preferred_language': null}).language, 'Arabic');
  });
}
