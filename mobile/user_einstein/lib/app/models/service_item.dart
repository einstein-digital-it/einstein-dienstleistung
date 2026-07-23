import 'package:flutter/material.dart';

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
    final id = (json['id'] ?? json['slug'] ?? json['category'] ?? json['name'] ?? '').toString();
    final title = (json['name'] ?? json['title_de'] ?? json['title_en'] ?? json['category'] ?? 'Service').toString();
    return ServiceItem(
      id: id.isEmpty ? title : id,
      title: title,
      description: (json['description'] ?? json['description_de'] ?? json['description_en'] ?? '').toString(),
      price: _price(json),
      icon: Icons.assignment_outlined,
      color: const Color(0xFF3B82F6),
      features: _features(json),
    );
  }
}

String _price(Map<String, dynamic> json) {
  final price = json['price'] ?? json['base_price'] ?? json['starting_price'];
  final unit = json['unit'] ?? json['price_unit'] ?? 'EUR';
  if (price == null) return 'Preis auf Anfrage';
  return '$price $unit';
}

List<String> _features(Map<String, dynamic> json) {
  final value = json['features'];
  if (value is List) return value.map((item) => item.toString()).toList();
  return const ['Mehrsprachige Kommunikation', 'Schnelle Umsetzung', 'Fester Ansprechpartner'];
}
