import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../api/api_client.dart';
import '../api/auth_session.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/ui.dart';

/// The four parts of the Unterlagen-Abo, the only thing the app offers.
const aboSections = <(String, IconData, Color)>[
  ('sort', Icons.folder_open_rounded, Color(0xFF2563EB)),
  ('translate', Icons.translate_rounded, Color(0xFF7C3AED)),
  ('remind', Icons.notifications_active_rounded, Color(0xFFD97706)),
  ('reply', Icons.edit_document, Color(0xFF059669)),
];

/// Short version for the home screens: one row per part, tap → the full explanation.
class AboSectionsSummary extends StatelessWidget {
  const AboSectionsSummary({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      for (final (key, icon, color) in aboSections) ...[
        AppCard(
          key: Key('abo_section_$key'),
          padding: const EdgeInsets.all(14),
          onTap: () => Get.toNamed(AppRoutes.subscription, arguments: key),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            IconTile(icon: icon, color: color, size: 42),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('abo_sec_${key}_title'.tr, style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w800, fontSize: 15.5)),
                const SizedBox(height: 3),
                Text('abo_sec_${key}_lead'.tr, style: const TextStyle(color: AppColors.darkGray, height: 1.4)),
              ]),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.muted),
          ]),
        ),
        const SizedBox(height: 10),
      ],
    ]);
  }
}

/// "The subscription": every part explained, what is included, the plans and prices.
class AboInfoView extends StatefulWidget {
  const AboInfoView({super.key});

  @override
  State<AboInfoView> createState() => _AboInfoViewState();
}

class _AboInfoViewState extends State<AboInfoView> {
  final _keys = {for (final s in aboSections) s.$1: GlobalKey()};
  List<Map<String, dynamic>> plans = const [
    {'key': 'basic', 'price': 6.99, 'questions': 10},
    {'key': 'silver', 'price': 11.99, 'questions': 20},
    {'key': 'unlimited', 'price': 17.99, 'questions': null},
  ];
  int letters = 50;

  @override
  void initState() {
    super.initState();
    _loadPlans();
    // Opened from a part on the home screen: scroll to it
    final target = Get.arguments;
    if (target is String && _keys.containsKey(target)) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final ctx = _keys[target]!.currentContext;
        if (ctx != null) Scrollable.ensureVisible(ctx, duration: const Duration(milliseconds: 300), alignment: 0.05);
      });
    }
  }

  /// Real prices from the server; the defaults above stay when it cannot be reached.
  Future<void> _loadPlans() async {
    try {
      final client = Get.find<ApiClient>();
      final data = Map<String, dynamic>.from(await client.get('public/abo-plans') as Map);
      final list = data['plans'];
      if (list is List && list.isNotEmpty && mounted) {
        setState(() {
          plans = list.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
          letters = int.tryParse('${data['letters_per_month'] ?? ''}') ?? letters;
        });
      }
    } catch (_) {}
  }

  String _euro(Object? p) => (double.tryParse('$p') ?? 0).toStringAsFixed(2).replaceAll('.', ',');

  @override
  Widget build(BuildContext context) {
    final loggedIn = Get.find<AuthSession>().isAuthenticated;
    return Scaffold(
      appBar: AppBar(title: Text('abo_info_title'.tr)),
      bottomNavigationBar: loggedIn ? null : const AppBottomNav(tab: NavTab.subscription),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          Text('abo_info_heading'.tr, style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text('abo_info_intro'.tr, style: const TextStyle(color: AppColors.darkGray, height: 1.55, fontSize: 15)),
          const SizedBox(height: 18),
          for (final (key, icon, color) in aboSections) ...[
            AppCard(
              key: _keys[key],
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  IconTile(icon: icon, color: color, size: 44),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text('abo_sec_${key}_title'.tr,
                        style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w800, fontSize: 17)),
                  ),
                ]),
                const SizedBox(height: 10),
                Text('abo_sec_${key}_lead'.tr, style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w600, height: 1.45)),
                const SizedBox(height: 8),
                for (final n in [1, 2, 3])
                  Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Padding(
                        padding: const EdgeInsets.only(top: 3),
                        child: Icon(Icons.check_circle_rounded, size: 17, color: color),
                      ),
                      const SizedBox(width: 8),
                      Expanded(child: Text('abo_sec_${key}_p$n'.tr, style: const TextStyle(color: AppColors.darkGray, height: 1.45))),
                    ]),
                  ),
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.only(top: 4),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(12)),
                  child: Text('abo_sec_${key}_example'.tr, style: TextStyle(color: AppColors.navy, fontSize: 13, height: 1.45, fontStyle: FontStyle.italic)),
                ),
              ]),
            ),
            const SizedBox(height: 12),
          ],
          const SizedBox(height: 8),
          SectionTitle(title: 'abo_info_plans'.tr),
          Text('abo_info_plans_sub'.trParams({'letters': '$letters'}), style: const TextStyle(color: AppColors.darkGray, height: 1.45)),
          const SizedBox(height: 10),
          for (final plan in plans) ...[
            AppCard(
              padding: const EdgeInsets.all(14),
              child: Row(children: [
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('abo_plan_${plan['key']}'.tr, style: const TextStyle(color: AppColors.navy, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 2),
                    Text(
                      plan['questions'] == null
                          ? 'abo_plan_questions_unlimited'.tr
                          : 'abo_plan_questions'.trParams({'count': '${plan['questions']}'}),
                      style: const TextStyle(color: AppColors.darkGray, fontSize: 13),
                    ),
                  ]),
                ),
                Text('abo_plan_month'.trParams({'price': _euro(plan['price'])}),
                    textDirection: TextDirection.ltr,
                    style: const TextStyle(color: AppColors.purple, fontWeight: FontWeight.w800, fontSize: 16)),
              ]),
            ),
            const SizedBox(height: 8),
          ],
          Text('abo_info_note'.tr, style: const TextStyle(color: AppColors.muted, fontSize: 12, height: 1.45)),
          const SizedBox(height: 18),
          FilledButton.icon(
            key: const Key('abo_info_start'),
            onPressed: () => loggedIn ? Get.offNamed(AppRoutes.documents) : Get.toNamed(AppRoutes.login, arguments: {'register': true}),
            icon: const Icon(Icons.rocket_launch_rounded),
            label: Text((loggedIn ? 'abo_info_open' : 'abo_info_start').tr),
          ),
        ],
      ),
    );
  }
}
