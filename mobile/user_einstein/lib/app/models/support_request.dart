class SupportRequest {
  const SupportRequest({
    required this.id,
    required this.type,
    required this.message,
    required this.status,
    required this.createdAt,
  });

  final String id;
  final String type;
  final String message;
  final String status;
  final String createdAt;

  factory SupportRequest.fromJson(Map<String, dynamic> json) {
    return SupportRequest(
      id: (json['id'] ?? '').toString(),
      type: (json['request_type'] ?? json['type'] ?? 'general').toString(),
      message: (json['message'] ?? '').toString(),
      status: (json['status'] ?? 'Received').toString(),
      createdAt: (json['created_at'] ?? 'Now').toString(),
    );
  }
}
