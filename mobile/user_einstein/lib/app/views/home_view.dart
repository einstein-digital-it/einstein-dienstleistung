import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/home_controller.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/einstein_logo.dart';
import '../widgets/primary_button.dart';
import '../widgets/service_card.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: const AppBottomNav(currentIndex: 0),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const _HomeTopBar(),
                    const SizedBox(height: 22),
                    _HeroPanel(onBook: () => Get.toNamed(AppRoutes.bookings)),
                    const SizedBox(height: 24),
                    const _QuickActions(),
                    const SizedBox(height: 24),
                    _SectionHeading(
                      title: 'home_promise'.tr,
                      subtitle: 'home_promise_subtitle'.tr,
                    ),
                    const SizedBox(height: 14),
                    _PromiseGrid(promises: controller.promises),
                    const SizedBox(height: 28),
                    _SectionHeading(
                      title: 'home_services'.tr,
                      subtitle: 'home_services_subtitle'.tr,
                    ),
                    const SizedBox(height: 14),
                  ],
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 30),
              sliver: SliverList.separated(
                itemCount: controller.services.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  return ServiceCard(service: controller.services[index]);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HomeTopBar extends StatelessWidget {
  const _HomeTopBar();

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
              Text(
                'EinStein Institut',
                style: TextStyle(
                  color: AppColors.navy,
                  fontWeight: FontWeight.w900,
                  fontSize: 18,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'home_organisation'.tr,
                style: const TextStyle(
                  color: AppColors.muted,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
        IconButton(
          onPressed: () => Get.toNamed(AppRoutes.notifications),
          icon: const Icon(
            Icons.notifications_none_rounded,
            color: AppColors.navy,
          ),
          style: IconButton.styleFrom(backgroundColor: Colors.white),
        ),
      ],
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions();

  @override
  Widget build(BuildContext context) {
    final actions = [
      (Icons.dashboard_outlined, 'dashboard'.tr, AppRoutes.customerDashboard),
      (Icons.local_offer_outlined, 'nav_offers'.tr, AppRoutes.offers),
      (Icons.support_agent_outlined, 'support'.tr, AppRoutes.customerService),
    ];

    return Row(
      children: actions
          .map(
            (action) => Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => Get.toNamed(action.$3),
                  child: Container(
                    height: 92,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE9EEF6)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(action.$1, color: AppColors.navy, size: 22),
                        const Spacer(),
                        Text(
                          action.$2,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppColors.navy,
                            fontWeight: FontWeight.w900,
                            fontSize: 12.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _HeroPanel extends StatelessWidget {
  const _HeroPanel({required this.onBook});

  final VoidCallback onBook;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.navy,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: AppColors.navy.withValues(alpha: 0.22),
            blurRadius: 28,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
            ),
            child: Text(
              'home_tagline'.tr,
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'home_organisation'.tr,
            style: TextStyle(
              color: Colors.white,
              fontSize: 33,
              height: 1.08,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'home_hero_subtitle'.tr,
            style: TextStyle(
              color: Color(0xFFDDE7F4),
              fontSize: 15.5,
              height: 1.45,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 22),
          Row(
            children: [
              Expanded(
                child: PrimaryButton(
                  label: 'book_now'.tr,
                  icon: Icons.arrow_forward_rounded,
                  onPressed: onBook,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SectionHeading extends StatelessWidget {
  const _SectionHeading({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 6),
        Text(subtitle, style: Theme.of(context).textTheme.bodyMedium),
      ],
    );
  }
}

class _PromiseGrid extends StatelessWidget {
  const _PromiseGrid({required this.promises});

  final List<String> promises;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      itemCount: promises.length,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisExtent: 106,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemBuilder: (context, index) {
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE9EEF6)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(
                Icons.check_circle,
                color: Color(0xFF10B981),
                size: 22,
              ),
              const SizedBox(height: 10),
              Text(
                promises[index],
                style: const TextStyle(
                  color: AppColors.navy,
                  fontSize: 13.5,
                  height: 1.2,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
