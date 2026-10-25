/// German VAT added on top of net prices. The server uses the same rate
/// (config services.tax.vat_rate) when it charges through Stripe.
const double vatRate = 0.19;

/// Net price -> gross price customers pay, rounded to cents.
double grossFromNet(num net) =>
    double.parse((net * (1 + vatRate)).toStringAsFixed(2));

/// "150" for whole euros, "178.50" otherwise.
String formatAmount(num value) => value == value.roundToDouble()
    ? value.toInt().toString()
    : value.toStringAsFixed(2);
