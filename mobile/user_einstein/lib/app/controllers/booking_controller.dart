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
  final selectedDate = '12 Jun 2026'.obs;
  final selectedTime = '10:30'.obs;
  final address = 'Frankfurt'.obs;
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
  };

  /// Fixed prices for services that have one (others are calculated later)
  final categoryPrices = const <String, num>{
    'eur1': 150,
    'dokumentabo': 49,
  };

  final dates = const <String>['12 Jun 2026', '15 Jun 2026', '18 Jun 2026'];
  final times = const <String>['09:00', '10:30', '13:00', '16:00'];

  @override
  void onInit() {
    super.onInit();
    // Opened from a service card: preselect that service
    final args = Get.arguments;
    if (args is Map && args['category'] is String && categories.contains(args['category'])) {
      selectedCategory.value = args['category'] as String;
    }
  }

  void selectCategory(String value) {
    selectedCategory.value = value;
  }

  Future<void> confirmBooking() async {
    isSubmitting.value = true;
    BookingItem booking;
    try {
      booking = await api.createBooking({
        'customer_name': store.profile.value.fullName,
        'customer_email': store.profile.value.email,
        'customer_phone': store.profile.value.phone,
        'service_name': categoryLabels[selectedCategory.value] ?? selectedCategory.value,
        'category': selectedCategory.value,
        'date': selectedDate.value,
        'time': selectedTime.value,
        'address': address.value,
        'description': note.value,
        'status': 'pending',
        'payment_status': 'unpaid',
        'price': categoryPrices[selectedCategory.value] ?? 90,
      });
      store.bookings.insert(0, booking);
    } catch (_) {
      await Future<void>.delayed(const Duration(milliseconds: 350));
      booking = store.createBooking(
        service: categoryLabels[selectedCategory.value] ?? selectedCategory.value,
        date: selectedDate.value,
        time: selectedTime.value,
        address: address.value,
        note: note.value,
      );
    }
    lastCreatedBooking.value = booking;
    isSubmitting.value = false;
    Get.offNamed(AppRoutes.myBookings);
  }

  @override
  void onClose() {
    noteController.dispose();
    super.onClose();
  }
}
