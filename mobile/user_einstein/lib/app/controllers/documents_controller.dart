import 'dart:async';
import 'dart:io' show File;

import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../api/api_exception.dart';
import '../api/auth_session.dart';
import '../api/customer_api_service.dart';
import '../models/customer_case.dart';
import '../models/customer_document.dart';
import 'customer_store_controller.dart';

enum UploadSource { camera, gallery, file }

/// The customer's file: documents sorted into folders, plus the reminders
/// found in them. Shared by the dashboard and the "My file" screens.
class DocumentsController extends GetxController {
  final api = Get.find<CustomerApiService>();
  final store = Get.find<CustomerStoreController>();

  final documents = <CustomerDocument>[].obs;
  final reminders = <CustomerReminder>[].obs;
  final isLoading = false.obs;
  final isUploading = false.obs;
  final errorText = ''.obs;
  final loadedOnce = false.obs;

  // Abo: automatic sorting + translation (monthly, VAT included)
  final aboActive = false.obs;
  final aboKnown = false.obs;
  final aboPrice = 6.99.obs;
  final aboUsed = 0.obs;
  final aboLimit = 0.obs;
  final aboEndsAt = Rxn<DateTime>();
  /// Free months from a voucher code (no payment, nothing to cancel).
  final aboFree = false.obs;
  final aboFreeUntil = Rxn<DateTime>();
  final voucherController = TextEditingController();
  final voucherError = ''.obs;
  final aboBusy = false.obs;

  // Files the customer created
  final cases = <CustomerCase>[].obs;
  final openCase = Rxn<CaseDetail>();
  final caseError = false.obs;
  final caseUpload = ''.obs; // progress text while uploading
  final isSharing = false.obs;

  Timer? _poll;
  Timer? _casePoll;

  bool get aboLimitReached => aboActive.value && aboLimit.value > 0 && aboUsed.value >= aboLimit.value;

  String get aboPriceText => aboPrice.value.toStringAsFixed(2).replaceAll('.', ',');

  String get langCode => store.locale.value.languageCode;
  bool get hasProcessing => documents.any((d) => d.isProcessing);

  List<CustomerDocument> inFolder(String folder) =>
      documents.where((d) => d.folder == folder).toList();

  int countIn(String folder) => documents.where((d) => d.folder == folder).length;

  List<CustomerDocument> get recent => documents.take(3).toList();

  Future<void> load({bool silent = false}) async {
    if (!Get.find<AuthSession>().isAuthenticated) return;
    if (!silent) isLoading.value = true;
    errorText.value = '';
    try {
      final results = await Future.wait([api.documents(), api.reminders()]);
      documents.assignAll(results[0] as List<CustomerDocument>);
      reminders.assignAll(results[1] as List<CustomerReminder>);
      loadedOnce.value = true;
    } catch (_) {
      if (!silent) errorText.value = 'files_load_error'.tr;
    } finally {
      isLoading.value = false;
      _schedulePoll();
    }
    if (!silent) await Future.wait([loadSubscription(), loadCases()]);
  }

  Future<void> loadCases() async {
    try {
      cases.assignAll(await api.cases());
    } catch (_) {
      // Older server, or offline: the rest of the screen still works
    }
  }

  /// Creates a file and returns its id.
  Future<int?> createCase(String name) async {
    try {
      final created = await api.createCase(name);
      cases.insert(0, created);
      return created.id;
    } catch (_) {
      Get.snackbar('cases_title'.tr, 'case_create_error'.tr);
      return null;
    }
  }

  Future<void> openCaseById(int id) async {
    caseError.value = false;
    _casePoll?.cancel();
    try {
      final detail = await api.caseDetail(id);
      openCase.value = detail;
      // While the AI is still sorting, keep the folders up to date
      if (detail.hasProcessing) {
        _casePoll = Timer(const Duration(seconds: 6), () => openCaseById(id));
      }
    } catch (_) {
      if (openCase.value == null) caseError.value = true;
    }
  }

