import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/notifications_controller.dart';
import '../models/notification_item.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bottom_nav.dart';

class NotificationsView extends GetView<NotificationsController> {
  const NotificationsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: const AppBottomNav(currentIndex: 4),
      body: SafeArea(
        child: Obx(
          () => CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              'notifications'.tr,
                              style: Theme.of(context).textTheme.headlineMedium,
                            ),
                          ),
                          TextButton.icon(
                            onPressed: controller.markAllRead,
                            icon: const Icon(Icons.done_all_rounded, size: 18),
                            label: Text('read_all'.tr),
                          ),
                          IconButton(
                            onPressed: () =>
                                Get.toNamed(AppRoutes.notificationSettings),
                            icon: const Icon(
                              Icons.settings_outlined,
                              color: AppColors.navy,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${controller.unreadCount} neue Hinweise zu Buchungen, Zahlungen und Providern.',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 18),
                    ],
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                sliver: SliverList.separated(
                  itemCount: controller.notifications.length,
                  separatorBuilder: (context, index) =>
                      const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    return _NotificationCard(
                      item: controller.notifications[index],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  const _NotificationCard({required this.item});

  final NotificationItem item;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: item.unread ? const Color(0xFFFFFAF0) : Colors.white,
        borderRadius: BorderRadius.circular(17),
        border: Border.all(
          color: item.unread
              ? AppColors.gold.withValues(alpha: 0.42)
              : const Color(0xFFE9EEF6),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: item.color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(item.icon, color: item.color),
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        item.title,
                        style: const TextStyle(
                          color: AppColors.navy,
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    if (item.unread)
                      Container(
                        width: 9,
                        height: 9,
                        margin: const EdgeInsets.only(top: 5),
                        decoration: const BoxDecoration(
                          color: AppColors.gold,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 7),
                Text(
                  item.message,
                  style: const TextStyle(
                    color: AppColors.muted,
                    height: 1.35,
                    fontSize: 13.5,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  item.time,
                  style: const TextStyle(
                    color: Color(0xFF8EA0B7),
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
