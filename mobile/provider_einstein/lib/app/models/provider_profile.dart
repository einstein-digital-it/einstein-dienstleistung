class ProviderProfile {
  const ProviderProfile({
    required this.id,
    required this.fullName,
    required this.email,
    required this.status,
    required this.loginEnabled,
    this.phone,
    this.address,
    this.profileImage,
    this.hourlyRate,
    this.rating,
    this.categories = const [],
    this.languages = const [],
    this.availability = const [],
    this.workingHoursStart,
    this.workingHoursEnd,
    this.experienceYears,
    this.serviceArea,
    this.city,
    this.qualifications,
    this.bio,
  });

  final int id;
  final String fullName;
  final String email;
  final String status;
  final bool loginEnabled;
  final String? phone;
  final String? address;
  final String? profileImage;
  final double? hourlyRate;
  final double? rating;
  final List<String> categories;
  final List<String> languages;
  final List<String> availability;
  final String? workingHoursStart;
  final String? workingHoursEnd;
  final int? experienceYears;
  final String? serviceArea;
  final String? city;
  final String? qualifications;
  final String? bio;

  factory ProviderProfile.fromJson(Map<String, dynamic> json) =>
      ProviderProfile(
        id: (json['id'] as num?)?.toInt() ?? 0,
        fullName: json['full_name']?.toString() ?? '',
        email: json['email']?.toString() ?? '',
        status: json['status']?.toString() ?? 'pending',
        loginEnabled: json['login_enabled'] == true,
        phone: json['phone']?.toString(),
        address: json['address']?.toString(),
        profileImage: json['profile_image']?.toString(),
        hourlyRate: (json['hourly_rate'] as num?)?.toDouble(),
        rating: (json['rating'] as num?)?.toDouble(),
        categories: _strings(json['categories']),
        languages: _strings(json['languages']),
        availability: _strings(json['availability']),
        workingHoursStart: json['working_hours_start']?.toString(),
        workingHoursEnd: json['working_hours_end']?.toString(),
        experienceYears: (json['experience_years'] as num?)?.toInt(),
        serviceArea: json['service_area']?.toString(),
        city: json['city']?.toString(),
        qualifications: json['qualifications']?.toString(),
        bio: json['bio_ar']?.toString().isNotEmpty == true
            ? json['bio_ar']?.toString()
            : json['bio_en']?.toString(),
      );

  static List<String> _strings(Object? value) =>
      value is List ? value.map((item) => item.toString()).toList() : const [];
}
