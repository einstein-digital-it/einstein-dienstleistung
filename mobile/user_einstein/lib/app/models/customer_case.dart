import 'customer_document.dart';

/// A file the customer created and named (backend: customer_files).
class CustomerCase {
  const CustomerCase({required this.id, required this.name, required this.documentsCount});

  final int id;
  final String name;
  final int documentsCount;

  factory CustomerCase.fromJson(Map<String, dynamic> json) => CustomerCase(
    id: (json['id'] as num).toInt(),
    name: (json['name'] ?? '').toString(),
    documentsCount: (json['documents_count'] as num?)?.toInt() ?? 0,
  );
}

/// One numbered sub-folder, e.g. name "Arbeitsvertrag", label "01_Arbeitsvertrag".
class CaseSection {
  const CaseSection({required this.name, required this.label});

  final String name;
  final String label;
}

class CaseDetail {
  const CaseDetail({required this.id, required this.name, required this.sections, required this.documents});

  final int id;
  final String name;
  final List<CaseSection> sections;
  final List<CustomerDocument> documents;

  List<CustomerDocument> inSection(String? section) => documents.where((d) => d.section == section).toList();
  bool get hasUnsorted => documents.any((d) => d.section == null);
  bool get hasProcessing => documents.any((d) => d.isProcessing);

  factory CaseDetail.fromJson(Map<String, dynamic> json) => CaseDetail(
    id: (json['id'] as num).toInt(),
    name: (json['name'] ?? '').toString(),
    sections: ((json['sections'] ?? []) as List)
        .whereType<Map>()
        .map((s) => CaseSection(name: s['name'].toString(), label: s['label'].toString()))
        .toList(),
    documents: ((json['documents'] ?? []) as List)
        .whereType<Map>()
        .map((d) => CustomerDocument.fromJson(Map<String, dynamic>.from(d)))
        .toList(),
  );
}
