class ServiceExtension {
  const ServiceExtension({
    required this.id,
    required this.status,
    required this.paymentStatus,
    this.bookingNumber,
    this.customerName,
    this.serviceName,
    this.amount,
    this.description,
    this.bookingId,
    this.documentsUrls = const [],
  });

  final String id;
  final String status;
  final String paymentStatus;
  final String? bookingNumber;
  final String? customerName;
  final String? serviceName;
  final double? amount;
  final String? description;
  final String? bookingId;
  final List<String> documentsUrls;

  factory ServiceExtension.fromJson(Map<String, dynamic> json) =>
      ServiceExtension(
        id: json['id']?.toString() ?? '',
        status: json['status']?.toString() ?? 'pending',
        paymentStatus: json['payment_status']?.toString() ?? 'unpaid',
        bookingNumber: json['booking_number']?.toString(),
        customerName: json['customer_name']?.toString(),
        serviceName: json['service_name']?.toString(),
        amount: (json['amount'] as num?)?.toDouble(),
        description: json['description']?.toString(),
        bookingId: json['booking_id']?.toString(),
        documentsUrls: json['documents_urls'] is List
            ? (json['documents_urls'] as List)
                  .map((item) => item.toString())
                  .toList()
            : const [],
      );
}
