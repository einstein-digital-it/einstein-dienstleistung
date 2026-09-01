import 'package:shared_preferences/shared_preferences.dart';

class ProviderSession {
  static const _tokenKey = 'einstein_provider_token';
  static const _emailKey = 'einstein_provider_email';
  static const _providerIdKey = 'einstein_provider_id';

  String? _token;
  String? _email;
  int? _providerId;
  bool _loaded = false;

  String? get token => _token;
  String? get email => _email;
  int? get providerId => _providerId;
  bool get isAuthenticated => _token != null && _token!.isNotEmpty;

  Future<void> load() async {
    final preferences = await SharedPreferences.getInstance();
    _token = preferences.getString(_tokenKey);
    _email = preferences.getString(_emailKey);
    _providerId = preferences.getInt(_providerIdKey);
    _loaded = true;
  }

  Future<void> ensureLoaded() async {
    if (!_loaded) await load();
  }

  Future<void> save({
    required String token,
    required String email,
    required int providerId,
  }) async {
    _token = token;
    _email = email;
    _providerId = providerId;
    _loaded = true;

    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_tokenKey, token);
    await preferences.setString(_emailKey, email);
    await preferences.setInt(_providerIdKey, providerId);
  }

  Future<void> clear() async {
    _token = null;
    _email = null;
    _providerId = null;
    _loaded = true;

    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_tokenKey);
    await preferences.remove(_emailKey);
    await preferences.remove(_providerIdKey);
  }
}
