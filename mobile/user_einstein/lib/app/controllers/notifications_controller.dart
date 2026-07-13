import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../models/notification_item.dart';

class NotificationsController extends GetxController {
  final notifications = <NotificationItem>[
    const NotificationItem(
      title: 'New booking request received',
      message: 'Your forms assistance request ES-2048 has been received and is under review.',
      time: '8 min ago',
      icon: Icons.calendar_month_outlined,
      color: Color(0xFFC9A227),
      unread: true,
    ),
    const NotificationItem(
      title: 'Payment received',
      message: 'A payment of 85 EUR was recorded for your confirmed booking.',
      time: '42 min ago',
      icon: Icons.credit_card_outlined,
      color: Color(0xFF10B981),
      unread: true,
    ),
    const NotificationItem(
      title: 'Provider available',
      message: 'A provider is available for tutoring and learning support services.',
      time: '2 hours ago',
      icon: Icons.person_search_outlined,
      color: Color(0xFF3B82F6),
    ),
    const NotificationItem(
      title: 'Booking completed',
      message: 'Your secretariat booking was completed and the invoice was issued.',
      time: 'Yesterday',
      icon: Icons.check_circle_outline,
      color: Color(0xFF10B981),
    ),
  ].obs;

  int get unreadCount => notifications.where((item) => item.unread).length;

  void markAllRead() {
    final updated = notifications
        .map(
          (item) => NotificationItem(
            title: item.title,
            message: item.message,
            time: item.time,
            icon: item.icon,
            color: item.color,
          ),
        )
        .toList();
    notifications.assignAll(updated);
  }
}
