import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/provider_store_controller.dart';
import '../models/provider_booking.dart';
import '../routes/app_routes.dart';
import '../theme/app_theme.dart';

class ProviderLanguageMenu extends StatelessWidget {
  const ProviderLanguageMenu({super.key});

  @override
  Widget build(BuildContext context) => PopupMenuButton<String>(
    tooltip: 'languages'.tr,
    icon: const Icon(Icons.language_rounded),
    onSelected: (language) => Get.updateLocale(Locale(language)),
    itemBuilder: (_) => const [
      PopupMenuItem(value: 'ar', child: Text('العربية')),
      PopupMenuItem(value: 'en', child: Text('English')),
      PopupMenuItem(value: 'de', child: Text('Deutsch')),
    ],
  );
}

Color statusColor(String status) => switch (status) {
  'completed' => const Color(0xFF18794E),
  'cancelled' => const Color(0xFFB42318),
  'confirmed' => const Color(0xFF175CD3),
  'in_progress' => const Color(0xFFB54708),
  _ => const Color(0xFF667085),
};

String statusText(String status) => switch (status) {
  'accepted' => 'accepted'.tr,
  'completed' => 'completed_status'.tr,
  'cancelled' => 'cancelled'.tr,
  'confirmed' => 'confirmed'.tr,
  'in_progress' => 'in_progress'.tr,
  _ => 'pending'.tr,
};

String extensionStatusText(String status) => switch (status) {
  'accepted' => 'accepted'.tr,
  'completed' => 'completed_status'.tr,
  'cancelled' => 'cancelled'.tr,
  _ => 'pending'.tr,
};

String paymentStatusText(String status) => switch (status) {
  'paid' => 'paid'.tr,
  'authorized' => 'authorized'.tr,
  'failed' => 'failed'.tr,
  'refunded' => 'refunded'.tr,
  _ => 'unpaid'.tr,
};

String providerStatusText(String status) => switch (status) {
  'approved' => 'approved'.tr,
  'rejected' => 'rejected'.tr,
  'suspended' => 'suspended'.tr,
  _ => 'pending'.tr,
};

class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final color = statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .1),
        borderRadius: BorderRadius.circular(7),
      ),
      child: Text(
        statusText(status),
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class BookingCard extends GetView<ProviderStoreController> {
  const BookingCard({
    super.key,
    required this.booking,
    this.showActions = false,
    this.showComplete = false,
    this.showDocuments = false,
  });

  final ProviderBooking booking;
  final bool showActions;
  final bool showComplete;
  final bool showDocuments;

  Future<void> _decline(BuildContext context) async {
    final approved = await Get.dialog<bool>(
      AlertDialog(
        title: Text('confirm_decline_title'.tr),
        content: Text('confirm_decline_message'.tr),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('cancel'.tr),
          ),
          FilledButton(
            onPressed: () => Get.back(result: true),
            child: Text('decline'.tr),
          ),
        ],
      ),
    );
    if (approved == true) await controller.bookingAction(booking, 'decline');
  }

  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 12),
    clipBehavior: Clip.antiAlias,
    child: Padding(
      padding: const EdgeInsets.all(15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  booking.serviceName?.isNotEmpty == true
                      ? booking.serviceName!
                      : booking.number,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    color: AppTheme.navy,
                  ),
                ),
              ),
              IconButton(
                tooltip: 'booking_details'.tr,
                onPressed: () =>
                    Get.toNamed(AppRoutes.bookingDetails, arguments: booking),
                icon: const Icon(Icons.chevron_right_rounded),
              ),
              StatusPill(status: booking.status),
            ],
          ),
          const SizedBox(height: 8),
          Text('${'customer'.tr}: ${booking.customerName}'),
          if (booking.date != null || booking.time != null)
            _Line(
              icon: Icons.calendar_month_outlined,
              text: [booking.date, booking.time].whereType<String>().join('  '),
            ),
          if (booking.address?.isNotEmpty == true)
            _Line(icon: Icons.location_on_outlined, text: booking.address!),
          if (booking.category?.isNotEmpty == true)
            _Line(icon: Icons.sell_outlined, text: booking.category!),
          if (showDocuments &&
              (booking.documentsUrls.isNotEmpty ||
                  booking.providerDocumentsUrls.isNotEmpty))
            Padding(
              padding: const EdgeInsets.only(top: 7),
              child: Text(
                '${'customer_documents'.tr}: ${booking.documentsUrls.length}  |  ${'provider_documents'.tr}: ${booking.providerDocumentsUrls.length}',
                style: const TextStyle(color: Color(0xFF475467), fontSize: 12),
              ),
            ),
          const SizedBox(height: 10),
          Row(
            children: [
              Text(
                '${booking.price.toStringAsFixed(2)} EUR',
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
              const SizedBox(width: 10),
              Text(
                '${'payment'.tr}: ${paymentStatusText(booking.paymentStatus ?? 'unpaid')}',
                style: const TextStyle(color: Color(0xFF667085), fontSize: 12),
              ),
              const Spacer(),
              Text(
                booking.number,
                style: const TextStyle(color: Color(0xFF667085), fontSize: 12),
              ),
            ],
          ),
          if (showActions || showComplete || showDocuments) ...[
            const Divider(height: 26),
            Obx(() {
              final busy = controller.busyBookingIds.contains(booking.id);
              if (busy) {
                return const Center(
                  child: SizedBox(
                    height: 24,
                    width: 24,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                );
              }
              return Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  if (showActions) ...[
                    FilledButton.icon(
                      onPressed: () =>
                          controller.bookingAction(booking, 'accept'),
                      icon: const Icon(Icons.check_rounded),
                      label: Text('accept'.tr),
                    ),
                    OutlinedButton.icon(
                      onPressed: () => _decline(context),
                      icon: const Icon(Icons.close_rounded),
                      label: Text('decline'.tr),
                    ),
                  ],
                  if (showComplete && booking.status == 'confirmed')
                    FilledButton.icon(
                      onPressed: () =>
                          controller.bookingAction(booking, 'start'),
                      icon: const Icon(Icons.play_arrow_rounded),
                      label: Text('start_work'.tr),
                    )
                  else if (showComplete && booking.status == 'in_progress')
                    FilledButton.icon(
                      onPressed: () =>
                          controller.bookingAction(booking, 'complete'),
                      icon: const Icon(Icons.task_alt_rounded),
                      label: Text('complete'.tr),
                    ),
                  if (showDocuments)
                    OutlinedButton.icon(
                      onPressed: () => Get.toNamed(
                        AppRoutes.bookingDetails,
                        arguments: booking,
                      ),
                      icon: const Icon(Icons.visibility_outlined),
                      label: Text('details'.tr),
                    ),
                ],
              );
            }),
          ],
        ],
      ),
    ),
  );
}

class _Line extends StatelessWidget {
  const _Line({required this.icon, required this.text});
  final IconData icon;
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 6),
    child: Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF667085)),
        const SizedBox(width: 6),
        Expanded(
          child: Text(text, style: const TextStyle(color: Color(0xFF475467))),
        ),
      ],
    ),
  );
}
