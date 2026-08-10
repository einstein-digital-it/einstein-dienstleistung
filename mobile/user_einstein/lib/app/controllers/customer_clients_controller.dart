import 'package:get/get.dart';

import '../api/customer_api_service.dart';
import '../models/managed_client.dart';

class CustomerClientsController extends GetxController {
  final api = Get.find<CustomerApiService>();
  final clients = <ManagedClient>[].obs;
  final isLoading = false.obs;
  final isSaving = false.obs;
  final errorText = ''.obs;

  @override
  void onInit() {
    super.onInit();
    loadClients();
  }

  Future<void> loadClients() async {
    isLoading.value = true;
    errorText.value = '';
    try {
      clients.assignAll(await api.managedClients());
    } catch (_) {
      errorText.value =
          'Could not load clients. Pull to refresh and try again.';
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> addClient(Map<String, dynamic> payload) async {
    isSaving.value = true;
    errorText.value = '';
    try {
      await api.createManagedClient(payload);
      await loadClients();
      return true;
    } catch (_) {
      errorText.value = 'The client could not be created. Please try again.';
      return false;
    } finally {
      isSaving.value = false;
    }
  }
}

class ClientWorkspaceController extends GetxController {
  ClientWorkspaceController({required this.clientId});

  final String clientId;
  final api = Get.find<CustomerApiService>();
  final workspace = Rxn<ClientWorkspace>();
  final isLoading = false.obs;
  final isSaving = false.obs;
  final errorText = ''.obs;

  @override
  void onInit() {
    super.onInit();
    loadWorkspace();
  }

  Future<void> loadWorkspace() async {
    isLoading.value = true;
    errorText.value = '';
    try {
      workspace.value = await api.managedClient(clientId);
    } catch (_) {
      errorText.value = 'Could not load this client workspace.';
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> addCommunication(Map<String, dynamic> payload) =>
      _save(() async {
        await api.createClientCommunication(clientId, payload);
        await loadWorkspace();
      });

  Future<bool> addRequest(Map<String, dynamic> payload) => _save(() async {
    await api.createClientRequest(clientId, payload);
    await loadWorkspace();
  });

  Future<bool> updateRequest(String requestId, Map<String, dynamic> payload) =>
      _save(() async {
        await api.updateClientRequest(clientId, requestId, payload);
        await loadWorkspace();
      });

  Future<bool> addFile(Map<String, dynamic> payload) => _save(() async {
    await api.createClientFile(clientId, payload);
    await loadWorkspace();
  });

  Future<bool> addInvoice(Map<String, dynamic> payload) => _save(() async {
    await api.createClientInvoice(clientId, payload);
    await loadWorkspace();
  });

  Future<bool> _save(Future<void> Function() action) async {
    isSaving.value = true;
    errorText.value = '';
    try {
      await action();
      return true;
    } catch (_) {
      errorText.value = 'The update could not be saved. Please try again.';
      return false;
    } finally {
      isSaving.value = false;
    }
  }
}
