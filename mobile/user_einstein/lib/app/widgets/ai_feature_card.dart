import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../routes/app_routes.dart';
import '../theme/app_colors.dart';

/// Tells every visitor what the AI assistant does. On the public home it leads to sign-in,
/// on the customer's dashboard straight to "My file".
class AiFeatureCard extends StatelessWidget {
  const AiFeatureCard({super.key, this.loggedIn = false});

  final bool loggedIn;

  @override
  Widget build(BuildContext context) {
    final points = [
      (Icons.folder_open_rounded, 'ai_feat_sort'.tr),
      (Icons.translate_rounded, 'ai_feat_translate'.tr),
      (Icons.question_answer_outlined, 'ai_feat_ask'.tr),
      (Icons.edit_document, 'ai_feat_reply'.tr),
      (Icons.draw_outlined, 'ai_feat_sign'.tr),
    ];
    return Material(
      color: Colors.transparent,
      child: InkWell(
        key: const Key('ai_feature_card'),
        borderRadius: BorderRadius.circular(22),
        onTap: () => Get.toNamed(loggedIn ? AppRoutes.documents : AppRoutes.login),
        child: Ink(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF2E1065), Color(0xFF4C1D95), Color(0xFF6D28D9)],
            ),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.smart_toy_outlined, color: AppColors.goldBright, size: 16),
                const SizedBox(width: 6),
                Text('ai_card_kicker'.tr, style: const TextStyle(color: AppColors.goldBright, fontWeight: FontWeight.w700, fontSize: 12.5)),
              ]),
            ),
            const SizedBox(height: 10),
            Text('ai_card_title'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 19, height: 1.3)),
            const SizedBox(height: 4),
            Text('ai_card_sub'.tr, style: TextStyle(color: Colors.white.withValues(alpha: 0.8), height: 1.4)),
            const SizedBox(height: 14),
            for (final p in points)
              Padding(
                padding: const EdgeInsets.only(bottom: 9),
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Icon(p.$1, color: AppColors.goldBright, size: 20),
                  const SizedBox(width: 10),
                  Expanded(child: Text(p.$2, style: const TextStyle(color: Colors.white, height: 1.4))),
                ]),
              ),
            const SizedBox(height: 6),
            Row(children: [
              Expanded(
                child: Text('ai_card_plans'.tr, style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 12.5)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
                child: Text('ai_card_cta'.tr, style: const TextStyle(color: Color(0xFF4C1D95), fontWeight: FontWeight.w800)),
              ),
            ]),
          ]),
        ),
      ),
    );
  }
}
