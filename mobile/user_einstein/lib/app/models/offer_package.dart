import 'package:flutter/material.dart';
import 'package:get/get.dart';

class OfferPackage {
  const OfferPackage({
    required this.title,
    required this.subtitle,
    required this.description,
    required this.icon,
    required this.color,
    required this.features,
  });

  final String title;
  final String subtitle;
  final String description;
  final IconData icon;
  final Color color;
  final List<String> features;

  factory OfferPackage.fromJson(Map<String, dynamic> json) {
    final language = Get.locale?.languageCode ?? 'ar';
    return OfferPackage(
      title: _offerText(json, 'title', language, fallback: 'Offer'),
      subtitle: _offerText(json, 'subtitle', language),
      description: _offerText(
        json,
        'description',
        language,
        alternateField: 'desc',
      ),
      icon: Icons.local_offer_outlined,
      color: const Color(0xFF3B82F6),
      features: _offerFeatures(json),
    );
  }
}

String _offerText(
  Map<String, dynamic> json,
  String field,
  String language, {
  String? alternateField,
  String fallback = '',
}) {
  final alternate = alternateField;
  return (json['${field}_$language'] ??
          (alternate == null ? null : json['${alternate}_$language']) ??
          json[field] ??
          (alternate == null ? null : json[alternate]) ??
          json['${field}_en'] ??
          json['${field}_de'] ??
          json['${field}_ar'] ??
          fallback)
      .toString();
}

List<String> _offerFeatures(Map<String, dynamic> json) {
  final features = json['features'];
  final language = Get.locale?.languageCode ?? 'ar';
  if (features is Map && features[language] is List) {
    return (features[language] as List).map((item) => item.toString()).toList();
  }
  if (features is List) return features.map((item) => item.toString()).toList();
  return const [
    'Flexible support',
    'Central coordination',
    'Personal guidance',
  ];
}
