import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/home_controller.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/public_header.dart';
import '../widgets/service_card.dart';
import '../widgets/ui.dart';

/// Home for visitors who are not signed in yet.
class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: const AppBottomNav(tab: NavTab.home),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
          children: [
            const PublicHeader(),
            const SizedBox(height: 18),
            const _Hero(),
            const SizedBox(height: 22),
            const _FileFeature(),
            const SizedBox(height: 26),
            SectionTitle(title: 'home_promise'.tr),
            _PromiseGrid(promises: controller.promises),
            const SizedBox(height: 26),
            SectionTitle(
              title: 'home_services'.tr,
              action: 'see_all'.tr,
              onAction: () => Get.offNamed(AppRoutes.services),
            ),
            for (final service in controller.services) ...[
              ServiceCard(
                service: service,
                onTap: () => Get.toNamed(AppRoutes.services, arguments: {'expand': service.id}),
              ),
              const SizedBox(height: 12),
            ],
          ],
        ),
      ),
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(22, 22, 22, 20),
      decoration: BoxDecoration(
        gradient: AppColors.heroGradient,
        borderRadius: BorderRadius.circular(26),
        boxShadow: [BoxShadow(color: AppColors.navy.withValues(alpha: 0.28), blurRadius: 30, offset: const Offset(0, 16))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: Colors.white.withValues(alpha: 0.16)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(width: 7, height: 7, decoration: const BoxDecoration(color: Color(0xFF34D399), shape: BoxShape.circle)),
                const SizedBox(width: 8),
                Text('home_tagline'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          const SizedBox(height: 18),
          Text(
            'home_organisation'.tr,
            style: const TextStyle(color: AppColors.goldBright, fontSize: 30, height: 1.2, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 10),
          Text(
            'home_hero_subtitle'.tr,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.82), fontSize: 15, height: 1.6),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: () => Get.toNamed(AppRoutes.bookings),
                  icon: const Icon(Icons.calendar_month_rounded, size: 20),
                  label: Text('book_now'.tr),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Get.toNamed(AppRoutes.login),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: BorderSide(color: Colors.white.withValues(alpha: 0.35)),
                  ),
                  child: Text('sign_in'.tr),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Teaser for the customer file: upload, sort, translate, remind.
class _FileFeature extends StatelessWidget {
  const _FileFeature();

  @override
  Widget build(BuildContext context) {
    final points = [
      (Icons.document_scanner_outlined, 'feature_scan'.tr),
      (Icons.translate_rounded, 'feature_translate'.tr),
      (Icons.notifications_active_outlined, 'feature_remind'.tr),
      (Icons.send_rounded, 'feature_forms'.tr),
    ];
    return AppCard(
      padding: const EdgeInsets.all(18),
      onTap: () => Get.toNamed(AppRoutes.login),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const IconTile(icon: Icons.auto_awesome_rounded, color: AppColors.purple, size: 40),
              const SizedBox(width: 12),
              Expanded(child: Text('feature_title'.tr, style: Theme.of(context).textTheme.titleLarge)),
            ],
          ),
          const SizedBox(height: 14),
          for (final p in points)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  Icon(p.$1, size: 20, color: AppColors.gold),
                  const SizedBox(width: 10),
                  Expanded(child: Text(p.$2, style: const TextStyle(color: AppColors.text, height: 1.4))),
                ],
              ),
            ),
        ],
      ),
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
        mainAxisExtent: 86,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemBuilder: (context, index) {
        return AppCard(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              const Icon(Icons.verified_rounded, color: AppColors.success, size: 22),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  promises[index].tr,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppColors.navy, fontSize: 13.5, height: 1.3, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
