import 'package:get/get.dart';

import '../api/customer_api_service.dart';
import '../models/customer_profile.dart';
import 'customer_store_controller.dart';

class NotificationSettingsController extends GetxController {
  final store = Get.find<CustomerStoreController>();
  final api = Get.find<CustomerApiService>();
  final isLoading = false.obs;
  final errorText = ''.obs;
  bool _readyToSync = false;

  RxBool get bookingUpdates => store.bookingUpdates;
  RxBool get paymentUpdates => store.paymentUpdates;
  RxBool get reminderUpdates => store.reminderUpdates;
  RxBool get providerUpdates => store.providerUpdates;
  RxBool get emailEnabled => store.emailEnabled;
  RxBool get pushEnabled => store.pushEnabled;
  RxString get selectedLanguage => store.selectedLanguage;
  RxString get reminderTiming => store.reminderTiming;

  @override
  void onInit() {
    super.onInit();
    everAll([
      bookingUpdates,
      paymentUpdates,
      reminderUpdates,
      providerUpdates,
      emailEnabled,
      pushEnabled,
      selectedLanguage,
      reminderTiming,
    ], (_) => savePreferences());
    loadPreferences();
  }

  Future<void> loadPreferences() async {
    if (store.currentEmail.isEmpty) return;
    isLoading.value = true;
    try {
      final prefs = await api.notificationPreferences(store.currentEmail);
      bookingUpdates.value = prefs['booking_confirmed'] != false;
      paymentUpdates.value = prefs['payment_received'] != false;
      reminderUpdates.value = prefs['appointment_reminder'] != false;
      providerUpdates.value = prefs['provider_documents_uploaded'] == true;
      emailEnabled.value = prefs['email_notifications'] != false;
      pushEnabled.value = prefs['in_app_notifications'] != false;
      store.applyLanguage(
        normalizeLanguageLabel(
          (prefs['notification_language'] ?? store.selectedLanguage.value)
              .toString(),
        ),
      );
    } catch (_) {
      errorText.value = 'Using local notification preferences.';
    } finally {
      _readyToSync = true;
      isLoading.value = false;
    }
  }

  Future<void> savePreferences() async {
    if (!_readyToSync || store.currentEmail.isEmpty) return;
    try {
      await api.updateNotificationPreferences({
        'user_email': store.currentEmail,
        'booking_confirmed': bookingUpdates.value,
        'payment_received': paymentUpdates.value,
        'appointment_reminder': reminderUpdates.value,
        'provider_documents_uploaded': providerUpdates.value,
        'email_notifications': emailEnabled.value,
        'in_app_notifications': pushEnabled.value,
        'notification_language': languageCodeFromLabel(selectedLanguage.value),
        'reminder_timing': [reminderTiming.value],
      });
    } catch (_) {
      errorText.value = 'Notification preferences saved locally.';
    }
  }

  void setLanguage(String language) {
    store.applyLanguage(language);
    savePreferences();
  }
}
