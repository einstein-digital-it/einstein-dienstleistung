class ProviderNotification {
  const ProviderNotification({
    required this.id,
    required this.type,
    required this.isRead,
    this.titleAr,
    this.titleEn,
    this.titleDe,
    this.messageAr,
    this.messageEn,
    this.messageDe,
    this.bookingId,
    this.createdAt,
  });

  final String id;
  final String type;
  final bool isRead;
  final String? titleAr;
  final String? titleEn;
  final String? titleDe;
  final String? messageAr;
  final String? messageEn;
  final String? messageDe;
  final String? bookingId;
  final DateTime? createdAt;

  factory ProviderNotification.fromJson(Map<String, dynamic> json) =>
      ProviderNotification(
        id: json['id']?.toString() ?? '',
        type: json['type']?.toString() ?? 'general',
        isRead: json['is_read'] == true,
        titleAr: json['title_ar']?.toString(),
        titleEn: json['title_en']?.toString(),
        titleDe: json['title_de']?.toString(),
        messageAr: json['message_ar']?.toString(),
        messageEn: json['message_en']?.toString(),
        messageDe: json['message_de']?.toString(),
        bookingId: json['booking_id']?.toString(),
        createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
      );

  String titleFor(String languageCode) => switch (languageCode) {
    'ar' => titleAr?.isNotEmpty == true ? titleAr! : (titleEn ?? titleDe ?? ''),
    'de' => titleDe?.isNotEmpty == true ? titleDe! : (titleEn ?? titleAr ?? ''),
    _ => titleEn?.isNotEmpty == true ? titleEn! : (titleAr ?? titleDe ?? ''),
  };

  String messageFor(String languageCode) => switch (languageCode) {
    'ar' =>
      messageAr?.isNotEmpty == true
          ? messageAr!
          : (messageEn ?? messageDe ?? ''),
    'de' =>
      messageDe?.isNotEmpty == true
          ? messageDe!
          : (messageEn ?? messageAr ?? ''),
    _ =>
      messageEn?.isNotEmpty == true
          ? messageEn!
          : (messageAr ?? messageDe ?? ''),
  };
}
