import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/provider_store_controller.dart';
import '../models/provider_booking.dart';
import '../models/service_extension.dart';
import '../theme/app_theme.dart';
import 'provider_workspace_widgets.dart';

class ProviderExtensionsView extends GetView<ProviderStoreController> {
  const ProviderExtensionsView({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text('extensions'.tr),
      actions: [
        IconButton(
          tooltip: 'refresh'.tr,
          onPressed: controller.loadExtensions,
          icon: const Icon(Icons.refresh_rounded),
        ),
      ],
    ),
    floatingActionButton: FloatingActionButton.extended(
      onPressed: _showRequest,
      icon: const Icon(Icons.add_rounded),
      label: Text('request_extension'.tr),
    ),
    body: Obx(
      () => RefreshIndicator(
        onRefresh: controller.loadExtensions,
        child: controller.extensions.isEmpty
            ? ListView(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(32),
                    child: Center(
                      child: Text(
                        'no_extensions'.tr,
                        style: const TextStyle(color: Color(0xFF667085)),
                      ),
                    ),
                  ),
                ],
              )
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: controller.extensions.length,
                itemBuilder: (_, index) =>
                    _ExtensionCard(extension: controller.extensions[index]),
              ),
      ),
    ),
  );

  Future<void> _showRequest() async {
    final booking = Rxn<ProviderBooking>();
    final amount = TextEditingController();
    final description = TextEditingController();
    await Get.bottomSheet(
      SafeArea(
        child: Material(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            child: Obx(
              () => SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'request_extension'.tr,
                      style: Get.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<ProviderBooking>(
                      initialValue: booking.value,
                      isExpanded: true,
                      hint: Text('select_booking'.tr),
                      items: controller.bookings
                          .where(
                            (item) =>
                                item.status != 'cancelled' &&
                                item.status != 'completed',
                          )
                          .map(
                            (item) => DropdownMenuItem(
                              value: item,
                              child: Text(
                                '${item.number} - ${item.customerName}',
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: (value) => booking.value = value,
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: amount,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      decoration: InputDecoration(labelText: 'amount'.tr),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: description,
                      minLines: 3,
                      maxLines: 5,
                      decoration: InputDecoration(labelText: 'description'.tr),
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: controller.isSaving.value
                          ? null
                          : () async {
                              final selected = booking.value;
                              if (selected == null ||
                                  selected.customerEmail?.isEmpty != false) {
                                return;
                              }
                              final created = await controller.createExtension({
                                'booking_id': selected.id,
                                'booking_number': selected.number,
                                'customer_name': selected.customerName,
                                'customer_email': selected.customerEmail,
                                'service_name': selected.serviceName,
                                'amount':
                                    double.tryParse(amount.text.trim()) ?? 0,
                                'description': description.text.trim(),
                                'status': 'pending',
                                'payment_status': 'unpaid',
                              });
                              if (created) Get.back();
                            },
                      child: controller.isSaving.value
                          ? const SizedBox(
                              height: 22,
                              width: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : Text('send_request'.tr),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
      isScrollControlled: true,
    );
    amount.dispose();
    description.dispose();
  }
}

class _ExtensionCard extends GetView<ProviderStoreController> {
  const _ExtensionCard({required this.extension});
  final ServiceExtension extension;
  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 10),
    child: Padding(
      padding: const EdgeInsets.all(15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  extension.serviceName?.isNotEmpty == true
                      ? extension.serviceName!
                      : extension.bookingNumber ?? 'extensions'.tr,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    color: AppTheme.navy,
                  ),
                ),
              ),
              StatusPill(status: extension.status),
            ],
          ),
          const SizedBox(height: 8),
          Text('${'customer'.tr}: ${extension.customerName ?? '-'}'),
          if (extension.description?.isNotEmpty == true)
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(extension.description!),
            ),
          const Divider(height: 24),
          Row(
            children: [
              Text(
                '${extension.amount?.toStringAsFixed(2) ?? '0.00'} EUR',
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
              const Spacer(),
              Text(
                '${'payment'.tr}: ${paymentStatusText(extension.paymentStatus)}',
                style: const TextStyle(color: Color(0xFF667085), fontSize: 12),
              ),
            ],
          ),
          if (extension.status == 'pending') ...[
            const Divider(height: 24),
            Wrap(
              spacing: 8,
              children: [
                OutlinedButton.icon(
                  onPressed: _edit,
                  icon: const Icon(Icons.edit_outlined),
                  label: Text('edit_extension'.tr),
                ),
                OutlinedButton.icon(
                  onPressed: _cancel,
                  icon: const Icon(Icons.close_rounded),
                  label: Text('cancel_extension'.tr),
                ),
              ],
            ),
          ],
        ],
      ),
    ),
  );

  Future<void> _edit() async {
    final amount = TextEditingController(text: extension.amount?.toString());
    final description = TextEditingController(text: extension.description);
    await Get.bottomSheet(
      SafeArea(
        child: Material(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'edit_extension'.tr,
                  style: Get.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: amount,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: InputDecoration(labelText: 'amount'.tr),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: description,
                  minLines: 3,
                  maxLines: 5,
                  decoration: InputDecoration(labelText: 'description'.tr),
                ),
                const SizedBox(height: 16),
                Obx(
                  () => FilledButton(
                    onPressed: controller.isSaving.value
                        ? null
                        : () async {
                            final updated = await controller
                                .updateExtension(extension, {
                                  'amount':
                                      double.tryParse(amount.text.trim()) ?? 0,
                                  'description': description.text.trim(),
                                });
                            if (updated) Get.back();
                          },
                    child: controller.isSaving.value
                        ? const SizedBox(
                            height: 22,
                            width: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text('save'.tr),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      isScrollControlled: true,
    );
    amount.dispose();
    description.dispose();
  }

  Future<void> _cancel() async {
    final approved = await Get.dialog<bool>(
      AlertDialog(
        title: Text('cancel_extension'.tr),
        content: Text('confirm_cancel_extension'.tr),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('cancel'.tr),
          ),
          FilledButton(
            onPressed: () => Get.back(result: true),
            child: Text('confirm'.tr),
          ),
        ],
      ),
    );
    if (approved == true) {
      await controller.updateExtension(extension, {'status': 'cancelled'});
    }
  }
}
