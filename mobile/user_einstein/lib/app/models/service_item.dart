import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'vat.dart';

class ServiceItem {
  const ServiceItem({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.icon,
    required this.color,
    required this.features,
  });

  final String id;
  final String title;
  final String description;
  final String price;
  final IconData icon;
  final Color color;
  final List<String> features;

  factory ServiceItem.fromJson(Map<String, dynamic> json) {
    final id =
        (json['id'] ?? json['slug'] ?? json['category'] ?? json['name'] ?? '')
            .toString();
    final language = Get.locale?.languageCode ?? 'ar';
    final title = _localized(
      json,
      'title',
      language,
      fallback: json['name'] ?? json['category'] ?? 'Service',
    );
    return ServiceItem(
      id: id.isEmpty ? title : id,
      title: title,
      description: _localized(json, 'description', language),
      price: _price(json),
      icon: Icons.assignment_outlined,
      color: const Color(0xFF3B82F6),
      features: _features(json),
    );
  }
}

String _localized(
  Map<String, dynamic> json,
  String field,
  String language, {
  Object? fallback,
}) {
  return (json['${field}_$language'] ??
          json[field] ??
          json['${field}_en'] ??
          json['${field}_de'] ??
          json['${field}_ar'] ??
          fallback ??
          '')
      .toString();
}

String _price(Map<String, dynamic> json) {
  final price = json['price'] ?? json['base_price'] ?? json['starting_price'];
  final unit = json['unit'] ?? json['price_unit'] ?? 'EUR';
  if (price == null) return 'Price on request';
  // Server prices are net; customers see the gross price (PAngV).
  final net = num.tryParse(price.toString());
  if (net == null) return '$price $unit';
  return '${formatAmount(grossFromNet(net))} $unit ${'incl_vat'.tr}';
}

List<String> _features(Map<String, dynamic> json) {
  final value = json['features'];
  if (value is List) return value.map((item) => item.toString()).toList();
  return const [
    'Multilingual communication',
    'Quick delivery',
    'Dedicated contact',
  ];
}
