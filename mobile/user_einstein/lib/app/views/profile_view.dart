import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/profile_controller.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/einstein_logo.dart';
import '../widgets/primary_button.dart';

class ProfileView extends GetView<ProfileController> {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: const AppBottomNav(currentIndex: 5),
      body: SafeArea(
        child: Obx(
          () => ListView(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 30),
            children: [
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFE9EEF6)),
                ),
                child: Column(
                  children: [
                    const EinsteinLogo(size: 92),
                    const SizedBox(height: 18),
                    Text(
                      controller.fullName,
                      style: const TextStyle(
                        color: AppColors.navy,
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      controller.email,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 18),
                    PrimaryButton(
                      label: 'profile_edit'.tr,
                      icon: Icons.edit_outlined,
                      onPressed: () =>
                          _showEditProfileSheet(context, controller),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              _ProfileField(
                icon: Icons.phone_outlined,
                label: 'profile_phone'.tr,
                value: controller.phone,
              ),
              _ProfileField(
                icon: Icons.location_on_outlined,
                label: 'profile_address'.tr,
                value: controller.address,
              ),
              _ProfileField(
                icon: Icons.language_outlined,
                label: 'profile_language'.tr,
                value: _languageTitle(controller.language),
              ),
              const SizedBox(height: 10),
              _ActionTile(
                icon: Icons.notifications_outlined,
                title: 'profile_notification_settings'.tr,
                onTap: () => Get.toNamed(AppRoutes.notificationSettings),
              ),
              _ActionTile(
                icon: Icons.support_agent_outlined,
                title: 'profile_customer_service'.tr,
                onTap: () => Get.toNamed(AppRoutes.customerService),
              ),
              _ActionTile(
                icon: Icons.privacy_tip_outlined,
                title: 'profile_privacy'.tr,
                onTap: controller.openPrivacyPolicy,
              ),
              _ActionTile(
                icon: Icons.logout_rounded,
                title: 'profile_logout'.tr,
                destructive: true,
                onTap: () => controller.logout(),
              ),
              _ActionTile(
                icon: Icons.delete_forever_outlined,
                title: 'delete_account'.tr,
                destructive: true,
                onTap: () => _showDeleteAccountDialog(controller),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

void _showEditProfileSheet(BuildContext context, ProfileController controller) {
  final nameController = TextEditingController(text: controller.fullName);
  final phoneController = TextEditingController(text: controller.phone);
  final addressController = TextEditingController(text: controller.address);
  final language = controller.language.obs;

  Get.bottomSheet(
    SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Obx(
          () => Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'profile_edit'.tr,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              _EditField(
                label: 'profile_full_name'.tr,
                icon: Icons.person_outline,
                controller: nameController,
              ),
              const SizedBox(height: 10),
              _EditField(
                label: 'profile_phone'.tr,
                icon: Icons.phone_outlined,
                controller: phoneController,
              ),
              const SizedBox(height: 10),
              _EditField(
                label: 'profile_address'.tr,
                icon: Icons.location_on_outlined,
                controller: addressController,
              ),
              const SizedBox(height: 10),
              PopupMenuButton<String>(
                onSelected: (value) => language.value = value,
                itemBuilder: (context) => const ['Deutsch', 'English', 'Arabic']
                    .map(
                      (item) => PopupMenuItem(
                        value: item,
                        child: Text(_languageTitle(item)),
                      ),
                    )
                    .toList(),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.input,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFDAE5F4)),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.language_outlined,
                        color: AppColors.gold,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _languageTitle(language.value),
                          style: const TextStyle(
                            color: AppColors.navy,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      const Icon(
                        Icons.expand_more_rounded,
                        color: AppColors.muted,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                label: 'profile_save'.tr,
                icon: Icons.check_rounded,
                onPressed: () {
                  controller.updateProfile(
                    fullName: nameController.text,
                    phone: phoneController.text,
                    address: addressController.text,
                    language: language.value,
                  );
                  Get.back();
                },
              ),
            ],
          ),
        ),
      ),
    ),
    isScrollControlled: true,
  );
}

void _showDeleteAccountDialog(ProfileController controller) {
  final passwordController = TextEditingController();
  final errorText = ''.obs;
  final isDeleting = false.obs;

  Get.dialog(
    AlertDialog(
      title: Text('delete_account'.tr),
      content: Obx(
        () => Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('delete_account_text'.tr),
            const SizedBox(height: 14),
            TextField(
              controller: passwordController,
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'delete_account_password'.tr,
                prefixIcon: const Icon(Icons.lock_outline),
              ),
            ),
            if (errorText.value.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(
                errorText.value,
                style: const TextStyle(
                  color: Color(0xFFDC2626),
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(Get.overlayContext!).pop(),
          child: Text('cancel_back'.tr),
        ),
        Obx(
          () => TextButton(
            style: TextButton.styleFrom(
              foregroundColor: const Color(0xFFDC2626),
            ),
            onPressed: isDeleting.value
                ? null
                : () async {
                    if (passwordController.text.isEmpty) {
                      errorText.value = 'delete_account_wrong_password'.tr;
                      return;
                    }
                    isDeleting.value = true;
                    final error = await controller.deleteAccount(
                      passwordController.text,
                    );
                    isDeleting.value = false;
                    if (error != null) errorText.value = error;
                  },
            child: Text('delete_account_confirm'.tr),
          ),
        ),
      ],
    ),
  );
}

String _languageTitle(String language) {
  return switch (language.toLowerCase()) {
    'arabic' || 'ar' => 'language_arabic'.tr,
    'english' || 'en' => 'language_english'.tr,
    _ => 'language_deutsch'.tr,
  };
}

class _EditField extends StatelessWidget {
  const _EditField({
    required this.label,
    required this.icon,
    required this.controller,
  });

  final String label;
  final IconData icon;
  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        filled: true,
        fillColor: AppColors.input,
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFDAE5F4)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.gold),
        ),
      ),
    );
  }
}

class _ProfileField extends StatelessWidget {
  const _ProfileField({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE9EEF6)),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.gold),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    color: AppColors.muted,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value,
                  style: const TextStyle(
                    color: AppColors.navy,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  const _ActionTile({
    required this.icon,
    required this.title,
    required this.onTap,
    this.destructive = false,
  });

  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final bool destructive;

  @override
  Widget build(BuildContext context) {
    final color = destructive ? const Color(0xFFDC2626) : AppColors.navy;
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: color),
      title: Text(
        title,
        style: TextStyle(color: color, fontWeight: FontWeight.w900),
      ),
      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.muted),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      tileColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
    ).paddingOnly(bottom: 10);
  }
}
