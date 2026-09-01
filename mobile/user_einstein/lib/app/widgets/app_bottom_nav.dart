import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/customer_store_controller.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';

class AppBottomNav extends StatelessWidget {
  const AppBottomNav({super.key, required this.currentIndex});

  final int currentIndex;

  @override
  Widget build(BuildContext context) {
    final store = Get.find<CustomerStoreController>();
    return Obx(() {
      store.locale.value;
      return NavigationBar(
        selectedIndex: currentIndex,
        backgroundColor: Colors.white,
        indicatorColor: AppColors.goldSoft,
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home),
            label: 'nav_home'.tr,
          ),
          NavigationDestination(
            icon: const Icon(Icons.grid_view_outlined),
            selectedIcon: const Icon(Icons.grid_view),
            label: 'nav_services'.tr,
          ),
          NavigationDestination(
            icon: const Icon(Icons.local_offer_outlined),
            selectedIcon: const Icon(Icons.local_offer),
            label: 'nav_offers'.tr,
          ),
          NavigationDestination(
            icon: const Icon(Icons.calendar_month_outlined),
            selectedIcon: const Icon(Icons.calendar_month),
            label: 'nav_my'.tr,
          ),
          NavigationDestination(
            icon: const Icon(Icons.notifications_none_rounded),
            selectedIcon: const Icon(Icons.notifications),
            label: 'nav_alerts'.tr,
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline),
            selectedIcon: const Icon(Icons.person),
            label: 'nav_profile'.tr,
          ),
        ],
        onDestinationSelected: (index) {
          if (index == 0) Get.offNamed(AppRoutes.home);
          if (index == 1) Get.offNamed(AppRoutes.services);
          if (index == 2) Get.offNamed(AppRoutes.offers);
          if (index == 3) Get.offNamed(AppRoutes.myBookings);
          if (index == 4) Get.offNamed(AppRoutes.notifications);
          if (index == 5) Get.offNamed(AppRoutes.profile);
        },
      );
    });
  }
}
