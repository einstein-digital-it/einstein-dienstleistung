import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/forms_controller.dart';
import '../models/customer_document.dart';
import '../routes/app_routes.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/ui.dart';

/// Applications (Anträge): pick one, we fill it with your data.
class FormsView extends GetView<FormsController> {
  const FormsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: const AppBottomNav(tab: NavTab.forms),
      body: SafeArea(
        child: Obx(() {
          return RefreshIndicator(
            onRefresh: controller.load,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
              children: [
                Text('forms_title'.tr, style: Theme.of(context).textTheme.headlineLarge),
                const SizedBox(height: 4),
                Text('forms_subtitle'.tr, style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 18),
                _HowItWorks(),
                const SizedBox(height: 20),
                if (controller.isLoading.value && controller.forms.isEmpty)
                  const Padding(padding: EdgeInsets.all(40), child: Center(child: CircularProgressIndicator()))
                else if (controller.errorText.isNotEmpty)
                  EmptyState(icon: Icons.cloud_off_rounded, text: controller.errorText.value)
                else
                  for (final form in controller.forms) ...[
                    AppCard(
                      onTap: () => Get.toNamed(AppRoutes.formFill, arguments: form.key),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          IconTile(icon: folderIcon(form.folder), color: folderColor(form.folder), size: 46),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(form.authority, style: const TextStyle(color: AppColors.muted, fontSize: 12.5, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 2),
                                Text(form.title, style: Theme.of(context).textTheme.titleLarge),
                                const SizedBox(height: 6),
                                Text(form.description, maxLines: 2, overflow: TextOverflow.ellipsis,
                                    style: Theme.of(context).textTheme.bodySmall),
                                const SizedBox(height: 8),
                                Builder(builder: (_) {
                                  final missing = controller.missing(form).length;
                                  return missing == 0
                                      ? Pill(label: 'forms_ready'.tr, color: AppColors.success, icon: Icons.check_circle_rounded)
                                      : Pill(label: 'forms_missing_count'.trParams({'count': '$missing'}), color: AppColors.warning, icon: Icons.edit_note_rounded);
                                }),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
              ],
            ),
          );
        }),
      ),
    );
  }
}

class _HowItWorks extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final steps = [
      (Icons.touch_app_outlined, 'forms_step1'.tr),
      (Icons.auto_fix_high_rounded, 'forms_step2'.tr),
      (Icons.send_rounded, 'forms_step3'.tr),
    ];
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(gradient: AppColors.heroGradient, borderRadius: BorderRadius.circular(20)),
      child: Row(
        children: [
          for (var i = 0; i < steps.length; i++) ...[
            Expanded(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: Colors.white.withValues(alpha: 0.12),
                    child: Icon(steps[i].$1, color: AppColors.goldBright, size: 20),
                  ),
                  const SizedBox(height: 8),
                  Text(steps[i].$2, textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.35, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
            if (i < steps.length - 1)
              Icon(Directionality.of(context) == TextDirection.rtl ? Icons.chevron_left_rounded : Icons.chevron_right_rounded,
                  color: Colors.white38),
          ],
        ],
      ),
    );
  }
}

class FormFillView extends StatefulWidget {
  const FormFillView({super.key});

  @override
  State<FormFillView> createState() => _FormFillViewState();
}

class _FormFillViewState extends State<FormFillView> {
  final controller = Get.find<FormsController>();
  final textControllers = <String, TextEditingController>{};

  TextEditingController _ctrl(FormFieldDef field) => textControllers.putIfAbsent(
    field.key,
    () => TextEditingController(text: controller.values[field.key] ?? ''),
  );

  @override
  void dispose() {
    for (final c in textControllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _pickDate(FormFieldDef field) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: DateTime(1920),
      lastDate: DateTime(now.year + 15),
    );
    if (picked == null) return;
    String two(int v) => v.toString().padLeft(2, '0');
    final text = '${two(picked.day)}.${two(picked.month)}.${picked.year}';
    _ctrl(field).text = text;
    controller.setValue(field.key, text);
    setState(() {});
  }

  Widget _field(FormFieldDef field) {
    final empty = (controller.values[field.key] ?? '').trim().isEmpty;
    final missing = field.required && empty;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: _ctrl(field),
        readOnly: field.type == 'date',
        onTap: field.type == 'date' ? () => _pickDate(field) : null,
        keyboardType: field.type == 'email'
            ? TextInputType.emailAddress
            : field.type == 'textarea'
            ? TextInputType.multiline
            : TextInputType.text,
        maxLines: field.type == 'textarea' ? 4 : 1,
        minLines: 1,
        onChanged: (v) {
          controller.setValue(field.key, v);
          setState(() {});
        },
        decoration: InputDecoration(
          labelText: '${field.label}${field.required ? ' *' : ''}',
          suffixIcon: field.type == 'date' ? const Icon(Icons.calendar_month_outlined) : null,
          helperText: missing ? 'forms_needed'.tr : null,
          helperStyle: const TextStyle(color: AppColors.warning),
          fillColor: missing ? AppColors.warningSoft : null,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final form = controller.byKey((Get.arguments ?? '').toString());
    if (form == null) {
      return Scaffold(appBar: AppBar(), body: EmptyState(icon: Icons.description_outlined, text: 'forms_load_error'.tr));
    }
    final missing = controller.missing(form);
    return Scaffold(
      appBar: AppBar(title: Text(form.authority)),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
          child: Obx(
            () => FilledButton.icon(
              onPressed: missing.isNotEmpty || controller.isSending.value ? null : () => controller.send(form),
              icon: controller.isSending.value
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.send_rounded),
              label: Text(missing.isEmpty ? 'forms_send'.tr : 'forms_missing_count'.trParams({'count': '${missing.length}'})),
            ),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
        children: [
          Text(form.title, style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: AppColors.purpleSoft, borderRadius: BorderRadius.circular(14)),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.info_outline_rounded, color: AppColors.purple, size: 20),
                const SizedBox(width: 10),
                Expanded(child: Text(form.description, style: const TextStyle(color: AppColors.navy, height: 1.5))),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SectionTitle(title: 'forms_your_data'.tr),
          for (final f in controller.personal) _field(f),
          const SizedBox(height: 8),
          SectionTitle(title: 'forms_application_data'.tr),
          for (final f in form.fields) _field(f),
          const SizedBox(height: 8),
          SectionTitle(title: 'forms_preview'.tr),
          AppCard(
            child: Directionality(
              textDirection: TextDirection.ltr,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(controller.render(form.subject, form),
                      style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.navy)),
                  const SizedBox(height: 10),
                  Text(controller.render(form.body, form), style: const TextStyle(height: 1.55, color: AppColors.text)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text('forms_mail_note'.tr, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }
}
