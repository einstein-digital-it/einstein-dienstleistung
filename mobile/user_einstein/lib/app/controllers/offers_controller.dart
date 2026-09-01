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
      title: 'offer_full_title',
      subtitle: 'offer_full_subtitle',
      description: 'offer_full_description',
      icon: Icons.home_work_outlined,
      color: Color(0xFF3B82F6),
      features: [
        'offer_full_feature_1',
        'offer_full_feature_2',
        'offer_full_feature_3',
        'offer_full_feature_4',
      ],
    ),
    const OfferPackage(
      title: 'offer_year_title',
      subtitle: 'offer_year_subtitle',
      description: 'offer_year_description',
      icon: Icons.calendar_month_outlined,
      color: Color(0xFF10B981),
      features: [
        'offer_year_feature_1',
        'offer_year_feature_2',
        'offer_year_feature_3',
        'offer_year_feature_4',
      ],
    ),
    const OfferPackage(
      title: 'offer_month_title',
      subtitle: 'offer_month_subtitle',
      description: 'offer_month_description',
      icon: Icons.calendar_view_month_outlined,
      color: Color(0xFF8B5CF6),
      features: [
        'offer_month_feature_1',
        'offer_month_feature_2',
        'offer_month_feature_3',
        'offer_month_feature_4',
      ],
    ),
    const OfferPackage(
      title: 'offer_week_title',
      subtitle: 'offer_week_subtitle',
      description: 'offer_week_description',
      icon: Icons.event_available_outlined,
      color: Color(0xFFF59E0B),
      features: [
        'offer_week_feature_1',
        'offer_week_feature_2',
        'offer_week_feature_3',
        'offer_week_feature_4',
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
