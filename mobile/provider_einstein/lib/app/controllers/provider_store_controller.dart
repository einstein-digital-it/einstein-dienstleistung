import 'package:get/get.dart';
import 'package:file_picker/file_picker.dart';

import '../api/api_exception.dart';
import '../api/provider_api_service.dart';
import '../api/provider_session.dart';
import '../models/provider_booking.dart';
import '../models/provider_dashboard.dart';
import '../models/provider_document.dart';
import '../models/provider_earnings_report.dart';
import '../models/provider_profile.dart';
import '../models/provider_notification.dart';
import '../models/service_extension.dart';

class ProviderStoreController extends GetxController {
  ProviderStoreController(this._api);

  final ProviderApiService _api;

  final profile = Rxn<ProviderProfile>();
  final summary = const ProviderSummary().obs;
  final bookings = <ProviderBooking>[].obs;
  final isLoading = false.obs;
  final errorText = ''.obs;
  final documents = <ProviderDocument>[].obs;
  final extensions = <ServiceExtension>[].obs;
  final notifications = <ProviderNotification>[].obs;
  final earningsReport = Rxn<ProviderEarningsReport>();
  final busyBookingIds = <String>{}.obs;
  final isSaving = false.obs;

  @override
  void onReady() {
    super.onReady();
    if (Get.find<ProviderSession>().isAuthenticated) {
      refreshWorkspace();
    }
  }

