import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../routes/app_routes.dart';

class AuthController extends GetxController {
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

    isLoading.value = true;
    errorText.value = '';

    await Future<void>.delayed(const Duration(milliseconds: 450));
    isLoading.value = false;
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
