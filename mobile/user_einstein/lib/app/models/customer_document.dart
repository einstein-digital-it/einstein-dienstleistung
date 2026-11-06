import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Folder keys used by the backend (CustomerDocument::FOLDERS).
const documentFolders = [
  'jobcenter', 'auslaenderbehoerde', 'finanzamt', 'familienkasse', 'krankenkasse',
  'rentenversicherung', 'wohnen', 'arbeit', 'schule', 'bank', 'versicherung', 'sonstiges',
];

IconData folderIcon(String folder) => switch (folder) {
  'jobcenter' => Icons.work_outline_rounded,
  'auslaenderbehoerde' => Icons.public_rounded,
  'finanzamt' => Icons.account_balance_outlined,
  'familienkasse' => Icons.child_care_rounded,
  'krankenkasse' => Icons.health_and_safety_outlined,
  'rentenversicherung' => Icons.savings_outlined,
  'wohnen' => Icons.home_work_outlined,
  'arbeit' => Icons.badge_outlined,
  'schule' => Icons.school_outlined,
  'bank' => Icons.account_balance_wallet_outlined,
  'versicherung' => Icons.shield_outlined,
  _ => Icons.folder_outlined,
};

Color folderColor(String folder) => switch (folder) {
  'jobcenter' => const Color(0xFF2563EB),
  'auslaenderbehoerde' => const Color(0xFF059669),
  'finanzamt' => const Color(0xFFD97706),
  'familienkasse' => const Color(0xFFDB2777),
  'krankenkasse' => const Color(0xFFDC2626),
  'rentenversicherung' => const Color(0xFF0D9488),
  'wohnen' => const Color(0xFFEA580C),
  'arbeit' => const Color(0xFF4F46E5),
  'schule' => const Color(0xFF0284C7),
  'bank' => AppColors.navy,
  'versicherung' => AppColors.purple,
  _ => const Color(0xFF64748B),
};

class CustomerDocument {
  const CustomerDocument({
    required this.id,
    required this.folder,
    required this.title,
    required this.originalName,
    required this.size,
    required this.createdAt,
    required this.uploadedBy,
    required this.aiStatus,
    this.sender,
    this.summary,
    this.translation,
    this.translationLanguage,
    this.deadline,
  });

  final int id;
  final String folder;
  final String title;
  final String originalName;
  final int size;
  final DateTime? createdAt;
  final String uploadedBy;
  final String aiStatus;
  final String? sender;
  final String? summary;
  final String? translation;
  final String? translationLanguage;
  final DateTime? deadline;

  bool get isProcessing => aiStatus == 'pending';
  bool get byEinstein => uploadedBy == 'einstein';
  bool get isPdf => originalName.toLowerCase().endsWith('.pdf');

  factory CustomerDocument.fromJson(Map<String, dynamic> json) => CustomerDocument(
    id: (json['id'] as num).toInt(),
    folder: (json['folder'] ?? 'sonstiges').toString(),
    title: (json['title'] ?? '').toString(),
    originalName: (json['original_name'] ?? 'document').toString(),
    size: (json['size'] as num?)?.toInt() ?? 0,
    createdAt: DateTime.tryParse((json['created_at'] ?? '').toString()),
    uploadedBy: (json['uploaded_by'] ?? 'customer').toString(),
    aiStatus: (json['ai_status'] ?? 'none').toString(),
    sender: json['sender']?.toString(),
    summary: json['summary']?.toString(),
    translation: json['translation']?.toString(),
    translationLanguage: json['translation_language']?.toString(),
    deadline: DateTime.tryParse((json['deadline'] ?? '').toString()),
  );
}

class CustomerReminder {
  const CustomerReminder({
    required this.id,
    required this.title,
    required this.folder,
    required this.kind,
    required this.dueDate,
    this.details,
    this.documentId,
  });

  final int id;
  final String title;
  final String folder;
  final String kind;
  final DateTime dueDate;
  final String? details;
  final int? documentId;

  int get daysLeft {
    final today = DateTime.now();
    return DateTime(dueDate.year, dueDate.month, dueDate.day)
        .difference(DateTime(today.year, today.month, today.day))
        .inDays;
  }

  factory CustomerReminder.fromJson(Map<String, dynamic> json) => CustomerReminder(
    id: (json['id'] as num).toInt(),
    title: (json['title'] ?? '').toString(),
    folder: (json['folder'] ?? 'sonstiges').toString(),
    kind: (json['kind'] ?? 'deadline').toString(),
    dueDate: DateTime.tryParse((json['due_date'] ?? '').toString()) ?? DateTime.now(),
    details: json['details']?.toString(),
    documentId: (json['customer_document_id'] as num?)?.toInt(),
  );
}
