import 'dart:convert';
import 'dart:io' show File;
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_email_sender/flutter_email_sender.dart';
import 'package:get/get.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../api/api_exception.dart';
import '../controllers/documents_controller.dart';
import '../models/customer_document.dart';
import '../theme/app_colors.dart';
import '../widgets/ui.dart';

/// "What do I do with this letter?" The AI says whether a reply is needed; the customer edits
/// the German reply / form values, signs, and gets a PDF to e-mail, share or copy.
class LetterReply extends StatefulWidget {
  const LetterReply({super.key, required this.doc});

  final CustomerDocument doc;

  @override
  State<LetterReply> createState() => _LetterReplyState();
}

class _LetterReplyState extends State<LetterReply> {
  final controller = Get.find<DocumentsController>();
  final letter = TextEditingController();
  Map<String, dynamic>? draft;
  List<TextEditingController> fieldValues = [];
  List<String> fieldLabels = [];
  Uint8List? signature;
  bool busy = false;
  String error = '';

  @override
  void initState() {
    super.initState();
    SignatureStore.load().then((s) {
      if (mounted) setState(() => signature = s);
    });
    controller.api.documentDraft(widget.doc.id).then((d) {
      if (mounted && d != null) _apply(d);
    }).catchError((_) {});
  }

  @override
  void dispose() {
    letter.dispose();
    for (final c in fieldValues) {
      c.dispose();
    }
    super.dispose();
  }

  void _apply(Map<String, dynamic> d) {
    final fields = (d['form_fields'] as List? ?? const []).whereType<Map>().toList();
    setState(() {
      draft = d;
      letter.text = '${d['letter'] ?? ''}';
      fieldLabels = [for (final f in fields) '${f['label']}'];
      fieldValues = [for (final f in fields) TextEditingController(text: '${f['value'] ?? ''}')];
    });
  }

