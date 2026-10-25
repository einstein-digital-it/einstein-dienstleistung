import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../controllers/auth_controller.dart';
import '../theme/app_colors.dart';
import '../widgets/einstein_logo.dart';
import '../widgets/primary_button.dart';

class LoginView extends GetView<AuthController> {
  const LoginView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
            child: Container(
              width: double.infinity,
              constraints: const BoxConstraints(maxWidth: 560),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: const Border(
                  top: BorderSide(color: Color(0xFFDBE7F5), width: 5),
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F172A).withValues(alpha: 0.12),
                    blurRadius: 70,
                    offset: const Offset(0, 22),
                  ),
                ],
              ),
              padding: const EdgeInsets.fromLTRB(22, 48, 22, 34),
              child: Obx(
                () => Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const EinsteinLogo(size: 122),
                    const SizedBox(height: 34),
                    Text(
                      'login_welcome'.tr,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColors.text,
                        fontSize: 36,
                        height: 1.16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'login_subtitle'.tr,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColors.muted,
                        fontSize: 19,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 40),
                    if (controller.isRegister.value) ...[
                      _AuthField(
                        label: 'name'.tr,
                        controller: controller.nameController,
                        icon: Icons.person_outline,
                      ),
                      const SizedBox(height: 24),
                    ],
                    _AuthField(
                      label: 'email'.tr,
                      controller: controller.emailController,
                      icon: Icons.mail_outline,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 24),
                    _AuthField(
                      label: 'password'.tr,
                      controller: controller.passwordController,
                      icon: Icons.lock_outline,
                      obscureText: true,
                    ),
                    if (controller.errorText.value.isNotEmpty) ...[
                      const SizedBox(height: 18),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFEFEF),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          controller.errorText.value,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Color(0xFFB91C1C),
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),
                    PrimaryButton(
                      label: controller.isRegister.value
                          ? 'create_account'.tr
                          : 'sign_in'.tr,
                      dark: true,
                      isLoading: controller.isLoading.value,
                      onPressed: controller.submit,
                    ),
                    const SizedBox(height: 17),
                    Row(
                      children: [
                        TextButton(
                          onPressed: () => launchUrl(
                            Uri.parse(
                              'mailto:info@einsteindienstleistung.de?subject=Passwort%20zur%C3%BCcksetzen',
                            ),
                          ),
                          child: Text(
                            'forgot_password'.tr,
                            style: TextStyle(
                              color: AppColors.muted,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        const Spacer(),
                        TextButton(
                          onPressed: controller.toggleMode,
                          child: Text(
                            controller.isRegister.value
                                ? 'sign_in'.tr
                                : 'sign_up'.tr,
                            style: const TextStyle(
                              color: AppColors.text,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}




class _AuthField extends StatelessWidget {
  const _AuthField({
    required this.label,
    required this.controller,
    required this.icon,
    this.obscureText = false,
    this.keyboardType,
  });

  final String label;
  final TextEditingController controller;
  final IconData icon;
  final bool obscureText;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF334155),
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            filled: true,
            fillColor: AppColors.input,
            prefixIcon: Icon(icon, color: const Color(0xFF8EA0B7)),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 18,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(13),
              borderSide: const BorderSide(color: Color(0xFFDAE5F4)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(13),
              borderSide: const BorderSide(
                color: Color(0xFFB5C7E5),
                width: 1.5,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
