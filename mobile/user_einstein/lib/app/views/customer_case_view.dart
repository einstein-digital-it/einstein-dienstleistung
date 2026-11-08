import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/documents_controller.dart';
import '../models/customer_document.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/ui.dart';
import 'documents_view.dart';

const _overviewLabel = '00_Uebersicht';

/// "My files" on the My file screen: the files the customer created.
class CasesSection extends StatelessWidget {
  const CasesSection({super.key});

  Future<void> _create(DocumentsController c) async {
    final text = TextEditingController();
    final name = await Get.dialog<String>(AlertDialog(
      title: Text('cases_new'.tr),
      content: TextField(
        controller: text,
        autofocus: true,
        maxLength: 120,
        decoration: InputDecoration(hintText: 'cases_name_hint'.tr),
      ),
      actions: [
        TextButton(onPressed: () => Get.back(), child: Text('cancel'.tr)),
        FilledButton(onPressed: () => Get.back(result: text.text.trim()), child: Text('cases_create'.tr)),
      ],
    ));
    text.dispose();
    if (name == null || name.isEmpty) return;
    final id = await c.createCase(name);
    if (id != null) Get.toNamed(AppRoutes.documentCase, arguments: id);
  }

  @override
  Widget build(BuildContext context) {
    final c = Get.find<DocumentsController>();
    return Obx(() {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionTitle(title: 'cases_title'.tr, action: 'cases_new'.tr, onAction: () => _create(c)),
          if (c.cases.isEmpty)
            Text('cases_empty'.tr, style: Theme.of(context).textTheme.bodySmall)
          else
            for (final item in c.cases) ...[
              AppCard(
                padding: const EdgeInsets.all(14),
                onTap: () => Get.toNamed(AppRoutes.documentCase, arguments: item.id),
                child: Row(
                  children: [
                    const IconTile(icon: Icons.folder_copy_outlined, color: AppColors.purple, size: 42),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.name, maxLines: 2, overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 2),
                          Text('files_tile_count'.trParams({'count': '${item.documentsCount}'}),
                              style: Theme.of(context).textTheme.bodySmall),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
            ],
          const SizedBox(height: 22),
        ],
      );
    });
  }
}

/// One created file: upload button and the numbered sub-folders.
class CaseView extends StatefulWidget {
  const CaseView({super.key});

  @override
  State<CaseView> createState() => _CaseViewState();
}

class _CaseViewState extends State<CaseView> {
  final c = Get.find<DocumentsController>();
  final int id = Get.arguments as int;

  @override
  void initState() {
    super.initState();
    c.openCaseById(id);
  }

  @override
  void dispose() {
    c.closeCase();
    super.dispose();
  }

  Future<void> _delete() async {
    final ok = await Get.dialog<bool>(AlertDialog(
      title: Text('case_delete'.tr),
      content: Text('case_delete_confirm'.tr),
      actions: [
        TextButton(onPressed: () => Get.back(result: false), child: Text('cancel'.tr)),
        FilledButton(
          style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
          onPressed: () => Get.back(result: true),
          child: Text('files_delete'.tr),
        ),
      ],
    ));
    if (ok != true) return;
    if (await c.deleteCase(id)) Get.back();
  }

