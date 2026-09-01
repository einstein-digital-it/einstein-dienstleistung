class UploadedFile {
  const UploadedFile({
    required this.name,
    required this.url,
    this.mimeType,
    this.size,
  });

  final String name;
  final String url;
  final String? mimeType;
  final int? size;

  factory UploadedFile.fromJson(Map<String, dynamic> json) => UploadedFile(
    name: json['name']?.toString() ?? '',
    url: json['url']?.toString() ?? '',
    mimeType: json['mime_type']?.toString(),
    size: (json['size'] as num?)?.toInt(),
  );
}
