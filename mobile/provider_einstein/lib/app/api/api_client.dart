import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:file_picker/file_picker.dart';

import 'api_exception.dart';
import 'provider_session.dart';

class ApiClient {
  ApiClient({
    required this.session,
    http.Client? httpClient,
    this.baseUrl = const String.fromEnvironment(
      'EINSTEIN_API_BASE_URL',
      defaultValue: 'http://127.0.0.1:8000/api',
    ),
  }) : _httpClient = httpClient ?? http.Client();

  final ProviderSession session;
  final String baseUrl;
  final http.Client _httpClient;

  Future<dynamic> get(String path, {Map<String, String?> query = const {}}) {
    return _send('GET', path, query: query);
  }

  Future<dynamic> post(String path, {Map<String, dynamic>? body}) {
    return _send('POST', path, body: body);
  }

  Future<dynamic> patch(String path, {Map<String, dynamic>? body}) {
    return _send('PATCH', path, body: body);
  }

  Future<void> delete(String path) async {
    await _send('DELETE', path);
  }

  Future<List<Map<String, dynamic>>> uploadFiles(
    List<PlatformFile> files,
  ) async {
    await session.ensureLoaded();
    if (files.isEmpty) return const [];
    final request = http.MultipartRequest('POST', _uri('uploads'));
    request.headers.addAll({
      'Accept': 'application/json',
      if (session.token != null) 'Authorization': 'Bearer ${session.token}',
    });
    for (final file in files) {
      if (file.path != null) {
        request.files.add(
          await http.MultipartFile.fromPath(
            'files[]',
            file.path!,
            filename: file.name,
          ),
        );
      } else if (file.bytes != null) {
        request.files.add(
          http.MultipartFile.fromBytes(
            'files[]',
            file.bytes!,
            filename: file.name,
          ),
        );
      }
    }
    if (request.files.isEmpty) {
      throw const ApiException('No file data was available.');
    }
    final streamed = await request.send().timeout(const Duration(seconds: 30));
    final response = await http.Response.fromStream(streamed);
    final decoded = response.body.isEmpty ? null : jsonDecode(response.body);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        _message(decoded) ?? 'Upload failed.',
        statusCode: response.statusCode,
      );
    }
    final data = decoded is Map<String, dynamic> ? decoded['data'] : null;
    final uploaded = data is Map<String, dynamic> ? data['files'] : null;
    return uploaded is List
        ? uploaded
              .map((item) => Map<String, dynamic>.from(item as Map))
              .toList()
        : const [];
  }

  String absoluteUrl(String value) {
    if (value.isEmpty || Uri.tryParse(value)?.hasScheme == true) return value;
    return Uri.parse(baseUrl).resolve(value).toString();
  }

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
    Map<String, String?> query = const {},
  }) async {
    await session.ensureLoaded();
    final uri = _uri(path).replace(
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
    final Future<http.Response> request = switch (method) {
      'GET' => _httpClient.get(uri, headers: headers),
      'POST' => _httpClient.post(uri, headers: headers, body: encodedBody),
      'PATCH' => _httpClient.patch(uri, headers: headers, body: encodedBody),
      'DELETE' => _httpClient.delete(uri, headers: headers),
      _ => throw const ApiException('Unsupported HTTP method.'),
    };
    final response = await request.timeout(const Duration(seconds: 15));
    final decoded = response.body.isEmpty ? null : jsonDecode(response.body);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        _message(decoded) ?? 'Request failed.',
        statusCode: response.statusCode,
        errors: decoded is Map<String, dynamic> ? decoded['errors'] : null,
      );
    }
    return decoded is Map<String, dynamic> && decoded.containsKey('data')
        ? decoded['data']
        : decoded;
  }

  Uri _uri(String path) {
    final base = baseUrl.endsWith('/')
        ? baseUrl.substring(0, baseUrl.length - 1)
        : baseUrl;
    return Uri.parse(
      '$base/${path.startsWith('/') ? path.substring(1) : path}',
    );
  }

  String? _message(Object? decoded) {
    if (decoded is Map<String, dynamic>) {
      final message = decoded['message'];
      if (message is String && message.isNotEmpty) return message;
    }
    return null;
  }
}
