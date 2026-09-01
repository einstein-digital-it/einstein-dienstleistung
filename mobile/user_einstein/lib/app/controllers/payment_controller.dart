import 'package:get/get.dart';

import '../api/customer_api_service.dart';
import '../models/booking_item.dart';
import 'customer_store_controller.dart';

class PaymentController extends GetxController {
  final store = Get.find<CustomerStoreController>();
  final api = Get.find<CustomerApiService>();

  final selectedMethod = 'card'.obs;
  final isProcessing = false.obs;
  final isPaid = false.obs;
  final bookingId = RxnString();

  BookingItem? get booking => store.bookingById(bookingId.value);
  String get bookingNumber => booking?.id ?? 'No booking';
  String get serviceName => booking?.service ?? 'No service selected';
  double get amount => booking?.amountValue ?? 0;
  double get vat => amount * 0.19;

  double get total => amount + vat;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is String) {
      bookingId.value = args;
    } else if (args is Map && args['bookingId'] is String) {
      bookingId.value = args['bookingId'] as String;
    }
    loadPayment();
  }

  Future<void> loadPayment() async {
    final id = bookingId.value;
    if (id == null || id.isEmpty) return;
    try {
      final remoteBooking = await api.paymentBooking(id);
      final index = store.bookings.indexWhere((item) => item.id == id);
      if (index == -1) {
        store.bookings.insert(0, remoteBooking);
      } else {
        store.bookings[index] = remoteBooking;
      }
    } catch (_) {
      // Keep the selected local booking as fallback.
    }
  }

  Future<void> confirmPayment() async {
    final currentBooking = booking;
    if (currentBooking == null) return;
    isProcessing.value = true;
    try {
      final paidBooking = await api.updatePaymentStatus(currentBooking.id, 'paid');
      final index = store.bookings.indexWhere((item) => item.id == currentBooking.id);
      if (index == -1) {
        store.bookings.insert(0, paidBooking);
      } else {
        store.bookings[index] = paidBooking;
      }
    } catch (_) {
      await Future<void>.delayed(const Duration(milliseconds: 650));
      store.markBookingPaid(currentBooking.id);
    }
    isProcessing.value = false;
    isPaid.value = true;
  }
}
