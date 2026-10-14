import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/payment_controller.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';

class PaymentView extends GetView<PaymentController> {
  const PaymentView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('payment'.tr),
        leading: IconButton(
          onPressed: Get.back,
          icon: const Icon(Icons.arrow_back_rounded),
        ),
      ),
      body: SafeArea(
        child: Obx(
          () => SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 30),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (controller.booking == null) ...[
                  const _NoPaymentPanel(),
                ] else if (controller.isPaid.value) ...[
                  _SuccessPanel(bookingNumber: controller.bookingNumber),
                ] else ...[
                  _PaymentHero(total: controller.total),
                  const SizedBox(height: 18),
                  _BookingSummary(controller: controller),
                  const SizedBox(height: 18),
                  Text(
                    'payment_method'.tr,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  _PaymentMethodTile(
                    selected: controller.selectedMethod.value == 'card',
                    icon: Icons.credit_card,
                    title: 'card_online'.tr,
                    subtitle: 'card_online_subtitle'.tr,
                    onTap: () => controller.selectedMethod.value = 'card',
                  ),
                  const SizedBox(height: 10),
                  _PaymentMethodTile(
                    selected: controller.selectedMethod.value == 'invoice',
                    icon: Icons.receipt_long_outlined,
                    title: 'invoice'.tr,
                    subtitle: 'invoice_subtitle'.tr,
                    onTap: () => controller.selectedMethod.value = 'invoice',
                  ),
                  const SizedBox(height: 20),
                  PrimaryButton(
                    label: 'pay_now'.trParams({
                      'amount': controller.total.toStringAsFixed(2),
                    }),
                    icon: Icons.lock_outline,
                    isLoading: controller.isProcessing.value,
                    onPressed: controller.confirmPayment,
                  ),
                  if (controller.infoText.value.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(
                      controller.infoText.value,
                      style: const TextStyle(color: AppColors.muted, fontWeight: FontWeight.w600),
                    ),
                  ],
                  if (controller.awaitingConfirmation.value) ...[
                    const SizedBox(height: 8),
                    TextButton.icon(
                      onPressed: controller.checkStatus,
                      icon: const Icon(Icons.refresh),
                      label: Text('check_payment_status'.tr),
                    ),
                  ],
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NoPaymentPanel extends StatelessWidget {
  const _NoPaymentPanel();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE9EEF6)),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.receipt_long_outlined,
            color: AppColors.gold,
            size: 64,
          ),
          const SizedBox(height: 16),
          Text(
            'no_payment_due'.tr,
            style: const TextStyle(
              color: AppColors.navy,
              fontSize: 24,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'There is no unpaid booking selected right now.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 22),
          PrimaryButton(
            label: 'go_my_bookings'.tr,
            icon: Icons.calendar_month_outlined,
            onPressed: () => Get.offNamed(AppRoutes.myBookings),
          ),
        ],
      ),
    );
  }
}

class _PaymentHero extends StatelessWidget {
  const _PaymentHero({required this.total});

  final double total;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.navy,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.verified_user_outlined,
            color: AppColors.gold,
            size: 34,
          ),
          const SizedBox(height: 18),
          Text(
            'secure_payment'.tr,
            style: TextStyle(
              color: Colors.white,
              fontSize: 31,
              height: 1.1,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Review your booking and complete payment.',
            style: TextStyle(
              color: Color(0xFFDDE7F4),
              fontSize: 15.5,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 18),
          Text(
            '${total.toStringAsFixed(2)} EUR',
            style: const TextStyle(
              color: AppColors.gold,
              fontSize: 30,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _BookingSummary extends StatelessWidget {
  const _BookingSummary({required this.controller});

  final PaymentController controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE9EEF6)),
      ),
      child: Column(
        children: [
          _SummaryLine(label: 'booking'.tr, value: controller.bookingNumber),
          _SummaryLine(label: 'service'.tr, value: controller.serviceName),
          _SummaryLine(
            label: 'net_amount'.tr,
            value: '${controller.amount.toStringAsFixed(2)} EUR',
          ),
          _SummaryLine(
            label: 'vat'.tr,
            value: '${controller.vat.toStringAsFixed(2)} EUR',
          ),
          const Divider(color: AppColors.line),
          _SummaryLine(
            label: 'total'.tr,
            value: '${controller.total.toStringAsFixed(2)} EUR',
            strong: true,
          ),
        ],
      ),
    );
  }
}

class _SummaryLine extends StatelessWidget {
  const _SummaryLine({
    required this.label,
    required this.value,
    this.strong = false,
  });

  final String label;
  final String value;
  final bool strong;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontWeight: FontWeight.w700,
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: TextStyle(
              color: strong ? AppColors.navy : AppColors.text,
              fontSize: strong ? 17 : 14,
              fontWeight: strong ? FontWeight.w900 : FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentMethodTile extends StatelessWidget {
  const _PaymentMethodTile({
    required this.selected,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final bool selected;
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? AppColors.goldSoft : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? AppColors.gold : const Color(0xFFE9EEF6),
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: selected ? AppColors.gold : AppColors.navy),
            const SizedBox(width: 13),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: AppColors.navy,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 12.5,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              selected ? Icons.check_circle : Icons.radio_button_unchecked,
              color: selected ? AppColors.gold : AppColors.muted,
            ),
          ],
        ),
      ),
    );
  }
}

class _SuccessPanel extends StatelessWidget {
  const _SuccessPanel({required this.bookingNumber});

  final String bookingNumber;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE9EEF6)),
      ),
      child: Column(
        children: [
          const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 74),
          const SizedBox(height: 16),
          Text(
            'payment_success'.tr,
            style: const TextStyle(
              color: AppColors.navy,
              fontSize: 24,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Booking $bookingNumber is now marked as paid.',
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 22),
          PrimaryButton(
            label: 'go_my_bookings'.tr,
            icon: Icons.calendar_month_outlined,
            onPressed: () => Get.offNamed(AppRoutes.myBookings),
          ),
        ],
      ),
    );
  }
}