  Future<void> _prepare() async {
    setState(() {
      busy = true;
      error = '';
    });
    try {
      _apply(await controller.api.prepareDocumentDraft(widget.doc.id, controller.langCode));
      await controller.loadSubscription();
    } on ApiException catch (e) {
      final key = switch (e.code) {
        'needs_subscription' => 'ask_needs',
        'limit_reached' => 'ask_limit',
        'too_long' => 'ask_too_long',
        'not_available' => 'ask_unavailable',
        _ => 'reply_failed',
      };
      if (mounted) setState(() => error = key.tr);
    } catch (_) {
      if (mounted) setState(() => error = 'reply_failed'.tr);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  String get _subject => '${draft?['subject'] ?? widget.doc.title}';
  String get _fileName {
    final base = _subject.replaceAll(RegExp(r'[^\p{L}\p{N} _-]+', unicode: true), '').trim();
    return '${base.isEmpty ? 'Antwort' : (base.length > 60 ? base.substring(0, 60) : base)}.pdf';
  }

  String get _plainText => [
        letter.text.trim(),
        for (var i = 0; i < fieldLabels.length; i++) '${fieldLabels[i]}: ${fieldValues[i].text}',
      ].where((s) => s.isNotEmpty).join('\n');

  /// A4 PDF: the reply with the signature under "Mit freundlichen Grüßen", then the form values.
  Future<Uint8List> _pdf() async {
    final font = pw.Font.ttf(await rootBundle.load('assets/fonts/IBMPlexSansArabic_400Regular.ttf'));
    final bold = pw.Font.ttf(await rootBundle.load('assets/fonts/IBMPlexSansArabic_700Bold.ttf'));
    final style = pw.TextStyle(font: font, fontSize: 11, lineSpacing: 3);
    final sign = signature == null
        ? pw.SizedBox(height: 36)
        : pw.Padding(padding: const pw.EdgeInsets.symmetric(vertical: 4), child: pw.Image(pw.MemoryImage(signature!), height: 48));

    final body = <pw.Widget>[];
    final text = letter.text.trim();
    if (text.isNotEmpty) {
      final lines = text.split('\n');
      final at = lines.indexWhere((l) => l.toLowerCase().contains('mit freundlichen grüßen'));
      if (at >= 0) {
        body
          ..add(pw.Text(lines.sublist(0, at + 1).join('\n'), style: style))
          ..add(sign)
          ..add(pw.Text(lines.sublist(at + 1).join('\n'), style: style));
      } else {
        body
          ..add(pw.Text(text, style: style))
          ..add(sign);
      }
    }
    if (fieldLabels.isNotEmpty) {
      if (text.isNotEmpty) body.add(pw.NewPage());
      body.add(pw.Text(_subject, style: style.copyWith(font: bold, fontSize: 12)));
      body.add(pw.SizedBox(height: 12));
      for (var i = 0; i < fieldLabels.length; i++) {
        body
          ..add(pw.Text(fieldLabels[i], style: style.copyWith(font: bold)))
          ..add(pw.Text(fieldValues[i].text.isEmpty ? '—' : fieldValues[i].text, style: style))
          ..add(pw.SizedBox(height: 6));
      }
      if (text.isEmpty) body.add(sign);
    }

    final doc = pw.Document();
    doc.addPage(pw.MultiPage(
      pageFormat: PdfPageFormat.a4,
      margin: const pw.EdgeInsets.fromLTRB(64, 56, 56, 56),
      build: (_) => body,
    ));
    return doc.save();
  }

  Future<File?> _pdfFile() async {
    if (kIsWeb) return null;
    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/$_fileName');
    await file.writeAsBytes(await _pdf(), flush: true);
    return file;
  }

  Future<void> _mail() async {
    try {
      final file = await _pdfFile();
      final to = '${draft?['recipient_email'] ?? ''}'.trim();
      await FlutterEmailSender.send(Email(
        recipients: [if (to.isNotEmpty && to != 'null') to],
        subject: _subject,
        body: _plainText,
        attachmentPaths: [if (file != null) file.path],
        isHTML: false,
      ));
    } on PlatformException {
      Get.snackbar('reply_title'.tr, 'forms_no_mail_app'.tr);
    } catch (_) {
      Get.snackbar('reply_title'.tr, 'reply_pdf_error'.tr);
    }
  }

  Future<void> _share() async {
    try {
      final bytes = await _pdf();
      await SharePlus.instance.share(ShareParams(
        files: [XFile.fromData(bytes, name: _fileName, mimeType: 'application/pdf')],
        fileNameOverrides: [_fileName],
        subject: _subject,
      ));
    } catch (_) {
      Get.snackbar('reply_title'.tr, 'reply_pdf_error'.tr);
    }
  }

  Future<void> _copy() async {
    await Clipboard.setData(ClipboardData(text: _plainText));
    Get.snackbar('reply_title'.tr, 'ask_copied'.tr);
  }

  Future<void> _sign() async {
    final bytes = await Get.to<Uint8List>(() => const SignatureScreen(), fullscreenDialog: true);
    if (bytes != null && mounted) {
      await SignatureStore.save(bytes);
      setState(() => signature = bytes);
    }
  }

  @override
  Widget build(BuildContext context) {
    final d = draft;
    if (d == null) {
      return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        FilledButton.tonalIcon(
          key: const Key('reply_prepare'),
          onPressed: busy ? null : _prepare,
          icon: busy
              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
              : const Icon(Icons.auto_fix_high_rounded),
          label: Text(busy ? 'reply_working'.tr : 'reply_start'.tr),
        ),
        if (error.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(error, style: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w600, fontSize: 13)),
          ),
      ]);
    }

