import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/provider_store_controller.dart';
import '../models/provider_notification.dart';
import '../routes/app_routes.dart';
import '../theme/app_theme.dart';

class ProviderNotificationsView extends GetView<ProviderStoreController> {
  const ProviderNotificationsView({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text('notifications'.tr),
      actions: [
        TextButton(
          onPressed: controller.markAllNotificationsRead,
          child: Text('mark_all_read'.tr),
        ),
      ],
    ),
    body: Obx(
      () => RefreshIndicator(
        onRefresh: controller.loadNotifications,
        child: controller.notifications.isEmpty
            ? ListView(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(32),
                    child: Center(
                      child: Text(
                        'no_notifications'.tr,
                        style: const TextStyle(color: Color(0xFF667085)),
                      ),
                    ),
                  ),
                ],
              )
            : ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: controller.notifications.length,
                itemBuilder: (_, index) => _NotificationTile(
                  notification: controller.notifications[index],
                ),
              ),
      ),
    ),
  );
}

class _NotificationTile extends GetView<ProviderStoreController> {
  const _NotificationTile({required this.notification});
  final ProviderNotification notification;
  @override
  Widget build(BuildContext context) {
    final language = Get.locale?.languageCode ?? 'ar';
    return Card(
      color: notification.isRead ? Colors.white : const Color(0xFFF0F5FA),
      child: ListTile(
        leading: Icon(
          notification.isRead
              ? Icons.notifications_none_rounded
              : Icons.notifications_active_rounded,
          color: notification.isRead ? const Color(0xFF667085) : AppTheme.gold,
        ),
        title: Text(
          notification.titleFor(language),
          style: TextStyle(
            fontWeight: notification.isRead ? FontWeight.w500 : FontWeight.w800,
          ),
        ),
        subtitle: Text(
          notification.messageFor(language),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: notification.isRead ? null : const Badge(),
        onTap: () async {
          await controller.markNotificationRead(notification);
          if (notification.bookingId?.isNotEmpty == true) {
            final booking = controller.bookings.firstWhereOrNull(
              (item) => item.id == notification.bookingId,
            );
            if (booking != null) {
              Get.toNamed(AppRoutes.bookingDetails, arguments: booking);
            }
          }
        },
      ),
    );
  }
}
