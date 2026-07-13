import 'package:get/get.dart';

class CustomerServiceController extends GetxController {
  final selectedType = 'callback'.obs;
  final message = ''.obs;

  final faqs = const <String>[
    'Wie kann ich eine Buchung aendern?',
    'Wann muss ich bezahlen?',
    'Welche Dokumente soll ich hochladen?',
    'Wie erreiche ich den Support?',
  ];
}
