import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'app/api/api_client.dart';
import 'app/api/auth_session.dart';
import 'app/api/customer_api_service.dart';
import 'app/controllers/customer_store_controller.dart';
import 'app/routes/app_pages.dart';
import 'app/routes/app_routes.dart';
import 'app/theme/app_theme.dart';

void main() {
  runApp(const EinsteinUserApp());
}

class EinsteinUserApp extends StatelessWidget {
  const EinsteinUserApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'EinStein Institut',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      initialRoute: AppRoutes.login,
      initialBinding: BindingsBuilder(() {
        final session = AuthSession();
        Get.put<AuthSession>(session, permanent: true);
        Get.put<ApiClient>(ApiClient(session: session), permanent: true);
        Get.put<CustomerApiService>(CustomerApiService(Get.find<ApiClient>()), permanent: true);
        Get.put<CustomerStoreController>(CustomerStoreController(), permanent: true);
      }),
      getPages: AppPages.pages,
    );
  }
}
