import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../controllers/provider_store_controller.dart';
import '../models/provider_booking.dart';
import '../theme/app_theme.dart';
import 'provider_workspace_widgets.dart';

class ProviderBookingDetailsView extends GetView<ProviderStoreController> {
  const ProviderBookingDetailsView({super.key});

  ProviderBooking get booking => Get.arguments as ProviderBooking;

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text('booking_details'.tr)),
    body: Obx(() {
      final current =
          controller.bookings.firstWhereOrNull(
            (item) => item.id == booking.id,
          ) ??
          booking;
      return ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _Section(
            title: current.serviceName?.isNotEmpty == true
                ? current.serviceName!
                : current.number,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    StatusPill(status: current.status),
                    const Spacer(),
                    Text(
                      current.number,
                      style: const TextStyle(color: Color(0xFF667085)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _Detail(
                  icon: Icons.person_outline_rounded,
                  label: 'customer'.tr,
                  value: current.customerName,
                ),
                _Detail(
                  icon: Icons.mail_outline_rounded,
                  label: 'email'.tr,
                  value: current.customerEmail ?? '-',
                ),
                _Detail(
                  icon: Icons.phone_outlined,
                  label: 'phone'.tr,
                  value: current.customerPhone ?? '-',
                ),
                _Detail(
                  icon: Icons.calendar_month_outlined,
                  label: 'appointment'.tr,
                  value: [
                    current.date,
                    current.time,
                  ].whereType<String>().join('  '),
                ),
                _Detail(
                  icon: Icons.location_on_outlined,
                  label: 'address'.tr,
                  value: current.address ?? '-',
                ),
                _Detail(
                  icon: Icons.payments_outlined,
                  label: 'payment'.tr,
                  value:
                      '${current.price.toStringAsFixed(2)} EUR - ${paymentStatusText(current.paymentStatus ?? 'unpaid')}',
                ),
                if (current.description?.isNotEmpty == true)
                  _Detail(
                    icon: Icons.notes_outlined,
                    label: 'description'.tr,
                    value: current.description!,
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          _FilesSection(
            title: 'customer_documents'.tr,
            urls: current.documentsUrls,
          ),
          const SizedBox(height: 12),
          _FilesSection(
            title: 'provider_documents'.tr,
            urls: current.providerDocumentsUrls,
          ),
          const SizedBox(height: 16),
          if (current.status == 'confirmed')
            FilledButton.icon(
              onPressed: () => controller.bookingAction(current, 'start'),
              icon: const Icon(Icons.play_arrow_rounded),
              label: Text('start_work'.tr),
            ),
          if (current.status == 'in_progress') ...[
            FilledButton.icon(
              onPressed: () => controller.bookingAction(current, 'complete'),
              icon: const Icon(Icons.task_alt_rounded),
              label: Text('complete'.tr),
            ),
            const SizedBox(height: 10),
          ],
          if (current.status != 'cancelled' && current.status != 'completed')
            OutlinedButton.icon(
              onPressed: () => _pickDocuments(current),
              icon: const Icon(Icons.upload_file_outlined),
              label: Text('upload_file'.tr),
            ),
        ],
      );
    }),
  );

  Future<void> _pickDocuments(ProviderBooking current) async {
    final result = await FilePicker.pickFiles(
      allowMultiple: true,
      withData: true,
    );
    if (result == null || result.files.isEmpty) {
      return;
    }
    await controller.uploadBookingDocuments(current, result.files);
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.child});
  final String title;
  final Widget child;
  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              color: AppTheme.navy,
              fontSize: 17,
            ),
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    ),
  );
}

class _Detail extends StatelessWidget {
  const _Detail({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: const Color(0xFF667085)),
        const SizedBox(width: 8),
        SizedBox(
          width: 86,
          child: Text(label, style: const TextStyle(color: Color(0xFF667085))),
        ),
        Expanded(child: Text(value)),
      ],
    ),
  );
}

class _FilesSection extends GetView<ProviderStoreController> {
  const _FilesSection({required this.title, required this.urls});
  final String title;
  final List<String> urls;
  @override
  Widget build(BuildContext context) => _Section(
    title: title,
    child: urls.isEmpty
        ? Text('no_files'.tr, style: const TextStyle(color: Color(0xFF667085)))
        : Column(
            children: urls.map((url) {
              final segments = Uri.tryParse(url)?.pathSegments;
              final name = segments == null || segments.isEmpty
                  ? url
                  : segments.last;
              return ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.description_outlined),
                title: Text(name, maxLines: 1, overflow: TextOverflow.ellipsis),
                trailing: IconButton(
                  tooltip: 'open_document'.tr,
                  icon: const Icon(Icons.open_in_new_rounded),
                  onPressed: () => _open(url),
                ),
              );
            }).toList(),
          ),
  );
  Future<void> _open(String url) async {
    final success = await launchUrl(
      Uri.parse(controller.resolveUrl(url)),
      mode: LaunchMode.externalApplication,
    );
    if (!success) Get.snackbar('action_failed'.tr, 'file_open_failed'.tr);
  }
}
