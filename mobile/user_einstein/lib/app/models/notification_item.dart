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

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    final type = (json['type'] ?? '').toString();
    return NotificationItem(
      title: _localized(json, 'title'),
      message: _localized(json, 'message'),
      time: (json['created_at'] ?? '').toString(),
      icon: _icon(type),
      color: _color(type),
      unread: json['is_read'] == false,
    );
  }
}

String _localized(Map<String, dynamic> json, String key) {
  return (json['${key}_de'] ?? json['${key}_en'] ?? json['${key}_ar'] ?? json[key] ?? '').toString();
}

IconData _icon(String type) {
  if (type.contains('payment')) return Icons.credit_card_outlined;
  if (type.contains('provider')) return Icons.person_search_outlined;
  if (type.contains('support')) return Icons.support_agent_outlined;
  return Icons.calendar_month_outlined;
}

Color _color(String type) {
  if (type.contains('payment')) return const Color(0xFF10B981);
  if (type.contains('provider')) return const Color(0xFF3B82F6);
  return const Color(0xFFC9A227);
}
