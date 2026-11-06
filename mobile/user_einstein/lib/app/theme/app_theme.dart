import 'package:flutter/material.dart';

import 'app_colors.dart';

abstract class AppTheme {
  static const fontFamily = 'IBMPlexSansArabic';

  static ThemeData get light {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.navy,
      primary: AppColors.navy,
      secondary: AppColors.purple,
      tertiary: AppColors.gold,
      surface: AppColors.surface,
      error: AppColors.danger,
    );
    final radius = BorderRadius.circular(14);

    return ThemeData(
      useMaterial3: true,
      fontFamily: fontFamily,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.background,
      splashFactory: InkSparkle.splashFactory,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.navy,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontFamily: fontFamily,
          fontSize: 19,
          fontWeight: FontWeight.w700,
          color: AppColors.navy,
        ),
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(fontSize: 30, height: 1.2, fontWeight: FontWeight.w700, color: AppColors.text),
        headlineMedium: TextStyle(fontSize: 22, height: 1.25, fontWeight: FontWeight.w700, color: AppColors.navy),
        headlineSmall: TextStyle(fontSize: 19, height: 1.3, fontWeight: FontWeight.w700, color: AppColors.navy),
        titleLarge: TextStyle(fontSize: 17, height: 1.3, fontWeight: FontWeight.w700, color: AppColors.navy),
        titleMedium: TextStyle(fontSize: 15, height: 1.35, fontWeight: FontWeight.w600, color: AppColors.text),
        bodyLarge: TextStyle(fontSize: 15.5, height: 1.55, color: AppColors.text),
        bodyMedium: TextStyle(fontSize: 14, height: 1.55, color: AppColors.muted),
        bodySmall: TextStyle(fontSize: 12.5, height: 1.45, color: AppColors.muted),
        labelLarge: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: AppColors.line),
        ),
      ),
      dividerTheme: const DividerThemeData(color: AppColors.line, thickness: 1, space: 1),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.purple,
          foregroundColor: Colors.white,
          minimumSize: const Size(0, 50),
          padding: const EdgeInsets.symmetric(horizontal: 20),
          shape: RoundedRectangleBorder(borderRadius: radius),
          textStyle: const TextStyle(fontFamily: fontFamily, fontSize: 15, fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.navy,
          minimumSize: const Size(0, 50),
          padding: const EdgeInsets.symmetric(horizontal: 18),
          side: const BorderSide(color: AppColors.line, width: 1.2),
          shape: RoundedRectangleBorder(borderRadius: radius),
          textStyle: const TextStyle(fontFamily: fontFamily, fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.purple,
          textStyle: const TextStyle(fontFamily: fontFamily, fontWeight: FontWeight.w600),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.input,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
        labelStyle: const TextStyle(color: AppColors.muted),
        hintStyle: const TextStyle(color: Color(0xFF98A2B3)),
        border: OutlineInputBorder(borderRadius: radius, borderSide: const BorderSide(color: AppColors.line)),
        enabledBorder: OutlineInputBorder(borderRadius: radius, borderSide: const BorderSide(color: AppColors.line)),
        focusedBorder: OutlineInputBorder(borderRadius: radius, borderSide: const BorderSide(color: AppColors.purple, width: 1.6)),
        errorBorder: OutlineInputBorder(borderRadius: radius, borderSide: const BorderSide(color: AppColors.danger)),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.surface,
        selectedColor: AppColors.purpleSoft,
        side: const BorderSide(color: AppColors.line),
        labelStyle: const TextStyle(fontFamily: fontFamily, fontWeight: FontWeight.w600, color: AppColors.navy),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        indicatorColor: AppColors.purpleSoft,
        height: 68,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => TextStyle(
            fontFamily: fontFamily,
            fontSize: 11.5,
            fontWeight: states.contains(WidgetState.selected) ? FontWeight.w700 : FontWeight.w500,
            color: states.contains(WidgetState.selected) ? AppColors.purple : AppColors.muted,
          ),
        ),
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            size: 24,
            color: states.contains(WidgetState.selected) ? AppColors.purple : AppColors.muted,
          ),
        ),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      ),
      snackBarTheme: const SnackBarThemeData(behavior: SnackBarBehavior.floating),
      progressIndicatorTheme: const ProgressIndicatorThemeData(color: AppColors.purple),
    );
  }
}
