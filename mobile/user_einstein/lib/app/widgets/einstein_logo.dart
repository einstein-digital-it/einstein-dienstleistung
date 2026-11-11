import 'package:flutter/material.dart';

/// The EinStein hexagon mark; [withWordmark] adds "EIN STEIN" and the tagline below it.
class EinsteinLogo extends StatelessWidget {
  const EinsteinLogo({super.key, this.size = 64, this.withWordmark = false});

  final double size;
  final bool withWordmark;

  @override
  Widget build(BuildContext context) {
    final mark = Image.asset(
      'assets/brand/einstein-mark.png',
      width: size,
      height: size,
      fit: BoxFit.contain,
      semanticLabel: 'EinStein',
    );
    if (!withWordmark) return mark;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        mark,
        const SizedBox(height: 10),
        Image.asset(
          'assets/brand/einstein-wordmark.png',
          width: size * 2.6,
          fit: BoxFit.contain,
          excludeFromSemantics: true,
        ),
      ],
    );
  }
}
