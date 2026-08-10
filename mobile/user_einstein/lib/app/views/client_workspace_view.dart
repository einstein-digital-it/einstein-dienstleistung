import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/customer_clients_controller.dart';
import '../models/managed_client.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';

class ClientWorkspaceView extends GetView<ClientWorkspaceController> {
  const ClientWorkspaceView({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 5,
      child: Scaffold(
        appBar: AppBar(
          title: Text('client_workspace'.tr),
          leading: IconButton(
            onPressed: Get.back,
            icon: const Icon(Icons.arrow_back_rounded),
          ),
          bottom: TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'overview'.tr),
              Tab(text: 'communication'.tr),
              Tab(text: 'requests'.tr),
              Tab(text: 'files'.tr),
              Tab(text: 'invoices'.tr),
            ],
          ),
        ),
        body: Obx(() {
          final workspace = controller.workspace.value;
          if (controller.isLoading.value && workspace == null) {
            return const Center(child: CircularProgressIndicator());
          }
          if (workspace == null) {
            return _Unavailable(message: controller.errorText.value);
          }
          return Column(
            children: [
              _ClientHeader(client: workspace.client),
              if (controller.errorText.value.isNotEmpty)
                _Banner(text: controller.errorText.value),
              Expanded(
                child: TabBarView(
                  children: [
                    _OverviewTab(workspace: workspace),
                    _CommunicationsTab(workspace: workspace),
                    _RequestsTab(workspace: workspace),
                    _FilesTab(workspace: workspace),
                    _InvoicesTab(workspace: workspace),
                  ],
                ),
              ),
            ],
          );
        }),
      ),
    );
  }
}

class _ClientHeader extends StatelessWidget {
  const _ClientHeader({required this.client});
  final ManagedClient client;
  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.fromLTRB(20, 14, 20, 16),
    color: AppColors.navy,
    child: Row(
      children: [
        CircleAvatar(
          radius: 24,
          backgroundColor: AppColors.gold,
          foregroundColor: AppColors.navy,
          child: Text(
            client.fullName.isEmpty ? '?' : client.fullName[0].toUpperCase(),
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20),
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
                  color: Colors.white,
                  fontSize: 19,
                  fontWeight: FontWeight.w900,
                ),
              ),
              Text(
                [client.companyName, client.email ?? client.phone]
                    .whereType<String>()
                    .where((item) => item.isNotEmpty)
                    .join(' | '),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Color(0xFFDDE7F4)),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

class _OverviewTab extends StatelessWidget {
  const _OverviewTab({required this.workspace});
  final ClientWorkspace workspace;
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      _SectionTitle(title: 'relationship_overview'.tr, action: null),
      _StatGrid(workspace: workspace),
      const SizedBox(height: 22),
      if (workspace.client.notes?.isNotEmpty ?? false)
        _NotesCard(notes: workspace.client.notes!),
      const SizedBox(height: 22),
      _SectionTitle(title: 'activity_history'.tr, action: null),
      if (workspace.history.isEmpty)
        _EmptyState(
          icon: Icons.history_rounded,
          text: 'client_history_empty'.tr,
        )
      else
        ...workspace.history.take(8).map((item) => _HistoryTile(item: item)),
    ],
  );
}

