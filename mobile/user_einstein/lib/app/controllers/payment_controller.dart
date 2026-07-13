import 'package:get/get.dart';

class PaymentController extends GetxController {
  final selectedMethod = 'card'.obs;
  final isProcessing = false.obs;
  final isPaid = false.obs;

  final bookingNumber = 'ES-2049';
  final serviceName = 'Buero & Sekretariat';
  final amount = 120.00;
  final vat = 22.80;

  double get total => amount + vat;

  Future<void> confirmPayment() async {
    isProcessing.value = true;
    await Future<void>.delayed(const Duration(milliseconds: 650));
    isProcessing.value = false;
    isPaid.value = true;
  }
}
