import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/booking_controller.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';

class BookingView extends GetView<BookingController> {
  const BookingView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dienstleistung buchen'),
        leading: IconButton(onPressed: Get.back, icon: const Icon(Icons.arrow_back_rounded)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _StepHeader(),
              const SizedBox(height: 20),
              Text('Kategorie waehlen', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 12),
              Obx(
                () => GridView.builder(
                  itemCount: controller.categories.length,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisExtent: 122,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemBuilder: (context, index) {
                    final id = controller.categories[index];
                    final selected = controller.selectedCategory.value == id;
                    return InkWell(
                      borderRadius: BorderRadius.circular(18),
                      onTap: () => controller.selectCategory(id),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: selected ? const Color(0xFFF4EEFF) : Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: selected ? AppColors.purple : const Color(0xFFE9EEF6), width: selected ? 2 : 1),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(selected ? Icons.check_circle : Icons.radio_button_unchecked, color: selected ? AppColors.purple : AppColors.muted),
                            const Spacer(),
                            Text(
                              controller.categoryLabels[id] ?? id,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w900, height: 1.15),
                            ),
                            const SizedBox(height: 4),
                            const Text('ab 40 EUR', style: TextStyle(color: AppColors.gold, fontSize: 12, fontWeight: FontWeight.w800)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 26),
              const _DetailsCard(),
              const SizedBox(height: 18),
              PrimaryButton(
                label: 'Buchung vorbereiten',
                icon: Icons.arrow_forward_rounded,
                onPressed: () => Get.toNamed(AppRoutes.myBookings),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StepHeader extends StatelessWidget {
  const _StepHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.navy,
        borderRadius: BorderRadius.circular(22),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Schnelle Buchung', style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w900)),
          SizedBox(height: 8),
          Text(
            'Waehlen Sie eine Dienstleistung, Termin und Details. Die Buchung wird danach in My Bookings sichtbar.',
            style: TextStyle(color: Color(0xFFDDE7F4), fontSize: 15, height: 1.4),
          ),
        ],
      ),
    );
  }
}

class _DetailsCard extends StatelessWidget {
  const _DetailsCard();

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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Details eingeben', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 14),
          const _InputLike(icon: Icons.person_outline, label: 'Name', value: 'Customer Name'),
          const SizedBox(height: 10),
          const _InputLike(icon: Icons.mail_outline, label: 'Email', value: 'customer@example.com'),
          const SizedBox(height: 10),
          const _InputLike(icon: Icons.location_on_outlined, label: 'Adresse', value: 'Frankfurt'),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Text(
              'Beschreibung: Unterstuetzung bei Formularen und Vorbereitung von Unterlagen.',
              style: TextStyle(color: AppColors.muted, height: 1.35),
            ),
          ),
        ],
      ),
    );
  }
}

class _InputLike extends StatelessWidget {
  const _InputLike({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.input,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFDAE5F4)),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF8EA0B7)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: AppColors.muted, fontSize: 12, fontWeight: FontWeight.w800)),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(color: AppColors.text, fontWeight: FontWeight.w800)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
