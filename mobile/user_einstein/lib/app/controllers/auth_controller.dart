import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../api/api_exception.dart';
import '../api/auth_session.dart';
import '../api/customer_api_service.dart';
import '../models/customer_profile.dart';
import '../routes/app_routes.dart';
import 'customer_store_controller.dart';

class AuthController extends GetxController {
  final store = Get.find<CustomerStoreController>();
  final api = Get.find<CustomerApiService>();
  final session = Get.find<AuthSession>();

  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final nameController = TextEditingController();

  final isRegister = false.obs;
  final isLoading = false.obs;
  final errorText = ''.obs;

  void toggleMode() {
    isRegister.toggle();
    errorText.value = '';
  }

  Future<void> submit() async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();
    final name = nameController.text.trim();

    if (isRegister.value && name.isEmpty) {
      errorText.value = 'Enter your name to create an account.';
      return;
    }

    if (email.isEmpty || password.isEmpty) {
      errorText.value = 'Enter your email and password to continue.';
      return;
    }

    if (!GetUtils.isEmail(email)) {
      errorText.value = 'Enter a valid email address.';
      return;
    }

    if (password.length < 6) {
      errorText.value = 'Password must contain at least 6 characters.';
      return;
    }

    isLoading.value = true;
    errorText.value = '';

    try {
      final result = isRegister.value
          ? await api.register(name: name, email: email, password: password)
          : await api.login(email: email, password: password);
      final user = Map<String, dynamic>.from(result['user'] as Map);
      final sessionData = Map<String, dynamic>.from(result['session'] as Map);
      final token = sessionData['token']?.toString();
      if (token == null || token.isEmpty) {
        throw const ApiException('Authentication token was not returned.');
      }
      await session.save(
        token: token,
        email: user['email']?.toString() ?? email,
      );
      store.profile.value = CustomerProfile.fromJson(user);
    } on ApiException catch (error) {
      errorText.value = error.message;
      Get.snackbar('auth_failed'.tr, error.message);
      return;
    } catch (_) {
      errorText.value = 'auth_connection_error'.tr;
      Get.snackbar('auth_failed'.tr, 'auth_connection_error'.tr);
      return;
    } finally {
      isLoading.value = false;
    }

    Get.snackbar(
      'auth_success'.tr,
      isRegister.value ? 'register_success'.tr : 'login_success'.tr,
    );
    Get.offAllNamed(AppRoutes.customerDashboard);
  }

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    nameController.dispose();
    super.onClose();
  }
}
