import 'dart:io' show File;

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_email_sender/flutter_email_sender.dart';
import 'package:get/get.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

import '../api/customer_api_service.dart';
import 'customer_store_controller.dart';
import 'documents_controller.dart';

/// One field of an application (label in the customer's language).
class FormFieldDef {
  const FormFieldDef({required this.key, required this.type, required this.required, required this.labels});

  final String key;
  final String type; // text | email | date | textarea
  final bool required;
  final Map<String, dynamic> labels;

  String get label {
    final lang = Get.locale?.languageCode ?? 'ar';
    return (labels[lang] ?? labels['en'] ?? labels['de'] ?? key).toString();
  }

  factory FormFieldDef.fromJson(Map<String, dynamic> json) => FormFieldDef(
    key: json['key'].toString(),
    type: (json['type'] ?? 'text').toString(),
    required: json['required'] == true,
    labels: Map<String, dynamic>.from((json['label'] ?? {}) as Map),
  );
}

class FormTemplate {
  const FormTemplate({
    required this.key,
    required this.folder,
    required this.authority,
    required this.recipientField,
    required this.titles,
    required this.descriptions,
    required this.fields,
    required this.subject,
    required this.body,
    required this.conditional,
  });

  final String key;
  final String folder;
  final String authority;
  final String recipientField;
  final Map<String, dynamic> titles;
  final Map<String, dynamic> descriptions;
  final List<FormFieldDef> fields;
  final String subject;
  final String body;
  final Map<String, dynamic> conditional;

  String _local(Map<String, dynamic> map) {
    final lang = Get.locale?.languageCode ?? 'ar';
    return (map[lang] ?? map['en'] ?? map['de'] ?? '').toString();
  }

  String get title => _local(titles);
  String get description => _local(descriptions);
  String get germanTitle => (titles['de'] ?? title).toString();

  factory FormTemplate.fromJson(Map<String, dynamic> json) => FormTemplate(
    key: json['key'].toString(),
    folder: (json['folder'] ?? 'sonstiges').toString(),
    authority: (json['authority'] ?? '').toString(),
    recipientField: (json['recipient_field'] ?? '').toString(),
    titles: Map<String, dynamic>.from((json['title'] ?? {}) as Map),
    descriptions: Map<String, dynamic>.from((json['description'] ?? {}) as Map),
    fields: ((json['fields'] ?? []) as List)
        .whereType<Map>()
        .map((f) => FormFieldDef.fromJson(Map<String, dynamic>.from(f)))
        .toList(),
    subject: (json['subject'] ?? '').toString(),
    body: (json['body'] ?? '').toString(),
    conditional: Map<String, dynamic>.from((json['conditional'] ?? {}) as Map),
  );
}

class FormsController extends GetxController {
  final api = Get.find<CustomerApiService>();
  final store = Get.find<CustomerStoreController>();

  final forms = <FormTemplate>[].obs;
  final personal = <FormFieldDef>[].obs;
  final values = <String, String>{}.obs;
  final isLoading = false.obs;
  final isSending = false.obs;
  final errorText = ''.obs;
  String accountEmail = '';

  @override
  void onInit() {
    super.onInit();
    load();
  }

  Future<void> load() async {
    isLoading.value = true;
    errorText.value = '';
    try {
      final data = await api.forms();
      personal.assignAll(((data['personal'] ?? []) as List)
          .whereType<Map>()
          .map((f) => FormFieldDef.fromJson(Map<String, dynamic>.from(f))));
      forms.assignAll(((data['forms'] ?? []) as List)
          .whereType<Map>()
          .map((f) => FormTemplate.fromJson(Map<String, dynamic>.from(f))));
      accountEmail = (data['email'] ?? store.currentEmail).toString();
      final saved = Map<String, dynamic>.from((data['data'] ?? {}) as Map);
      final suggestions = Map<String, dynamic>.from((data['suggestions'] ?? {}) as Map);
      values
        ..clear()
        ..addAll({for (final e in suggestions.entries) e.key: e.value.toString()})
        ..addAll({for (final e in saved.entries) e.key: e.value.toString()});
    } catch (_) {
      errorText.value = 'forms_load_error'.tr;
    } finally {
      isLoading.value = false;
    }
  }

  FormTemplate? byKey(String key) => forms.firstWhereOrNull((f) => f.key == key);

