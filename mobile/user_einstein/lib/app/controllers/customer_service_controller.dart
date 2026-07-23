import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../api/customer_api_service.dart';
import '../models/support_request.dart';
import 'customer_store_controller.dart';

class CustomerServiceController extends GetxController {
  final store = Get.find<CustomerStoreController>();
  final api = Get.find<CustomerApiService>();

  final selectedType = 'callback'.obs;
  final message = ''.obs;
  final errorText = ''.obs;
  final isSubmitting = false.obs;
  final lastRequest = Rxn<SupportRequest>();
  final messageController = TextEditingController();

  final faqs = <String>[
    'Wie kann ich eine Buchung aendern?',
    'Wann muss ich bezahlen?',
    'Welche Dokumente soll ich hochladen?',
    'Wie erreiche ich den Support?',
  ].obs;

  List<SupportRequest> get supportRequests => store.supportRequests;

  @override
  void onInit() {
    super.onInit();
    loadSupport();
  }

  Future<void> loadSupport() async {
    try {
      final data = await api.customerSupport();
      final remoteFaqs = data['faqs'];
      if (remoteFaqs is List && remoteFaqs.isNotEmpty) {
        faqs.assignAll(
          remoteFaqs.map((item) {
            final map = Map<String, dynamic>.from(item as Map);
            return (map['question_de'] ?? map['question_en'] ?? map['question_ar'] ?? '').toString();
          }).where((item) => item.isNotEmpty),
        );
      }
    } catch (_) {
      errorText.value = 'Using local support data.';
    }
  }

  Future<void> submitRequest() async {
    final body = message.value.trim();
    if (body.isEmpty) {
      errorText.value = 'Please describe your request.';
      return;
    }

    isSubmitting.value = true;
    errorText.value = '';
    try {
      lastRequest.value = await api.createSupportRequest({
        'name': store.profile.value.fullName,
        'email': store.profile.value.email,
        'phone': store.profile.value.phone,
        'request_type': selectedType.value == 'question' ? 'general' : selectedType.value,
        'message': body,
      });
      store.supportRequests.insert(0, lastRequest.value!);
    } catch (_) {
      await Future<void>.delayed(const Duration(milliseconds: 350));
      lastRequest.value = store.createSupportRequest(
        type: selectedType.value,
        message: body,
      );
    }
    message.value = '';
    messageController.clear();
    isSubmitting.value = false;
  }

  @override
  void onClose() {
    messageController.dispose();
    super.onClose();
  }
}