class _CommunicationsTab extends GetView<ClientWorkspaceController> {
  const _CommunicationsTab({required this.workspace});
  final ClientWorkspace workspace;
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      _SectionTitle(
        title: 'communication'.tr,
        action: () => _communicationDialog(context),
      ),
      Text(
        'client_communication_subtitle'.tr,
        style: const TextStyle(color: AppColors.muted),
      ),
      const SizedBox(height: 14),
      if (workspace.communications.isEmpty)
        _EmptyState(
          icon: Icons.forum_outlined,
          text: 'client_communication_empty'.tr,
        )
      else
        ...workspace.communications.map(
          (item) => _CommunicationCard(item: item),
        ),
    ],
  );
  Future<void> _communicationDialog(BuildContext context) async {
    final summary = TextEditingController();
    final details = TextEditingController();
    final translation = TextEditingController();
    var channel = 'call';
    await _formSheet(
      context: context,
      title: 'log_communication'.tr,
      controllers: [summary, details, translation],
      child: StatefulBuilder(
        builder: (context, setState) => Column(
          children: [
            DropdownButtonFormField(
              initialValue: channel,
              decoration: InputDecoration(labelText: 'channel'.tr),
              items: [
                DropdownMenuItem(value: 'call', child: Text('call'.tr)),
                DropdownMenuItem(value: 'whatsapp', child: Text('whatsapp'.tr)),
                DropdownMenuItem(value: 'email', child: Text('email'.tr)),
                DropdownMenuItem(value: 'message', child: Text('message'.tr)),
              ],
              onChanged: (value) => setState(() => channel = value ?? 'call'),
            ),
            _Input(
              controller: summary,
              label: 'summary'.tr,
              icon: Icons.subject_outlined,
              maxLines: 2,
            ),
            _Input(
              controller: translation,
              label: 'translated_summary'.tr,
              icon: Icons.translate_rounded,
              maxLines: 2,
            ),
            _Input(
              controller: details,
              label: 'team_notes'.tr,
              icon: Icons.notes_outlined,
              maxLines: 3,
            ),
            Obx(
              () => PrimaryButton(
                label: 'save_communication'.tr,
                icon: Icons.save_outlined,
                isLoading: controller.isSaving.value,
                onPressed: () async {
                  if (summary.text.trim().isEmpty) return;
                  final ok = await controller.addCommunication({
                    'channel': channel,
                    'direction': 'outbound',
                    'summary': summary.text.trim(),
                    'translated_summary': translation.text.trim().isEmpty
                        ? null
                        : translation.text.trim(),
                    'details': details.text.trim().isEmpty
                        ? null
                        : details.text.trim(),
                  });
                  if (ok) Get.back();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RequestsTab extends GetView<ClientWorkspaceController> {
  const _RequestsTab({required this.workspace});
  final ClientWorkspace workspace;
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      _SectionTitle(
        title: 'tickets_requests'.tr,
        action: () => _requestDialog(context),
      ),
      Text(
        'client_requests_subtitle'.tr,
        style: const TextStyle(color: AppColors.muted),
      ),
      const SizedBox(height: 14),
      if (workspace.requests.isEmpty)
        _EmptyState(
          icon: Icons.confirmation_number_outlined,
          text: 'client_requests_empty'.tr,
        )
      else
        ...workspace.requests.map((item) => _RequestCard(item: item)),
    ],
  );
  Future<void> _requestDialog(BuildContext context) async {
    final subject = TextEditingController();
    final description = TextEditingController();
    var priority = 'normal';
    await _formSheet(
      context: context,
      title: 'new_request'.tr,
      controllers: [subject, description],
      child: StatefulBuilder(
        builder: (context, setState) => Column(
          children: [
            _Input(
              controller: subject,
              label: 'request_subject'.tr,
              icon: Icons.subject_outlined,
            ),
            _Input(
              controller: description,
              label: 'request_details'.tr,
              icon: Icons.notes_outlined,
              maxLines: 3,
            ),
            DropdownButtonFormField(
              initialValue: priority,
              decoration: InputDecoration(labelText: 'priority'.tr),
              items: [
                DropdownMenuItem(value: 'low', child: Text('priority_low'.tr)),
                DropdownMenuItem(
                  value: 'normal',
                  child: Text('priority_normal'.tr),
                ),
                DropdownMenuItem(
                  value: 'high',
                  child: Text('priority_high'.tr),
                ),
                DropdownMenuItem(
                  value: 'urgent',
                  child: Text('priority_urgent'.tr),
                ),
              ],
              onChanged: (value) =>
                  setState(() => priority = value ?? 'normal'),
            ),
            const SizedBox(height: 14),
            Obx(
              () => PrimaryButton(
                label: 'open_request'.tr,
                icon: Icons.add_task_outlined,
                isLoading: controller.isSaving.value,
                onPressed: () async {
                  if (subject.text.trim().isEmpty) return;
                  final ok = await controller.addRequest({
                    'subject': subject.text.trim(),
                    'description': description.text.trim().isEmpty
                        ? null
                        : description.text.trim(),
                    'priority': priority,
                  });
                  if (ok) Get.back();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilesTab extends GetView<ClientWorkspaceController> {
  const _FilesTab({required this.workspace});
  final ClientWorkspace workspace;
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      _SectionTitle(title: 'files'.tr, action: () => _fileDialog(context)),
      Text(
        'client_files_subtitle'.tr,
        style: const TextStyle(color: AppColors.muted),
      ),
      const SizedBox(height: 14),
      if (workspace.files.isEmpty)
        _EmptyState(
          icon: Icons.folder_open_outlined,
          text: 'client_files_empty'.tr,
        )
      else
        ...workspace.files.map((item) => _FileCard(item: item)),
    ],
  );
  Future<void> _fileDialog(BuildContext context) async {
    final name = TextEditingController();
    final url = TextEditingController();
    await _formSheet(
      context: context,
      title: 'link_file'.tr,
      controllers: [name, url],
      child: Column(
        children: [
          _Input(
            controller: name,
            label: 'file_name'.tr,
            icon: Icons.description_outlined,
          ),
          _Input(
            controller: url,
            label: 'file_url'.tr,
            icon: Icons.link_rounded,
          ),
          Obx(
            () => PrimaryButton(
              label: 'add_file'.tr,
              icon: Icons.attach_file_rounded,
              isLoading: controller.isSaving.value,
              onPressed: () async {
                if (name.text.trim().isEmpty || url.text.trim().isEmpty) return;
                final ok = await controller.addFile({
                  'name': name.text.trim(),
                  'file_url': url.text.trim(),
                });
                if (ok) Get.back();
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _InvoicesTab extends GetView<ClientWorkspaceController> {
  const _InvoicesTab({required this.workspace});
  final ClientWorkspace workspace;
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      _SectionTitle(
        title: 'invoices'.tr,
        action: () => _invoiceDialog(context),
      ),
      Text(
        'client_invoices_subtitle'.tr,
        style: const TextStyle(color: AppColors.muted),
      ),
      const SizedBox(height: 14),
      if (workspace.invoices.isEmpty)
        _EmptyState(
          icon: Icons.receipt_long_outlined,
          text: 'client_invoices_empty'.tr,
        )
      else
        ...workspace.invoices.map((item) => _InvoiceCard(item: item)),
    ],
  );
  Future<void> _invoiceDialog(BuildContext context) async {
    final title = TextEditingController();
    final amount = TextEditingController();
    var status = 'draft';
    await _formSheet(
      context: context,
      title: 'create_invoice'.tr,
      controllers: [title, amount],
      child: StatefulBuilder(
        builder: (context, setState) => Column(
          children: [
            _Input(
              controller: title,
              label: 'invoice_title'.tr,
              icon: Icons.receipt_long_outlined,
            ),
            _Input(
              controller: amount,
              label: 'amount_eur'.tr,
              icon: Icons.euro_rounded,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
            ),
            DropdownButtonFormField(
              initialValue: status,
              decoration: InputDecoration(labelText: 'status'.tr),
              items: [
                DropdownMenuItem(
                  value: 'draft',
                  child: Text('status_draft'.tr),
                ),
                DropdownMenuItem(value: 'sent', child: Text('status_sent'.tr)),
              ],
              onChanged: (value) => setState(() => status = value ?? 'draft'),
            ),
            const SizedBox(height: 14),
            Obx(
              () => PrimaryButton(
                label: 'create_invoice_button'.tr,
                icon: Icons.add_card_outlined,
                isLoading: controller.isSaving.value,
                onPressed: () async {
                  if (title.text.trim().isEmpty ||
                      double.tryParse(amount.text.replaceAll(',', '.')) ==
                          null) {
                    return;
                  }
                  final ok = await controller.addInvoice({
                    'title': title.text.trim(),
                    'amount': double.parse(amount.text.replaceAll(',', '.')),
                    'currency': 'EUR',
                    'status': status,
                  });
                  if (ok) Get.back();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, required this.action});
  final String title;
  final VoidCallback? action;
  @override
  Widget build(BuildContext context) => Row(
    children: [
      Expanded(
        child: Text(title, style: Theme.of(context).textTheme.titleLarge),
      ),
      if (action != null)
        IconButton(
          onPressed: action,
          tooltip: 'add'.tr,
          style: IconButton.styleFrom(
            backgroundColor: AppColors.navy,
            foregroundColor: Colors.white,
          ),
          icon: const Icon(Icons.add_rounded),
        ),
    ],
  );
}

class _StatGrid extends StatelessWidget {
  const _StatGrid({required this.workspace});
  final ClientWorkspace workspace;
  @override
  Widget build(BuildContext context) => GridView.count(
    crossAxisCount: 2,
    shrinkWrap: true,
    physics: const NeverScrollableScrollPhysics(),
    mainAxisSpacing: 10,
    crossAxisSpacing: 10,
    childAspectRatio: 1.8,
    children: [
      _Stat(
        icon: Icons.forum_outlined,
        value: workspace.communications.length,
        label: 'updates'.tr,
      ),
      _Stat(
        icon: Icons.confirmation_number_outlined,
        value: workspace.requests
            .where(
              (item) => item.status != 'closed' && item.status != 'completed',
            )
            .length,
        label: 'open_requests'.tr,
      ),
      _Stat(
        icon: Icons.attach_file_rounded,
        value: workspace.files.length,
        label: 'files'.tr,
      ),
      _Stat(
        icon: Icons.receipt_long_outlined,
        value: workspace.invoices.length,
        label: 'invoices'.tr,
      ),
    ],
  );
}

class _Stat extends StatelessWidget {
  const _Stat({required this.icon, required this.value, required this.label});
  final IconData icon;
  final int value;
  final String label;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.line),
    ),
    child: Row(
      children: [
        Icon(icon, color: AppColors.gold),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '$value',
              style: const TextStyle(
                fontWeight: FontWeight.w900,
                color: AppColors.navy,
                fontSize: 18,
              ),
            ),
            Text(
              label,
              style: const TextStyle(color: AppColors.muted, fontSize: 11),
            ),
          ],
        ),
      ],
    ),
  );
}

class _NotesCard extends StatelessWidget {
  const _NotesCard({required this.notes});
  final String notes;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: AppColors.goldSoft,
      borderRadius: BorderRadius.circular(12),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'team_instructions'.tr,
          style: TextStyle(fontWeight: FontWeight.w900, color: AppColors.navy),
        ),
        const SizedBox(height: 6),
        Text(notes, style: const TextStyle(color: AppColors.navy)),
      ],
    ),
  );
}

class _CommunicationCard extends StatelessWidget {
  const _CommunicationCard({required this.item});
  final ClientCommunication item;
  @override
  Widget build(BuildContext context) => _Card(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(_channelIcon(item.channel), color: AppColors.gold),
            const SizedBox(width: 8),
            Text(
              _channelLabel(item.channel),
              style: const TextStyle(
                fontWeight: FontWeight.w900,
                color: AppColors.navy,
              ),
            ),
            const Spacer(),
            Text(
              _dateLabel(item.occurredAt),
              style: const TextStyle(color: AppColors.muted, fontSize: 11),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text(
          item.summary,
          style: const TextStyle(
            fontWeight: FontWeight.w800,
            color: AppColors.navy,
          ),
        ),
        if (item.translatedSummary?.isNotEmpty ?? false)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(
              item.translatedSummary!,
              style: const TextStyle(color: AppColors.muted),
            ),
          ),
        if (item.attachmentName?.isNotEmpty ?? false)
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Chip(
              avatar: const Icon(Icons.attach_file_rounded, size: 16),
              label: Text(item.attachmentName!),
            ),
          ),
      ],
    ),
  );
}

class _RequestCard extends GetView<ClientWorkspaceController> {
  const _RequestCard({required this.item});
  final ClientRequest item;
  @override
  Widget build(BuildContext context) => _Card(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                item.subject,
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  color: AppColors.navy,
                ),
              ),
            ),
            _Pill(
              label: item.status,
              color: item.status == 'completed' ? Colors.green : AppColors.gold,
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          item.number,
          style: const TextStyle(color: AppColors.muted, fontSize: 12),
        ),
        if (item.description?.isNotEmpty ?? false)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              item.description!,
              style: const TextStyle(color: AppColors.muted),
            ),
          ),
        const SizedBox(height: 10),
        Row(
          children: [
            Text(
              _priorityLabel(item.priority),
              style: const TextStyle(
                color: AppColors.navy,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Spacer(),
            if (item.status != 'completed' && item.status != 'closed')
              TextButton.icon(
                onPressed: () =>
                    controller.updateRequest(item.id, {'status': 'completed'}),
                icon: const Icon(Icons.check_circle_outline, size: 18),
                label: Text('mark_done'.tr),
              ),
          ],
        ),
      ],
    ),
  );
}

class _FileCard extends StatelessWidget {
  const _FileCard({required this.item});
  final ClientFile item;
  @override
  Widget build(BuildContext context) => _Card(
    child: Row(
      children: [
        const Icon(Icons.description_outlined, color: AppColors.gold),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item.name,
                style: const TextStyle(
                  color: AppColors.navy,
                  fontWeight: FontWeight.w900,
                ),
              ),
              Text(
                item.url,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppColors.muted, fontSize: 12),
              ),
            ],
          ),
        ),
        const Icon(Icons.open_in_new_rounded, color: AppColors.muted, size: 18),
      ],
    ),
  );
}

class _InvoiceCard extends StatelessWidget {
  const _InvoiceCard({required this.item});
  final ClientInvoice item;
  @override
  Widget build(BuildContext context) => _Card(
    child: Row(
      children: [
        const Icon(Icons.receipt_long_outlined, color: AppColors.gold),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item.title,
                style: const TextStyle(
                  color: AppColors.navy,
                  fontWeight: FontWeight.w900,
                ),
              ),
              Text(
                item.number,
                style: const TextStyle(color: AppColors.muted, fontSize: 12),
              ),
            ],
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${item.amount.toStringAsFixed(2)} ${item.currency}',
              style: const TextStyle(
                color: AppColors.navy,
                fontWeight: FontWeight.w900,
              ),
            ),
            _Pill(
              label: item.status,
              color: item.status == 'paid' ? Colors.green : AppColors.gold,
            ),
          ],
        ),
      ],
    ),
  );
}

