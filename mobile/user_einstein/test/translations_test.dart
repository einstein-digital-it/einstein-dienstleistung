import 'package:flutter_test/flutter_test.dart';
import 'package:user_einstein/app/lang/app_translations.dart';
import 'package:user_einstein/app/lang/uk_translations.dart';

void main() {
  test('every English text has a Ukrainian translation', () {
    final en = AppTranslations().keys['en']!;
    final missing = en.keys.where((k) => !ukTranslations.containsKey(k)).toList();
    expect(missing, isEmpty, reason: 'Add these keys to uk_translations.dart');
  });

  test('Ukrainian prices end with the VAT note the booking grid strips', () {
    final vat = ukTranslations['incl_vat']!;
    for (final key in ['service_forms_price', 'service_admin_price', 'service_eur1_price']) {
      expect(ukTranslations[key], endsWith(' $vat'));
    }
  });
}