  Future<void> loadDashboard() async {
    isLoading.value = true;
    errorText.value = '';
    try {
      final dashboard = await _api.dashboard();
      profile.value = dashboard.provider;
      bookings.assignAll(dashboard.bookings);
      summary.value = dashboard.summary;
    } on ApiException catch (error) {
      errorText.value = error.message;
    } catch (_) {
      errorText.value = 'connection_error'.tr;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> refreshWorkspace() async {
    await Future.wait([
      loadDashboard(),
      loadDocuments(),
      loadExtensions(),
      loadNotifications(),
    ]);
  }

  Future<bool> bookingAction(ProviderBooking booking, String action) async {
    busyBookingIds.add(booking.id);
    try {
      await _api.bookingAction(booking.id, action);
      await loadDashboard();
      Get.snackbar('success'.tr, 'booking_action_success'.tr);
      return true;
    } on ApiException catch (error) {
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    } finally {
      busyBookingIds.remove(booking.id);
    }
    return false;
  }

  Future<bool> addBookingDocument(ProviderBooking booking, String url) async {
    if (url.trim().isEmpty) return false;
    try {
      await _api.updateBookingDocuments(booking.id, [url.trim()]);
      await loadDashboard();
      Get.snackbar('success'.tr, 'document_added'.tr);
      return true;
    } on ApiException catch (error) {
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    }
    return false;
  }

  Future<bool> uploadBookingDocuments(
    ProviderBooking booking,
    List<PlatformFile> files,
  ) async {
    if (files.isEmpty) return false;
    isSaving.value = true;
    try {
      final uploaded = await _api.uploadFiles(files);
      await _api.updateBookingDocuments(
        booking.id,
        uploaded.map((file) => file.url).toList(),
      );
      await loadDashboard();
      Get.snackbar('success'.tr, 'document_added'.tr);
      return true;
    } on ApiException catch (error) {
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    } finally {
      isSaving.value = false;
    }
    return false;
  }

  Future<void> loadDocuments() async {
    try {
      documents.assignAll(await _api.documents());
    } on ApiException catch (error) {
      errorText.value = error.message;
    } catch (_) {
      errorText.value = 'connection_error'.tr;
    }
  }

  Future<bool> createDocument(Map<String, dynamic> payload) async {
    isSaving.value = true;
    try {
      final document = await _api.createDocument(payload);
      documents.insert(0, document);
      Get.snackbar('success'.tr, 'document_added'.tr);
      return true;
    } on ApiException catch (error) {
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    } finally {
      isSaving.value = false;
    }
    return false;
  }

  Future<bool> uploadProviderDocument({
    required PlatformFile file,
    required String title,
    required String documentType,
  }) async {
    isSaving.value = true;
    try {
      final uploaded = await _api.uploadFiles([file]);
      if (uploaded.isEmpty) {
        throw const ApiException('Upload did not return a file.');
      }
      final document = await _api.createDocument({
        'title': title,
        'document_type': documentType,
        'file_url': uploaded.first.url,
        'status': 'active',
      });
      documents.insert(0, document);
      Get.snackbar('success'.tr, 'document_added'.tr);
      return true;
    } on ApiException catch (error) {
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    } finally {
      isSaving.value = false;
    }
    return false;
  }

  Future<void> deleteDocument(ProviderDocument document) async {
    try {
      await _api.deleteDocument(document.id);
      documents.removeWhere((item) => item.id == document.id);
      Get.snackbar('success'.tr, 'document_deleted'.tr);
    } on ApiException catch (error) {
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    }
  }

  Future<void> loadExtensions() async {
    try {
      extensions.assignAll(await _api.extensions());
    } on ApiException catch (error) {
      errorText.value = error.message;
    } catch (_) {
      errorText.value = 'connection_error'.tr;
    }
  }

  Future<void> loadNotifications() async {
    try {
      notifications.assignAll(await _api.notifications());
    } on ApiException catch (error) {
      errorText.value = error.message;
    } catch (_) {
      errorText.value = 'connection_error'.tr;
    }
  }

  int get unreadNotifications =>
      notifications.where((item) => !item.isRead).length;

  String resolveUrl(String value) => _api.absoluteUrl(value);

  Future<void> markNotificationRead(ProviderNotification notification) async {
    if (notification.isRead) return;
    try {
      final updated = await _api.markNotificationRead(notification.id);
      final index = notifications.indexWhere((item) => item.id == updated.id);
      if (index >= 0) notifications[index] = updated;
    } on ApiException catch (error) {
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    }
  }

  Future<void> markAllNotificationsRead() async {
    try {
      notifications.assignAll(await _api.markAllNotificationsRead());
    } on ApiException catch (error) {
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    }
  }

  Future<bool> createExtension(Map<String, dynamic> payload) async {
    isSaving.value = true;
    try {
      final extension = await _api.createExtension(payload);
      extensions.insert(0, extension);
      Get.snackbar('success'.tr, 'extension_created'.tr);
      return true;
    } on ApiException catch (error) {
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    } finally {
      isSaving.value = false;
    }
    return false;
  }

  Future<bool> updateExtension(
    ServiceExtension extension,
    Map<String, dynamic> payload,
  ) async {
    isSaving.value = true;
    try {
      final updated = await _api.updateExtension(extension.id, payload);
      final index = extensions.indexWhere((item) => item.id == updated.id);
      if (index >= 0) extensions[index] = updated;
      Get.snackbar('success'.tr, 'extension_updated'.tr);
      return true;
    } on ApiException catch (error) {
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    } finally {
      isSaving.value = false;
    }
    return false;
  }

  Future<void> loadEarnings({int? year}) async {
    try {
      earningsReport.value = await _api.earnings(year: year);
    } on ApiException catch (error) {
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> payload) async {
    final current = profile.value;
    if (current == null) return false;
    isSaving.value = true;
    try {
      await _api.updateProfile(current.id, payload);
      await loadDashboard();
      Get.snackbar('success'.tr, 'profile_updated'.tr);
      return true;
    } on ApiException catch (error) {
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    } finally {
      isSaving.value = false;
    }
    return false;
  }

  Future<bool> uploadProfileImage(PlatformFile file) async {
    isSaving.value = true;
    try {
      final uploaded = await _api.uploadFiles([file]);
      if (uploaded.isEmpty) {
        throw const ApiException('Upload did not return an image.');
      }
      return await updateProfile({'profile_image': uploaded.first.url});
    } on ApiException catch (error) {
      Get.snackbar('action_failed'.tr, error.message);
    } catch (_) {
      Get.snackbar('action_failed'.tr, 'connection_error'.tr);
    } finally {
      isSaving.value = false;
    }
    return false;
  }

  void reset() {
    profile.value = null;
    bookings.clear();
    summary.value = const ProviderSummary();
    errorText.value = '';
    documents.clear();
    extensions.clear();
    notifications.clear();
    earningsReport.value = null;
    busyBookingIds.clear();
  }
}
