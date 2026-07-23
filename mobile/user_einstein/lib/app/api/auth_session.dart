import 'package:shared_preferences/shared_preferences.dart';

class AuthSession {
  static const _tokenKey = 'einstein_user_token';
  static const _emailKey = 'einstein_user_email';

  String? _token;
  String? _email;
  bool _loaded = false;

  String? get token => _token;
  String? get email => _email;
  bool get isAuthenticated => _token != null && _token!.isNotEmpty;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
    _email = prefs.getString(_emailKey);
    _loaded = true;
  }

  Future<void> ensureLoaded() async {
    if (!_loaded) await load();
  }

  Future<void> save({required String token, required String email}) async {
    _token = token;
    _email = email;
    _loaded = true;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_emailKey, email);
  }

  Future<void> clear() async {
    _token = null;
    _email = null;
    _loaded = true;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_emailKey);
  }
}
