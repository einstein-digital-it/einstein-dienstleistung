import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../models/booking_item.dart';
import '../models/notification_item.dart';

class CustomerDashboardController extends GetxController {
  final openPayments = 1.obs;

  final upcomingBookings = const <BookingItem>[
    BookingItem(
      id: 'ES-2048',
      service: 'Behoerden & Formularhilfe',
      date: '12 Jun 2026',
      time: '10:30',
      address: 'Frankfurt',
      status: 'Confirmed',
      paymentStatus: 'Paid',
      price: '85 EUR',
      statusColor: Color(0xFF10B981),
    ),
    BookingItem(
      id: 'ES-2049',
      service: 'Buero & Sekretariat',
      date: '15 Jun 2026',
      time: '13:00',
      address: 'Online',
      status: 'Awaiting payment',
      paymentStatus: 'Unpaid',
      price: '120 EUR',
      statusColor: Color(0xFFC9A227),
    ),
  ];

  final recentNotifications = const <NotificationItem>[
    NotificationItem(
      title: 'Payment reminder',
      message: 'Your booking ES-2049 is waiting for payment.',
      time: 'Today',
      icon: Icons.credit_card_outlined,
      color: Color(0xFFC9A227),
      unread: true,
    ),
    NotificationItem(
      title: 'Booking confirmed',
      message: 'Your forms assistance booking has been confirmed.',
      time: 'Yesterday',
      icon: Icons.check_circle_outline,
      color: Color(0xFF10B981),
    ),
  ];
}
