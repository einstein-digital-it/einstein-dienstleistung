import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../models/service_item.dart';

class ServicesController extends GetxController {
  final expandedId = ''.obs;

  final services = const <ServiceItem>[
    ServiceItem(
      id: 'forms',
      title: 'Behoerden & Formularhilfe',
      description: 'Unterstuetzung bei Behoerdenangelegenheiten, Formularen und Antraegen.',
      price: '40 EUR / Stunde',
      icon: Icons.file_copy_outlined,
      color: Color(0xFF3B82F6),
      features: [
        'Ausfuellen von Antraegen und Formularen',
        'Unterstuetzung bei Behoerdengaengen',
        'Vorbereitung von Unterlagen',
        'Erklaerung von Bescheiden',
      ],
    ),
    ServiceItem(
      id: 'admin',
      title: 'Administrative Dienstleistungen',
      description: 'Umfassende administrative Unterstuetzung fuer Verwaltungsaufgaben.',
      price: '40 EUR / Stunde',
      icon: Icons.assignment_outlined,
      color: Color(0xFF10B981),
      features: [
        'Dokumentenmanagement',
        'Korrespondenz und Schriftverkehr',
        'Terminkoordination',
        'Allgemeine Bueroarbeiten',
      ],
    ),
    ServiceItem(
      id: 'coordination',
      title: 'Koordinationsleistungen',
      description: 'Professionelle Koordination und Projektbetreuung fuer Ihre Vorhaben.',
      price: '30 EUR / Stunde',
      icon: Icons.settings_suggest_outlined,
      color: Color(0xFF8B5CF6),
      features: [
        'Projektkoordination',
        'Terminplanung und Ueberwachung',
        'Kommunikation mit Dienstleistern',
        'Qualitaetskontrolle',
      ],
    ),
    ServiceItem(
      id: 'mercosur',
      title: 'MERCOSUR (LATAM)',
      description: 'Dienstleistungen fuer lateinamerikanische Dokumente und Verfahren.',
      price: '150 EUR / Vorgang',
      icon: Icons.public_outlined,
      color: Color(0xFF06B6D4),
      features: [
        'Apostille und Legalisation',
        'Dokumentenuebersetzung',
        'Visumsangelegenheiten',
        'Anerkennung von Abschluessen',
      ],
    ),
    ServiceItem(
      id: 'tutoring',
      title: 'Nachhilfe / Lernunterstuetzung',
      description: 'Individuelle Lernbegleitung und Nachhilfe fuer alle Altersgruppen.',
      price: '25 EUR / Stunde',
      icon: Icons.menu_book_outlined,
      color: Color(0xFFEC4899),
      features: [
        'Einzelunterricht',
        'Gruppenunterricht',
        'Hausaufgabenbetreuung',
        'Pruefungsvorbereitung',
      ],
    ),
    ServiceItem(
      id: 'print',
      title: 'Druck- und Stempeldienstleistungen',
      description: 'Professionelle Druck- und Stempelservices fuer Ihre Unterlagen.',
      price: 'ab 1 EUR',
      icon: Icons.print_outlined,
      color: Color(0xFFF97316),
      features: [
        'Dokumentendruck',
        'Kopierservice',
        'Stempelherstellung',
        'Laminieren und Binden',
      ],
    ),
    ServiceItem(
      id: 'office',
      title: 'Buero- und Organisationsservice',
      description: 'Projektbezogene Buero- und Organisationsdienstleistungen.',
      price: '40 EUR / Stunde',
      icon: Icons.business_center_outlined,
      color: Color(0xFF64748B),
      features: [
        'E-Mail-Management',
        'Terminplanung',
        'Dokumentenerstellung',
        'Digitale Dokumentenorganisation',
      ],
    ),
  ];

  void toggle(String id) {
    expandedId.value = expandedId.value == id ? '' : id;
  }
}
