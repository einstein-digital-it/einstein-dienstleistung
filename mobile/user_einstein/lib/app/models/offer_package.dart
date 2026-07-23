import 'package:flutter/material.dart';

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
    return OfferPackage(
      title: (json['title_de'] ?? json['title_en'] ?? json['title_ar'] ?? json['title'] ?? 'Offer').toString(),
      subtitle: (json['subtitle_de'] ?? json['subtitle_en'] ?? json['subtitle_ar'] ?? '').toString(),
      description: (json['desc_de'] ?? json['description_de'] ?? json['desc_en'] ?? json['description'] ?? '').toString(),
      icon: Icons.local_offer_outlined,
      color: const Color(0xFF3B82F6),
      features: _offerFeatures(json),
    );
  }
}

List<String> _offerFeatures(Map<String, dynamic> json) {
  final features = json['features'];
  if (features is Map && features['de'] is List) {
    return (features['de'] as List).map((item) => item.toString()).toList();
  }
  if (features is List) return features.map((item) => item.toString()).toList();
  return const ['Flexible Betreuung', 'Zentrale Koordination', 'Persoenliche Begleitung'];
}
