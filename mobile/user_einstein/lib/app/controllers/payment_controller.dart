import 'package:flutter/widgets.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../api/customer_api_service.dart';
import '../models/booking_item.dart';
import 'customer_store_controller.dart';

class PaymentController extends GetxController with WidgetsBindingObserver {
  final store = Get.find<CustomerStoreController>();
  final api = Get.find<CustomerApiService>();

  final selectedMethod = 'card'.obs;
  final isProcessing = false.obs;
  final isPaid = false.obs;
  final awaitingConfirmation = false.obs;
  final infoText = ''.obs;
  final bookingId = RxnString();

  BookingItem? get booking => store.bookingById(bookingId.value);
  String get bookingNumber => booking?.id ?? 'No booking';
  String get serviceName => booking?.service ?? 'No service selected';
  double get amount => booking?.amountValue ?? 0;
  // Kleinunternehmer gemaess § 19 UStG: no VAT is charged.
  double get vat => 0;

  double get total => amount;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is String) {
      bookingId.value = args;
    } else if (args is Map && args['bookingId'] is String) {
      bookingId.value = args['bookingId'] as String;
    }
    WidgetsBinding.instance.addObserver(this);
    loadPayment();
  }

  @override
  void onClose() {
    WidgetsBinding.instance.removeObserver(this);
    super.onClose();
  }

  /// When the customer comes back from the Stripe page, refresh the status.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && awaitingConfirmation.value) {
      checkStatus();
    }
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
    infoText.value = '';

    if (selectedMethod.value == 'invoice') {
      // Pay later by invoice: the booking simply stays unpaid.
      infoText.value = 'invoice_chosen_info'.tr;
      return;
    }

    isProcessing.value = true;
    try {
      final url = await api.startCheckout(
        currentBooking.id,
        Get.locale?.languageCode ?? 'de',
      );
      final opened = await launchUrl(
        Uri.parse(url),
        mode: LaunchMode.externalApplication,
      );
      if (opened) {
        awaitingConfirmation.value = true;
        infoText.value = 'payment_pending_info'.tr;
      } else {
        infoText.value = 'payment_start_failed'.tr;
      }
    } catch (_) {
      infoText.value = 'payment_start_failed'.tr;
    }
    isProcessing.value = false;
  }

  /// Reload the booking; it is marked paid by Stripe (webhook) after payment.
  Future<void> checkStatus() async {
    await loadPayment();
    if (booking?.isPaid ?? false) {
      isPaid.value = true;
      awaitingConfirmation.value = false;
      infoText.value = '';
    }
  }
}
