import 'package:flutter/material.dart';

/// EinStein brand colours — same palette as the website:
/// deep navy surfaces, purple for actions, gold for highlights.
abstract class AppColors {
  static const navy = Color(0xFF1E3A5F);
  static const navyDeep = Color(0xFF0F2342);
  static const navyDark = Color(0xFF0B1A33);
  static const gold = Color(0xFFC9A227);
  static const goldBright = Color(0xFFE8C547);
  static const goldSoft = Color(0xFFFFF6DB);
  static const purple = Color(0xFF6B46C1);
  static const purpleDeep = Color(0xFF4C2F9E);
  static const purpleSoft = Color(0xFFF1ECFC);
  static const background = Color(0xFFF5F6FA);
  static const surface = Colors.white;
  static const text = Color(0xFF101828);
  static const muted = Color(0xFF667085);
  static const line = Color(0xFFE6EAF2);
  static const input = Color(0xFFF7F8FB);
  static const success = Color(0xFF12B76A);
  static const successSoft = Color(0xFFE8F8F0);
  static const warning = Color(0xFFDC6803);
  static const warningSoft = Color(0xFFFFF4E5);
  static const danger = Color(0xFFD92D20);
  static const dangerSoft = Color(0xFFFEF0EF);

  static const heroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [navyDeep, navy, Color(0xFF2B4C7E)],
  );

  static const actionGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [purple, purpleDeep],
  );

  static List<BoxShadow> get softShadow => [
    BoxShadow(
      color: const Color(0xFF101828).withValues(alpha: 0.06),
      blurRadius: 18,
      offset: const Offset(0, 8),
    ),
  ];
}
