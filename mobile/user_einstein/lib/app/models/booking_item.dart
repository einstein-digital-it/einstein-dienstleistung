import 'package:flutter/material.dart';
import 'package:get/get.dart';

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
    this.category = '',
    String? number,
  }) : number = number ?? id;

  /// Database id, used in API paths.
  final String id;

  /// Booking number the customer sees (e.g. ES-20261025...).
  final String number;
  final String service;
  final String date;
  final String time;
  final String address;
  final String status;
  final String paymentStatus;
  final String price;
  final Color statusColor;
  final String category;

  bool get isDocumentSubscription => category == 'dokumentabo';

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    final status = (json['status'] ?? 'pending').toString();
    final paymentStatus = _paymentLabel((json['payment_status'] ?? 'unpaid').toString());
    final price = json['price'];
    final id = (json['id'] ?? json['booking_number'] ?? '').toString();
    return BookingItem(
      id: id,
      number: (json['booking_number'] ?? id).toString(),
      service: (json['service_name'] ?? json['service'] ?? json['category'] ?? 'Service').toString(),
      date: _date(json['date']),
      time: (json['time'] ?? '').toString(),
      address: (json['address'] ?? 'Online').toString(),
      status: _statusLabel(status),
      paymentStatus: paymentStatus,
      price: price == null ? '0 EUR' : '${_number(price)} EUR',
      statusColor: _statusColor(status, paymentStatus),
      category: (json['category'] ?? '').toString(),
    );
  }

  double get amountValue {
    final normalized = price.replaceAll(',', '.');
    final match = RegExp(r'(\d+(\.\d+)?)').firstMatch(normalized);
    return double.tryParse(match?.group(1) ?? '') ?? 0;
  }

  bool get isPaid => paymentStatus == 'Paid';

  /// Service name in the app language; the server stores it in German.
  String get displayService {
    final key = 'service_${category}_title';
    final translated = key.tr;
    return translated == key ? service : translated;
  }

  /// Translation keys for the status labels above.
  String get paymentStatusKey =>
      isPaid ? 'payment_status_paid' : 'payment_status_unpaid';
  String get statusKey => switch (status) {
    'Completed' => 'booking_status_completed',
    'Confirmed' => 'booking_status_confirmed',
    _ => 'booking_status_awaiting_payment',
  };

  BookingItem copyWith({
    String? id,
    String? number,
    String? service,
    String? date,
    String? time,
    String? address,
    String? status,
    String? paymentStatus,
    String? price,
    Color? statusColor,
    String? category,
  }) {
    return BookingItem(
      id: id ?? this.id,
      number: number ?? this.number,
      service: service ?? this.service,
      date: date ?? this.date,
      time: time ?? this.time,
      address: address ?? this.address,
      status: status ?? this.status,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      price: price ?? this.price,
      statusColor: statusColor ?? this.statusColor,
      category: category ?? this.category,
    );
  }
}

/// The API sends dates as "2026-10-26" or "2026-10-26T00:00:00.000000Z";
/// show them as "26.10.2026".
String _date(Object? value) {
  final raw = (value ?? '').toString();
  final parsed = DateTime.tryParse(raw);
  if (parsed == null) return raw;
  String two(int n) => n.toString().padLeft(2, '0');
  return '${two(parsed.day)}.${two(parsed.month)}.${parsed.year}';
}

String _number(Object value) {
  final number = double.tryParse(value.toString());
  if (number == null) return value.toString();
  return number == number.roundToDouble() ? number.toInt().toString() : number.toStringAsFixed(2);
}

String _paymentLabel(String value) {
  return switch (value.toLowerCase()) {
    'paid' || 'authorized' => 'Paid',
    _ => 'Unpaid',
  };
}

String _statusLabel(String value) {
  return switch (value.toLowerCase()) {
    'completed' => 'Completed',
    'confirmed' || 'in_progress' => 'Confirmed',
    _ => 'Awaiting payment',
  };
}

Color _statusColor(String status, String paymentStatus) {
  if (paymentStatus == 'Unpaid') return const Color(0xFFC9A227);
  return switch (status.toLowerCase()) {
    'completed' => const Color(0xFF3B82F6),
    _ => const Color(0xFF10B981),
  };
}