    final needs = '${d['reply_needed']}';
    final (color, soft, icon) = switch (needs) {
      'none' => (AppColors.success, AppColors.successSoft, Icons.check_circle_rounded),
      'required' => (AppColors.warning, AppColors.warningSoft, Icons.event_rounded),
      _ => (AppColors.purple, AppColors.purpleSoft, Icons.info_outline_rounded),
    };
    final deadline = DateTime.tryParse('${d['deadline'] ?? ''}');
    final hasOutput = letter.text.trim().isNotEmpty || fieldLabels.isNotEmpty;
    final missing = (d['missing'] as List? ?? const []).map((e) => '$e').toList();
    final attachments = (d['attachments'] as List? ?? const []).map((e) => '$e').toList();
    final sendBy = '${d['send_by'] ?? 'none'}';
    final email = '${d['recipient_email'] ?? ''}';

    return AppCard(
      key: const Key('reply_card'),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(color: soft, borderRadius: BorderRadius.circular(20)),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 6),
              Text(
                'reply_$needs'.tr + (needs != 'none' && deadline != null ? ' · ${deadline.day}.${deadline.month}.${deadline.year}' : ''),
                style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 13),
              ),
            ]),
          ),
          const Spacer(),
          TextButton(onPressed: busy ? null : _prepare, child: Text('reply_again'.tr)),
        ]),
        const SizedBox(height: 8),
        Text('${d['reason'] ?? ''}', style: const TextStyle(color: AppColors.navy, height: 1.45)),
        if ('${d['next_steps'] ?? ''}'.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text('${d['next_steps']}', style: const TextStyle(color: AppColors.muted, height: 1.45)),
        ],
        if (needs != 'none' && !hasOutput) ...[
          const SizedBox(height: 4),
          Text('reply_lawyer'.tr, style: const TextStyle(color: AppColors.muted, fontSize: 12)),
        ],
        if (hasOutput && sendBy != 'none') ...[
          const SizedBox(height: 6),
          Text('reply_send_$sendBy'.tr + (email.isNotEmpty && email != 'null' ? ': $email' : ''),
              style: const TextStyle(color: AppColors.purple, fontWeight: FontWeight.w600, fontSize: 13)),
        ],
        if (missing.isNotEmpty) _ListBox(title: 'reply_missing'.tr, items: missing, color: AppColors.warningSoft),
        if (attachments.isNotEmpty) _ListBox(title: 'reply_attach'.tr, items: attachments, color: AppColors.purpleSoft),
        if (letter.text.isNotEmpty) ...[
          const SizedBox(height: 12),
          Text('reply_letter'.tr, style: const TextStyle(color: AppColors.muted, fontSize: 12, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Directionality(
            textDirection: TextDirection.ltr,
            child: TextField(
              key: const Key('reply_letter'),
              controller: letter,
              minLines: 6,
              maxLines: 18,
              style: const TextStyle(fontSize: 13.5, height: 1.45),
              decoration: InputDecoration(
                filled: true,
                fillColor: AppColors.input,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ),
        ],
        if (fieldLabels.isNotEmpty) ...[
          const SizedBox(height: 12),
          Text('reply_form'.tr, style: const TextStyle(color: AppColors.muted, fontSize: 12, fontWeight: FontWeight.w600)),
          for (var i = 0; i < fieldLabels.length; i++)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Directionality(
                textDirection: TextDirection.ltr,
                child: TextField(
                  controller: fieldValues[i],
                  decoration: InputDecoration(
                    isDense: true,
                    labelText: fieldLabels[i],
                    filled: true,
                    fillColor: AppColors.input,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
              ),
            ),
        ],
        if (hasOutput) ...[
          const SizedBox(height: 12),
          Row(children: [
            OutlinedButton.icon(
              key: const Key('reply_sign'),
              onPressed: _sign,
              icon: const Icon(Icons.draw_rounded),
              label: Text((signature == null ? 'reply_sign' : 'reply_resign').tr),
            ),
            const SizedBox(width: 10),
            if (signature != null) Image.memory(signature!, height: 34),
          ]),
          const SizedBox(height: 8),
          Wrap(spacing: 8, runSpacing: 8, children: [
            FilledButton.icon(
              key: const Key('reply_mail'),
              onPressed: _mail,
              icon: const Icon(Icons.mail_outline_rounded),
              label: Text('reply_mail'.tr),
            ),
            OutlinedButton.icon(
              key: const Key('reply_share'),
              onPressed: _share,
              icon: const Icon(Icons.picture_as_pdf_outlined),
              label: Text('reply_share'.tr),
            ),
            OutlinedButton.icon(
              key: const Key('reply_copy'),
              onPressed: _copy,
              icon: const Icon(Icons.copy_rounded),
              label: Text('ask_copy'.tr),
            ),
          ]),
          const SizedBox(height: 8),
          Text('reply_note'.tr, style: const TextStyle(color: AppColors.muted, fontSize: 12)),
        ],
        if (error.isNotEmpty) ...[
          const SizedBox(height: 6),
          Text(error, style: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w600, fontSize: 13)),
        ],
      ]),
    );
  }
}

