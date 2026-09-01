import 'package:get/get.dart';

import '../api/customer_api_service.dart';
import 'customer_store_controller.dart';

class CustomerDashboardController extends GetxController {
  final store = Get.find<CustomerStoreController>();
  final api = Get.find<CustomerApiService>();
  final isLoading = false.obs;
  final errorText = ''.obs;

  @override
  void onInit() {
    super.onInit();
    refreshDashboard();
  }

  Future<void> refreshDashboard() async {
    if (store.currentEmail.isEmpty) return;
    isLoading.value = true;
    errorText.value = '';
    try {
      final data = await api.dashboard(store.currentEmail);
      store.applyDashboard(data);
    } catch (_) {
      errorText.value = 'Using local dashboard data.';
    } finally {
      isLoading.value = false;
    }
  }
}
