import 'package:get/get.dart';

import '../api/customer_api_service.dart';
import '../models/booking_item.dart';
import 'customer_store_controller.dart';

class MyBookingsController extends GetxController {
  final activeFilter = 'upcoming'.obs;
  final store = Get.find<CustomerStoreController>();
  final api = Get.find<CustomerApiService>();
  final isLoading = false.obs;
  final errorText = ''.obs;

  List<BookingItem> get bookings => store.bookings;
  int get totalCount => store.bookings.length;
  int get unpaidCount => store.openPaymentsCount;
  int get paidCount => store.paidBookingsCount;

  @override
  void onInit() {
    super.onInit();
    loadBookings();
  }

  Future<void> loadBookings() async {
    if (store.currentEmail.isEmpty) return;
    isLoading.value = true;
    try {
      final remoteBookings = await api.bookings(store.currentEmail);
      store.replaceBookings(remoteBookings);
    } catch (_) {
      errorText.value = 'Using local bookings data.';
    } finally {
      isLoading.value = false;
    }
  }

  /// Cancel the Dokumenten-Abo to the end of the month (§ 312k BGB).
  Future<void> cancelSubscription(BookingItem item) async {
    try {
      await api.submitCancellation({
        'name': store.profile.value.fullName,
        'email': store.currentEmail,
        'cancellation_type': 'ordinary',
        'termination_timing': 'soonest',
        'reference_number': item.id,
        'language': Get.locale?.languageCode ?? 'de',
      });
      Get.snackbar('cancel_subscription'.tr, 'cancel_subscription_done'.tr);
    } catch (_) {
      Get.snackbar('cancel_subscription'.tr, 'cancel_subscription_failed'.tr);
    }
  }
}
