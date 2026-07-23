import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/customer_dashboard_controller.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/einstein_logo.dart';
import '../widgets/primary_button.dart';

class CustomerDashboardView extends GetView<CustomerDashboardController> {
  const CustomerDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: const AppBottomNav(currentIndex: 0),
      body: SafeArea(
        child: Obx(
          () => CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _DashboardTopBar(name: controller.store.profile.value.fullName),
                      const SizedBox(height: 20),
                      _WelcomeCard(openPayments: controller.store.openPaymentsCount),
                      const SizedBox(height: 18),
                      const _QuickGrid(),
                      const SizedBox(height: 26),
                      Text('Upcoming bookings', style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                sliver: controller.store.upcomingBookings.isEmpty
                    ? const SliverToBoxAdapter(child: _EmptyPanel(message: 'No bookings yet. Start with a new booking.'))
                    : SliverList.separated(
                        itemCount: controller.store.upcomingBookings.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final item = controller.store.upcomingBookings[index];
                          return Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: const Color(0xFFE9EEF6)),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(color: item.statusColor.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(14)),
                                  child: Icon(Icons.calendar_today_outlined, color: item.statusColor),
                                ),
                                const SizedBox(width: 13),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(item.service, style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w900)),
                                      const SizedBox(height: 5),
                                      Text('${item.date} - ${item.time}', style: const TextStyle(color: AppColors.muted, fontSize: 12.5, fontWeight: FontWeight.w700)),
                                    ],
                                  ),
                                ),
                                Text(item.price, style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.w900)),
                              ],
                            ),
                          );
                        },
                      ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 30),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Recent notifications', style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 12),
                      if (controller.store.recentNotifications.isEmpty)
                        const _EmptyPanel(message: 'No notifications right now.')
                      else
                        ...controller.store.recentNotifications.map(
                          (item) => Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE9EEF6))),
                            child: Row(
                              children: [
                                Icon(item.icon, color: item.color),
                                const SizedBox(width: 12),
                                Expanded(child: Text(item.title, style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w800))),
                                const Icon(Icons.chevron_right, color: AppColors.muted),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DashboardTopBar extends StatelessWidget {
  const _DashboardTopBar({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const EinsteinLogo(size: 48),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Welcome back', style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w700)),
              Text(name, style: const TextStyle(color: AppColors.navy, fontSize: 18, fontWeight: FontWeight.w900)),
            ],
          ),
        ),
        IconButton(
          onPressed: () => Get.toNamed(AppRoutes.notifications),
          icon: const Icon(Icons.notifications_none_rounded, color: AppColors.navy),
          style: IconButton.styleFrom(backgroundColor: Colors.white),
        ),
      ],
    );
  }
}

class _WelcomeCard extends StatelessWidget {
  const _WelcomeCard({required this.openPayments});

  final int openPayments;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(color: AppColors.navy, borderRadius: BorderRadius.circular(24)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Customer Dashboard', style: TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          const Text('Track bookings, payments, notifications and your profile from one place.', style: TextStyle(color: Color(0xFFDDE7F4), height: 1.4)),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(child: PrimaryButton(label: 'New booking', icon: Icons.add_rounded, onPressed: () => Get.toNamed(AppRoutes.bookings))),
              const SizedBox(width: 10),
              Container(
                height: 58,
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(14)),
                alignment: Alignment.center,
                child: Text('$openPayments due', style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.w900)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QuickGrid extends StatelessWidget {
  const _QuickGrid();

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.calendar_month_outlined, 'My Bookings', AppRoutes.myBookings),
      (Icons.credit_card_outlined, 'Payment', AppRoutes.payment),
      (Icons.support_agent_outlined, 'Support', AppRoutes.customerService),
      (Icons.settings_outlined, 'Notifications', AppRoutes.notificationSettings),
      (Icons.person_outline, 'Profile', AppRoutes.profile),
    ];
    return GridView.builder(
      itemCount: items.length,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, mainAxisExtent: 104, crossAxisSpacing: 12, mainAxisSpacing: 12),
      itemBuilder: (context, index) {
        final item = items[index];
        return InkWell(
          borderRadius: BorderRadius.circular(17),
          onTap: () => Get.toNamed(item.$3),
          child: Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(17), border: Border.all(color: const Color(0xFFE9EEF6))),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(item.$1, color: AppColors.gold),
                const Spacer(),
                Text(item.$2, style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w900)),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _EmptyPanel extends StatelessWidget {
  const _EmptyPanel({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE9EEF6))),
      child: Text(message, style: const TextStyle(color: AppColors.muted, fontWeight: FontWeight.w700)),
    );
  }
}
