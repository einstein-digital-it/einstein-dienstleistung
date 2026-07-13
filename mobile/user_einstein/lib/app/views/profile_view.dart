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
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFE9EEF6))),
                child: Column(
                  children: [
                    const EinsteinLogo(size: 92),
                    const SizedBox(height: 18),
                    Text(controller.fullName.value, style: const TextStyle(color: AppColors.navy, fontSize: 24, fontWeight: FontWeight.w900)),
                    const SizedBox(height: 4),
                    Text(controller.email.value, style: const TextStyle(color: AppColors.muted, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 18),
                    PrimaryButton(label: 'Edit profile', icon: Icons.edit_outlined, onPressed: () {}),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              _ProfileField(icon: Icons.phone_outlined, label: 'Phone', value: controller.phone.value),
              _ProfileField(icon: Icons.location_on_outlined, label: 'Address', value: controller.address.value),
              _ProfileField(icon: Icons.language_outlined, label: 'Preferred language', value: controller.language.value),
              const SizedBox(height: 10),
              _ActionTile(icon: Icons.notifications_outlined, title: 'Notification settings', onTap: () => Get.toNamed(AppRoutes.notificationSettings)),
              _ActionTile(icon: Icons.support_agent_outlined, title: 'Customer service', onTap: () => Get.toNamed(AppRoutes.customerService)),
              _ActionTile(icon: Icons.logout_rounded, title: 'Logout', destructive: true, onTap: () => Get.offAllNamed(AppRoutes.login)),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileField extends StatelessWidget {
  const _ProfileField({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFE9EEF6))),
      child: Row(
        children: [
          Icon(icon, color: AppColors.gold),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: AppColors.muted, fontSize: 12, fontWeight: FontWeight.w800)),
                const SizedBox(height: 3),
                Text(value, style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w900)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  const _ActionTile({required this.icon, required this.title, required this.onTap, this.destructive = false});

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
      title: Text(title, style: TextStyle(color: color, fontWeight: FontWeight.w900)),
      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.muted),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      tileColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
    ).paddingOnly(bottom: 10);
  }
}
