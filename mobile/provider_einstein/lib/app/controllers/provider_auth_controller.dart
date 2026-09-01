import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../api/api_exception.dart';
import '../api/provider_api_service.dart';
import '../api/provider_session.dart';
import '../routes/app_routes.dart';
import 'provider_store_controller.dart';

class ProviderAuthController extends GetxController {
  ProviderAuthController({
    required ProviderApiService api,
    required ProviderSession session,
    required ProviderStoreController store,
  }) : _api = api,
       _session = session,
       _store = store;

  final ProviderApiService _api;
  final ProviderSession _session;
  final ProviderStoreController _store;

  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final registerFullNameController = TextEditingController();
  final registerEmailController = TextEditingController();
  final registerPhoneController = TextEditingController();
  final registerPasswordController = TextEditingController();
  final isLoading = false.obs;
  final isRegistering = false.obs;
  final errorText = ''.obs;
  final registerErrorText = ''.obs;

  Future<void> login() async {
    final email = emailController.text.trim();
    final password = passwordController.text;
    if (!GetUtils.isEmail(email) || password.isEmpty) {
      errorText.value = 'login_validation'.tr;
      return;
    }

    isLoading.value = true;
    errorText.value = '';
    try {
      final result = await _api.login(email: email, password: password);
      final user = Map<String, dynamic>.from(result['user'] as Map);
      final provider = Map<String, dynamic>.from(result['provider'] as Map);
      final session = Map<String, dynamic>.from(result['session'] as Map);
      final token = session['token']?.toString();
      final providerId = (provider['id'] as num?)?.toInt();

      if (token == null ||
          token.isEmpty ||
          providerId == null ||
          user['role']?.toString() != 'provider' ||
          provider['login_enabled'] != true) {
        throw const ApiException('Provider account is not enabled.');
      }

      await _session.save(
        token: token,
        email: user['email']?.toString() ?? email,
        providerId: providerId,
      );
      await _store.refreshWorkspace();
      Get.snackbar('login_success_title'.tr, 'login_success_message'.tr);
      Get.offAllNamed(AppRoutes.dashboard);
    } on ApiException catch (error) {
      errorText.value = error.message;
      Get.snackbar('login_failed_title'.tr, error.message);
    } catch (_) {
      errorText.value = 'connection_error'.tr;
      Get.snackbar('login_failed_title'.tr, 'connection_error'.tr);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> logout() async {
    try {
      await _api.logout();
    } catch (_) {
      // A local logout must still succeed when the server is unreachable.
    }
    await _session.clear();
    _store.reset();
    Get.offAllNamed(AppRoutes.login);
    Get.snackbar('logout_title'.tr, 'logout_message'.tr);
  }

  Future<void> register() async {
    final fullName = registerFullNameController.text.trim();
    final email = registerEmailController.text.trim();
    final phone = registerPhoneController.text.trim();
    final password = registerPasswordController.text;

    if (fullName.isEmpty || !GetUtils.isEmail(email) || password.length < 6) {
      registerErrorText.value = 'provider_application_validation'.tr;
      return;
    }

    isRegistering.value = true;
    registerErrorText.value = '';
    try {
      await _api.register(
        fullName: fullName,
        email: email,
        password: password,
        phone: phone,
      );
      emailController.text = email;
      passwordController.clear();
      Get.offAllNamed(AppRoutes.login);
      Get.snackbar(
        'provider_application_sent_title'.tr,
        'provider_application_sent_message'.tr,
      );
    } on ApiException catch (error) {
      registerErrorText.value = error.message;
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      registerErrorText.value = 'connection_error'.tr;
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    } finally {
      isRegistering.value = false;
    }
  }

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    registerFullNameController.dispose();
    registerEmailController.dispose();
    registerPhoneController.dispose();
    registerPasswordController.dispose();
    super.onClose();
  }
}
