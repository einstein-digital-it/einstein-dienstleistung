import 'package:get/get.dart';

import '../controllers/auth_controller.dart';
import '../controllers/booking_controller.dart';
import '../controllers/customer_dashboard_controller.dart';
import '../controllers/customer_clients_controller.dart';
import '../controllers/customer_service_controller.dart';
import '../controllers/home_controller.dart';
import '../controllers/my_bookings_controller.dart';
import '../controllers/notification_settings_controller.dart';
import '../controllers/notifications_controller.dart';
import '../controllers/offers_controller.dart';
import '../controllers/payment_controller.dart';
import '../controllers/profile_controller.dart';
import '../controllers/services_controller.dart';
import '../views/booking_view.dart';
import '../views/customer_dashboard_view.dart';
import '../views/customer_clients_view.dart';
import '../views/client_workspace_view.dart';
import '../views/customer_service_view.dart';
import '../views/home_view.dart';
import '../views/login_view.dart';
import '../views/my_bookings_view.dart';
import '../views/notification_settings_view.dart';
import '../views/notifications_view.dart';
import '../views/offers_view.dart';
import '../views/payment_view.dart';
import '../views/profile_view.dart';
import '../views/services_view.dart';
import 'app_routes.dart';
import 'customer_auth_middleware.dart';

abstract class AppPages {
  static final _customerAuthMiddleware = <GetMiddleware>[
    CustomerAuthMiddleware(),
  ];

  static final pages = <GetPage<dynamic>>[
    GetPage(
      name: AppRoutes.login,
      page: () => const LoginView(),
      binding: BindingsBuilder(() {
        Get.lazyPut<AuthController>(AuthController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.home,
      page: () => const HomeView(),
      binding: BindingsBuilder(() {
        Get.lazyPut<HomeController>(HomeController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.services,
      page: () => const ServicesView(),
      binding: BindingsBuilder(() {
        Get.lazyPut<ServicesController>(ServicesController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.offers,
      page: () => const OffersView(),
      binding: BindingsBuilder(() {
        Get.lazyPut<OffersController>(OffersController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.bookings,
      page: () => const BookingView(),
      middlewares: _customerAuthMiddleware,
      binding: BindingsBuilder(() {
        Get.lazyPut<BookingController>(BookingController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.myBookings,
      page: () => const MyBookingsView(),
      middlewares: _customerAuthMiddleware,
      binding: BindingsBuilder(() {
        Get.lazyPut<MyBookingsController>(MyBookingsController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.notifications,
      page: () => const NotificationsView(),
      middlewares: _customerAuthMiddleware,
      binding: BindingsBuilder(() {
        Get.lazyPut<NotificationsController>(NotificationsController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.payment,
      page: () => const PaymentView(),
      middlewares: _customerAuthMiddleware,
      binding: BindingsBuilder(() {
        Get.lazyPut<PaymentController>(PaymentController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.customerDashboard,
      page: () => const CustomerDashboardView(),
      middlewares: _customerAuthMiddleware,
      binding: BindingsBuilder(() {
        Get.lazyPut<CustomerDashboardController>(
          CustomerDashboardController.new,
        );
      }),
    ),
    GetPage(
      name: AppRoutes.notificationSettings,
      page: () => const NotificationSettingsView(),
      middlewares: _customerAuthMiddleware,
      binding: BindingsBuilder(() {
        Get.lazyPut<NotificationSettingsController>(
          NotificationSettingsController.new,
        );
      }),
    ),
    GetPage(
      name: AppRoutes.profile,
      page: () => const ProfileView(),
      middlewares: _customerAuthMiddleware,
      binding: BindingsBuilder(() {
        Get.lazyPut<ProfileController>(ProfileController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.customerService,
      page: () => const CustomerServiceView(),
      middlewares: _customerAuthMiddleware,
      binding: BindingsBuilder(() {
        Get.lazyPut<CustomerServiceController>(CustomerServiceController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.customerClients,
      page: () => const CustomerClientsView(),
      middlewares: _customerAuthMiddleware,
      binding: BindingsBuilder(() {
        Get.lazyPut<CustomerClientsController>(CustomerClientsController.new);
      }),
    ),
    GetPage(
      name: AppRoutes.clientWorkspace,
      page: () => const ClientWorkspaceView(),
      middlewares: _customerAuthMiddleware,
      binding: BindingsBuilder(() {
        Get.lazyPut<ClientWorkspaceController>(
          () => ClientWorkspaceController(clientId: Get.arguments.toString()),
        );
      }),
    ),
  ];
}
