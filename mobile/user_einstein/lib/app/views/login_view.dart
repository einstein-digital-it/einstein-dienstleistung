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
      backgroundColor: AppColors.navyDeep,
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.heroGradient),
        child: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
            child: Container(
              width: double.infinity,
              constraints: const BoxConstraints(maxWidth: 560),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(26),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.25),
                    blurRadius: 40,
                    offset: const Offset(0, 18),
                  ),
                ],
              ),
              padding: const EdgeInsets.fromLTRB(22, 28, 22, 26),
              child: Obx(
                () => Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const EinsteinLogo(size: 76, withWordmark: true),
                    const SizedBox(height: 18),
                    if (controller.pendingEmail.value.isNotEmpty)
                      _VerifyCodeStep(controller: controller)
                    else ...[
                    Text(
                      'login_welcome'.tr,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColors.text,
                        fontSize: 25,
                        height: 1.3,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'login_subtitle'.tr,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColors.muted,
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 26),
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
                    const SizedBox(height: 16),
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
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
      ),
    );
  }
}

/// Second step of signing up: the 6-digit code from the email.
class _VerifyCodeStep extends StatelessWidget {
  const _VerifyCodeStep({required this.controller});

  final AuthController controller;

  @override
  Widget build(BuildContext context) {
    return Obx(
      () => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: const Color(0xFFF3E8FF),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.mark_email_read_outlined, color: Color(0xFF6D28D9), size: 28),
          ),
          const SizedBox(height: 14),
          Text(
            'verify_title'.tr,
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.text, fontSize: 24, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 10),
          Text(
            'verify_subtitle'.tr,
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.muted, fontSize: 15, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 4),
          Text(
            controller.pendingEmail.value,
            textAlign: TextAlign.center,
            textDirection: TextDirection.ltr,
            style: TextStyle(color: AppColors.text, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 22),
          TextField(
            key: const Key('verify_code_field'),
            controller: controller.codeController,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            textDirection: TextDirection.ltr,
            maxLength: 6,
            autofocus: true,
            autofillHints: const [AutofillHints.oneTimeCode],
            onSubmitted: (_) => controller.verifyCode(),
            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: 10),
            decoration: InputDecoration(
              counterText: '',
              hintText: 'verify_code'.tr,
              hintStyle: const TextStyle(fontSize: 15, letterSpacing: 0, fontWeight: FontWeight.w500),
              filled: true,
              fillColor: AppColors.input,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(13),
                borderSide: const BorderSide(color: Color(0xFFDAE5F4)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(13),
                borderSide: const BorderSide(color: Color(0xFFB5C7E5), width: 1.5),
              ),
            ),
          ),
          if (controller.errorText.value.isNotEmpty)
            _Note(text: controller.errorText.value, background: const Color(0xFFFFEFEF), color: const Color(0xFFB91C1C))
          else if (controller.noticeText.value.isNotEmpty)
            _Note(text: controller.noticeText.value, background: const Color(0xFFECFDF5), color: const Color(0xFF047857)),
          const SizedBox(height: 20),
          PrimaryButton(
            label: 'verify_submit'.tr,
            isLoading: controller.isLoading.value,
            onPressed: controller.verifyCode,
          ),
          const SizedBox(height: 12),
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            spacing: 8,
            children: [
              TextButton(
                onPressed: controller.resendSeconds.value > 0 ? null : controller.resendCode,
                child: Text(
                  controller.resendSeconds.value > 0
                      ? 'verify_resend_in'.trParams({'s': '${controller.resendSeconds.value}'})
                      : 'verify_resend'.tr,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
              TextButton(
                onPressed: controller.cancelVerification,
                child: Text(
                  'verify_other_email'.tr,
                  style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Note extends StatelessWidget {
  const _Note({required this.text, required this.background, required this.color});

  final String text;
  final Color background;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 14),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(color: background, borderRadius: BorderRadius.circular(10)),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: TextStyle(color: color, fontWeight: FontWeight.w700),
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
