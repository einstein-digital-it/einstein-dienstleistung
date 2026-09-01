import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/provider_auth_controller.dart';
import '../theme/app_theme.dart';
import 'provider_workspace_widgets.dart';

class ProviderRegisterView extends GetView<ProviderAuthController> {
  const ProviderRegisterView({super.key});

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
                  'provider_application_title'.tr,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: AppTheme.navy,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'provider_application_subtitle'.tr,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Color(0xFF667085)),
                ),
                const SizedBox(height: 28),
                TextField(
                  controller: controller.registerFullNameController,
                  textInputAction: TextInputAction.next,
                  decoration: InputDecoration(
                    labelText: 'full_name'.tr,
                    prefixIcon: const Icon(Icons.person_outline_rounded),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: controller.registerPhoneController,
                  keyboardType: TextInputType.phone,
                  textInputAction: TextInputAction.next,
                  decoration: InputDecoration(
                    labelText: 'phone'.tr,
                    prefixIcon: const Icon(Icons.phone_outlined),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: controller.registerEmailController,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  autofillHints: const [AutofillHints.email],
                  decoration: InputDecoration(
                    labelText: 'email'.tr,
                    prefixIcon: const Icon(Icons.mail_outline_rounded),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: controller.registerPasswordController,
                  obscureText: true,
                  onSubmitted: (_) => controller.register(),
                  decoration: InputDecoration(
                    labelText: 'password'.tr,
                    prefixIcon: const Icon(Icons.lock_outline_rounded),
                  ),
                ),
                Obx(
                  () => controller.registerErrorText.value.isEmpty
                      ? const SizedBox(height: 22)
                      : Padding(
                          padding: const EdgeInsets.only(top: 12),
                          child: Text(
                            controller.registerErrorText.value,
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.redAccent),
                          ),
                        ),
                ),
                const SizedBox(height: 12),
                Obx(
                  () => FilledButton(
                    onPressed: controller.isRegistering.value
                        ? null
                        : controller.register,
                    style: FilledButton.styleFrom(
                      backgroundColor: AppTheme.navy,
                      minimumSize: const Size.fromHeight(52),
                    ),
                    child: controller.isRegistering.value
                        ? const SizedBox(
                            height: 22,
                            width: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text('submit_application'.tr),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}
