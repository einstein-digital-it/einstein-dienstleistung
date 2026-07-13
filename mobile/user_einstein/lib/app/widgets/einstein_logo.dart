import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

class EinsteinLogo extends StatelessWidget {
  const EinsteinLogo({super.key, this.size = 64});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.55), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        'ES',
        style: TextStyle(
          color: AppColors.navy,
          fontSize: size * 0.35,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}
