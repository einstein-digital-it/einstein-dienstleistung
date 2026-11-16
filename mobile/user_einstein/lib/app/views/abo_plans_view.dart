import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../api/api_exception.dart';
import '../controllers/documents_controller.dart';
import '../models/customer_document.dart';
import '../theme/app_colors.dart';
import '../widgets/ui.dart';

String _euro(double p) => p.toStringAsFixed(2).replaceAll('.', ',');

String planName(String key) => 'abo_plan_$key'.tr;

/// The three Unterlagen-Abo plans. [change] false: each tile starts the checkout;
/// true: a paid Abo runs and the other tiles switch to that plan.
class AboPlanTiles extends StatelessWidget {
  const AboPlanTiles({super.key, this.change = false});

  final bool change;

  Future<void> _pick(DocumentsController c, AboPlan plan) async {
    if (change) {
      final ok = await Get.dialog<bool>(AlertDialog(
        title: Text(planName(plan.key)),
        content: Text('abo_plan_change_confirm'.trParams({'name': planName(plan.key)})),
        actions: [
          TextButton(onPressed: () => Get.back(result: false), child: Text('cancel'.tr)),
          FilledButton(onPressed: () => Get.back(result: true), child: Text('abo_plan_change'.tr)),
        ],
      ));
      if (ok == true) await c.changePlan(plan.key);
    } else {
      await c.subscribe(plan.key);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = Get.find<DocumentsController>();
    return Obx(() => Column(
          children: [
            for (final plan in c.aboPlans)
              Builder(builder: (context) {
                final current = change && c.aboPlan.value == plan.key;
                final featured = plan.key == 'silver';
                return Container(
                  key: Key('abo_plan_${plan.key}'),
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: current ? AppColors.success : featured ? AppColors.purple : AppColors.line,
                      width: current || featured ? 1.6 : 1,
                    ),
                  ),
                  child: Row(children: [
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(planName(plan.key), style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.navy)),
                        const SizedBox(height: 2),
                        Text('abo_plan_month'.trParams({'price': _euro(plan.price)}),
                            textDirection: TextDirection.ltr,
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: AppColors.purple)),
                        const SizedBox(height: 4),
                        Text(
                          plan.questions == null
                              ? 'abo_plan_questions_unlimited'.tr
                              : 'abo_plan_questions'.trParams({'count': '${plan.questions}'}),
                          style: const TextStyle(color: AppColors.navy, fontSize: 13),
                        ),
                      ]),
                    ),
                    const SizedBox(width: 10),
                    if (current)
                      Text('abo_plan_current'.tr, style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.w700))
                    else if (change)
                      OutlinedButton(
                        onPressed: c.aboBusy.value ? null : () => _pick(c, plan),
                        child: Text('abo_plan_change'.tr),
                      )
                    else
                      FilledButton(
                        onPressed: c.aboBusy.value ? null : () => _pick(c, plan),
                        child: Text('abo_plan_choose'.tr),
                      ),
                  ]),
                );
              }),
            if (!change)
              Align(
                alignment: AlignmentDirectional.centerStart,
                child: Text('abo_plan_vat'.tr, style: const TextStyle(color: AppColors.muted, fontSize: 12)),
              ),
          ],
        ));
  }
}

/// Questions to the AI about one letter. Part of the Abo; the plan sets how many a month.
class LetterChat extends StatefulWidget {
  const LetterChat({super.key, required this.doc});

  final CustomerDocument doc;

  @override
  State<LetterChat> createState() => _LetterChatState();
}

class _LetterChatState extends State<LetterChat> {
  final controller = Get.find<DocumentsController>();
  final input = TextEditingController();
  List<DocumentAnswer>? items;
  bool busy = false;
  String error = '';

  @override
  void initState() {
    super.initState();
    controller.api.documentQuestions(widget.doc.id).then((list) {
      if (mounted) setState(() => items = list);
    }).catchError((_) {
      if (mounted) setState(() => items = const []);
    });
  }

  @override
  void dispose() {
    input.dispose();
    super.dispose();
  }

  Future<void> _ask() async {
    final question = input.text.trim();
    if (question.length < 2 || busy) return;
    setState(() {
      busy = true;
      error = '';
    });
    try {
      final list = await controller.api.askDocumentQuestion(widget.doc.id, question, controller.langCode);
      input.clear();
      if (mounted) setState(() => items = list);
      await controller.loadSubscription();
    } on ApiException catch (e) {
      final key = switch (e.code) {
        'needs_subscription' => 'ask_needs',
        'limit_reached' => 'ask_limit',
        'too_long' => 'ask_too_long',
        'not_available' => 'ask_unavailable',
        _ => 'ask_failed',
      };
      if (mounted) setState(() => error = key.tr);
    } catch (_) {
      if (mounted) setState(() => error = 'ask_failed'.tr);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Obx(() {
        final limit = controller.aboQuestionsLimit.value;
        final used = controller.aboQuestionsUsed.value;
        final reached = limit != null && used >= limit;
        return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Icon(Icons.smart_toy_outlined, color: AppColors.purple, size: 20),
            const SizedBox(width: 8),
            Expanded(child: Text('ask_title'.tr, style: Theme.of(context).textTheme.titleLarge)),
          ]),
          const SizedBox(height: 10),
          if (items == null) const Center(child: Padding(padding: EdgeInsets.all(8), child: CircularProgressIndicator(strokeWidth: 2))),
          for (final item in items ?? const <DocumentAnswer>[]) ...[
            Align(
              alignment: AlignmentDirectional.centerEnd,
              child: _Bubble(text: item.question, mine: true),
            ),
            const SizedBox(height: 6),
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: _Bubble(text: item.answer, mine: false),
            ),
            const SizedBox(height: 10),
          ],
          if (busy)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(children: [
                const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)),
                const SizedBox(width: 8),
                Text('ask_thinking'.tr, style: const TextStyle(color: AppColors.purple, fontSize: 13)),
              ]),
            ),
          Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Expanded(
              child: TextField(
                key: const Key('ask_field'),
                controller: input,
                enabled: !busy && !reached,
                minLines: 1,
                maxLines: 4,
                maxLength: 1000,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _ask(),
                decoration: InputDecoration(
                  isDense: true,
                  counterText: '',
                  hintText: 'ask_hint'.tr,
                  filled: true,
                  fillColor: AppColors.input,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              key: const Key('ask_send'),
              tooltip: 'ask_send'.tr,
              onPressed: busy || reached ? null : _ask,
              icon: const Icon(Icons.send_rounded),
            ),
          ]),
          if (error.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(error, style: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w600, fontSize: 13)),
          ] else if (reached) ...[
            const SizedBox(height: 6),
            Text('ask_limit'.tr, style: const TextStyle(color: AppColors.warning, fontWeight: FontWeight.w600, fontSize: 13)),
          ],
          const SizedBox(height: 6),
          Text(
            limit == null ? 'ask_unlimited'.tr : 'ask_left'.trParams({'used': '$used', 'limit': '$limit'}),
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),
          Text('ask_note'.tr, style: const TextStyle(color: AppColors.muted, fontSize: 12)),
        ]);
      }),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.text, required this.mine});

  final String text;
  final bool mine;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.75),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
        decoration: BoxDecoration(
          color: mine ? AppColors.purple : AppColors.purpleSoft,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(text, style: TextStyle(color: mine ? Colors.white : AppColors.navy, height: 1.45)),
      ),
    );
  }
}
