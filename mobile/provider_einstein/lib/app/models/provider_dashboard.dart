import 'provider_booking.dart';
import 'provider_profile.dart';

class ProviderDashboard {
  const ProviderDashboard({
    required this.provider,
    required this.bookings,
    required this.summary,
  });

  final ProviderProfile? provider;
  final List<ProviderBooking> bookings;
  final ProviderSummary summary;

  factory ProviderDashboard.fromJson(Map<String, dynamic> json) {
    final provider = json['provider'];
    final bookings = json['bookings'];
    return ProviderDashboard(
      provider: provider is Map
          ? ProviderProfile.fromJson(Map<String, dynamic>.from(provider))
          : null,
      bookings: bookings is List
          ? bookings
                .map(
                  (item) => ProviderBooking.fromJson(
                    Map<String, dynamic>.from(item as Map),
                  ),
                )
                .toList()
          : const [],
      summary: ProviderSummary.fromJson(
        Map<String, dynamic>.from(json['summary'] as Map? ?? const {}),
      ),
    );
  }
}

class ProviderSummary {
  const ProviderSummary({
    this.upcoming = 0,
    this.completed = 0,
    this.totalEarnings = 0,
    this.thisMonth = 0,
  });

  final int upcoming;
  final int completed;
  final double totalEarnings;
  final double thisMonth;

  factory ProviderSummary.fromJson(Map<String, dynamic> json) =>
      ProviderSummary(
        upcoming: (json['upcoming'] as num?)?.toInt() ?? 0,
        completed: (json['completed'] as num?)?.toInt() ?? 0,
        totalEarnings: (json['total_earnings'] as num?)?.toDouble() ?? 0,
        thisMonth: (json['this_month'] as num?)?.toDouble() ?? 0,
      );
}
