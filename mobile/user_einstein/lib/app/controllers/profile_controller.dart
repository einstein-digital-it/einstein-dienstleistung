import 'package:get/get.dart';

import '../api/auth_session.dart';
import '../api/customer_api_service.dart';
import '../routes/app_routes.dart';
import 'customer_store_controller.dart';

class ProfileController extends GetxController {
  final store = Get.find<CustomerStoreController>();
  final api = Get.find<CustomerApiService>();
  final session = Get.find<AuthSession>();
  final isLoading = false.obs;
  final errorText = ''.obs;

  @override
  void onInit() {
    super.onInit();
    loadProfile();
  }

  String get fullName => store.profile.value.fullName;
  String get email => store.profile.value.email;
  String get phone => store.profile.value.phone;
  String get address => store.profile.value.address;
  String get language => store.profile.value.language;

  Future<void> loadProfile() async {
    if (store.currentEmail.isEmpty) return;
    try {
      final nextProfile = await api.profile(store.currentEmail);
      store.setProfile(nextProfile);
    } catch (_) {
      errorText.value = 'Using local profile data.';
    }
  }

  Future<void> updateProfile({
    required String fullName,
    required String phone,
    required String address,
    required String language,
  }) async {
    store.updateProfile(
      fullName: fullName,
      phone: phone,
      address: address,
      language: language,
    );
    try {
      final nextProfile = await api.updateProfile(store.profile.value);
      store.setProfile(nextProfile);
    } catch (_) {
      errorText.value = 'Profile saved locally until API is available.';
    }
  }

  Future<void> logout() async {
    try {
      await api.logout();
    } catch (_) {
      // Local logout remains available when the API is unreachable.
    }
    await session.clear();
    store.clearCustomerData();
    Get.snackbar('auth_success'.tr, 'logout_success'.tr);
    Get.offAllNamed(AppRoutes.login);
  }
}
