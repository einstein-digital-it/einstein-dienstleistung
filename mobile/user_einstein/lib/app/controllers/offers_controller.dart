import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../api/customer_api_service.dart';
import '../models/offer_package.dart';

class OffersController extends GetxController {
  final api = Get.find<CustomerApiService>();
  final selectedIndex = 0.obs;
  final isLoading = false.obs;
  final errorText = ''.obs;

  final packages = <OfferPackage>[
    const OfferPackage(
      title: 'Ganzheitliche Haus- & Familienbetreuung',
      subtitle: 'Full-Service',
      description: 'Vollstaendige Entlastung im Alltag mit zentraler Organisation aller Aufgaben.',
      icon: Icons.home_work_outlined,
      color: Color(0xFF3B82F6),
      features: [
        'Organisation aller Haushaltsarbeiten',
        'Reinigung, Pflege und Instandhaltung',
        'Koordination von Reparaturen',
        'Zentrale Betreuung ohne externe Dienstleister',
      ],
    ),
    const OfferPackage(
      title: 'Jahresbetreuung',
      subtitle: 'Ganzjahresmodell',
      description: 'Kontinuierliche, langfristige Begleitung fuer Familien und Berufstaetige.',
      icon: Icons.calendar_month_outlined,
      color: Color(0xFF10B981),
      features: [
        'Laufende Haushaltsorganisation',
        'Regelmaessige Wartung und Reparaturen',
        'Kontinuierliche buerokratische Begleitung',
        'Feste Ansprechpartner',
      ],
    ),
    const OfferPackage(
      title: 'Monatsbetreuung',
      subtitle: 'Flexibles Abonnement',
      description: 'Regelmaessige Unterstuetzung mit flexibler monatlicher Planung.',
      icon: Icons.calendar_view_month_outlined,
      color: Color(0xFF8B5CF6),
      features: [
        'Monatliche Alltagsorganisation',
        'Terminmanagement',
        'Koordination von Technik und Handwerk',
        'Begleitung schulischer Themen',
      ],
    ),
    const OfferPackage(
      title: 'Wochenbetreuung',
      subtitle: 'Kurzfristige Entlastung',
      description: 'Ideal fuer intensive Arbeitsphasen, Krankheit oder zeitlich begrenzte Projekte.',
      icon: Icons.event_available_outlined,
      color: Color(0xFFF59E0B),
      features: [
        'Kurzfristige Haushaltsorganisation',
        'Unterstuetzung bei Terminen',
        'Koordination notwendiger Dienstleistungen',
        'Strukturierte Entlastung',
      ],
    ),
  ].obs;

  @override
  void onInit() {
    super.onInit();
    loadOffers();
  }

  Future<void> loadOffers() async {
    isLoading.value = true;
    try {
      final remoteOffers = await api.offers();
      if (remoteOffers.isNotEmpty) packages.assignAll(remoteOffers);
    } catch (_) {
      errorText.value = 'Using local offers data.';
    } finally {
      isLoading.value = false;
    }
  }
}