  List<FormFieldDef> fieldsFor(FormTemplate form) => [...personal, ...form.fields];

  List<FormFieldDef> missing(FormTemplate form) =>
      fieldsFor(form).where((f) => f.required && (values[f.key] ?? '').trim().isEmpty).toList();

  void setValue(String key, String value) => values[key] = value;

  /// The German letter with the customer's data filled in.
  String render(String template, FormTemplate form) {
    final data = {...values, 'email': accountEmail};
    var text = template;
    form.conditional.forEach((name, rule) {
      final r = Map<String, dynamic>.from(rule as Map);
      final filled = (data[r['field']] ?? '').trim().isNotEmpty;
      text = text.replaceAll('{{$name}}', (filled ? r['if_filled'] : r['if_empty']).toString());
    });
    return text.replaceAllMapped(RegExp(r'\{\{(\w+)\}\}'), (m) {
      final value = (data[m.group(1)] ?? '').trim();
      return value.isEmpty ? '[…]' : value;
    });
  }

  String _today() {
    final d = DateTime.now();
    String two(int v) => v.toString().padLeft(2, '0');
    return '${two(d.day)}.${two(d.month)}.${d.year}';
  }

  Future<List<int>> buildPdf(FormTemplate form) async {
    final font = pw.Font.ttf(await rootBundle.load('assets/fonts/IBMPlexSansArabic_400Regular.ttf'));
    final bold = pw.Font.ttf(await rootBundle.load('assets/fonts/IBMPlexSansArabic_700Bold.ttf'));
    final style = pw.TextStyle(font: font, fontSize: 11, lineSpacing: 3);
    final city = (values['address_zip_city'] ?? '').replaceAll(RegExp(r'^\d+\s*'), '');
    final doc = pw.Document();
    doc.addPage(pw.Page(
      pageFormat: PdfPageFormat.a4,
      margin: const pw.EdgeInsets.fromLTRB(64, 56, 56, 56),
      build: (context) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(
            [values['full_name'], values['address_street'], values['address_zip_city'], values['phone'], accountEmail]
                .where((v) => (v ?? '').trim().isNotEmpty)
                .join('\n'),
            style: style.copyWith(fontSize: 10),
          ),
          pw.SizedBox(height: 28),
          pw.Text(form.authority, style: style),
          pw.SizedBox(height: 24),
          pw.Align(
            alignment: pw.Alignment.centerRight,
            child: pw.Text('${city.isEmpty ? '' : '$city, '}${_today()}', style: style),
          ),
          pw.SizedBox(height: 20),
          pw.Text(render(form.subject, form), style: style.copyWith(font: bold, fontSize: 12)),
          pw.SizedBox(height: 18),
          pw.Text(render(form.body, form), style: style),
        ],
      ),
    ));
    return doc.save();
  }

  /// Save the data, keep a copy in the customer's file and open the mail app.
  Future<void> send(FormTemplate form) async {
    isSending.value = true;
    try {
      final changed = {for (final f in fieldsFor(form)) f.key: (values[f.key] ?? '').trim()};
      await api.saveFormData(changed);

      final bytes = await buildPdf(form);
      final fileName = '${form.key}_${DateTime.now().millisecondsSinceEpoch}.pdf';

      // Copy for the customer's file (no AI needed — we wrote it)
      await Get.find<DocumentsController>().upload(
        bytes,
        fileName,
        folder: form.folder,
        title: '${form.germanTitle} – ${_today()}',
        process: false,
      );

      if (kIsWeb) {
        Get.snackbar(form.title, 'forms_saved_web'.tr);
        return;
      }
      final dir = await getTemporaryDirectory();
      final file = File('${dir.path}/$fileName');
      await file.writeAsBytes(bytes, flush: true);

      final recipient = (values[form.recipientField] ?? '').trim();
      try {
        await FlutterEmailSender.send(Email(
          recipients: [if (recipient.isNotEmpty) recipient],
          subject: render(form.subject, form),
          body: '${render(form.body, form)}\n\nAnlage: ${form.germanTitle} (PDF)',
          attachmentPaths: [file.path],
          isHTML: false,
        ));
      } on PlatformException {
        Get.snackbar(form.title, 'forms_no_mail_app'.tr);
      }
    } catch (_) {
      Get.snackbar(form.title, 'forms_send_error'.tr);
    } finally {
      isSending.value = false;
    }
  }
}
