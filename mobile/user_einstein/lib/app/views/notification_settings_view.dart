import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/notification_settings_controller.dart';
import '../theme/app_colors.dart';

class NotificationSettingsView extends GetView<NotificationSettingsController> {
  const NotificationSettingsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Obx(() {
          controller.selectedLanguage.value;
          return Text('notification_settings'.tr);
        }),
        leading: IconButton(
          onPressed: Get.back,
          icon: const Icon(Icons.arrow_back_rounded),
        ),
      ),
      body: SafeArea(
        child: Obx(
          () => ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 30),
            children: [
              _HeaderCard(
                title: 'notification_header'.tr,
                subtitle: 'notification_subtitle'.tr,
              ),
              const SizedBox(height: 18),
              _SettingsGroup(
                title: 'topics'.tr,
                children: [
                  _SwitchRow(
                    title: 'booking_updates'.tr,
                    subtitle: 'booking_updates_subtitle'.tr,
                    value: controller.bookingUpdates.value,
                    onChanged: (value) =>
                        controller.bookingUpdates.value = value,
                  ),
                  _SwitchRow(
                    title: 'payment_updates'.tr,
                    subtitle: 'payment_updates_subtitle'.tr,
                    value: controller.paymentUpdates.value,
                    onChanged: (value) =>
                        controller.paymentUpdates.value = value,
                  ),
                  _SwitchRow(
                    title: 'reminders'.tr,
                    subtitle: 'reminders_subtitle'.tr,
                    value: controller.reminderUpdates.value,
                    onChanged: (value) =>
                        controller.reminderUpdates.value = value,
                  ),
                  _SwitchRow(
                    title: 'provider_updates'.tr,
                    subtitle: 'provider_updates_subtitle'.tr,
                    value: controller.providerUpdates.value,
                    onChanged: (value) =>
                        controller.providerUpdates.value = value,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _SettingsGroup(
                title: 'channels'.tr,
                children: [
                  _SwitchRow(
                    title: 'push_notifications'.tr,
                    subtitle: 'push_notifications_subtitle'.tr,
                    value: controller.pushEnabled.value,
                    onChanged: (value) => controller.pushEnabled.value = value,
                  ),
                  _SwitchRow(
                    title: 'email_notifications'.tr,
                    subtitle: 'email_notifications_subtitle'.tr,
                    value: controller.emailEnabled.value,
                    onChanged: (value) => controller.emailEnabled.value = value,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _ChoiceCard(
                title: 'language'.tr,
                value: _languageTitle(controller.selectedLanguage.value),
                icon: Icons.language_outlined,
                items: const ['Deutsch', 'English', 'Arabic'],
                itemLabel: _languageTitle,
                onSelected: controller.setLanguage,
              ),
              const SizedBox(height: 12),
              _ChoiceCard(
                title: 'reminder_timing'.tr,
                value: controller.reminderTiming.value,
                icon: Icons.schedule_outlined,
                items: const ['2h before', '24h before', '48h before'],
                onSelected: (value) => controller.reminderTiming.value = value,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeaderCard extends StatelessWidget {
  const _HeaderCard({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.navy,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.notifications_active_outlined,
            color: AppColors.gold,
            size: 32,
          ),
          const SizedBox(height: 14),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 29,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: const TextStyle(color: Color(0xFFDDE7F4), height: 1.4),
          ),
        ],
      ),
    );
  }
}

class _SettingsGroup extends StatelessWidget {
  const _SettingsGroup({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE9EEF6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
            child: Text(
              title,
              style: const TextStyle(
                color: AppColors.navy,
                fontSize: 18,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          ...children,
        ],
      ),
    );
  }
}

class _SwitchRow extends StatelessWidget {
  const _SwitchRow({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: SwitchListTile(
        value: value,
        activeThumbColor: AppColors.gold,
        onChanged: onChanged,
        title: Text(
          title,
          style: const TextStyle(
            color: AppColors.navy,
            fontWeight: FontWeight.w800,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(color: AppColors.muted),
        ),
      ),
    );
  }
}

class _ChoiceCard extends StatelessWidget {
  const _ChoiceCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.items,
    required this.onSelected,
    this.itemLabel,
  });

  final String title;
  final String value;
  final IconData icon;
  final List<String> items;
  final ValueChanged<String> onSelected;
  final String Function(String value)? itemLabel;

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      onSelected: onSelected,
      itemBuilder: (context) => items
          .map(
            (item) => PopupMenuItem(
              value: item,
              child: Text(itemLabel?.call(item) ?? item),
            ),
          )
          .toList(),
      child: Container(
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
                    title,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    value,
                    style: const TextStyle(
                      color: AppColors.navy,
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.expand_more_rounded, color: AppColors.muted),
          ],
        ),
      ),
    );
  }
}

String _languageTitle(String language) {
  return switch (language.toLowerCase()) {
    'arabic' || 'ar' => 'language_arabic'.tr,
    'english' || 'en' => 'language_english'.tr,
    _ => 'language_deutsch'.tr,
  };
}
