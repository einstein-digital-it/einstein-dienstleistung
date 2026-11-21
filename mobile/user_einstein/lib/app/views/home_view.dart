import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/home_controller.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import 'abo_info_view.dart';
import '../widgets/ai_feature_card.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/public_header.dart';
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
            const SizedBox(height: 26),
            SectionTitle(
              title: 'abo_home_parts'.tr,
              action: 'abo_home_more'.tr,
              onAction: () => Get.offNamed(AppRoutes.subscription),
            ),
            const AboSectionsSummary(),
            const SizedBox(height: 16),
            const AiFeatureCard(),
            const SizedBox(height: 26),
            SectionTitle(title: 'home_promise'.tr),
            _PromiseGrid(promises: controller.promises),
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
            'abo_home_title'.tr,
            style: const TextStyle(color: AppColors.goldBright, fontSize: 30, height: 1.2, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 10),
          Text(
            'abo_home_sub'.tr,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.82), fontSize: 15, height: 1.6),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: FilledButton(
                  key: const Key('home_start'),
                  onPressed: () => Get.toNamed(AppRoutes.login, arguments: {'register': true}),
                  child: Text('abo_info_start'.tr, maxLines: 1, overflow: TextOverflow.ellipsis),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  // Sign-in is already in the header and the bottom bar
                  onPressed: () => Get.offNamed(AppRoutes.subscription),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: BorderSide(color: Colors.white.withValues(alpha: 0.35)),
                  ),
                  child: Text('abo_home_how'.tr, maxLines: 1, overflow: TextOverflow.ellipsis),
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
