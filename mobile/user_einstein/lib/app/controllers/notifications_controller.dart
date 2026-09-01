import 'package:get/get.dart';

import '../api/customer_api_service.dart';
import '../models/notification_item.dart';
import 'customer_store_controller.dart';

class NotificationsController extends GetxController {
  final store = Get.find<CustomerStoreController>();
  final api = Get.find<CustomerApiService>();
  final isLoading = false.obs;
  final errorText = ''.obs;

  List<NotificationItem> get notifications => store.notifications;
  int get unreadCount => store.unreadNotificationsCount;

  @override
  void onInit() {
    super.onInit();
    loadNotifications();
  }

  Future<void> loadNotifications() async {
    if (store.currentEmail.isEmpty) return;
    isLoading.value = true;
    try {
      final remoteNotifications = await api.notifications(store.currentEmail);
      store.replaceNotifications(remoteNotifications);
    } catch (_) {
      errorText.value = 'Using local notifications data.';
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> markAllRead() async {
    try {
      final remoteNotifications = await api.markAllNotificationsRead(store.currentEmail);
      store.replaceNotifications(remoteNotifications);
    } catch (_) {
      store.markAllNotificationsRead();
    }
  }
}
