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
    this.category = '',
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
  final String category;

  bool get isDocumentSubscription => category == 'dokumentabo';

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    final status = (json['status'] ?? 'pending').toString();
    final paymentStatus = _paymentLabel((json['payment_status'] ?? 'unpaid').toString());
    final price = json['price'];
    return BookingItem(
      id: (json['id'] ?? json['booking_number'] ?? '').toString(),
      service: (json['service_name'] ?? json['service'] ?? json['category'] ?? 'Service').toString(),
      date: (json['date'] ?? '').toString(),
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

  BookingItem copyWith({
    String? id,
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
