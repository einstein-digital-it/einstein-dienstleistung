import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/customer_clients_controller.dart';
import '../models/managed_client.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';

class CustomerClientsView extends GetView<CustomerClientsController> {
  const CustomerClientsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('client_workspace'.tr),
        leading: IconButton(
          onPressed: Get.back,
          icon: const Icon(Icons.arrow_back_rounded),
        ),
        actions: [
          IconButton(
            onPressed: controller.loadClients,
            tooltip: 'refresh'.tr,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.navy,
        foregroundColor: Colors.white,
        onPressed: () => _showAddClient(context),
        icon: const Icon(Icons.person_add_alt_1_rounded),
        label: Text('add_client'.tr),
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.clients.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }
        return RefreshIndicator(
          onRefresh: controller.loadClients,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
            children: [
              const _IntroCard(),
              const SizedBox(height: 20),
              if (controller.errorText.value.isNotEmpty)
                _ErrorCard(text: controller.errorText.value),
              if (controller.clients.isEmpty &&
                  controller.errorText.value.isEmpty)
                const _EmptyClients()
              else
                ...controller.clients.map(
                  (client) => _ClientCard(client: client),
                ),
            ],
          ),
        );
      }),
    );
  }

  Future<void> _showAddClient(BuildContext context) async {
    final name = TextEditingController();
    final company = TextEditingController();
    final email = TextEditingController();
    final phone = TextEditingController();
    final notes = TextEditingController();
    var language = 'de';
    await Get.bottomSheet(
      StatefulBuilder(
        builder: (context, setState) => SafeArea(
          child: Container(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'add_client_title'.tr,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'client_intro'.tr,
                    style: TextStyle(color: AppColors.muted),
                  ),
                  const SizedBox(height: 18),
                  _Field(
                    controller: name,
                    label: 'client_name'.tr,
                    icon: Icons.person_outline,
                  ),
                  _Field(
                    controller: company,
                    label: 'company'.tr,
                    icon: Icons.business_outlined,
                  ),
                  _Field(
                    controller: email,
                    label: 'email'.tr,
                    icon: Icons.email_outlined,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  _Field(
                    controller: phone,
                    label: 'phone_whatsapp'.tr,
                    icon: Icons.phone_outlined,
                    keyboardType: TextInputType.phone,
                  ),
                  DropdownButtonFormField<String>(
                    initialValue: language,
                    decoration: InputDecoration(
                      labelText: 'client_language'.tr,
                    ),
                    items: [
                      DropdownMenuItem(
                        value: 'de',
                        child: Text('language_deutsch'.tr),
                      ),
                      DropdownMenuItem(
                        value: 'en',
                        child: Text('language_english'.tr),
                      ),
                      DropdownMenuItem(
                        value: 'ar',
                        child: Text('language_arabic'.tr),
                      ),
                    ],
                    onChanged: (value) =>
                        setState(() => language = value ?? 'de'),
                  ),
                  const SizedBox(height: 12),
                  _Field(
                    controller: notes,
                    label: 'team_instructions'.tr,
                    icon: Icons.notes_outlined,
                    maxLines: 3,
                  ),
                  const SizedBox(height: 12),
                  Obx(
                    () => PrimaryButton(
                      label: 'create_client'.tr,
                      icon: Icons.check_circle_outline,
                      isLoading: controller.isSaving.value,
                      onPressed: () async {
                        if (name.text.trim().isEmpty) {
                          Get.snackbar(
                            'client_name'.tr,
                            'client_name_required'.tr,
                          );
                          return;
                        }
                        final ok = await controller.addClient({
                          'full_name': name.text.trim(),
                          'company_name': company.text.trim().isEmpty
                              ? null
                              : company.text.trim(),
                          'email': email.text.trim().isEmpty
                              ? null
                              : email.text.trim(),
                          'phone': phone.text.trim().isEmpty
                              ? null
                              : phone.text.trim(),
                          'preferred_language': language,
                          'notes': notes.text.trim().isEmpty
                              ? null
                              : notes.text.trim(),
                        });
                        if (ok) Get.back();
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      isScrollControlled: true,
    );
    name.dispose();
    company.dispose();
    email.dispose();
    phone.dispose();
    notes.dispose();
  }
}

class _IntroCard extends StatelessWidget {
  const _IntroCard();
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: AppColors.navy,
      borderRadius: BorderRadius.circular(18),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.groups_2_outlined, color: AppColors.gold, size: 32),
        const SizedBox(height: 12),
        Text(
          'clients_intro_title'.tr,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 21,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 7),
        Text(
          'clients_intro_body'.tr,
          style: const TextStyle(color: Color(0xFFDDE7F4), height: 1.4),
        ),
      ],
    ),
  );
}

class _ClientCard extends StatelessWidget {
  const _ClientCard({required this.client});
  final ManagedClient client;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => Get.toNamed(AppRoutes.clientWorkspace, arguments: client.id),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.line),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppColors.goldSoft,
                  foregroundColor: AppColors.navy,
                  child: Text(
                    client.fullName.isEmpty
                        ? '?'
                        : client.fullName[0].toUpperCase(),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        client.fullName,
                        style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          color: AppColors.navy,
                          fontSize: 17,
                        ),
                      ),
                      if (client.companyName?.isNotEmpty ?? false)
                        Text(
                          client.companyName!,
                          style: const TextStyle(color: AppColors.muted),
                        ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right_rounded, color: AppColors.muted),
              ],
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _Count(
                  icon: Icons.forum_outlined,
                  count: client.communicationsCount,
                  label: 'updates'.tr,
                ),
                _Count(
                  icon: Icons.confirmation_number_outlined,
                  count: client.openRequestsCount,
                  label: 'open'.tr,
                ),
                _Count(
                  icon: Icons.attach_file_rounded,
                  count: client.filesCount,
                  label: 'files'.tr,
                ),
                _Count(
                  icon: Icons.receipt_long_outlined,
                  count: client.openInvoicesCount,
                  label: 'invoices'.tr,
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  );
}

class _Count extends StatelessWidget {
  const _Count({required this.icon, required this.count, required this.label});
  final IconData icon;
  final int count;
  final String label;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
    decoration: BoxDecoration(
      color: AppColors.background,
      borderRadius: BorderRadius.circular(8),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.gold),
        const SizedBox(width: 4),
        Text(
          '$count $label',
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: AppColors.navy,
          ),
        ),
      ],
    ),
  );
}

class _EmptyClients extends StatelessWidget {
  const _EmptyClients();
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 48),
    child: Column(
      children: [
        const Icon(
          Icons.person_add_alt_1_outlined,
          color: AppColors.gold,
          size: 52,
        ),
        const SizedBox(height: 12),
        Text(
          'clients_empty'.tr,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: AppColors.muted,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    ),
  );
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.text});
  final String text;
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 14),
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: const Color(0xFFFFF7ED),
      borderRadius: BorderRadius.circular(12),
    ),
    child: Text(
      text,
      style: const TextStyle(
        color: Color(0xFF9A3412),
        fontWeight: FontWeight.w700,
      ),
    ),
  );
}

class _Field extends StatelessWidget {
  const _Field({
    required this.controller,
    required this.label,
    required this.icon,
    this.maxLines = 1,
    this.keyboardType,
  });
  final TextEditingController controller;
  final String label;
  final IconData icon;
  final int maxLines;
  final TextInputType? keyboardType;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: TextField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      decoration: InputDecoration(labelText: label, prefixIcon: Icon(icon)),
    ),
  );
}
