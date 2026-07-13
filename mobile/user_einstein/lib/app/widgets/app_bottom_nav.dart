import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../routes/app_routes.dart';
import '../theme/app_colors.dart';

class AppBottomNav extends StatelessWidget {
  const AppBottomNav({super.key, required this.currentIndex});

  final int currentIndex;

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      selectedIndex: currentIndex,
      backgroundColor: Colors.white,
      indicatorColor: AppColors.goldSoft,
      destinations: const [
        NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
        NavigationDestination(icon: Icon(Icons.grid_view_outlined), selectedIcon: Icon(Icons.grid_view), label: 'Services'),
        NavigationDestination(icon: Icon(Icons.local_offer_outlined), selectedIcon: Icon(Icons.local_offer), label: 'Offers'),
        NavigationDestination(icon: Icon(Icons.calendar_month_outlined), selectedIcon: Icon(Icons.calendar_month), label: 'My'),
        NavigationDestination(icon: Icon(Icons.notifications_none_rounded), selectedIcon: Icon(Icons.notifications), label: 'Alerts'),
        NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
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
  }
}