class _ListBox extends StatelessWidget {
  const _ListBox({required this.title, required this.items, required this.color});

  final String title;
  final List<String> items;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(12)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.navy, fontSize: 13)),
        for (final item in items) Text('• $item', style: const TextStyle(color: AppColors.navy, fontSize: 13)),
      ]),
    );
  }
}

/// The drawn signature stays on this phone only (never sent to the server).
class SignatureStore {
  static const _key = 'einstein_signature_png';

  static Future<Uint8List?> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    return raw == null ? null : base64Decode(raw);
  }

  static Future<void> save(Uint8List png) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, base64Encode(png));
  }
}

/// Full-screen pad: sign with a finger; returns the signature as a transparent PNG.
class SignatureScreen extends StatefulWidget {
  const SignatureScreen({super.key});

  @override
  State<SignatureScreen> createState() => _SignatureScreenState();
}

class _SignatureScreenState extends State<SignatureScreen> {
  final strokes = <List<Offset>>[];
  Size area = Size.zero;

  Future<void> _done() async {
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);
    _SignaturePainter(strokes, scale: 2).paint(canvas, area * 2);
    final image = await recorder.endRecording().toImage((area.width * 2).round(), (area.height * 2).round());
    final png = await image.toByteData(format: ui.ImageByteFormat.png);
    if (png != null) Get.back(result: png.buffer.asUint8List());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('reply_sign'.tr),
        actions: [
          TextButton(onPressed: strokes.isEmpty ? null : () => setState(strokes.clear), child: Text('reply_clear'.tr)),
          TextButton(key: const Key('signature_done'), onPressed: strokes.isEmpty ? null : _done, child: Text('reply_use'.tr)),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          Text('reply_sign_hint'.tr, style: const TextStyle(color: AppColors.muted)),
          const SizedBox(height: 12),
          Expanded(
            child: LayoutBuilder(builder: (context, box) {
              area = Size(box.maxWidth, box.maxHeight);
              return GestureDetector(
                key: const Key('signature_pad'),
                onPanStart: (d) => setState(() => strokes.add([d.localPosition])),
                onPanUpdate: (d) => setState(() => strokes.last.add(d.localPosition)),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.line, width: 2),
                  ),
                  child: CustomPaint(painter: _SignaturePainter(strokes), size: Size.infinite),
                ),
              );
            }),
          ),
        ]),
      ),
    );
  }
}

class _SignaturePainter extends CustomPainter {
  _SignaturePainter(this.strokes, {this.scale = 1});

  final List<List<Offset>> strokes;
  final double scale;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF0B1A33)
      ..strokeWidth = 2.6 * scale
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;
    for (final s in strokes) {
      if (s.length == 1) {
        canvas.drawCircle(s.first * scale, 1.3 * scale, paint..style = PaintingStyle.fill);
        paint.style = PaintingStyle.stroke;
        continue;
      }
      final path = Path()..moveTo(s.first.dx * scale, s.first.dy * scale);
      for (final p in s.skip(1)) {
        path.lineTo(p.dx * scale, p.dy * scale);
      }
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _SignaturePainter old) => true;
}
