import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/my_bookings_controller.dart';
import '../models/booking_item.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/primary_button.dart';

class MyBookingsView extends GetView<MyBookingsController> {
  const MyBookingsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: const AppBottomNav(currentIndex: 3),
      body: SafeArea(
        child: Obx(
          () => CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              'my_bookings'.tr,
                              style: Theme.of(context).textTheme.headlineMedium,
                            ),
                          ),
                          IconButton(
                            onPressed: () => Get.toNamed(AppRoutes.bookings),
                            icon: const Icon(
                              Icons.add_rounded,
                              color: Colors.white,
                            ),
                            style: IconButton.styleFrom(
                              backgroundColor: AppColors.navy,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'bookings_subtitle'.tr,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 18),
                      _BookingStats(
                        total: controller.totalCount,
                        unpaid: controller.unpaidCount,
                        paid: controller.paidCount,
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                sliver: controller.bookings.isEmpty
                    ? const SliverToBoxAdapter(child: _EmptyBookings())
                    : SliverList.separated(
                        itemCount: controller.bookings.length,
                        separatorBuilder: (context, index) =>
                            const SizedBox(height: 14),
                        itemBuilder: (context, index) =>
                            _BookingCard(item: controller.bookings[index]),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BookingStats extends StatelessWidget {
  const _BookingStats({
    required this.total,
    required this.unpaid,
    required this.paid,
  });

  final int total;
  final int unpaid;
  final int paid;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _StatBox(
            label: 'all'.tr,
            value: '$total',
            icon: Icons.calendar_month_outlined,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _StatBox(
            label: 'open'.tr,
            value: '$unpaid',
            icon: Icons.access_time_rounded,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _StatBox(
            label: 'paid'.tr,
            value: '$paid',
            icon: Icons.check_circle_outline,
          ),
        ),
      ],
    );
  }
}

class _StatBox extends StatelessWidget {
  const _StatBox({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
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
          Icon(icon, color: AppColors.gold, size: 22),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.navy,
              fontSize: 22,
              fontWeight: FontWeight.w900,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _BookingCard extends StatelessWidget {
  const _BookingCard({required this.item});

  final BookingItem item;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE9EEF6)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.06),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _StatusPill(label: item.statusKey.tr, color: item.statusColor),
              const SizedBox(width: 8),
              _StatusPill(
                label: item.paymentStatusKey.tr,
                color: item.paymentStatus == 'Paid'
                    ? const Color(0xFF10B981)
                    : AppColors.gold,
              ),
              const Spacer(),
              Text(
                item.number,
                style: const TextStyle(
                  color: AppColors.muted,
                  fontWeight: FontWeight.w900,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            item.displayService,
            style: const TextStyle(
              color: AppColors.navy,
              fontSize: 19,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 14,
            runSpacing: 8,
            children: [
              _Meta(icon: Icons.calendar_today_outlined, text: item.date),
              _Meta(icon: Icons.access_time_rounded, text: item.time),
              _Meta(icon: Icons.location_on_outlined, text: item.address),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.grossPrice,
                    style: const TextStyle(
                      color: AppColors.navy,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  Text(
                    'incl_vat'.tr,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              SizedBox(
                width: 126,
                child: PrimaryButton(
                  label: item.paymentStatus == 'Unpaid'
                      ? 'pay'.tr
                      : 'details'.tr,
                  onPressed: () => item.paymentStatus == 'Unpaid'
                      ? Get.toNamed(AppRoutes.payment, arguments: item.id)
                      : Get.snackbar(
                          'booking_details'.tr,
                          'booking_status_message'.trParams({
                            'booking': item.number,
                            'status': item.statusKey.tr,
                          }),
                        ),
                  icon: item.paymentStatus == 'Unpaid'
                      ? Icons.credit_card_outlined
                      : Icons.arrow_forward_rounded,
                ),
              ),
            ],
          ),
          if (item.isDocumentSubscription) ...[
            const SizedBox(height: 10),
            Align(
              alignment: AlignmentDirectional.centerEnd,
              child: TextButton.icon(
                onPressed: () => _confirmCancel(item),
                icon: const Icon(Icons.cancel_outlined, size: 18),
                label: Text('cancel_subscription'.tr),
                style: TextButton.styleFrom(foregroundColor: const Color(0xFFDC2626)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _confirmCancel(BookingItem item) {
    Get.defaultDialog(
      title: 'cancel_subscription'.tr,
      middleText: 'cancel_subscription_confirm'.tr,
      textConfirm: 'cancel_subscription'.tr,
      textCancel: 'cancel_back'.tr,
      confirmTextColor: Colors.white,
      buttonColor: const Color(0xFFDC2626),
      onConfirm: () {
        Get.back();
        Get.find<MyBookingsController>().cancelSubscription(item);
      },
    );
  }
}

class _EmptyBookings extends StatelessWidget {
  const _EmptyBookings();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE9EEF6)),
      ),
      child: Text(
        'no_bookings_text'.tr,
        style: const TextStyle(
          color: AppColors.muted,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _Meta extends StatelessWidget {
  const _Meta({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: AppColors.muted, size: 16),
        const SizedBox(width: 5),
        Text(
          text,
          style: const TextStyle(
            color: AppColors.muted,
            fontWeight: FontWeight.w700,
            fontSize: 12.5,
          ),
        ),
      ],
    );
  }
}
