import 'package:flutter_test/flutter_test.dart';
import 'package:user_einstein/app/models/booking_item.dart';

void main() {
  test('shows the booking number and a readable date from the API', () {
    final item = BookingItem.fromJson({
      'id': 1,
      'booking_number': 'ES-20261025171803-514',
      'service_name': 'Dokumentenservice EU-Syrien / EUR.1',
      'category': 'eur1',
      'date': '2026-10-26T00:00:00.000000Z',
      'time': '09:00',
      'status': 'pending',
      'payment_status': 'unpaid',
      'price': 150,
    });

    expect(item.id, '1');
    expect(item.number, 'ES-20261025171803-514');
    expect(item.date, '26.10.2026');
    expect(item.price, '150 EUR');
    expect(item.paymentStatusKey, 'payment_status_unpaid');
    expect(item.statusKey, 'booking_status_awaiting_payment');
  });

  test('falls back to the id when there is no booking number', () {
    final item = BookingItem.fromJson({
      'id': 'ES-2050',
      'date': '2026-11-02',
      'status': 'confirmed',
      'payment_status': 'paid',
    });

    expect(item.number, 'ES-2050');
    expect(item.date, '02.11.2026');
    expect(item.paymentStatusKey, 'payment_status_paid');
    expect(item.statusKey, 'booking_status_confirmed');
  });
}
