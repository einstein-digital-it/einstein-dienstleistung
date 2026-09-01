import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/customer_store_controller.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import 'einstein_logo.dart';

class PublicHeader extends StatelessWidget {
  const PublicHeader({super.key, this.showBack = false});

  final bool showBack;

  @override
  Widget build(BuildContext context) {
    final store = Get.find<CustomerStoreController>();
    return Obx(
      () => Row(
        children: [
          if (showBack)
            IconButton(
              tooltip: MaterialLocalizations.of(context).backButtonTooltip,
              onPressed: Get.back,
              icon: const Icon(Icons.arrow_back_rounded),
            )
          else
            const EinsteinLogo(size: 46),
          const Spacer(),
          TextButton.icon(
            onPressed: () => _showLanguageMenu(store),
            icon: const Icon(Icons.language_rounded, size: 19),
            label: Text(_shortLanguage(store.locale.value.languageCode)),
            style: TextButton.styleFrom(
              foregroundColor: AppColors.navy,
              textStyle: const TextStyle(fontWeight: FontWeight.w800),
            ),
          ),
          const SizedBox(width: 4),
          FilledButton(
            onPressed: () => Get.toNamed(AppRoutes.login),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.purple,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              minimumSize: const Size(0, 42),
            ),
            child: Text('sign_in'.tr),
          ),
        ],
      ),
    );
  }

  void _showLanguageMenu(CustomerStoreController store) {
    Get.bottomSheet(
      SafeArea(
        child: Container(
          color: Colors.white,
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('language'.tr, style: Get.textTheme.titleLarge),
              const SizedBox(height: 8),
              Obx(
                () => RadioGroup<String>(
                  groupValue: store.selectedLanguage.value,
                  onChanged: (value) {
                    if (value == null) return;
                    store.applyLanguage(value);
                    Get.back();
                  },
                  child: Column(
                    children: [
                      for (final option in const [
                        'Arabic',
                        'English',
                        'Deutsch',
                      ])
                        RadioListTile<String>(
                          value: option,
                          title: Text(_languageTitle(option)),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }
}

String _shortLanguage(String localeCode) {
  return switch (localeCode) {
    'ar' => 'AR',
    'de' => 'DE',
    _ => 'EN',
  };
}

String _languageTitle(String language) {
  return switch (language) {
    'Arabic' => 'language_arabic'.tr,
    'Deutsch' => 'language_deutsch'.tr,
    _ => 'language_english'.tr,
  };
}