class _HistoryTile extends StatelessWidget {
  const _HistoryTile({required this.item});
  final ClientHistory item;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.history_rounded, color: AppColors.gold, size: 18),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item.title,
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  color: AppColors.navy,
                ),
              ),
              if (item.description?.isNotEmpty ?? false)
                Text(
                  item.description!,
                  style: const TextStyle(color: AppColors.muted),
                ),
              Text(
                _dateLabel(item.occurredAt),
                style: const TextStyle(color: AppColors.muted, fontSize: 11),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

class _Card extends StatelessWidget {
  const _Card({required this.child});
  final Widget child;
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 12),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.line),
    ),
    child: child,
  );
}

class _Pill extends StatelessWidget {
  const _Pill({required this.label, required this.color});
  final String label;
  final Color color;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      color: color.withValues(alpha: .12),
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(
      _statusLabel(label),
      style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w800),
    ),
  );
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.icon, required this.text});
  final IconData icon;
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 48),
    child: Column(
      children: [
        Icon(icon, color: AppColors.gold, size: 48),
        const SizedBox(height: 12),
        Text(
          text,
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

class _Unavailable extends StatelessWidget {
  const _Unavailable({required this.message});
  final String message;
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(28),
      child: Text(
        message.isEmpty ? 'client_workspace_unavailable'.tr : message,
        textAlign: TextAlign.center,
        style: const TextStyle(color: AppColors.muted),
      ),
    ),
  );
}

class _Banner extends StatelessWidget {
  const _Banner({required this.text});
  final String text;
  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(10),
    color: const Color(0xFFFFF7ED),
    child: Text(
      text,
      style: const TextStyle(
        color: Color(0xFF9A3412),
        fontWeight: FontWeight.w700,
      ),
    ),
  );
}

