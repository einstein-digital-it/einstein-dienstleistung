import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'app/api/api_client.dart';
import 'app/api/auth_session.dart';
import 'app/api/customer_api_service.dart';
import 'app/controllers/customer_store_controller.dart';
import 'app/lang/app_translations.dart';
import 'app/routes/app_pages.dart';
import 'app/routes/app_routes.dart';
import 'app/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final session = AuthSession();
  await session.load();
  Get.put<AuthSession>(session, permanent: true);
  runApp(const EinsteinUserApp());
}

void _ensureDependencies() {
  if (Get.isRegistered<CustomerStoreController>()) return;

  final session = Get.isRegistered<AuthSession>()
      ? Get.find<AuthSession>()
      : Get.put<AuthSession>(AuthSession(), permanent: true);
  if (!Get.isRegistered<ApiClient>()) {
    Get.put<ApiClient>(ApiClient(session: session), permanent: true);
  }
  if (!Get.isRegistered<CustomerApiService>()) {
    Get.put<CustomerApiService>(
      CustomerApiService(Get.find<ApiClient>()),
      permanent: true,
    );
  }
  Get.put<CustomerStoreController>(CustomerStoreController(), permanent: true);
}

class EinsteinUserApp extends StatelessWidget {
  const EinsteinUserApp({super.key, this.initialLocale});

  final Locale? initialLocale;

  @override
  Widget build(BuildContext context) {
    _ensureDependencies();
    final store = Get.find<CustomerStoreController>();
    final session = Get.find<AuthSession>();
    final preferredLocale = initialLocale ?? Locale(session.localeCode);
    if (store.locale.value != preferredLocale) {
      store.locale.value = preferredLocale;
      Get.locale = preferredLocale;
      final language = preferredLocale.languageCode == 'ar'
          ? 'Arabic'
          : preferredLocale.languageCode == 'de'
          ? 'Deutsch'
          : 'English';
      store.selectedLanguage.value = language;
      store.profile.value = store.profile.value.copyWith(language: language);
    }

    return Obx(() {
      final locale = store.locale.value;
      return GetMaterialApp(
        title: 'EinStein Institut',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        translations: AppTranslations(),
        locale: locale,
        fallbackLocale: const Locale('ar'),
        builder: (context, child) {
          return Directionality(
            textDirection: locale.languageCode == 'ar'
                ? TextDirection.rtl
                : TextDirection.ltr,
            child: child ?? const SizedBox.shrink(),
          );
        },
        initialRoute: session.isAuthenticated
            ? AppRoutes.customerDashboard
            : AppRoutes.home,
        getPages: AppPages.pages,
      );
    });
  }
}
