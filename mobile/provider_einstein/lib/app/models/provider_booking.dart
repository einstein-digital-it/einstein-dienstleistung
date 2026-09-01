class ProviderBooking {
  const ProviderBooking({
    required this.id,
    required this.number,
    required this.customerName,
    required this.status,
    required this.price,
    this.serviceName,
    this.category,
    this.date,
    this.time,
    this.address,
    this.paymentStatus,
    this.customerEmail,
    this.customerPhone,
    this.durationHours,
    this.description,
    this.documentsUrls = const [],
    this.providerDocumentsUrls = const [],
  });

  final String id;
  final String number;
  final String customerName;
  final String status;
  final double price;
  final String? serviceName;
  final String? category;
  final String? date;
  final String? time;
  final String? address;
  final String? paymentStatus;
  final String? customerEmail;
  final String? customerPhone;
  final int? durationHours;
  final String? description;
  final List<String> documentsUrls;
  final List<String> providerDocumentsUrls;

  factory ProviderBooking.fromJson(Map<String, dynamic> json) =>
      ProviderBooking(
        id: json['id']?.toString() ?? '',
        number: json['booking_number']?.toString() ?? '',
        customerName: json['customer_name']?.toString() ?? '',
        status: json['status']?.toString() ?? 'pending',
        price: (json['price'] as num?)?.toDouble() ?? 0,
        serviceName: json['service_name']?.toString(),
        category: json['category']?.toString(),
        date: json['date']?.toString(),
        time: json['time']?.toString(),
        address: json['address']?.toString(),
        paymentStatus: json['payment_status']?.toString(),
        customerEmail: json['customer_email']?.toString(),
        customerPhone: json['customer_phone']?.toString(),
        durationHours: (json['duration_hours'] as num?)?.toInt(),
        description: json['description']?.toString(),
        documentsUrls: _urls(json['documents_urls']),
        providerDocumentsUrls: _urls(json['provider_documents_urls']),
      );

  static List<String> _urls(Object? value) => value is List
      ? value.whereType<Object>().map((item) => item.toString()).toList()
      : const [];
}
