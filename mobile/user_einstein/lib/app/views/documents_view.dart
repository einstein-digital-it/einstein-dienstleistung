import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/documents_controller.dart';
import '../models/customer_document.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/ui.dart';
import 'customer_case_view.dart';

String folderName(String folder) => 'folder_$folder'.tr;

String formatDate(DateTime? date) {
  if (date == null) return '';
  String two(int v) => v.toString().padLeft(2, '0');
  return '${two(date.day)}.${two(date.month)}.${date.year}';
}

/// "My file": upload card, reminders and the folders.
class DocumentsView extends StatefulWidget {
  const DocumentsView({super.key});

  @override
  State<DocumentsView> createState() => _DocumentsViewState();
}

class _DocumentsViewState extends State<DocumentsView> {
  final controller = Get.find<DocumentsController>();

  @override
  void initState() {
    super.initState();
    controller.load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: const AppBottomNav(tab: NavTab.documents),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: controller.load,
          child: Obx(() {
            final loading = controller.isLoading.value && !controller.loadedOnce.value;
            return ListView(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
              children: [
                Text('files_title'.tr, style: Theme.of(context).textTheme.headlineLarge),
                const SizedBox(height: 4),
                Text('files_subtitle'.tr, style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 18),
                const UploadHeroCard(),
                if (controller.aboKnown.value) ...[
                  const SizedBox(height: 12),
                  const AboCard(),
                ],
                if (controller.hasProcessing) ...[
                  const SizedBox(height: 12),
                  const _ProcessingBanner(),
                ],
                if (controller.errorText.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Text(controller.errorText.value, style: const TextStyle(color: AppColors.danger)),
                ],
                if (controller.reminders.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  SectionTitle(title: 'reminders_title'.tr),
                  for (final r in controller.reminders.take(4)) ...[
                    ReminderCard(reminder: r),
                    const SizedBox(height: 10),
                  ],
                ],
                const SizedBox(height: 22),
                const CasesSection(),
                SectionTitle(title: 'files_folders'.tr),
                if (loading)
                  const Padding(
                    padding: EdgeInsets.all(40),
                    child: Center(child: CircularProgressIndicator()),
                  )
                else
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: documentFolders.length,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      mainAxisExtent: 104,
                    ),
                    itemBuilder: (context, i) {
                      final folder = documentFolders[i];
                      final count = controller.countIn(folder);
                      return _FolderTile(
                        folder: folder,
                        count: count,
                        onTap: () => Get.toNamed(AppRoutes.documentFolder, arguments: folder),
                      );
                    },
                  ),
              ],
            );
          }),
        ),
      ),
    );
  }
}

class _FolderTile extends StatelessWidget {
  const _FolderTile({required this.folder, required this.count, required this.onTap});

  final String folder;
  final int count;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.all(12),
      color: count > 0 ? null : AppColors.surface.withValues(alpha: 0.6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          IconTile(icon: folderIcon(folder), color: folderColor(folder), size: 36),
          const Spacer(),
          Text(
            folderName(folder),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: AppColors.navy, fontSize: 13, height: 1.25, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 2),
          Text(
            count == 0 ? 'files_tile_empty'.tr : 'files_tile_count'.trParams({'count': '$count'}),
            style: TextStyle(
              color: count == 0 ? AppColors.muted : folderColor(folder),
              fontSize: 11.5,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

/// The monthly Abo for automatic sorting + translation: offer it, or show it is active.
class AboCard extends StatelessWidget {
  const AboCard({super.key});

  Future<void> _confirmCancel(DocumentsController c) async {
    final ok = await Get.dialog<bool>(AlertDialog(
      title: Text('abo_cancel'.tr),
      content: Text('abo_cancel_confirm'.tr),
      actions: [
        TextButton(onPressed: () => Get.back(result: false), child: Text('abo_keep'.tr)),
        TextButton(onPressed: () => Get.back(result: true), child: Text('abo_cancel'.tr)),
      ],
    ));
    if (ok == true) await c.cancelSubscription();
  }

  @override
  Widget build(BuildContext context) {
    final c = Get.find<DocumentsController>();
    return Obx(() {
      if (c.aboActive.value) {
        final ends = c.aboEndsAt.value;
        return AppCard(
          child: Row(
            children: [
              const Icon(Icons.verified_rounded, color: AppColors.success),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  ends == null ? 'abo_active'.tr : 'abo_active_until'.trParams({'date': formatDate(ends)}),
                  style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.navy),
                ),
              ),
              if (ends == null)
                TextButton(
                  onPressed: c.aboBusy.value ? null : () => _confirmCancel(c),
                  child: Text('abo_cancel'.tr),
                ),
            ],
          ),
        );
      }
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: AppColors.purpleSoft, borderRadius: BorderRadius.circular(18)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              const Icon(Icons.auto_awesome_rounded, color: AppColors.purple),
              const SizedBox(width: 8),
              Expanded(
                child: Text('abo_title'.tr,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.navy)),
              ),
            ]),
            const SizedBox(height: 8),
            Text('abo_pitch'.tr, style: const TextStyle(color: AppColors.navy, height: 1.5)),
            const SizedBox(height: 4),
            Text('abo_price'.trParams({'price': c.aboPriceText}),
                style: const TextStyle(color: AppColors.purple, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: c.aboBusy.value ? null : c.subscribe,
                icon: const Icon(Icons.lock_open_rounded),
                label: Text('abo_subscribe'.tr),
              ),
            ),
          ],
        ),
      );
    });
  }
}

