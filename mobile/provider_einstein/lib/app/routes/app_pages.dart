import 'package:get/get.dart';

import '../routes/app_routes.dart';
import '../views/provider_documents_view.dart';
import '../views/provider_earnings_view.dart';
import '../views/provider_booking_details_view.dart';
import '../views/provider_extensions_view.dart';
import '../views/provider_login_view.dart';
import '../views/provider_register_view.dart';
import '../views/provider_profile_view.dart';
import '../views/provider_notifications_view.dart';
import '../views/provider_task_tracker_view.dart';
import '../views/provider_workspace_view.dart';

class AppPages {
  static final pages = <GetPage<dynamic>>[
    GetPage(name: AppRoutes.login, page: ProviderLoginView.new),
    GetPage(name: AppRoutes.register, page: ProviderRegisterView.new),
    GetPage(name: AppRoutes.dashboard, page: ProviderWorkspaceView.new),
    GetPage(name: AppRoutes.profile, page: ProviderProfileView.new),
    GetPage(name: AppRoutes.documents, page: ProviderDocumentsView.new),
    GetPage(name: AppRoutes.taskTracker, page: ProviderTaskTrackerView.new),
    GetPage(name: AppRoutes.extensions, page: ProviderExtensionsView.new),
    GetPage(
      name: AppRoutes.bookingDetails,
      page: ProviderBookingDetailsView.new,
    ),
    GetPage(name: AppRoutes.notifications, page: ProviderNotificationsView.new),
    GetPage(name: AppRoutes.earnings, page: ProviderEarningsView.new),
  ];
}
