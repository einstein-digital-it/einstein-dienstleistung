class ProviderEarningsReport {
  const ProviderEarningsReport({
    required this.year,
    required this.summary,
    required this.items,
  });

  final int year;
  final ProviderEarningsSummary summary;
  final List<ProviderEarningItem> items;

  factory ProviderEarningsReport.fromJson(Map<String, dynamic> json) =>
      ProviderEarningsReport(
        year: (json['year'] as num?)?.toInt() ?? DateTime.now().year,
        summary: ProviderEarningsSummary.fromJson(
          Map<String, dynamic>.from(json['summary'] as Map? ?? const {}),
        ),
        items: (json['items'] as List? ?? const [])
            .map(
              (item) => ProviderEarningItem.fromJson(
                Map<String, dynamic>.from(item as Map),
              ),
            )
            .toList(),
      );
}

class ProviderEarningsSummary {
  const ProviderEarningsSummary({
    this.totalEarned = 0,
    this.paidAmount = 0,
    this.pendingAmount = 0,
    this.completedServices = 0,
  });

  final double totalEarned;
  final double paidAmount;
  final double pendingAmount;
  final int completedServices;

  factory ProviderEarningsSummary.fromJson(Map<String, dynamic> json) =>
      ProviderEarningsSummary(
        totalEarned: (json['total_earned'] as num?)?.toDouble() ?? 0,
        paidAmount: (json['paid_amount'] as num?)?.toDouble() ?? 0,
        pendingAmount: (json['pending_amount'] as num?)?.toDouble() ?? 0,
        completedServices: (json['completed_services'] as num?)?.toInt() ?? 0,
      );
}

class ProviderEarningItem {
  const ProviderEarningItem({
    required this.id,
    required this.kind,
    required this.amount,
    required this.paymentStatus,
    required this.status,
    this.reference,
    this.customerName,
    this.serviceName,
    this.date,
    this.invoiceUrl,
  });

  final String id;
  final String kind;
  final double amount;
  final String paymentStatus;
  final String status;
  final String? reference;
  final String? customerName;
  final String? serviceName;
  final String? date;
  final String? invoiceUrl;

  factory ProviderEarningItem.fromJson(Map<String, dynamic> json) =>
      ProviderEarningItem(
        id: json['id']?.toString() ?? '',
        kind: json['kind']?.toString() ?? 'booking',
        amount: (json['amount'] as num?)?.toDouble() ?? 0,
        paymentStatus: json['payment_status']?.toString() ?? 'unpaid',
        status: json['status']?.toString() ?? 'pending',
        reference: json['reference']?.toString(),
        customerName: json['customer_name']?.toString(),
        serviceName: json['service_name']?.toString(),
        date: json['date']?.toString(),
        invoiceUrl: json['invoice_url']?.toString(),
      );
}
