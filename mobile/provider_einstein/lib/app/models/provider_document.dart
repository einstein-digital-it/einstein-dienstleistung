class ProviderDocument {
  const ProviderDocument({
    required this.id,
    required this.title,
    this.documentType,
    this.fileUrl,
    this.status,
  });

  final String id;
  final String title;
  final String? documentType;
  final String? fileUrl;
  final String? status;

  factory ProviderDocument.fromJson(Map<String, dynamic> json) =>
      ProviderDocument(
        id: json['id']?.toString() ?? '',
        title: json['title']?.toString() ?? '',
        documentType: json['document_type']?.toString(),
        fileUrl: json['file_url']?.toString(),
        status: json['status']?.toString(),
      );
}
