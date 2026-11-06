import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'api_exception.dart';
import 'auth_session.dart';

class ApiClient {
  ApiClient({
    required this.session,
    http.Client? httpClient,
    this.baseUrl = const String.fromEnvironment(
      'EINSTEIN_API_BASE_URL',
      defaultValue: 'http://127.0.0.1:8000/api',
    ),
  }) : _httpClient = httpClient ?? http.Client();

  final AuthSession session;
  final String baseUrl;
  final http.Client _httpClient;

  Future<dynamic> get(String path, {Map<String, String?> query = const {}}) {
    return _send('GET', path, query: query);
  }

  Future<dynamic> post(
    String path, {
    Map<String, dynamic>? body,
    Map<String, String?> query = const {},
  }) {
    return _send('POST', path, body: body, query: query);
  }

  Future<dynamic> patch(
    String path, {
    Map<String, dynamic>? body,
    Map<String, String?> query = const {},
  }) {
    return _send('PATCH', path, body: body, query: query);
  }

  Future<dynamic> put(
    String path, {
    Map<String, dynamic>? body,
    Map<String, String?> query = const {},
  }) {
    return _send('PUT', path, body: body, query: query);
  }

  Future<dynamic> delete(
    String path, {
    Map<String, dynamic>? body,
    Map<String, String?> query = const {},
  }) {
    return _send('DELETE', path, body: body, query: query);
  }

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
    Map<String, String?> query = const {},
  }) async {
    await session.ensureLoaded();
    final normalizedBase = baseUrl.endsWith('/')
        ? baseUrl.substring(0, baseUrl.length - 1)
        : baseUrl;
    final normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    final uri = Uri.parse('$normalizedBase/$normalizedPath').replace(
      queryParameters: {
        for (final entry in query.entries)
          if (entry.value != null && entry.value!.isNotEmpty)
            entry.key: entry.value,
      },
    );

    final headers = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      if (session.token != null) 'Authorization': 'Bearer ${session.token}',
    };

    final encodedBody = body == null ? null : jsonEncode(body);
    final Future<http.Response> request;
    if (method == 'GET') {
      request = _httpClient.get(uri, headers: headers);
    } else if (method == 'POST') {
      request = _httpClient.post(uri, headers: headers, body: encodedBody);
    } else if (method == 'PATCH') {
      request = _httpClient.patch(uri, headers: headers, body: encodedBody);
    } else if (method == 'PUT') {
      request = _httpClient.put(uri, headers: headers, body: encodedBody);
    } else if (method == 'DELETE') {
      request = _httpClient.delete(uri, headers: headers, body: encodedBody);
    } else {
      throw ApiException('Unsupported HTTP method: $method');
    }

    // Generous on purpose: on slow mobile networks a short timeout reports
    // failure for requests the server has already saved (e.g. bookings).
    final response = await request.timeout(const Duration(seconds: 20));

    final decoded = response.body.isEmpty ? null : jsonDecode(response.body);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        _messageFrom(decoded) ?? 'Request failed.',
        statusCode: response.statusCode,
        errors: decoded is Map<String, dynamic> ? decoded['errors'] : null,
      );
    }

    return decoded is Map<String, dynamic> && decoded.containsKey('data')
        ? decoded['data']
        : decoded;
  }

  Uri _uri(String path) {
    final normalizedBase = baseUrl.endsWith('/')
        ? baseUrl.substring(0, baseUrl.length - 1)
        : baseUrl;
    final normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    return Uri.parse('$normalizedBase/$normalizedPath');
  }

  /// Multipart upload of one file plus form fields.
  Future<dynamic> upload(
    String path, {
    required List<int> bytes,
    required String filename,
    Map<String, String> fields = const {},
  }) async {
    await session.ensureLoaded();
    final request = http.MultipartRequest('POST', _uri(path))
      ..headers['Accept'] = 'application/json'
      ..fields.addAll(fields)
      ..files.add(http.MultipartFile.fromBytes('file', bytes, filename: filename));
    if (session.token != null) {
      request.headers['Authorization'] = 'Bearer ${session.token}';
    }
    final streamed = await _httpClient.send(request).timeout(const Duration(seconds: 90));
    final response = await http.Response.fromStream(streamed);
    final decoded = response.body.isEmpty ? null : jsonDecode(response.body);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        _messageFrom(decoded) ?? 'Upload failed.',
        statusCode: response.statusCode,
        errors: decoded is Map<String, dynamic> ? decoded['errors'] : null,
      );
    }
    return decoded is Map<String, dynamic> && decoded.containsKey('data')
        ? decoded['data']
        : decoded;
  }

  /// Raw bytes of a protected file (e.g. a customer document).
  Future<List<int>> getBytes(String path) async {
    await session.ensureLoaded();
    final response = await _httpClient.get(_uri(path), headers: {
      if (session.token != null) 'Authorization': 'Bearer ${session.token}',
    }).timeout(const Duration(seconds: 60));
    if (response.statusCode != 200) {
      throw ApiException('Download failed.', statusCode: response.statusCode);
    }
    return response.bodyBytes;
  }

  String? _messageFrom(Object? decoded) {
    if (decoded is Map<String, dynamic>) {
      final message = decoded['message'];
      if (message is String && message.isNotEmpty) return message;
    }
    return null;
  }
}
