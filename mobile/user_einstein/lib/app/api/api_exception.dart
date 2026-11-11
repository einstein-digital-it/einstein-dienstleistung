class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode, this.errors, this.code, this.data});

  final String message;
  final int? statusCode;
  final Object? errors;

  /// Machine-readable reason from the API, e.g. "email_not_verified".
  final String? code;
  final Object? data;

  @override
  String toString() => 'ApiException($statusCode): $message';
}
