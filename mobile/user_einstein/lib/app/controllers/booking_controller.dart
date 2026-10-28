import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../api/customer_api_service.dart';
import '../models/booking_item.dart';
import '../routes/app_routes.dart';
import 'customer_store_controller.dart';

class BookingController extends GetxController {
  final store = Get.find<CustomerStoreController>();
  final api = Get.find<CustomerApiService>();

  final selectedCategory = 'forms'.obs;
  final selectedDate = ''.obs;
  final selectedTime = '10:30'.obs;
  final address = ''.obs;
  final note = ''.obs;
  final isSubmitting = false.obs;
  final lastCreatedBooking = Rxn<BookingItem>();

  final noteController = TextEditingController();

  final categories = const <String>[
    'forms',
    'admin',
    'coordination',
    'mercosur',
    'tutoring',
    'print',
    'office',
    'eur1',
    'dokumentabo',
    'bueromanagement',
  ];

  final categoryLabels = const <String, String>{
    'forms': 'Behoerden & Formularhilfe',
    'admin': 'Administrative Dienstleistungen',
    'coordination': 'Koordinationsleistungen',
    'mercosur': 'MERCOSUR (LATAM)',
    'tutoring': 'Nachhilfe',
    'print': 'Druck & Stempel',
    'office': 'Buero & Organisation',
    'eur1': 'Dokumentenservice EU-Syrien / EUR.1',
    'dokumentabo': 'Dokumenten-Abo (49 EUR / Monat)',
    'bueromanagement': 'Büro-Management',
  };

  /// Fixed prices for services that have one (others are calculated later)
  final categoryPrices = const <String, num>{
    'eur1': 150,
    'dokumentabo': 49,
  };

  /// Büro-Management: net monthly price by number of employees (Minijobber included).
  static const bueroTiers = <String, num>{'klein': 200, 'mittel': 300, 'gross': 400};
  static const _bueroTierNames = <String, String>{
    'klein': 'Paket Klein (1–4 Mitarbeitende)',
    'mittel': 'Paket Mittel (5–6 Mitarbeitende)',
    'gross': 'Paket Groß (ab 7 Mitarbeitenden)',
  };
  final selectedTier = 'klein'.obs;

  bool get isBueroManagement => selectedCategory.value == 'bueromanagement';

  num get _price => isBueroManagement
      ? bueroTiers[selectedTier.value]!
      : (categoryPrices[selectedCategory.value] ?? 0);

  String get _serviceName => isBueroManagement
      ? 'Büro-Management – ${_bueroTierNames[selectedTier.value]}'
      : (categoryLabels[selectedCategory.value] ?? selectedCategory.value);

  /// Next 14 days (without Sundays), shown as e.g. "Mo 26.10."; sent as yyyy-MM-dd.
  late final List<DateTime> _dateValues = _upcomingDays();
  late final List<String> dates = _dateValues.map(_label).toList();

  static List<DateTime> _upcomingDays() {
    final today = DateTime.now();
    final days = <DateTime>[];
    for (var i = 1; days.length < 12; i++) {
      final day = DateTime(today.year, today.month, today.day + i);
      if (day.weekday != DateTime.sunday) days.add(day);
    }
    return days;
  }

  static String _label(DateTime d) {
    const names = {
      'de': ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
      'en': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      'ar': ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
    };
    final lang = Get.locale?.languageCode ?? 'de';
    final weekday = (names[lang] ?? names['de']!)[d.weekday - 1];
    String two(int n) => n.toString().padLeft(2, '0');
    return '$weekday ${two(d.day)}.${two(d.month)}.';
  }

  String get _selectedIsoDate {
    final index = dates.indexOf(selectedDate.value);
    final d = _dateValues[index < 0 ? 0 : index];
    String two(int n) => n.toString().padLeft(2, '0');
    return '${d.year}-${two(d.month)}-${two(d.day)}';
  }
  final times = const <String>['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  @override
  void onInit() {
    super.onInit();
    // Opened from a service card: preselect that service
    final args = Get.arguments;
    if (args is Map && args['category'] is String && categories.contains(args['category'])) {
      selectedCategory.value = args['category'] as String;
    }
    selectedDate.value = dates.first;
    selectedTime.value = times.first;
    address.value = store.profile.value.address;
  }

  void selectCategory(String value) {
    selectedCategory.value = value;
  }

  Future<void> confirmBooking() async {
    // Bookings belong to an account: ask the customer to log in first.
    if (store.currentEmail.isEmpty) {
      Get.snackbar('booking'.tr, 'login_required_to_book'.tr);
      Get.toNamed(AppRoutes.login);
      return;
    }
    isSubmitting.value = true;
    try {
      final booking = await api.createBooking({
        'customer_name': store.profile.value.fullName,
        'customer_email': store.profile.value.email,
        'customer_phone': store.profile.value.phone,
        'service_name': _serviceName,
        'category': selectedCategory.value,
        'date': _selectedIsoDate,
        'time': selectedTime.value,
        'address': address.value,
        'description': note.value,
        'status': 'pending',
        'payment_status': 'unpaid',
        'price': _price,
      });
      store.bookings.insert(0, booking);
      lastCreatedBooking.value = booking;
      Get.offNamed(AppRoutes.myBookings);
    } catch (_) {
      // Never pretend a booking exists when the server did not save it.
      Get.snackbar('booking'.tr, 'booking_failed'.tr);
    } finally {
      isSubmitting.value = false;
    }
  }

  @override
  void onClose() {
    noteController.dispose();
    super.onClose();
  }
}
