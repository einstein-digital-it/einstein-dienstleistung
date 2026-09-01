import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/provider_store_controller.dart';
import '../models/provider_profile.dart';
import '../theme/app_theme.dart';
import 'provider_workspace_widgets.dart';

class ProviderProfileView extends GetView<ProviderStoreController> {
  const ProviderProfileView({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text('profile'.tr),
      actions: const [ProviderLanguageMenu()],
    ),
    body: Obx(() {
      final profile = controller.profile.value;
      if (profile == null) {
        return const Center(child: CircularProgressIndicator());
      }
      return RefreshIndicator(
        onRefresh: controller.loadDashboard,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _ProfileHeader(profile: profile),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: _pickProfilePhoto,
              icon: const Icon(Icons.photo_camera_outlined),
              label: Text('change_photo'.tr),
            ),
            const SizedBox(height: 14),
            _ProfileSection(
              title: 'contact'.tr,
              children: [
                _Row(icon: Icons.mail_outline_rounded, value: profile.email),
                _Row(icon: Icons.phone_outlined, value: profile.phone ?? '-'),
                _Row(
                  icon: Icons.location_on_outlined,
                  value: profile.address ?? profile.city ?? '-',
                ),
              ],
            ),
            _ProfileSection(
              title: 'specialties'.tr,
              children: [_Tags(values: profile.categories)],
            ),
            _ProfileSection(
              title: 'languages'.tr,
              children: [_Tags(values: profile.languages)],
            ),
            _ProfileSection(
              title: 'availability'.tr,
              children: [_Tags(values: profile.availability)],
            ),
            _ProfileSection(
              title: 'working_hours'.tr,
              children: [
                Text(
                  '${profile.workingHoursStart ?? '-'} - ${profile.workingHoursEnd ?? '-'}',
                ),
              ],
            ),
            _ProfileSection(
              title: 'hourly_rate'.tr,
              children: [
                Text(
                  profile.hourlyRate == null
                      ? '-'
                      : '${profile.hourlyRate!.toStringAsFixed(2)} EUR',
                ),
              ],
            ),
            _ProfileSection(
              title: 'experience'.tr,
              children: [
                Text(
                  profile.experienceYears == null
                      ? '-'
                      : '${profile.experienceYears} ${'years'.tr}',
                ),
              ],
            ),
            _ProfileSection(
              title: 'qualifications'.tr,
              children: [
                Text(
                  profile.qualifications?.isNotEmpty == true
                      ? profile.qualifications!
                      : '-',
                ),
              ],
            ),
            if (profile.bio?.isNotEmpty == true)
              _ProfileSection(
                title: 'details'.tr,
                children: [Text(profile.bio!)],
              ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: () => _showEdit(profile),
              icon: const Icon(Icons.edit_outlined),
              label: Text('edit_profile'.tr),
            ),
          ],
        ),
      );
    }),
  );

  Future<void> _showEdit(ProviderProfile profile) async {
    final name = TextEditingController(text: profile.fullName);
    final phone = TextEditingController(text: profile.phone);
    final address = TextEditingController(text: profile.address);
    final categories = TextEditingController(
      text: profile.categories.join(', '),
    );
    final languages = TextEditingController(text: profile.languages.join(', '));
    final availability = TextEditingController(
      text: profile.availability.join(', '),
    );
    final hoursStart = TextEditingController(text: profile.workingHoursStart);
    final hoursEnd = TextEditingController(text: profile.workingHoursEnd);
    final rate = TextEditingController(text: profile.hourlyRate?.toString());
    final qualifications = TextEditingController(text: profile.qualifications);
    final saved = await Get.bottomSheet<bool>(
      SafeArea(
        child: Material(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'edit_profile'.tr,
                    style: Get.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _Input(controller: name, label: 'full_name'.tr),
                  _Input(
                    controller: phone,
                    label: 'phone'.tr,
                    type: TextInputType.phone,
                  ),
                  _Input(controller: address, label: 'address'.tr),
                  _Input(
                    controller: categories,
                    label: 'specialties'.tr,
                    hint: 'separate_with_commas'.tr,
                  ),
                  _Input(
                    controller: languages,
                    label: 'languages'.tr,
                    hint: 'separate_with_commas'.tr,
                  ),
                  _Input(
                    controller: availability,
                    label: 'availability'.tr,
                    hint: 'separate_with_commas'.tr,
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: _Input(
                          controller: hoursStart,
                          label: 'working_hours'.tr,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _Input(controller: hoursEnd, label: 'to'.tr),
                      ),
                    ],
                  ),
                  _Input(
                    controller: rate,
                    label: 'hourly_rate'.tr,
                    type: const TextInputType.numberWithOptions(decimal: true),
                  ),
                  _Input(
                    controller: qualifications,
                    label: 'qualifications'.tr,
                  ),
                  Obx(
                    () => FilledButton(
                      onPressed: controller.isSaving.value
                          ? null
                          : () async {
                              final result = await controller.updateProfile({
                                'full_name': name.text.trim(),
                                'phone': phone.text.trim(),
                                'address': address.text.trim(),
                                'categories': _split(categories.text),
                                'languages': _split(languages.text),
                                'availability': _split(availability.text),
                                'working_hours_start': hoursStart.text.trim(),
                                'working_hours_end': hoursEnd.text.trim(),
                                'hourly_rate': double.tryParse(
                                  rate.text.trim(),
                                ),
                                'qualifications': qualifications.text.trim(),
                              });
                              if (result) Get.back(result: true);
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
      ),
      isScrollControlled: true,
    );
    for (final item in [
      name,
      phone,
      address,
      categories,
      languages,
      availability,
      hoursStart,
      hoursEnd,
      rate,
      qualifications,
    ]) {
      item.dispose();
    }
    if (saved == true) await controller.loadDashboard();
  }

  Future<void> _pickProfilePhoto() async {
    final result = await FilePicker.pickFiles(
      type: FileType.image,
      withData: true,
    );
    if (result?.files.singleOrNull == null) {
      return;
    }
    await controller.uploadProfileImage(result!.files.single);
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({required this.profile});
  final ProviderProfile profile;
  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 32,
            backgroundColor: AppTheme.navy,
            backgroundImage: profile.profileImage?.isNotEmpty == true
                ? NetworkImage(
                    Get.find<ProviderStoreController>().resolveUrl(
                      profile.profileImage!,
                    ),
                  )
                : null,
            child: profile.profileImage?.isNotEmpty == true
                ? null
                : Text(
                    profile.fullName.isEmpty
                        ? '?'
                        : profile.fullName.substring(0, 1).toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 25,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profile.fullName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  providerStatusText(profile.status),
                  style: const TextStyle(color: Color(0xFF667085)),
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );
}

class _ProfileSection extends StatelessWidget {
  const _ProfileSection({required this.title, required this.children});
  final String title;
  final List<Widget> children;
  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 10),
    child: Padding(
      padding: const EdgeInsets.all(15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              color: AppTheme.navy,
            ),
          ),
          const SizedBox(height: 10),
          ...children,
        ],
      ),
    ),
  );
}

class _Row extends StatelessWidget {
  const _Row({required this.icon, required this.value});
  final IconData icon;
  final String value;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF667085)),
        const SizedBox(width: 8),
        Expanded(child: Text(value)),
      ],
    ),
  );
}

class _Tags extends StatelessWidget {
  const _Tags({required this.values});
  final List<String> values;
  @override
  Widget build(BuildContext context) => values.isEmpty
      ? const Text('-')
      : Wrap(
          spacing: 6,
          runSpacing: 6,
          children: values.map((value) => Chip(label: Text(value))).toList(),
        );
}

class _Input extends StatelessWidget {
  const _Input({
    required this.controller,
    required this.label,
    this.hint,
    this.type,
  });
  final TextEditingController controller;
  final String label;
  final String? hint;
  final TextInputType? type;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: TextField(
      controller: controller,
      keyboardType: type,
      decoration: InputDecoration(labelText: label, hintText: hint),
    ),
  );
}

List<String> _split(String value) => value
    .split(',')
    .map((item) => item.trim())
    .where((item) => item.isNotEmpty)
    .toList();
