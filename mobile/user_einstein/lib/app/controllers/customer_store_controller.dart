import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../api/auth_session.dart';
import '../models/booking_item.dart';
import '../models/customer_profile.dart';
import '../models/notification_item.dart';
import '../models/support_request.dart';

class CustomerStoreController extends GetxController {
  // Empty until the customer logs in (filled from the API / session).
  final profile = const CustomerProfile(
    fullName: '',
    email: '',
    phone: '',
    address: '',
    language: 'Arabic',
  ).obs;
  final bookings = <BookingItem>[].obs;
  final notifications = <NotificationItem>[].obs;
  final supportRequests = <SupportRequest>[].obs;

  final bookingUpdates = true.obs;
  final paymentUpdates = true.obs;
  final reminderUpdates = true.obs;
  final providerUpdates = false.obs;
  final emailEnabled = true.obs;
  final pushEnabled = true.obs;
  final selectedLanguage = 'Arabic'.obs;
  final locale = const Locale('ar').obs;
  final reminderTiming = '24h before'.obs;
  final dashboardOpenPayments = RxnInt();

  int get openPaymentsCount =>
      dashboardOpenPayments.value ??
      bookings.where((item) => !item.isPaid).length;
  int get paidBookingsCount => bookings.where((item) => item.isPaid).length;
  int get unreadNotificationsCount =>
      notifications.where((item) => item.unread).length;

  List<BookingItem> get upcomingBookings => bookings.take(3).toList();
  List<NotificationItem> get recentNotifications =>
      notifications.take(3).toList();

  String get currentEmail => profile.value.email;

  /// Forget everything about the logged-out customer.
  void clearCustomerData() {
    profile.value = CustomerProfile(
      fullName: '',
      email: '',
      phone: '',
      address: '',
      language: profile.value.language,
    );
    bookings.clear();
    notifications.clear();
    supportRequests.clear();
    dashboardOpenPayments.value = null;
  }

  void setProfile(CustomerProfile nextProfile) {
    profile.value = nextProfile;
    applyLanguage(nextProfile.language, updateProfileLanguage: false);
  }

  void applyLanguage(String language, {bool updateProfileLanguage = true}) {
    final normalized = normalizeLanguageLabel(language);
    selectedLanguage.value = normalized;
    if (updateProfileLanguage && profile.value.language != normalized) {
      profile.value = profile.value.copyWith(language: normalized);
    }
    final nextLocale = Locale(languageCodeFromLabel(normalized));
    unawaited(Get.find<AuthSession>().saveLocale(nextLocale.languageCode));
    if (Get.locale?.languageCode != nextLocale.languageCode) {
      Get.updateLocale(nextLocale);
    }
    locale.value = nextLocale;
  }

  void applyDashboard(Map<String, dynamic> data) {
    final summary = data['summary'];
    if (summary is Map && summary['open_payments'] != null) {
      dashboardOpenPayments.value = int.tryParse(
        summary['open_payments'].toString(),
      );
    }

    final profileData = data['profile'];
    if (profileData is Map) {
      setProfile(
        CustomerProfile.fromJson(Map<String, dynamic>.from(profileData)),
      );
    }

    final upcoming = data['upcoming_bookings'];
    if (upcoming is List) {
      bookings.assignAll(
        upcoming
            .map(
              (item) =>
                  BookingItem.fromJson(Map<String, dynamic>.from(item as Map)),
            )
            .toList(),
      );
    }

    final latestNotifications = data['notifications'];
    if (latestNotifications is List) {
      notifications.assignAll(
        latestNotifications
            .map(
              (item) => NotificationItem.fromJson(
                Map<String, dynamic>.from(item as Map),
              ),
            )
            .toList(),
      );
    }
  }

  void replaceBookings(List<BookingItem> nextBookings) {
    if (nextBookings.isNotEmpty) {
      bookings.assignAll(nextBookings);
      dashboardOpenPayments.value = null;
    }
  }

  void replaceNotifications(List<NotificationItem> nextNotifications) {
    notifications.assignAll(nextNotifications);
  }

  BookingItem? bookingById(String? id) {
    if (id == null) {
      for (final item in bookings) {
        if (!item.isPaid) return item;
      }
      return bookings.isEmpty ? null : bookings.first;
    }
    for (final item in bookings) {
      if (item.id == id) return item;
    }
    return null;
  }

  void signIn({required String email, String? name}) {
    final resolvedName = (name == null || name.trim().isEmpty)
        ? profile.value.fullName
        : name.trim();
    profile.value = profile.value.copyWith(
      fullName: resolvedName,
      email: email,
    );
  }

  void updateProfile({
    required String fullName,
    required String phone,
    required String address,
    required String language,
  }) {
    profile.value = profile.value.copyWith(
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      language: language,
    );
    applyLanguage(language);
    addNotification(
      title: 'Profile updated',
      message: 'Your personal information was updated successfully.',
      icon: Icons.person_outline,
      color: const Color(0xFF10B981),
    );
  }

  BookingItem createBooking({
    required String service,
    required String date,
    required String time,
    required String address,
    required String note,
  }) {
    final nextId = 'ES-${2050 + bookings.length}';
    final booking = BookingItem(
      id: nextId,
      service: service,
      date: date,
      time: time,
      address: address,
      status: 'Awaiting payment',
      paymentStatus: 'Unpaid',
      price: '90 EUR',
      statusColor: const Color(0xFFC9A227),
    );
    bookings.insert(0, booking);
    addNotification(
      title: 'Booking created',
      message: '$service booking $nextId was added to My Bookings.',
      icon: Icons.calendar_month_outlined,
      color: const Color(0xFFC9A227),
    );
    return booking;
  }

  void markBookingPaid(String id) {
    final index = bookings.indexWhere((item) => item.id == id);
    if (index == -1) return;
    final booking = bookings[index];
    bookings[index] = booking.copyWith(
      status: 'Confirmed',
      paymentStatus: 'Paid',
      statusColor: const Color(0xFF10B981),
    );
    dashboardOpenPayments.value = null;
    addNotification(
      title: 'Payment successful',
      message: 'Booking $id is now marked as paid.',
      icon: Icons.credit_card_outlined,
      color: const Color(0xFF10B981),
    );
  }

  void markAllNotificationsRead() {
    notifications.assignAll(
      notifications.map((item) {
        return NotificationItem(
          title: item.title,
          message: item.message,
          time: item.time,
          icon: item.icon,
          color: item.color,
        );
      }),
    );
  }

  void addNotification({
    required String title,
    required String message,
    required IconData icon,
    required Color color,
  }) {
    notifications.insert(
      0,
      NotificationItem(
        title: title,
        message: message,
        time: 'Now',
        icon: icon,
        color: color,
        unread: true,
      ),
    );
  }

  SupportRequest createSupportRequest({
    required String type,
    required String message,
  }) {
    final request = SupportRequest(
      id: 'SUP-${1000 + supportRequests.length + 1}',
      type: type,
      message: message.trim(),
      status: 'Received',
      createdAt: 'Now',
    );
    supportRequests.insert(0, request);
    addNotification(
      title: 'Support request received',
      message: 'Your ${type.toLowerCase()} request ${request.id} was sent.',
      icon: Icons.support_agent_outlined,
      color: const Color(0xFF3B82F6),
    );
    return request;
  }
}
