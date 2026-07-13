import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/customer_service_controller.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';

class CustomerServiceView extends GetView<CustomerServiceController> {
  const CustomerServiceView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Customer Service'),
        leading: IconButton(onPressed: Get.back, icon: const Icon(Icons.arrow_back_rounded)),
      ),
      body: SafeArea(
        child: Obx(
          () => ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 30),
            children: [
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(color: AppColors.navy, borderRadius: BorderRadius.circular(24)),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.support_agent_outlined, color: AppColors.gold, size: 34),
                    SizedBox(height: 16),
                    Text('How can we help?', style: TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w900)),
                    SizedBox(height: 8),
                    Text('Reach the EinStein support team for bookings, documents and payment questions.', style: TextStyle(color: Color(0xFFDDE7F4), height: 1.4)),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(child: _TypeChip(label: 'Callback', value: 'callback', selected: controller.selectedType.value == 'callback', onTap: () => controller.selectedType.value = 'callback')),
                  const SizedBox(width: 10),
                  Expanded(child: _TypeChip(label: 'Email', value: 'email', selected: controller.selectedType.value == 'email', onTap: () => controller.selectedType.value = 'email')),
                  const SizedBox(width: 10),
                  Expanded(child: _TypeChip(label: 'Question', value: 'question', selected: controller.selectedType.value == 'question', onTap: () => controller.selectedType.value = 'question')),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                minLines: 5,
                maxLines: 7,
                onChanged: (value) => controller.message.value = value,
                decoration: InputDecoration(
                  hintText: 'Describe your request...',
                  filled: true,
                  fillColor: Colors.white,
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: Color(0xFFE9EEF6))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: AppColors.gold, width: 1.5)),
                ),
              ),
              const SizedBox(height: 16),
              PrimaryButton(label: 'Send request', icon: Icons.send_outlined, onPressed: () {}),
              const SizedBox(height: 26),
              Text('Frequently asked questions', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 12),
              ...controller.faqs.map(
                (faq) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE9EEF6))),
                  child: ListTile(
                    leading: const Icon(Icons.help_outline_rounded, color: AppColors.gold),
                    title: Text(faq, style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w800)),
                    trailing: const Icon(Icons.expand_more_rounded, color: AppColors.muted),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TypeChip extends StatelessWidget {
  const _TypeChip({required this.label, required this.value, required this.selected, required this.onTap});

  final String label;
  final String value;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        height: 48,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? AppColors.navy : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: selected ? AppColors.navy : const Color(0xFFE9EEF6)),
        ),
        child: Text(label, style: TextStyle(color: selected ? Colors.white : AppColors.navy, fontWeight: FontWeight.w900, fontSize: 12.5)),
      ),
    );
  }
}
