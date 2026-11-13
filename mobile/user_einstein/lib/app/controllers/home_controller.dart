import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../api/customer_api_service.dart';
import '../models/service_item.dart';

class HomeController extends GetxController {
  final selectedIndex = 0.obs;

  final services = <ServiceItem>[
    const ServiceItem(
      id: 'forms',
      title: 'service_forms_title',
      description: 'service_forms_description',
      price: 'service_forms_price',
      icon: Icons.description_outlined,
      color: Color(0xFF3B82F6),
      features: [
        'service_forms_feature_1',
        'service_forms_feature_2',
        'service_forms_feature_3',
      ],
    ),
    const ServiceItem(
      id: 'admin',
      title: 'service_admin_title',
      description: 'service_admin_description',
      price: 'service_admin_price',
      icon: Icons.assignment_outlined,
      color: Color(0xFF10B981),
      features: [
        'service_admin_feature_1',
        'service_admin_feature_2',
        'service_admin_feature_3',
      ],
    ),
    const ServiceItem(
      id: 'coordination',
      title: 'service_coordination_title',
      description: 'service_coordination_description',
      price: 'service_coordination_price',
      icon: Icons.settings_suggest_outlined,
      color: Color(0xFF8B5CF6),
      features: [
        'service_coordination_feature_1',
        'service_coordination_feature_2',
        'service_coordination_feature_3',
      ],
    ),
    const ServiceItem(
      id: 'office',
      title: 'service_office_title',
      description: 'service_office_description',
      price: 'service_office_price',
      icon: Icons.business_center_outlined,
      color: Color(0xFFF59E0B),
      features: [
        'service_office_feature_1',
        'service_office_feature_2',
        'service_office_feature_3',
      ],
    ),
  ].obs;

  final promises = const <String>[
    'promise_all_in_one',
    'promise_multilingual',
    'promise_fast',
    'promise_contact',
  ];

  @override
  void onInit() {
    super.onInit();
    _hideRemovedServices();
  }

  /// Cards the admin deleted or switched off in "Dienste verwalten" disappear here too.
  /// Without a connection all cards stay.
  Future<void> _hideRemovedServices() async {
    if (!Get.isRegistered<CustomerApiService>()) return;
    try {
      final remote = await Get.find<CustomerApiService>().services(
        local: {for (final service in services) service.id: service},
      );
      if (remote.isEmpty) return;
      final byId = {for (final service in remote) service.id: service};
      services.assignAll([
        for (final service in services)
          if (byId.containsKey(service.id)) byId[service.id]!,
      ]);
    } catch (_) {}
  }
}