  void closeCase() {
    _casePoll?.cancel();
    openCase.value = null;
    caseError.value = false;
    loadCases();
  }

  Future<bool> deleteCase(int id) async {
    try {
      await api.deleteCase(id);
      cases.removeWhere((c) => c.id == id);
      return true;
    } catch (_) {
      Get.snackbar('cases_title'.tr, 'files_delete_error'.tr);
      return false;
    }
  }

  /// Several photos or files at once.
  Future<void> pickAndUploadToCase(int id, UploadSource source) async {
    final picked = <(List<int>, String)>[];
    try {
      if (source == UploadSource.file) {
        final result = await FilePicker.platform.pickFiles(
          allowMultiple: true,
          withData: true,
          type: FileType.custom,
          allowedExtensions: const ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'doc', 'docx'],
        );
        for (final file in result?.files ?? const <PlatformFile>[]) {
          if (file.bytes != null) picked.add((file.bytes!, file.name));
        }
      } else {
        final images = source == UploadSource.camera
            ? [?await ImagePicker().pickImage(source: ImageSource.camera, imageQuality: 85, maxWidth: 2400)]
            : await ImagePicker().pickMultiImage(imageQuality: 85, maxWidth: 2400);
        for (final image in images) {
          picked.add((await image.readAsBytes(), image.name.isEmpty ? 'scan.jpg' : image.name));
        }
      }
    } catch (_) {
      Get.snackbar('files_upload'.tr, 'files_pick_error'.tr);
      return;
    }
    await uploadManyToCase(id, picked);
  }

  /// One after the other, so one bad file does not stop the rest.
  Future<void> uploadManyToCase(int id, List<(List<int>, String)> files) async {
    if (files.isEmpty) return;
    var failed = 0;
    for (var i = 0; i < files.length; i++) {
      caseUpload.value = 'case_uploading'.trParams({'done': '${i + 1}', 'total': '${files.length}'});
      try {
        await api.uploadToCase(id, bytes: files[i].$1, filename: files[i].$2, lang: langCode);
      } catch (_) {
        failed++;
      }
    }
    caseUpload.value = '';
    await openCaseById(id);
    await loadSubscription();
    if (failed > 0) {
      Get.snackbar('case_upload'.tr, 'case_upload_failed'.trParams({'count': '$failed'}));
    } else if (aboKnown.value && !aboActive.value) {
      Get.snackbar('files_uploaded'.tr, 'abo_stored_only'.tr);
    } else if (aboLimitReached) {
      Get.snackbar('files_uploaded'.tr, 'abo_limit_reached'.tr);
    } else {
      Get.snackbar('files_uploaded'.tr, 'files_processing_hint'.tr);
    }
  }

  /// Opens the phone's share menu (WhatsApp, e-mail, Drive, ...) with these papers.
  Future<void> shareDocuments(List<CustomerDocument> docs, {required String subject, String prefix = ''}) async {
    if (docs.isEmpty || isSharing.value) return;
    isSharing.value = true;
    try {
      final names = <String>{};
      final files = <XFile>[];
      for (final doc in docs) {
        files.add(XFile.fromData(Uint8List.fromList(await api.downloadDocument(doc.id)), mimeType: _mimeOf(doc.originalName)));
        final base = doc.originalName.split(RegExp(r'[/\\]')).last;
        final sectionLabel = openCase.value?.sections.firstWhereOrNull((s) => s.name == doc.section)?.label;
        // Sharing a whole file keeps the folder number in each name
        final name = prefix.isEmpty ? base : '${sectionLabel ?? prefix}_$base';
        names.add(names.contains(name) ? '${doc.id}_$name' : name);
      }
      await SharePlus.instance.share(ShareParams(files: files, fileNameOverrides: names.toList(), subject: subject, title: subject));
    } catch (_) {
      Get.snackbar(subject, 'files_share_error'.tr);
    } finally {
      isSharing.value = false;
    }
  }

  String _mimeOf(String name) => switch (name.split('.').last.toLowerCase()) {
    'pdf' => 'application/pdf',
    'jpg' || 'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'webp' => 'image/webp',
    'heic' => 'image/heic',
    'doc' => 'application/msword',
    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    _ => 'application/octet-stream',
  };

  /// A document from the authority folders or from the open file.
  CustomerDocument? findDocument(int? id) =>
      documents.firstWhereOrNull((d) => d.id == id) ?? openCase.value?.documents.firstWhereOrNull((d) => d.id == id);

  Future<void> loadSubscription() async {
    try {
      _applyAbo(await api.fileSubscription());
    } catch (_) {
      // Older server without the Abo endpoint: leave the state unknown
    }
  }

  void _applyAbo(Map<String, dynamic> data) {
    if (data.isEmpty) return;
    aboActive.value = data['active'] == true;
    aboPrice.value = double.tryParse('${data['price'] ?? ''}') ?? aboPrice.value;
    aboEndsAt.value = DateTime.tryParse('${data['ends_at'] ?? ''}')?.toLocal();
    aboFree.value = data['free'] == true;
    aboFreeUntil.value = DateTime.tryParse('${data['free_until'] ?? ''}')?.toLocal();
    aboUsed.value = int.tryParse('${data['used'] ?? ''}') ?? 0;
    aboLimit.value = int.tryParse('${data['limit'] ?? ''}') ?? 0;
    aboKnown.value = true;
  }

  /// Enter a voucher code from EinStein: sorting and translation for free.
  Future<void> redeemVoucher() async {
    final code = voucherController.text.trim();
    if (code.isEmpty) return;
    aboBusy.value = true;
    voucherError.value = '';
    try {
      _applyAbo(await api.redeemVoucher(code));
      voucherController.clear();
      Get.snackbar('abo_title'.tr, 'voucher_ok'.trParams({'date': _date(aboFreeUntil.value)}));
    } on ApiException catch (e) {
      voucherError.value = switch (e.code) {
        'invalid_code' => 'voucher_invalid'.tr,
        'code_expired' => 'voucher_expired'.tr,
        'code_used_up' => 'voucher_used_up'.tr,
        'already_redeemed' => 'voucher_already'.tr,
        'already_subscribed' => 'voucher_subscribed'.tr,
        _ => e.message,
      };
    } catch (_) {
      voucherError.value = 'auth_connection_error'.tr;
    } finally {
      aboBusy.value = false;
    }
  }

  /// Opens Stripe's payment page; the Abo turns active once Stripe confirms it.
  Future<void> subscribe() async {
    aboBusy.value = true;
    try {
      final url = await api.startFileSubscription(Get.locale?.languageCode ?? 'de');
      final opened = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
      Get.snackbar('abo_title'.tr, opened ? 'abo_pending'.tr : 'abo_start_error'.tr);
    } on ApiException catch (e) {
      Get.snackbar('abo_title'.tr, e.message);
    } catch (_) {
      Get.snackbar('abo_title'.tr, 'abo_start_error'.tr);
    } finally {
      aboBusy.value = false;
    }
  }

  Future<void> cancelSubscription() async {
    aboBusy.value = true;
    try {
      _applyAbo(await api.cancelFileSubscription());
      Get.snackbar('abo_title'.tr, 'abo_cancelled'.trParams({'date': _date(aboEndsAt.value)}));
    } catch (_) {
      Get.snackbar('abo_title'.tr, 'abo_cancel_error'.tr);
    } finally {
      aboBusy.value = false;
    }
  }

  String _date(DateTime? d) {
    if (d == null) return '';
    String two(int v) => v.toString().padLeft(2, '0');
    return '${two(d.day)}.${two(d.month)}.${d.year}';
  }

  /// While letters are being sorted/translated, refresh every few seconds.
  void _schedulePoll() {
    _poll?.cancel();
    if (hasProcessing) {
      _poll = Timer(const Duration(seconds: 6), () => load(silent: true));
    }
  }

  Future<void> pickAndUpload(UploadSource source, {String folder = 'auto'}) async {
    List<int>? bytes;
    String? name;
    try {
      if (source == UploadSource.file) {
        final result = await FilePicker.platform.pickFiles(
          withData: true,
          type: FileType.custom,
          allowedExtensions: const ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'doc', 'docx'],
        );
        final file = result?.files.single;
        bytes = file?.bytes;
        name = file?.name;
      } else {
        final image = await ImagePicker().pickImage(
          source: source == UploadSource.camera ? ImageSource.camera : ImageSource.gallery,
          imageQuality: 85,
          maxWidth: 2400,
        );
        if (image != null) {
          bytes = await image.readAsBytes();
          name = image.name.isEmpty ? 'scan.jpg' : image.name;
        }
      }
    } catch (_) {
      Get.snackbar('files_upload'.tr, 'files_pick_error'.tr);
      return;
    }
    if (bytes == null || name == null) return;
    await upload(bytes, name, folder: folder);
  }

  Future<CustomerDocument?> upload(
    List<int> bytes,
    String name, {
    String folder = 'auto',
    String? title,
    bool process = true,
  }) async {
    isUploading.value = true;
    try {
      final doc = await api.uploadDocument(
        bytes: bytes,
        filename: name,
        folder: folder,
        lang: langCode,
        title: title,
        process: process,
      );
      documents.insert(0, doc);
      if (process) {
        Get.snackbar('files_uploaded'.tr, doc.isProcessing ? 'files_processing_hint'.tr : (aboActive.value ? 'abo_limit_reached'.tr : 'abo_stored_only'.tr));
        unawaited(loadSubscription());
      }
      _schedulePoll();
      return doc;
    } on ApiException catch (e) {
      Get.snackbar('files_upload'.tr, e.message);
    } catch (_) {
      Get.snackbar('files_upload'.tr, 'files_upload_error'.tr);
    } finally {
      isUploading.value = false;
    }
    return null;
  }

  Future<void> open(CustomerDocument doc) async {
    try {
      final bytes = await api.downloadDocument(doc.id);
      if (kIsWeb) return;
      final dir = await getTemporaryDirectory();
      final file = File('${dir.path}/${doc.id}_${doc.originalName}');
      await file.writeAsBytes(bytes, flush: true);
      await OpenFilex.open(file.path);
    } catch (_) {
      Get.snackbar(doc.title, 'files_open_error'.tr);
    }
  }

  Future<void> remove(CustomerDocument doc) async {
    try {
      await api.deleteDocument(doc.id);
      documents.removeWhere((d) => d.id == doc.id);
      if (openCase.value != null) await openCaseById(openCase.value!.id);
      reminders.removeWhere((r) => r.documentId == doc.id);
    } catch (_) {
      Get.snackbar(doc.title, 'files_delete_error'.tr);
    }
  }

  Future<void> translateAgain(CustomerDocument doc) async {
    if (aboKnown.value && !aboActive.value) {
      Get.snackbar('abo_title'.tr, 'abo_needed'.trParams({'price': aboPriceText}));
      return;
    }
    try {
      await api.translateDocument(doc.id, langCode);
      await load(silent: true);
      if (openCase.value != null) await openCaseById(openCase.value!.id);
      Get.snackbar(doc.title, 'files_processing_hint'.tr);
    } catch (_) {
      Get.snackbar(doc.title, 'files_translate_error'.tr);
    }
  }

  Future<void> completeReminder(CustomerReminder reminder) async {
    reminders.removeWhere((r) => r.id == reminder.id);
    try {
      await api.updateReminder(reminder.id, {'status': 'done'});
    } catch (_) {
      reminders.add(reminder);
    }
  }

  void clear() {
    _poll?.cancel();
    documents.clear();
    reminders.clear();
    loadedOnce.value = false;
    cases.clear();
    openCase.value = null;
    aboActive.value = false;
    aboKnown.value = false;
    aboEndsAt.value = null;
  }

  @override
  void onClose() {
    _poll?.cancel();
    _casePoll?.cancel();
    super.onClose();
  }
}
