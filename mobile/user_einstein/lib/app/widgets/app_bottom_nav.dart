import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../api/auth_session.dart';
import '../controllers/customer_store_controller.dart';
import '../routes/app_routes.dart';

enum NavTab { home, services, offers, documents, bookings, forms, profile, login }

/// Guests: Home · Services · Offers · Sign in.
/// Customers: Home · My file · Bookings · Applications · Account.
class AppBottomNav extends StatelessWidget {
  const AppBottomNav({super.key, required this.tab});

  final NavTab tab;

  @override
  Widget build(BuildContext context) {
    final store = Get.find<CustomerStoreController>();
    return Obx(() {
      store.locale.value;
      final loggedIn = Get.find<AuthSession>().isAuthenticated;
      final items = loggedIn
          ? <(NavTab, IconData, IconData, String, String)>[
              (NavTab.home, Icons.space_dashboard_outlined, Icons.space_dashboard_rounded, 'nav_home'.tr, AppRoutes.customerDashboard),
              (NavTab.documents, Icons.folder_open_outlined, Icons.folder_rounded, 'nav_documents'.tr, AppRoutes.documents),
              (NavTab.bookings, Icons.event_note_outlined, Icons.event_note_rounded, 'nav_bookings'.tr, AppRoutes.myBookings),
              (NavTab.forms, Icons.edit_document, Icons.edit_document, 'nav_forms'.tr, AppRoutes.forms),
              (NavTab.profile, Icons.person_outline_rounded, Icons.person_rounded, 'nav_profile'.tr, AppRoutes.profile),
            ]
          : <(NavTab, IconData, IconData, String, String)>[
              (NavTab.home, Icons.home_outlined, Icons.home_rounded, 'nav_home'.tr, AppRoutes.home),
              (NavTab.services, Icons.grid_view_outlined, Icons.grid_view_rounded, 'nav_services'.tr, AppRoutes.services),
              (NavTab.offers, Icons.local_offer_outlined, Icons.local_offer_rounded, 'nav_offers'.tr, AppRoutes.offers),
              (NavTab.login, Icons.login_rounded, Icons.login_rounded, 'sign_in'.tr, AppRoutes.login),
            ];
      final index = items.indexWhere((item) => item.$1 == tab);
      return DecoratedBox(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: Color(0xFFE6EAF2))),
        ),
        child: NavigationBar(
          selectedIndex: index < 0 ? 0 : index,
          destinations: [
            for (final item in items)
              NavigationDestination(
                icon: Icon(item.$2),
                selectedIcon: Icon(item.$3),
                label: item.$4,
              ),
          ],
          onDestinationSelected: (i) {
            if (items[i].$1 == tab) return;
            if (items[i].$1 == NavTab.login) {
              Get.toNamed(items[i].$5);
            } else {
              Get.offNamed(items[i].$5);
            }
          },
        ),
      );
    });
  }
}
