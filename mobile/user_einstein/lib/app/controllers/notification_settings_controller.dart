import 'package:get/get.dart';

class NotificationSettingsController extends GetxController {
  final bookingUpdates = true.obs;
  final paymentUpdates = true.obs;
  final reminderUpdates = true.obs;
  final providerUpdates = false.obs;
  final emailEnabled = true.obs;
  final pushEnabled = true.obs;
  final selectedLanguage = 'Deutsch'.obs;
  final reminderTiming = '24h before'.obs;
}
