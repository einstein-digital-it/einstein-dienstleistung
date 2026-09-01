import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/provider_auth_controller.dart';
import '../routes/app_routes.dart';
import '../theme/app_theme.dart';
import 'provider_workspace_widgets.dart';

class ProviderLoginView extends GetView<ProviderAuthController> {
  const ProviderLoginView({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(actions: const [ProviderLanguageMenu()]),
    body: SafeArea(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(
                  Icons.business_center_outlined,
                  size: 54,
                  color: AppTheme.gold,
                ),
                const SizedBox(height: 20),
                Text(
                  'provider_login_title'.tr,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: AppTheme.navy,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'provider_login_subtitle'.tr,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Color(0xFF667085)),
                ),
                const SizedBox(height: 32),
                TextField(
                  controller: controller.emailController,
                  keyboardType: TextInputType.emailAddress,
                  autofillHints: const [AutofillHints.username],
                  decoration: InputDecoration(
                    labelText: 'email'.tr,
                    prefixIcon: const Icon(Icons.mail_outline_rounded),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: controller.passwordController,
                  obscureText: true,
                  autofillHints: const [AutofillHints.password],
                  onSubmitted: (_) => controller.login(),
                  decoration: InputDecoration(
                    labelText: 'password'.tr,
                    prefixIcon: const Icon(Icons.lock_outline_rounded),
                  ),
                ),
                Obx(
                  () => controller.errorText.value.isEmpty
                      ? const SizedBox(height: 22)
                      : Padding(
                          padding: const EdgeInsets.only(top: 12),
                          child: Text(
                            controller.errorText.value,
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.redAccent),
                          ),
                        ),
                ),
                const SizedBox(height: 12),
                Obx(
                  () => FilledButton(
                    onPressed: controller.isLoading.value
                        ? null
                        : controller.login,
                    style: FilledButton.styleFrom(
                      backgroundColor: AppTheme.navy,
                      minimumSize: const Size.fromHeight(52),
                    ),
                    child: controller.isLoading.value
                        ? const SizedBox(
                            height: 22,
                            width: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text('sign_in'.tr),
                  ),
                ),
                const SizedBox(height: 8),
                TextButton.icon(
                  onPressed: () => Get.toNamed(AppRoutes.register),
                  icon: const Icon(Icons.person_add_alt_1_outlined),
                  label: Text('provider_apply'.tr),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}