class _Input extends StatelessWidget {
  const _Input({
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

Future<void> _formSheet({
  required BuildContext context,
  required String title,
  required Widget child,
  required List<TextEditingController> controllers,
}) => Get.bottomSheet(
  _ControllerOwnedSheet(
    controllers: controllers,
    child: SafeArea(
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
              Text(title, style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 18),
              child,
            ],
          ),
        ),
      ),
    ),
  ),
  isScrollControlled: true,
);

class _ControllerOwnedSheet extends StatefulWidget {
  const _ControllerOwnedSheet({required this.controllers, required this.child});

  final List<TextEditingController> controllers;
  final Widget child;

  @override
  State<_ControllerOwnedSheet> createState() => _ControllerOwnedSheetState();
}

class _ControllerOwnedSheetState extends State<_ControllerOwnedSheet> {
  @override
  void dispose() {
    for (final controller in widget.controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

IconData _channelIcon(String channel) => switch (channel) {
  'call' => Icons.call_outlined,
  'whatsapp' => Icons.chat_outlined,
  'email' => Icons.email_outlined,
  _ => Icons.message_outlined,
};

String _channelLabel(String channel) => switch (channel) {
  'call' => 'call'.tr,
  'whatsapp' => 'whatsapp'.tr,
  'email' => 'email'.tr,
  'message' => 'message'.tr,
  _ => channel,
};

String _priorityLabel(String priority) => switch (priority) {
  'low' => 'priority_low'.tr,
  'normal' => 'priority_normal'.tr,
  'high' => 'priority_high'.tr,
  'urgent' => 'priority_urgent'.tr,
  _ => priority,
};

String _statusLabel(String status) => switch (status) {
  'draft' => 'status_draft'.tr,
  'sent' => 'status_sent'.tr,
  'open' => 'status_open'.tr,
  'closed' => 'status_closed'.tr,
  'completed' => 'status_completed'.tr,
  'pending' => 'status_pending'.tr,
  'paid' => 'paid'.tr,
  'cancelled' => 'status_cancelled'.tr,
  _ => status,
};

String _dateLabel(DateTime? value) => value == null
    ? 'just_now'.tr
    : '${value.day.toString().padLeft(2, '0')}/${value.month.toString().padLeft(2, '0')} ${value.hour.toString().padLeft(2, '0')}:${value.minute.toString().padLeft(2, '0')}';