class _ProcessingBanner extends StatelessWidget {
  const _ProcessingBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.purpleSoft, borderRadius: BorderRadius.circular(14)),
      child: Row(
        children: [
          const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2.2)),
          const SizedBox(width: 12),
          Expanded(
            child: Text('files_processing'.tr, style: const TextStyle(color: AppColors.purple, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

/// Gradient card: "Upload a letter — we sort and translate it".
class UploadHeroCard extends StatelessWidget {
  const UploadHeroCard({super.key, this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<DocumentsController>();
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppColors.actionGradient,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [BoxShadow(color: AppColors.purple.withValues(alpha: 0.25), blurRadius: 24, offset: const Offset(0, 12))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.16), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.auto_awesome_rounded, color: AppColors.goldBright),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'files_upload_title'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 17, height: 1.3, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
          if (!compact) ...[
            const SizedBox(height: 10),
            Text(
              'files_upload_desc'.tr,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 13.5, height: 1.5),
            ),
          ],
          const SizedBox(height: 16),
          Obx(
            () => SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: controller.isUploading.value ? null : () => showUploadSheet(),
                style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppColors.purpleDeep),
                icon: controller.isUploading.value
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.document_scanner_outlined),
                label: Text(controller.isUploading.value ? 'files_uploading'.tr : 'files_upload'.tr),
              ),
            ),
          ),
          if (!compact) ...[
            const SizedBox(height: 10),
            Text(
              'files_ai_note'.tr,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 11, height: 1.4),
            ),
          ],
        ],
      ),
    );
  }
}

void showUploadSheet({String folder = 'auto'}) {
  final controller = Get.find<DocumentsController>();
  Widget option(IconData icon, String label, UploadSource source) => ListTile(
    leading: IconTile(icon: icon, color: AppColors.purple, size: 40),
    title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.navy)),
    onTap: () {
      Get.back();
      controller.pickAndUpload(source, folder: folder);
    },
  );
  Get.bottomSheet(
    SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(8, 0, 8, 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            option(Icons.photo_camera_outlined, 'files_from_camera'.tr, UploadSource.camera),
            option(Icons.photo_library_outlined, 'files_from_gallery'.tr, UploadSource.gallery),
            option(Icons.picture_as_pdf_outlined, 'files_from_file'.tr, UploadSource.file),
          ],
        ),
      ),
    ),
    backgroundColor: Colors.white,
  );
}

class ReminderCard extends StatelessWidget {
  const ReminderCard({super.key, required this.reminder});

  final CustomerReminder reminder;

