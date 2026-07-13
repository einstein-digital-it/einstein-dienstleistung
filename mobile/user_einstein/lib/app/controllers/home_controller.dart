import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../models/service_item.dart';

class HomeController extends GetxController {
  final selectedIndex = 0.obs;

  final services = const <ServiceItem>[
    ServiceItem(
      id: 'forms',
      title: 'Behoerden & Formularhilfe',
      description: 'Antragstellung, digitale Einreichung, Nachverfolgung und Abholung.',
      price: '40 EUR / Std.',
      icon: Icons.description_outlined,
      color: Color(0xFF3B82F6),
      features: ['Formulare', 'Unterlagen', 'Behoerdengaenge'],
    ),
    ServiceItem(
      id: 'admin',
      title: 'Administrative Dienstleistungen',
      description: 'Dokumentenmanagement, Korrespondenz und Terminkoordination.',
      price: '40 EUR / Std.',
      icon: Icons.assignment_outlined,
      color: Color(0xFF10B981),
      features: ['Dokumente', 'E-Mail', 'Termine'],
    ),
    ServiceItem(
      id: 'coordination',
      title: 'Koordinationsleistungen',
      description: 'Projektkoordination, Planung und Kommunikation mit Dienstleistern.',
      price: '30 EUR / Std.',
      icon: Icons.settings_suggest_outlined,
      color: Color(0xFF8B5CF6),
      features: ['Planung', 'Kommunikation', 'Kontrolle'],
    ),
    ServiceItem(
      id: 'office',
      title: 'Buero & Sekretariat',
      description: 'Professionelle Organisationshilfe vor Ort oder projektbezogen.',
      price: '45 EUR / Std.',
      icon: Icons.business_center_outlined,
      color: Color(0xFFF59E0B),
      features: ['Kalender', 'Sekretariat', 'Organisation'],
    ),
  ];

  final promises = const <String>[
    'Alles aus einer Hand',
    'Mehrsprachige Kommunikation',
    'Schnelle Umsetzung',
    'Fester Ansprechpartner',
  ];
}
