import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/booking_controller.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';

class BookingView extends GetView<BookingController> {
  const BookingView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('book_service'.tr),
        leading: IconButton(
          onPressed: Get.back,
          icon: const Icon(Icons.arrow_back_rounded),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _StepHeader(),
              const SizedBox(height: 20),
              Text(
                'choose_category'.tr,
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 12),
              Obx(() {
                final selectedCategory = controller.selectedCategory.value;
                return GridView.builder(
                  itemCount: controller.categories.length,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    // Room for two lines of name and two of the gross price.
                    mainAxisExtent: 148,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemBuilder: (context, index) {
                    final id = controller.categories[index];
                    final selected = selectedCategory == id;
                    return InkWell(
                      borderRadius: BorderRadius.circular(18),
                      onTap: () => controller.selectCategory(id),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: selected
                              ? const Color(0xFFF4EEFF)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: selected
                                ? AppColors.purple
                                : const Color(0xFFE9EEF6),
                            width: selected ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              selected
                                  ? Icons.check_circle
                                  : Icons.radio_button_unchecked,
                              color: selected
                                  ? AppColors.purple
                                  : AppColors.muted,
                            ),
                            const Spacer(),
                            Text(
                              'service_${id}_title'.tr,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: AppColors.navy,
                                fontWeight: FontWeight.w900,
                                height: 1.15,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'service_${id}_price'.tr,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: AppColors.gold,
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              }),
              const SizedBox(height: 26),
              _DetailsCard(controller: controller),
              const SizedBox(height: 18),
              Obx(
                () => PrimaryButton(
                  label: 'prepare_booking'.tr,
                  icon: Icons.arrow_forward_rounded,
                  isLoading: controller.isSubmitting.value,
                  onPressed: controller.confirmBooking,
                ),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'quick_booking'.tr,
            style: const TextStyle(
              color: AppColors.gold,
              fontWeight: FontWeight.w900,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'quick_booking_subtitle'.tr,
            style: TextStyle(
              color: Color(0xFFDDE7F4),
              fontSize: 15,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailsCard extends StatelessWidget {
  const _DetailsCard({required this.controller});

  final BookingController controller;

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
          Text(
            'booking_details'.tr,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 14),
          _InputLike(
            icon: Icons.person_outline,
            label: 'name'.tr,
            value: controller.store.profile.value.fullName,
          ),
          const SizedBox(height: 10),
          _InputLike(
            icon: Icons.mail_outline,
            label: 'email'.tr,
            value: controller.store.profile.value.email,
          ),
          const SizedBox(height: 10),
          Obx(
            () => _ChoiceWrap(
              title: 'date'.tr,
              values: controller.dates,
              selected: controller.selectedDate.value,
              onSelected: (value) => controller.selectedDate.value = value,
            ),
          ),
          const SizedBox(height: 10),
          Obx(
            () => _ChoiceWrap(
              title: 'time'.tr,
              values: controller.times,
              selected: controller.selectedTime.value,
              onSelected: (value) => controller.selectedTime.value = value,
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            onChanged: (value) => controller.address.value = value,
            decoration: InputDecoration(
              labelText: 'address'.tr,
              hintText: controller.address.value,
              prefixIcon: const Icon(Icons.location_on_outlined),
              filled: true,
              fillColor: AppColors.input,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFFDAE5F4)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFFDAE5F4)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: AppColors.gold),
              ),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: controller.noteController,
            minLines: 3,
            maxLines: 5,
            onChanged: (value) => controller.note.value = value,
            decoration: InputDecoration(
              hintText: 'booking_note_hint'.tr,
              filled: true,
              fillColor: AppColors.background,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ChoiceWrap extends StatelessWidget {
  const _ChoiceWrap({
    required this.title,
    required this.values,
    required this.selected,
    required this.onSelected,
  });

  final String title;
  final List<String> values;
  final String selected;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.input,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFDAE5F4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: values.map((value) {
              final isSelected = selected == value;
              return ChoiceChip(
                label: Text(value),
                selected: isSelected,
                selectedColor: AppColors.goldSoft,
                onSelected: (_) => onSelected(value),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _InputLike extends StatelessWidget {
  const _InputLike({
    required this.icon,
    required this.label,
    required this.value,
  });

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
                Text(
                  label,
                  style: const TextStyle(
                    color: AppColors.muted,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    color: AppColors.text,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
