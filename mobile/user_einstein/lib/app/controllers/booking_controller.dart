import 'package:get/get.dart';

class BookingController extends GetxController {
  final selectedCategory = 'forms'.obs;
  final selectedDate = '12 Jun 2026'.obs;
  final selectedTime = '10:30'.obs;
  final note = ''.obs;

  final categories = const <String>[
    'forms',
    'admin',
    'coordination',
    'mercosur',
    'tutoring',
    'print',
    'office',
  ];

  final categoryLabels = const <String, String>{
    'forms': 'Behoerden & Formularhilfe',
    'admin': 'Administrative Dienstleistungen',
    'coordination': 'Koordinationsleistungen',
    'mercosur': 'MERCOSUR (LATAM)',
    'tutoring': 'Nachhilfe',
    'print': 'Druck & Stempel',
    'office': 'Buero & Organisation',
  };

  void selectCategory(String value) {
    selectedCategory.value = value;
  }
}
