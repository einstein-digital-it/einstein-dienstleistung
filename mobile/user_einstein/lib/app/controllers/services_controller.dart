import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../api/customer_api_service.dart';
import '../models/service_item.dart';

class ServicesController extends GetxController {
  final api = Get.find<CustomerApiService>();
  final expandedId = ''.obs;
  final isLoading = false.obs;
  final errorText = ''.obs;

  final services = <ServiceItem>[
    const ServiceItem(
      id: 'forms',
      title: 'service_forms_title',
      description: 'service_forms_description',
      price: 'service_forms_price',
      icon: Icons.file_copy_outlined,
      color: Color(0xFF3B82F6),
      features: [
        'service_forms_feature_1',
        'service_forms_feature_2',
        'service_forms_feature_3',
        'service_forms_feature_4',
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
        'service_admin_feature_4',
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
        'service_coordination_feature_4',
      ],
    ),
    const ServiceItem(
      id: 'mercosur',
      title: 'service_mercosur_title',
      description: 'service_mercosur_description',
      price: 'service_mercosur_price',
      icon: Icons.public_outlined,
      color: Color(0xFF06B6D4),
      features: [
        'service_mercosur_feature_1',
        'service_mercosur_feature_2',
        'service_mercosur_feature_3',
        'service_mercosur_feature_4',
      ],
    ),
    const ServiceItem(
      id: 'tutoring',
      title: 'service_tutoring_title',
      description: 'service_tutoring_description',
      price: 'service_tutoring_price',
      icon: Icons.menu_book_outlined,
      color: Color(0xFFEC4899),
      features: [
        'service_tutoring_feature_1',
        'service_tutoring_feature_2',
        'service_tutoring_feature_3',
        'service_tutoring_feature_4',
      ],
    ),
    const ServiceItem(
      id: 'print',
      title: 'service_print_title',
      description: 'service_print_description',
      price: 'service_print_price',
      icon: Icons.print_outlined,
      color: Color(0xFFF97316),
      features: [
        'service_print_feature_1',
        'service_print_feature_2',
        'service_print_feature_3',
        'service_print_feature_4',
      ],
    ),
    const ServiceItem(
      id: 'office',
      title: 'service_office_title',
      description: 'service_office_description',
      price: 'service_office_price',
      icon: Icons.business_center_outlined,
      color: Color(0xFF64748B),
      features: [
        'service_office_feature_1',
        'service_office_feature_2',
        'service_office_feature_3',
        'service_office_feature_4',
      ],
    ),
  ].obs;

  @override
  void onInit() {
    super.onInit();
    loadServices();
  }

  Future<void> loadServices() async {
    isLoading.value = true;
    try {
      final remoteServices = await api.services();
      if (remoteServices.isNotEmpty) services.assignAll(remoteServices);
    } catch (_) {
      errorText.value = 'Using local services data.';
    } finally {
      isLoading.value = false;
    }
  }

  void toggle(String id) {
    expandedId.value = expandedId.value == id ? '' : id;
  }
}
