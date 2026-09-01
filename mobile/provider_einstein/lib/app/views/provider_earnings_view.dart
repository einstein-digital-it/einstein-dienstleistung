import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../controllers/provider_store_controller.dart';
import '../models/provider_earnings_report.dart';
import '../theme/app_theme.dart';
import 'provider_workspace_widgets.dart';

class ProviderEarningsView extends StatefulWidget {
  const ProviderEarningsView({super.key});

  @override
  State<ProviderEarningsView> createState() => _ProviderEarningsViewState();
}

class _ProviderEarningsViewState extends State<ProviderEarningsView> {
  final controller = Get.find<ProviderStoreController>();

  @override
  void initState() {
    super.initState();
    controller.loadEarnings();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('earnings_report'.tr),
        actions: [
          IconButton(
            tooltip: 'refresh'.tr,
            onPressed: controller.loadEarnings,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: Obx(() {
        final report = controller.earningsReport.value;
        if (report == null) {
          return const Center(child: CircularProgressIndicator());
        }
        return RefreshIndicator(
          onRefresh: controller.loadEarnings,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                childAspectRatio: 1.55,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                children: [
                  _Metric(
                    label: 'earnings'.tr,
                    value:
                        '${report.summary.totalEarned.toStringAsFixed(2)} EUR',
                  ),
                  _Metric(
                    label: 'paid_amount'.tr,
                    value:
                        '${report.summary.paidAmount.toStringAsFixed(2)} EUR',
                  ),
                  _Metric(
                    label: 'pending_amount'.tr,
                    value:
                        '${report.summary.pendingAmount.toStringAsFixed(2)} EUR',
                  ),
                  _Metric(
                    label: 'completed_services'.tr,
                    value: '${report.summary.completedServices}',
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Text(
                'transactions'.tr,
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 10),
              if (report.items.isEmpty)
                Padding(
                  padding: const EdgeInsets.all(28),
                  child: Center(
                    child: Text(
                      'no_transactions'.tr,
                      style: const TextStyle(color: Color(0xFF667085)),
                    ),
                  ),
                ),
              ...report.items.map((item) => _EarningTile(item: item)),
            ],
          ),
        );
      }),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(13),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            value,
            style: const TextStyle(
              color: AppTheme.navy,
              fontWeight: FontWeight.w800,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Color(0xFF667085), fontSize: 12),
          ),
        ],
      ),
    ),
  );
}

class _EarningTile extends GetView<ProviderStoreController> {
  const _EarningTile({required this.item});
  final ProviderEarningItem item;
  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 10),
    child: ListTile(
      leading: Icon(
        item.kind == 'extension'
            ? Icons.update_rounded
            : Icons.receipt_long_outlined,
        color: AppTheme.navy,
      ),
      title: Text(
        item.serviceName?.isNotEmpty == true
            ? item.serviceName!
            : item.reference ?? '-',
      ),
      subtitle: Text(
        '${item.customerName ?? '-'}  |  ${item.date ?? '-'}\n${item.kind == 'extension' ? 'service_extension'.tr : 'service_booking'.tr} - ${paymentStatusText(item.paymentStatus)}',
      ),
      isThreeLine: true,
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            '${item.amount.toStringAsFixed(2)} EUR',
            style: const TextStyle(fontWeight: FontWeight.w800),
          ),
          if (item.invoiceUrl?.isNotEmpty == true)
            IconButton(
              tooltip: 'invoice'.tr,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              icon: const Icon(Icons.open_in_new_rounded, size: 18),
              onPressed: _openInvoice,
            ),
        ],
      ),
    ),
  );

  Future<void> _openInvoice() async {
    final success = await launchUrl(
      Uri.parse(controller.resolveUrl(item.invoiceUrl!)),
      mode: LaunchMode.externalApplication,
    );
    if (!success) Get.snackbar('action_failed'.tr, 'file_open_failed'.tr);
  }
}
