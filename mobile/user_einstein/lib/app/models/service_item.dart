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

  /// A row of GET public/services ("Dienste verwalten"). The category is the id, so booking
  /// keeps working. [local] is the built-in card for that category: its icon, colour and price
  /// stay, and its translated texts are used where the database has no text in this language.
  factory ServiceItem.fromJson(
    Map<String, dynamic> json, {
    ServiceItem? local,
  }) {
    final id =
        (json['category'] ?? json['slug'] ?? json['id'] ?? json['name'] ?? '')
            .toString();
    final language = Get.locale?.languageCode ?? 'ar';
    final title =
        _text(json, 'name', language) ??
        local?.title ??
        _localized(
          json,
          'title',
          language,
          fallback: json['name'] ?? json['category'] ?? 'Service',
        );
    final features = _featuresFor(json, language);
    return ServiceItem(
      id: id.isEmpty ? title : id,
      title: title,
      description:
          _text(json, 'description', language) ??
          local?.description ??
          _localized(json, 'description', language),
      price: local?.price ?? _price(json),
      icon: local?.icon ?? Icons.assignment_outlined,
      color: local?.color ?? const Color(0xFF3B82F6),
      features: features.isNotEmpty
          ? features
          : (local?.features ?? _features(json)),
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

/// The text in this language only (no fallback to another language).
String? _text(Map<String, dynamic> json, String field, String language) {
  final value = json['${field}_$language'];
  if (value == null || value.toString().trim().isEmpty) return null;
  return value.toString();
}

/// features is {"de": ["…"], "ar": [...], ...}.
List<String> _featuresFor(Map<String, dynamic> json, String language) {
  final value = json['features'];
  if (value is! Map) return const [];
  final list = value[language];
  if (list is! List) return const [];
  return list
      .map((item) => item.toString())
      .where((item) => item.trim().isNotEmpty)
      .toList();
}

String _price(Map<String, dynamic> json) {
  final price =
      json['price'] ??
      json['base_price'] ??
      json['starting_price'] ??
      json['price_from'];
  final unit = json['unit'] ?? 'EUR';
  // "Dienste verwalten" stores the unit as a key: hour, service, visit, day, month
  final per = json['price_unit'] == null ? '' : ' / ${json['price_unit']}';
  if (price == null) return 'Price on request';
  // Server prices are net; customers see the gross price (PAngV).
  final net = num.tryParse(price.toString());
  if (net == null) return '$price $unit$per';
  return '${formatAmount(grossFromNet(net))} $unit$per ${'incl_vat'.tr}';
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
