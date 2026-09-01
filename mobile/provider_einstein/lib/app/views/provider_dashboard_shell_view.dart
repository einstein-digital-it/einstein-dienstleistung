import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/provider_auth_controller.dart';
import '../controllers/provider_store_controller.dart';
import '../theme/app_theme.dart';

class ProviderDashboardShellView extends GetView<ProviderStoreController> {
  const ProviderDashboardShellView({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text('dashboard'.tr),
      actions: [
        IconButton(
          tooltip: 'refresh'.tr,
          onPressed: controller.loadDashboard,
          icon: const Icon(Icons.refresh_rounded),
        ),
        IconButton(
          tooltip: 'logout'.tr,
          onPressed: Get.find<ProviderAuthController>().logout,
          icon: const Icon(Icons.logout_rounded),
        ),
      ],
    ),
    body: Obx(() {
      if (controller.isLoading.value && controller.profile.value == null) {
        return const Center(child: CircularProgressIndicator());
      }
      final profile = controller.profile.value;
      final summary = controller.summary.value;
      return ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            profile?.fullName ?? 'app_name'.tr,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: AppTheme.navy,
            ),
          ),
          if (controller.errorText.value.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              controller.errorText.value,
              style: const TextStyle(color: Colors.redAccent),
            ),
          ],
          const SizedBox(height: 20),
          _SummaryGrid(
            upcoming: summary.upcoming,
            completed: summary.completed,
            earnings: summary.totalEarnings,
            thisMonth: summary.thisMonth,
          ),
          const SizedBox(height: 24),
          Text(
            'provider_tools_coming'.tr,
            style: const TextStyle(color: Color(0xFF667085), height: 1.5),
          ),
        ],
      );
    }),
  );
}

class _SummaryGrid extends StatelessWidget {
  const _SummaryGrid({
    required this.upcoming,
    required this.completed,
    required this.earnings,
    required this.thisMonth,
  });

  final int upcoming;
  final int completed;
  final double earnings;
  final double thisMonth;

  @override
  Widget build(BuildContext context) => GridView.count(
    crossAxisCount: 2,
    shrinkWrap: true,
    physics: const NeverScrollableScrollPhysics(),
    crossAxisSpacing: 12,
    mainAxisSpacing: 12,
    childAspectRatio: 1.55,
    children: [
      _Metric(label: 'upcoming'.tr, value: '$upcoming'),
      _Metric(label: 'completed'.tr, value: '$completed'),
      _Metric(
        label: 'earnings'.tr,
        value: '${earnings.toStringAsFixed(2)} EUR',
      ),
      _Metric(
        label: 'this_month'.tr,
        value: '${thisMonth.toStringAsFixed(2)} EUR',
      ),
    ],
  );
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => DecoratedBox(
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: const Color(0xFFE0E5EA)),
    ),
    child: Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            value,
            style: const TextStyle(
              color: AppTheme.navy,
              fontWeight: FontWeight.w800,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(color: Color(0xFF667085))),
        ],
      ),
    ),
  );
}
