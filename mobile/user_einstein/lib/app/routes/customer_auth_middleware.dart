import 'package:flutter/widgets.dart';
import 'package:get/get.dart';

import '../api/auth_session.dart';
import 'app_routes.dart';

class CustomerAuthMiddleware extends GetMiddleware {
  @override
  RouteSettings? redirect(String? route) {
    final session = Get.find<AuthSession>();
    if (session.isAuthenticated) return null;

    return const RouteSettings(name: AppRoutes.login);
  }
}
