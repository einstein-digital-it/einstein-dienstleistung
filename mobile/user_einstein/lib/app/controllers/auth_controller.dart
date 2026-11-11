import 'dart:async';

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
  final codeController = TextEditingController();

  final isRegister = false.obs;
  final isLoading = false.obs;
  final errorText = ''.obs;

  /// Email waiting for its 6-digit code (after sign-up, or a login before confirming).
  final pendingEmail = ''.obs;
  final noticeText = ''.obs;
  final resendSeconds = 0.obs;
  Timer? _resendTimer;

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
          ? await api.register(
              name: name,
              email: email,
              password: password,
              language: Get.locale?.languageCode,
            )
          : await api.login(email: email, password: password);
      if (result['verification_required'] == true) {
        _askForCode(result['email']?.toString() ?? email);
        return;
      }
      await _signIn(result, email);
    } on ApiException catch (error) {
      if (error.code == 'email_not_verified') {
        final data = error.data;
        _askForCode(data is Map ? data['email']?.toString() ?? email : email);
        return;
      }
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

  Future<void> _signIn(Map<String, dynamic> result, String email) async {
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
  }

  void _askForCode(String email) {
    pendingEmail.value = email;
    codeController.clear();
    errorText.value = '';
    noticeText.value = '';
    _startResendTimer();
  }

  void _startResendTimer() {
    _resendTimer?.cancel();
    resendSeconds.value = 60;
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      resendSeconds.value--;
      if (resendSeconds.value <= 0) timer.cancel();
    });
  }

  void cancelVerification() {
    _resendTimer?.cancel();
    resendSeconds.value = 0;
    pendingEmail.value = '';
    errorText.value = '';
    noticeText.value = '';
  }

  Future<void> verifyCode() async {
    final code = codeController.text.trim();
    if (!RegExp(r'^\d{6}$').hasMatch(code)) {
      errorText.value = 'verify_err_code'.tr;
      return;
    }
    isLoading.value = true;
    errorText.value = '';
    final email = pendingEmail.value;
    try {
      await _signIn(await api.verifyEmail(email: email, code: code), email);
    } on ApiException catch (error) {
      errorText.value = switch (error.code) {
        'invalid_code' => 'verify_err_wrong'.tr,
        'expired' => 'verify_err_expired'.tr,
        'too_many' => 'verify_err_too_many'.tr,
        _ => error.message,
      };
      return;
    } catch (_) {
      errorText.value = 'auth_connection_error'.tr;
      return;
    } finally {
      isLoading.value = false;
    }

    cancelVerification();
    Get.snackbar('auth_success'.tr, 'register_success'.tr);
    Get.offAllNamed(AppRoutes.customerDashboard);
  }

  Future<void> resendCode() async {
    if (resendSeconds.value > 0) return;
    errorText.value = '';
    try {
      await api.resendVerification(pendingEmail.value);
      noticeText.value = 'verify_resent'.tr;
      _startResendTimer();
    } on ApiException catch (error) {
      errorText.value = error.message;
    } catch (_) {
      errorText.value = 'auth_connection_error'.tr;
    }
  }

  @override
  void onClose() {
    _resendTimer?.cancel();
    codeController.dispose();
    emailController.dispose();
    passwordController.dispose();
    nameController.dispose();
    super.onClose();
  }
}
