class CustomerProfile {
  const CustomerProfile({
    required this.fullName,
    required this.email,
    required this.phone,
    required this.address,
    required this.language,
  });

  final String fullName;
  final String email;
  final String phone;
  final String address;
  final String language;

  factory CustomerProfile.fromJson(Map<String, dynamic> json) {
    final email = (json['email'] ?? '').toString();
    return CustomerProfile(
      fullName: (json['full_name'] ?? json['name'] ?? email.split('@').first)
          .toString(),
      email: email,
      phone: (json['phone'] ?? '').toString(),
      address: (json['address'] ?? '').toString(),
      language: normalizeLanguageLabel(
        (json['preferred_language'] ?? json['language'] ?? 'Arabic').toString(),
      ),
    );
  }

  Map<String, dynamic> toApiJson() {
    return {
      'email': email,
      'full_name': fullName,
      'phone': phone,
      'address': address,
      'preferred_language': languageCodeFromLabel(language),
    };
  }

  CustomerProfile copyWith({
    String? fullName,
    String? email,
    String? phone,
    String? address,
    String? language,
  }) {
    return CustomerProfile(
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      language: language ?? this.language,
    );
  }
}

String normalizeLanguageLabel(String value) {
  return switch (value.toLowerCase()) {
    'ar' || 'arabic' => 'Arabic',
    'en' || 'english' => 'English',
    _ => 'Deutsch',
  };
}

String languageCodeFromLabel(String value) {
  return switch (value.toLowerCase()) {
    'arabic' || 'ar' => 'ar',
    'english' || 'en' => 'en',
    _ => 'de',
  };
}

// ignore: unused_element
String _languageLabel(String value) {
  return switch (value.toLowerCase()) {
    'ar' || 'arabic' || 'العربية' => 'Arabic',
    'en' || 'english' => 'English',
    _ => 'Deutsch',
  };
}

// ignore: unused_element
String _languageCode(String value) {
  return switch (value.toLowerCase()) {
    'arabic' || 'ar' || 'العربية' => 'ar',
    'english' || 'en' => 'en',
    _ => 'de',
  };
}
