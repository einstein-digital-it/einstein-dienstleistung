import 'package:flutter/material.dart';

class NotificationItem {
  const NotificationItem({
    required this.title,
    required this.message,
    required this.time,
    required this.icon,
    required this.color,
    this.unread = false,
  });

  final String title;
  final String message;
  final String time;
  final IconData icon;
  final Color color;
  final bool unread;
}
