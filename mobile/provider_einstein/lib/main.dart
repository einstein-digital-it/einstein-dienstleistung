import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'app/api/api_client.dart';
import 'app/api/provider_api_service.dart';
import 'app/api/provider_session.dart';
import 'app/controllers/provider_auth_controller.dart';
import 'app/controllers/provider_store_controller.dart';
import 'app/lang/app_translations.dart';
import 'app/routes/app_pages.dart';
import 'app/routes/app_routes.dart';
import 'app/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final session = ProviderSession();
  try {
    await session.load().timeout(const Duration(seconds: 5));
  } catch (error) {
    debugPrint('Provider session restore skipped: $error');
  }

  Get.put<ProviderSession>(session, permanent: true);
  Get.put<ApiClient>(ApiClient(session: session), permanent: true);
  Get.put<ProviderApiService>(
    ProviderApiService(Get.find<ApiClient>()),
    permanent: true,
  );
  Get.put<ProviderStoreController>(
    ProviderStoreController(Get.find<ProviderApiService>()),
    permanent: true,
  );
  Get.put<ProviderAuthController>(
    ProviderAuthController(
      api: Get.find<ProviderApiService>(),
      session: session,
      store: Get.find<ProviderStoreController>(),
    ),
    permanent: true,
  );

  runApp(ProviderEinsteinApp(isAuthenticated: session.isAuthenticated));
}

class ProviderEinsteinApp extends StatelessWidget {
  const ProviderEinsteinApp({super.key, required this.isAuthenticated});

  final bool isAuthenticated;

  @override
  Widget build(BuildContext context) => GetMaterialApp(
    title: 'EinStein Provider',
    debugShowCheckedModeBanner: false,
    theme: AppTheme.light,
    translations: AppTranslations(),
    locale: const Locale('ar'),
    fallbackLocale: const Locale('en'),
    initialRoute: isAuthenticated ? AppRoutes.dashboard : AppRoutes.login,
    getPages: AppPages.pages,
    builder: (context, child) => Directionality(
      textDirection: Get.locale?.languageCode == 'ar'
          ? TextDirection.rtl
          : TextDirection.ltr,
      child: child ?? const SizedBox.shrink(),
    ),
  );
}
