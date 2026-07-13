import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../models/booking_item.dart';

class MyBookingsController extends GetxController {
  final activeFilter = 'upcoming'.obs;

  final bookings = const <BookingItem>[
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
    BookingItem(
      id: 'ES-2031',
      service: 'Nachhilfe / Lernunterstuetzung',
      date: '28 May 2026',
      time: '16:00',
      address: 'Offenbach',
      status: 'Completed',
      paymentStatus: 'Paid',
      price: '60 EUR',
      statusColor: Color(0xFF3B82F6),
    ),
  ];
}
