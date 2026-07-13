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
}