  void _pickSource() {
    Widget option(IconData icon, String label, UploadSource source) => ListTile(
      leading: IconTile(icon: icon, color: AppColors.purple, size: 40),
      title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.navy)),
      onTap: () {
        Get.back();
        c.pickAndUploadToCase(id, source);
      },
    );
    Get.bottomSheet(
      SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            option(Icons.photo_camera_outlined, 'files_from_camera'.tr, UploadSource.camera),
            option(Icons.photo_library_outlined, 'case_from_gallery'.tr, UploadSource.gallery),
            option(Icons.picture_as_pdf_outlined, 'case_from_files'.tr, UploadSource.file),
          ],
        ),
      ),
      backgroundColor: Colors.white,
    );
  }

  void _openSection(String title, {String? section, bool overview = false}) {
    Get.toNamed(AppRoutes.documentCaseSection, arguments: {'title': title, 'section': section, 'overview': overview});
  }

  Widget _tile(String label, int count, IconData icon, VoidCallback onTap) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: AppCard(
      padding: const EdgeInsets.all(14),
      onTap: onTap,
      child: Row(
        children: [
          IconTile(icon: icon, color: AppColors.gold, size: 40),
          const SizedBox(width: 12),
          // Folder names are German file names, so they always read left to right
          Expanded(
            child: Text(label,
                textDirection: TextDirection.ltr,
                textAlign: Directionality.of(context) == TextDirection.rtl ? TextAlign.right : TextAlign.left,
                style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 8),
          Text('$count', style: const TextStyle(color: AppColors.muted, fontWeight: FontWeight.w700)),
        ],
      ),
    ),
  );

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final detail = c.openCase.value;
      final uploading = c.caseUpload.value.isNotEmpty;
      return Scaffold(
        appBar: AppBar(
          title: Text(detail?.name ?? ''),
          actions: [
            IconButton(tooltip: 'case_delete'.tr, icon: const Icon(Icons.delete_outline_rounded), onPressed: _delete),
          ],
        ),
        body: detail == null
            ? (c.caseError.value
                ? EmptyState(icon: Icons.cloud_off_rounded, text: 'case_load_error'.tr)
                : const Center(child: CircularProgressIndicator()))
            : RefreshIndicator(
                onRefresh: () => c.openCaseById(id),
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
                  children: [
                    FilledButton.icon(
                      onPressed: uploading ? null : _pickSource,
                      icon: uploading
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(Icons.upload_file_rounded),
                      label: Text(uploading ? c.caseUpload.value : 'case_upload'.tr),
                    ),
                    const SizedBox(height: 12),
                    if (c.aboKnown.value && !c.aboActive.value) ...[
                      const AboCard(),
                      const SizedBox(height: 12),
                    ],
                    if (detail.hasProcessing) ...[
                      Pill(label: 'files_processing'.tr, icon: Icons.auto_awesome_rounded),
                      const SizedBox(height: 12),
                    ],
                    if (detail.documents.isEmpty)
                      EmptyState(icon: Icons.folder_copy_outlined, text: 'case_empty'.tr)
                    else ...[
                      _tile(_overviewLabel, detail.documents.length, Icons.summarize_outlined,
                          () => _openSection(_overviewLabel, overview: true)),
                      for (final s in detail.sections)
                        _tile(s.label, detail.inSection(s.name).length, Icons.folder_rounded,
                            () => _openSection(s.label, section: s.name)),
                      if (detail.hasUnsorted)
                        _tile('case_unsorted'.tr, detail.inSection(null).length, Icons.folder_open_rounded,
                            () => _openSection('case_unsorted'.tr)),
                    ],
                  ],
                ),
              ),
      );
    });
  }
}

/// The papers of one sub-folder, or all of them with their summaries (00_Uebersicht).
class CaseSectionView extends StatelessWidget {
  const CaseSectionView({super.key});

  @override
  Widget build(BuildContext context) {
    final args = Map<String, dynamic>.from(Get.arguments as Map);
    final overview = args['overview'] == true;
    final c = Get.find<DocumentsController>();
    return Scaffold(
      appBar: AppBar(title: Text(args['title'].toString())),
      body: Obx(() {
        final detail = c.openCase.value;
        final List<CustomerDocument> docs =
            detail == null ? const [] : (overview ? detail.documents : detail.inSection(args['section'] as String?));
        if (docs.isEmpty) return EmptyState(icon: Icons.folder_open_rounded, text: 'files_folder_empty'.tr);
        return ListView.separated(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
          itemCount: docs.length,
          separatorBuilder: (_, _) => const SizedBox(height: 10),
          itemBuilder: (_, i) => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DocumentTile(doc: docs[i]),
              if (overview && (docs[i].summary ?? '').isNotEmpty)
                Padding(
                  padding: const EdgeInsets.fromLTRB(6, 6, 6, 0),
                  child: Text(docs[i].summary!, style: Theme.of(context).textTheme.bodySmall),
                ),
            ],
          ),
        );
      }),
    );
  }
}
