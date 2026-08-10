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
        title: Text('customer_service'.tr),
        leading: IconButton(
          onPressed: Get.back,
          icon: const Icon(Icons.arrow_back_rounded),
        ),
      ),
      body: SafeArea(
        child: Obx(
          () => ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 30),
            children: [
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: AppColors.navy,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.support_agent_outlined,
                      color: AppColors.gold,
                      size: 34,
                    ),
                    SizedBox(height: 16),
                    Text(
                      'help_title'.tr,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 30,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'help_subtitle'.tr,
                      style: TextStyle(color: Color(0xFFDDE7F4), height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: _TypeChip(
                      label: 'callback'.tr,
                      value: 'callback',
                      selected: controller.selectedType.value == 'callback',
                      onTap: () => controller.selectedType.value = 'callback',
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _TypeChip(
                      label: 'email'.tr,
                      value: 'email',
                      selected: controller.selectedType.value == 'email',
                      onTap: () => controller.selectedType.value = 'email',
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _TypeChip(
                      label: 'question'.tr,
                      value: 'question',
                      selected: controller.selectedType.value == 'question',
                      onTap: () => controller.selectedType.value = 'question',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: controller.messageController,
                minLines: 5,
                maxLines: 7,
                onChanged: (value) => controller.message.value = value,
                decoration: InputDecoration(
                  hintText: 'describe_request'.tr,
                  filled: true,
                  fillColor: Colors.white,
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: const BorderSide(color: Color(0xFFE9EEF6)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: const BorderSide(
                      color: AppColors.gold,
                      width: 1.5,
                    ),
                  ),
                ),
              ),
              if (controller.errorText.value.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  controller.errorText.value,
                  style: const TextStyle(
                    color: Color(0xFFDC2626),
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
              const SizedBox(height: 16),
              PrimaryButton(
                label: 'send_request'.tr,
                icon: Icons.send_outlined,
                isLoading: controller.isSubmitting.value,
                onPressed: controller.submitRequest,
              ),
              if (controller.lastRequest.value != null) ...[
                const SizedBox(height: 14),
                _RequestStatusCard(
                  id: controller.lastRequest.value!.id,
                  status: controller.lastRequest.value!.status,
                ),
              ],
              if (controller.supportRequests.isNotEmpty) ...[
                const SizedBox(height: 26),
                Text(
                  'recent_requests'.tr,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                ...controller.supportRequests
                    .take(3)
                    .map(
                      (request) => Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE9EEF6)),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.support_agent_outlined,
                              color: AppColors.gold,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    request.id,
                                    style: const TextStyle(
                                      color: AppColors.navy,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                  Text(
                                    request.message,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: AppColors.muted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              request.status,
                              style: const TextStyle(
                                color: Color(0xFF10B981),
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
              ],
              const SizedBox(height: 26),
              Text('faq'.tr, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 12),
              ...controller.faqs.map(
                (faq) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE9EEF6)),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: ListTile(
                      leading: const Icon(
                        Icons.help_outline_rounded,
                        color: AppColors.gold,
                      ),
                      title: Text(
                        faq,
                        style: const TextStyle(
                          color: AppColors.navy,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      trailing: const Icon(
                        Icons.expand_more_rounded,
                        color: AppColors.muted,
                      ),
                    ),
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

class _RequestStatusCard extends StatelessWidget {
  const _RequestStatusCard({required this.id, required this.status});

  final String id;
  final String status;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF6FF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFBFDBFE)),
      ),
      child: Row(
        children: [
          const Icon(Icons.check_circle_outline, color: Color(0xFF2563EB)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'request_sent'.trParams({'id': id}),
              style: const TextStyle(
                color: AppColors.navy,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          Text(
            status,
            style: const TextStyle(
              color: Color(0xFF2563EB),
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _TypeChip extends StatelessWidget {
  const _TypeChip({
    required this.label,
    required this.value,
    required this.selected,
    required this.onTap,
  });

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
          border: Border.all(
            color: selected ? AppColors.navy : const Color(0xFFE9EEF6),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : AppColors.navy,
            fontWeight: FontWeight.w900,
            fontSize: 12.5,
          ),
        ),
      ),
    );
  }
}
