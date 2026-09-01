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
}