  @override
  Widget build(BuildContext context) {
    final days = reminder.daysLeft;
    final urgent = days <= 14;
    final color = days < 0 ? AppColors.danger : urgent ? AppColors.warning : AppColors.success;
    final label = days < 0
        ? 'reminder_overdue'.tr
        : days == 0
        ? 'reminder_today'.tr
        : 'reminder_days'.trParams({'days': '$days'});
    return AppCard(
      padding: const EdgeInsets.all(14),
      onTap: () => _showReminder(reminder),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          IconTile(icon: folderIcon(reminder.folder), color: folderColor(reminder.folder), size: 42),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(reminder.title, maxLines: 2, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w700, height: 1.3)),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Pill(label: label, color: color, icon: Icons.schedule_rounded),
                    Text('${folderName(reminder.folder)} · ${formatDate(reminder.dueDate)}',
                        style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

void _showReminder(CustomerReminder reminder) {
  final controller = Get.find<DocumentsController>();
  Get.bottomSheet(
    SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(reminder.title, style: Get.textTheme.headlineSmall),
            const SizedBox(height: 6),
            Text('${folderName(reminder.folder)} · ${formatDate(reminder.dueDate)}', style: Get.textTheme.bodyMedium),
            if ((reminder.details ?? '').isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(reminder.details!, style: Get.textTheme.bodyLarge),
            ],
            const SizedBox(height: 20),
            Row(
              children: [
                if (reminder.documentId != null)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        final doc = controller.documents.firstWhereOrNull((d) => d.id == reminder.documentId);
                        Get.back();
                        if (doc != null) Get.toNamed(AppRoutes.documentDetail, arguments: doc.id);
                      },
                      child: Text('reminder_open_letter'.tr),
                    ),
                  ),
                if (reminder.documentId != null) const SizedBox(width: 10),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () {
                      Get.back();
                      controller.completeReminder(reminder);
                    },
                    icon: const Icon(Icons.check_rounded),
                    label: Text('reminder_done'.tr),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    backgroundColor: Colors.white,
  );
}

class DocumentTile extends StatelessWidget {
  const DocumentTile({super.key, required this.doc, this.showFolder = false});

  final CustomerDocument doc;
  final bool showFolder;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(14),
      onTap: () => Get.toNamed(AppRoutes.documentDetail, arguments: doc.id),
      child: Row(
        children: [
          IconTile(
            icon: doc.isPdf ? Icons.picture_as_pdf_outlined : Icons.image_outlined,
            color: showFolder ? folderColor(doc.folder) : AppColors.purple,
            size: 42,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(doc.title, maxLines: 2, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w700, height: 1.3)),
                const SizedBox(height: 4),
                Text(
                  [if (showFolder) folderName(doc.folder), formatDate(doc.createdAt)].join(' · '),
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                if (doc.isProcessing || doc.byEinstein) ...[
                  const SizedBox(height: 6),
                  Wrap(spacing: 6, children: [
                    if (doc.isProcessing) Pill(label: 'files_processing_short'.tr, icon: Icons.auto_awesome_rounded),
                    if (doc.byEinstein) Pill(label: 'files_by_einstein'.tr, color: AppColors.gold),
                  ]),
                ],
              ],
            ),
          ),
          Icon(Directionality.of(context) == TextDirection.rtl ? Icons.chevron_left_rounded : Icons.chevron_right_rounded,
              color: AppColors.muted),
        ],
      ),
    );
  }
}

class FolderView extends StatelessWidget {
  const FolderView({super.key});

  @override
  Widget build(BuildContext context) {
    final folder = (Get.arguments ?? 'sonstiges').toString();
    final controller = Get.find<DocumentsController>();
    return Scaffold(
      appBar: AppBar(title: Text(folderName(folder))),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showUploadSheet(folder: folder),
        backgroundColor: AppColors.purple,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: Text('files_add_here'.tr),
      ),
      body: Obx(() {
        final docs = controller.inFolder(folder);
        if (docs.isEmpty) {
          return EmptyState(icon: folderIcon(folder), text: 'files_folder_empty'.tr);
        }
        return ListView.separated(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
          itemCount: docs.length,
          separatorBuilder: (_, _) => const SizedBox(height: 10),
          itemBuilder: (_, i) => DocumentTile(doc: docs[i]),
        );
      }),
    );
  }
}

class DocumentDetailView extends StatefulWidget {
  const DocumentDetailView({super.key});

  @override
  State<DocumentDetailView> createState() => _DocumentDetailViewState();
}

class _DocumentDetailViewState extends State<DocumentDetailView> {
  final controller = Get.find<DocumentsController>();
  bool showTranslation = true;

