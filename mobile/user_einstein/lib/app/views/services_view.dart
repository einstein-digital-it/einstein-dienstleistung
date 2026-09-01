import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/services_controller.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/primary_button.dart';
import '../widgets/service_card.dart';

class ServicesView extends GetView<ServicesController> {
  const ServicesView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: const AppBottomNav(currentIndex: 1),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              pinned: true,
              expandedHeight: 238,
              leading: IconButton(
                onPressed: Get.back,
                icon: const Icon(Icons.arrow_back_rounded),
              ),
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  padding: const EdgeInsets.fromLTRB(20, 76, 20, 24),
                  decoration: const BoxDecoration(
                    color: AppColors.navy,
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(28),
                      bottomRight: Radius.circular(28),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'services_title'.tr,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          height: 1.08,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      SizedBox(height: 12),
                      Text(
                        'services_subtitle'.tr,
                        style: TextStyle(
                          color: Color(0xFFDDE7F4),
                          fontSize: 15.5,
                          height: 1.42,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      SizedBox(height: 18),
                      _HeaderBadge(),
                    ],
                  ),
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 32),
              sliver: Obx(
                () => SliverList.separated(
                  itemCount: controller.services.length,
                  separatorBuilder: (context, index) =>
                      const SizedBox(height: 14),
                  itemBuilder: (context, index) {
                    final service = controller.services[index];
                    return Column(
                      children: [
                        ServiceCard(
                          service: service,
                          expanded: controller.expandedId.value == service.id,
                          onTap: () => controller.toggle(service.id),
                        ),
                        if (controller.expandedId.value == service.id) ...[
                          const SizedBox(height: 10),
                          PrimaryButton(
                            label: 'book_now'.tr,
                            icon: Icons.arrow_forward_rounded,
                            onPressed: () => Get.toNamed(AppRoutes.bookings),
                          ),
                        ],
                      ],
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HeaderBadge extends StatelessWidget {
  const _HeaderBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.gold.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.35)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.verified_outlined, color: AppColors.gold, size: 18),
          SizedBox(width: 8),
          Text(
            'quality_guaranteed'.tr,
            style: TextStyle(
              color: Colors.white,
              fontSize: 12.5,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
