import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../controllers/provider_store_controller.dart';
import '../models/provider_document.dart';
import '../theme/app_theme.dart';

class ProviderDocumentsView extends GetView<ProviderStoreController> {
  const ProviderDocumentsView({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text('documents'.tr),
      actions: [
        IconButton(
          tooltip: 'refresh'.tr,
          onPressed: controller.loadDocuments,
          icon: const Icon(Icons.refresh_rounded),
        ),
      ],
    ),
    floatingActionButton: FloatingActionButton.extended(
      onPressed: _showAddDocument,
      icon: const Icon(Icons.add_rounded),
      label: Text('add_document'.tr),
    ),
    body: Obx(
      () => RefreshIndicator(
        onRefresh: controller.loadDocuments,
        child: controller.documents.isEmpty
            ? ListView(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(32),
                    child: Center(
                      child: Text(
                        'no_documents'.tr,
                        style: const TextStyle(color: Color(0xFF667085)),
                      ),
                    ),
                  ),
                ],
              )
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: controller.documents.length,
                itemBuilder: (_, index) =>
                    _DocumentCard(document: controller.documents[index]),
              ),
      ),
    ),
  );

  Future<void> _showAddDocument() async {
    final title = TextEditingController();
    final type = TextEditingController();
    final selected = Rxn<PlatformFile>();
    await Get.bottomSheet(
      SafeArea(
        child: Material(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'add_document'.tr,
                  style: Get.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: title,
                  decoration: InputDecoration(labelText: 'document_title'.tr),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: type,
                  decoration: InputDecoration(labelText: 'document_type'.tr),
                ),
                const SizedBox(height: 10),
                Obx(
                  () => OutlinedButton.icon(
                    onPressed: () async {
                      final result = await FilePicker.pickFiles(withData: true);
                      if (result?.files.singleOrNull != null) {
                        selected.value = result!.files.single;
                      }
                    },
                    icon: const Icon(Icons.attach_file_rounded),
                    label: Text(
                      selected.value == null
                          ? 'select_file'.tr
                          : '${'selected_file'.tr}: ${selected.value!.name}',
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Obx(
                  () => FilledButton(
                    onPressed: controller.isSaving.value
                        ? null
                        : () async {
                            if (selected.value == null) {
                              Get.snackbar(
                                'action_failed'.tr,
                                'file_required'.tr,
                              );
                              return;
                            }
                            final created = await controller
                                .uploadProviderDocument(
                                  file: selected.value!,
                                  title: title.text.trim().isEmpty
                                      ? selected.value!.name
                                      : title.text.trim(),
                                  documentType: type.text.trim(),
                                );
                            if (created) Get.back();
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
                        : Text('add'.tr),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      isScrollControlled: true,
    );
    title.dispose();
    type.dispose();
  }
}

class _DocumentCard extends GetView<ProviderStoreController> {
  const _DocumentCard({required this.document});
  final ProviderDocument document;
  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 10),
    child: ListTile(
      leading: const CircleAvatar(
        backgroundColor: Color(0x1A183552),
        child: Icon(Icons.description_outlined, color: AppTheme.navy),
      ),
      title: Text(
        document.title,
        style: const TextStyle(fontWeight: FontWeight.w700),
      ),
      subtitle: Text(
        [
          document.documentType,
          document.status,
        ].whereType<String>().where((value) => value.isNotEmpty).join(' • '),
      ),
      trailing: IconButton(
        tooltip: 'delete'.tr,
        icon: const Icon(
          Icons.delete_outline_rounded,
          color: Color(0xFFB42318),
        ),
        onPressed: () => _confirmDelete(),
      ),
      onTap: document.fileUrl?.isNotEmpty == true ? _open : null,
    ),
  );

  Future<void> _confirmDelete() async {
    final delete = await Get.dialog<bool>(
      AlertDialog(
        title: Text('delete_document_title'.tr),
        content: Text('delete_document_message'.tr),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('cancel'.tr),
          ),
          FilledButton(
            onPressed: () => Get.back(result: true),
            child: Text('delete'.tr),
          ),
        ],
      ),
    );
    if (delete == true) await controller.deleteDocument(document);
  }

  Future<void> _open() async {
    final success = await launchUrl(
      Uri.parse(controller.resolveUrl(document.fileUrl!)),
      mode: LaunchMode.externalApplication,
    );
    if (!success) Get.snackbar('action_failed'.tr, 'file_open_failed'.tr);
  }
}