  @override
  Widget build(BuildContext context) {
    final id = Get.arguments as int?;
    return Obx(() {
      final doc = controller.findDocument(id);
      if (doc == null) {
        return Scaffold(appBar: AppBar(), body: EmptyState(icon: Icons.description_outlined, text: 'files_not_found'.tr));
      }
      final otherLanguage = doc.translationLanguage != null && doc.translationLanguage != controller.langCode;
      return Scaffold(
        appBar: AppBar(
          title: Text(folderName(doc.folder)),
          actions: [
            ShareDocumentsButton(docs: [doc], subject: doc.title),
            IconButton(
              tooltip: 'files_delete'.tr,
              icon: const Icon(Icons.delete_outline_rounded),
              onPressed: () async {
                final ok = await Get.dialog<bool>(AlertDialog(
                  title: Text('files_delete'.tr),
                  content: Text('files_delete_confirm'.tr),
                  actions: [
                    TextButton(onPressed: () => Get.back(result: false), child: Text('cancel'.tr)),
                    FilledButton(
                      style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
                      onPressed: () => Get.back(result: true),
                      child: Text('files_delete'.tr),
                    ),
                  ],
                ));
                if (ok == true) {
                  await controller.remove(doc);
                  Get.back();
                }
              },
            ),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 32),
          children: [
            Text(doc.title, style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Wrap(spacing: 8, runSpacing: 6, children: [
              Pill(label: folderName(doc.folder), color: folderColor(doc.folder), icon: folderIcon(doc.folder)),
              Pill(label: formatDate(doc.createdAt), color: AppColors.muted),
              if (doc.byEinstein) Pill(label: 'files_by_einstein'.tr, color: AppColors.gold),
            ]),
            if ((doc.sender ?? '').isNotEmpty) ...[
              const SizedBox(height: 14),
              Text('${'files_from'.tr}: ${doc.sender}', style: Theme.of(context).textTheme.titleMedium),
            ],
            const SizedBox(height: 16),
            if (doc.isProcessing) const _ProcessingBanner(),
            if (doc.deadline != null) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: AppColors.warningSoft, borderRadius: BorderRadius.circular(14)),
                child: Row(children: [
                  const Icon(Icons.event_available_rounded, color: AppColors.warning),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text('${'files_deadline'.tr}: ${formatDate(doc.deadline)}',
                        style: const TextStyle(color: AppColors.warning, fontWeight: FontWeight.w700)),
                  ),
                ]),
              ),
              const SizedBox(height: 12),
            ],
            if ((doc.summary ?? '').isNotEmpty) ...[
              AppCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Icon(Icons.auto_awesome_rounded, color: AppColors.purple, size: 20),
                    const SizedBox(width: 8),
                    Text('files_summary'.tr, style: Theme.of(context).textTheme.titleLarge),
                  ]),
                  const SizedBox(height: 8),
                  Text(doc.summary!, style: Theme.of(context).textTheme.bodyLarge),
                ]),
              ),
              const SizedBox(height: 12),
            ],
            if ((doc.translation ?? '').isNotEmpty)
              AppCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  InkWell(
                    onTap: () => setState(() => showTranslation = !showTranslation),
                    child: Row(children: [
                      const Icon(Icons.translate_rounded, color: AppColors.navy, size: 20),
                      const SizedBox(width: 8),
                      Expanded(child: Text('files_translation'.tr, style: Theme.of(context).textTheme.titleLarge)),
                      Icon(showTranslation ? Icons.expand_less_rounded : Icons.expand_more_rounded, color: AppColors.muted),
                    ]),
                  ),
                  if (showTranslation) ...[
                    const SizedBox(height: 10),
                    SelectableText(doc.translation!, style: Theme.of(context).textTheme.bodyLarge),
                    const SizedBox(height: 10),
                    Text('files_translation_note'.tr, style: Theme.of(context).textTheme.bodySmall),
                  ],
                ]),
              ),
            const SizedBox(height: 18),
            FilledButton.icon(
              onPressed: () => controller.open(doc),
              icon: const Icon(Icons.open_in_new_rounded),
              label: Text('files_open_original'.tr),
            ),
            if (otherLanguage && !doc.isProcessing) ...[
              const SizedBox(height: 10),
              OutlinedButton.icon(
                onPressed: () => controller.translateAgain(doc),
                icon: const Icon(Icons.translate_rounded),
                label: Text('files_translate_mine'.tr),
              ),
            ],
          ],
        ),
      );
    });
  }
}
