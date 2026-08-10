class ManagedClient {
  const ManagedClient({
    required this.id,
    required this.fullName,
    required this.companyName,
    required this.email,
    required this.phone,
    required this.language,
    required this.status,
    required this.notes,
    required this.communicationsCount,
    required this.openRequestsCount,
    required this.filesCount,
    required this.openInvoicesCount,
  });

  final String id;
  final String fullName;
  final String? companyName;
  final String? email;
  final String? phone;
  final String language;
  final String status;
  final String? notes;
  final int communicationsCount;
  final int openRequestsCount;
  final int filesCount;
  final int openInvoicesCount;

  factory ManagedClient.fromJson(Map<String, dynamic> json) => ManagedClient(
    id: json['id'].toString(),
    fullName: (json['full_name'] ?? '').toString(),
    companyName: json['company_name']?.toString(),
    email: json['email']?.toString(),
    phone: json['phone']?.toString(),
    language: (json['preferred_language'] ?? 'de').toString(),
    status: (json['status'] ?? 'active').toString(),
    notes: json['notes']?.toString(),
    communicationsCount: _integer(json['communications_count']),
    openRequestsCount: _integer(json['open_requests_count']),
    filesCount: _integer(json['files_count']),
    openInvoicesCount: _integer(json['open_invoices_count']),
  );
}

class ClientWorkspace {
  const ClientWorkspace({
    required this.client,
    required this.communications,
    required this.requests,
    required this.files,
    required this.invoices,
    required this.history,
  });

  final ManagedClient client;
  final List<ClientCommunication> communications;
  final List<ClientRequest> requests;
  final List<ClientFile> files;
  final List<ClientInvoice> invoices;
  final List<ClientHistory> history;

  factory ClientWorkspace.fromJson(Map<String, dynamic> json) =>
      ClientWorkspace(
        client: ManagedClient.fromJson(json),
        communications: _list(
          json['communications'],
          ClientCommunication.fromJson,
        ),
        requests: _list(json['requests'], ClientRequest.fromJson),
        files: _list(json['files'], ClientFile.fromJson),
        invoices: _list(json['invoices'], ClientInvoice.fromJson),
        history: _list(json['history'], ClientHistory.fromJson),
      );
}

class ClientCommunication {
  const ClientCommunication({
    required this.id,
    required this.channel,
    required this.direction,
    required this.summary,
    required this.details,
    required this.translatedSummary,
    required this.attachmentName,
    required this.performedBy,
    required this.occurredAt,
  });
  final String id;
  final String channel;
  final String direction;
  final String summary;
  final String? details;
  final String? translatedSummary;
  final String? attachmentName;
  final String? performedBy;
  final DateTime? occurredAt;
  factory ClientCommunication.fromJson(Map<String, dynamic> json) =>
      ClientCommunication(
        id: json['id'].toString(),
        channel: (json['channel'] ?? 'message').toString(),
        direction: (json['direction'] ?? 'outbound').toString(),
        summary: (json['summary'] ?? '').toString(),
        details: json['details']?.toString(),
        translatedSummary: json['translated_summary']?.toString(),
        attachmentName: json['attachment_name']?.toString(),
        performedBy: json['performed_by']?.toString(),
        occurredAt: _date(json['occurred_at']),
      );
}

class ClientRequest {
  const ClientRequest({
    required this.id,
    required this.number,
    required this.subject,
    required this.description,
    required this.status,
    required this.priority,
    required this.assignedTo,
    required this.dueAt,
  });
  final String id;
  final String number;
  final String subject;
  final String? description;
  final String status;
  final String priority;
  final String? assignedTo;
  final DateTime? dueAt;
  factory ClientRequest.fromJson(Map<String, dynamic> json) => ClientRequest(
    id: json['id'].toString(),
    number: (json['request_number'] ?? '').toString(),
    subject: (json['subject'] ?? '').toString(),
    description: json['description']?.toString(),
    status: (json['status'] ?? 'open').toString(),
    priority: (json['priority'] ?? 'normal').toString(),
    assignedTo: json['assigned_to']?.toString(),
    dueAt: _date(json['due_at']),
  );
}

class ClientFile {
  const ClientFile({
    required this.id,
    required this.name,
    required this.url,
    required this.mimeType,
    required this.sizeBytes,
    required this.createdAt,
  });
  final String id;
  final String name;
  final String url;
  final String? mimeType;
  final int? sizeBytes;
  final DateTime? createdAt;
  factory ClientFile.fromJson(Map<String, dynamic> json) => ClientFile(
    id: json['id'].toString(),
    name: (json['name'] ?? '').toString(),
    url: (json['file_url'] ?? '').toString(),
    mimeType: json['mime_type']?.toString(),
    sizeBytes: json['size_bytes'] == null ? null : _integer(json['size_bytes']),
    createdAt: _date(json['created_at']),
  );
}

class ClientInvoice {
  const ClientInvoice({
    required this.id,
    required this.number,
    required this.title,
    required this.amount,
    required this.currency,
    required this.status,
    required this.dueDate,
  });
  final String id;
  final String number;
  final String title;
  final double amount;
  final String currency;
  final String status;
  final String? dueDate;
  factory ClientInvoice.fromJson(Map<String, dynamic> json) => ClientInvoice(
    id: json['id'].toString(),
    number: (json['invoice_number'] ?? '').toString(),
    title: (json['title'] ?? '').toString(),
    amount: double.tryParse('${json['amount'] ?? 0}') ?? 0,
    currency: (json['currency'] ?? 'EUR').toString(),
    status: (json['status'] ?? 'draft').toString(),
    dueDate: json['due_date']?.toString(),
  );
}

class ClientHistory {
  const ClientHistory({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.actorName,
    required this.occurredAt,
  });
  final String id;
  final String type;
  final String title;
  final String? description;
  final String? actorName;
  final DateTime? occurredAt;
  factory ClientHistory.fromJson(Map<String, dynamic> json) => ClientHistory(
    id: json['id'].toString(),
    type: (json['event_type'] ?? '').toString(),
    title: (json['title'] ?? '').toString(),
    description: json['description']?.toString(),
    actorName: json['actor_name']?.toString(),
    occurredAt: _date(json['occurred_at']),
  );
}

int _integer(dynamic value) => int.tryParse('${value ?? 0}') ?? 0;
DateTime? _date(dynamic value) =>
    value == null ? null : DateTime.tryParse(value.toString());
List<T> _list<T>(dynamic value, T Function(Map<String, dynamic>) mapper) =>
    value is List
    ? value
          .map((item) => mapper(Map<String, dynamic>.from(item as Map)))
          .toList()
    : <T>[];
