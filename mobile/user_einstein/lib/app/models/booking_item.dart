import 'package:flutter/material.dart';

class BookingItem {
  const BookingItem({
    required this.id,
    required this.service,
    required this.date,
    required this.time,
    required this.address,
    required this.status,
    required this.paymentStatus,
    required this.price,
    required this.statusColor,
  });

  final String id;
  final String service;
  final String date;
  final String time;
  final String address;
  final String status;
  final String paymentStatus;
  final String price;
  final Color statusColor;
}
