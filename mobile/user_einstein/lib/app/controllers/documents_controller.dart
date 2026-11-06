import 'dart:async';
import 'dart:io' show File;

import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';

import '../api/api_exception.dart';
import '../api/auth_session.dart';
import '../api/customer_api_service.dart';
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

  Timer? _poll;

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
        Get.snackbar('files_uploaded'.tr, 'files_processing_hint'.tr);
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
      reminders.removeWhere((r) => r.documentId == doc.id);
    } catch (_) {
      Get.snackbar(doc.title, 'files_delete_error'.tr);
    }
  }

  Future<void> translateAgain(CustomerDocument doc) async {
    try {
      await api.translateDocument(doc.id, langCode);
      await load(silent: true);
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
  }

  @override
  void onClose() {
    _poll?.cancel();
    super.onClose();
  }
}
