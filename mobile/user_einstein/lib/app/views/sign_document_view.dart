import 'dart:convert' show base64Decode;
import 'dart:io' show File;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_email_sender/flutter_email_sender.dart';
import 'package:get/get.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:share_plus/share_plus.dart';

import '../api/api_exception.dart';
import '../controllers/documents_controller.dart';
import '../models/customer_document.dart';
import '../theme/app_colors.dart';
import 'letter_reply_view.dart';

/// Whether a letter can be signed here: PDFs and photos (JPG, PNG).
bool canSignDocument(CustomerDocument doc) {
  final name = doc.originalName.toLowerCase();
  return doc.isPdf || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png');
}

/// Sign any PDF or photo: pick the page, drag the signature to its place, then share
/// or e-mail the signed PDF. The pages are drawn as images (150 dpi) with the signature
/// on top; nothing goes to the server.
class SignDocumentScreen extends StatefulWidget {
  const SignDocumentScreen({super.key, required this.doc});

  final CustomerDocument doc;

  @override
  State<SignDocumentScreen> createState() => _SignDocumentScreenState();
}

class _SignDocumentScreenState extends State<SignDocumentScreen> {
  final controller = Get.find<DocumentsController>();
  final pages = <Uint8List>[];
  final sizes = <Size>[];
  int page = 0;
  Uint8List? signature;
  // Top-left and width of the signature as a share of the page
  Offset pos = const Offset(0.55, 0.78);
  double width = 0.3;
  bool loading = true;
  bool busy = false;
  bool filling = false;
  String error = '';
  /// After auto-fill: how many fields were filled and which stayed empty.
  int? filledCount;
  List<String> missing = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      signature = await SignatureStore.load();
      final bytes = Uint8List.fromList(await controller.api.downloadDocument(widget.doc.id));
      if (widget.doc.isPdf) {
        await for (final raster in Printing.raster(bytes, dpi: 150)) {
          pages.add(await raster.toPng());
          sizes.add(Size(raster.width.toDouble(), raster.height.toDouble()));
        }
      } else {
        final image = await decodeImageFromList(bytes);
        pages.add(bytes);
        sizes.add(Size(image.width.toDouble(), image.height.toDouble()));
      }
      if (pages.isEmpty) throw StateError('no pages');
      page = pages.length - 1; // signatures usually go on the last page
    } catch (_) {
      error = 'sign_error'.tr;
    }
    if (mounted) setState(() => loading = false);
  }

  Future<List<(Uint8List, Size)>> _raster(Uint8List bytes) async {
    final out = <(Uint8List, Size)>[];
    await for (final raster in Printing.raster(bytes, dpi: 150)) {
      out.add((await raster.toPng(), Size(raster.width.toDouble(), raster.height.toDouble())));
    }
    return out;
  }

  /// Like autofill: the form's fields fill themselves from the customer's details and the
  /// saved signature goes into the signature box.
  Future<void> _autofill() async {
    setState(() => filling = true);
    try {
      final res = await controller.api.autofillDocument(widget.doc.id);
      final pdf = res['pdf'];
      if (pdf is String && pdf.isNotEmpty) {
        final rendered = await _raster(base64Decode(pdf));
        if (rendered.isNotEmpty) {
          pages
            ..clear()
            ..addAll(rendered.map((r) => r.$1));
          sizes
            ..clear()
            ..addAll(rendered.map((r) => r.$2));
        }
      }
      final sig = res['signature'];
      final pdfPages = (res['pages'] as List? ?? const []).whereType<Map>().toList();
      if (sig is Map) {
        final p = int.tryParse('${sig['page']}') ?? 0;
        if (p < pdfPages.length && p < pages.length) {
          final pw = double.tryParse('${pdfPages[p]['w']}') ?? 1;
          final ph = double.tryParse('${pdfPages[p]['h']}') ?? 1;
          final x = (double.tryParse('${sig['x']}') ?? 0) / pw;
          final y = (double.tryParse('${sig['y']}') ?? 0) / ph;
          final w = ((double.tryParse('${sig['w']}') ?? 0) / pw).clamp(0.12, 0.6);
          final h = (double.tryParse('${sig['h']}') ?? 0) / ph;
          page = p;
          width = w;
          pos = Offset(x.clamp(0.0, 1 - w), (1 - y - h).clamp(0.0, 0.95));
        }
      }
      filledCount = res['fillable'] == true ? int.tryParse('${res['filled']}') : null;
      missing = (res['missing'] as List? ?? const []).map((e) => '$e').toList();
      if (res['fillable'] != true) Get.snackbar('sign_title'.tr, 'autofill_no_fields'.tr);
      if (mounted) setState(() {});
      if (signature == null) await _draw(); // drawn once, then always used
    } on ApiException catch (e) {
      final key = switch (e.code) {
        'needs_subscription' => 'ask_needs',
        'limit_reached' => 'ask_limit',
        'not_available' => 'ask_unavailable',
        _ => 'autofill_failed',
      };
      Get.snackbar('sign_title'.tr, key.tr);
    } catch (_) {
      Get.snackbar('sign_title'.tr, 'autofill_failed'.tr);
    } finally {
      if (mounted) setState(() => filling = false);
    }
  }

  Future<void> _draw() async {
    final bytes = await Get.to<Uint8List>(() => const SignatureScreen(), fullscreenDialog: true);
    if (bytes != null && mounted) {
      await SignatureStore.save(bytes);
      setState(() => signature = bytes);
    }
  }

  /// Every page as a full-page image, the signature placed on the chosen one.
  Future<Uint8List> _signedPdf() async {
    final sig = await decodeImageFromList(signature!);
    final doc = pw.Document();
    for (var i = 0; i < pages.length; i++) {
      // Page size in PDF points at 150 dpi
      final w = sizes[i].width * 72 / 150;
      final h = sizes[i].height * 72 / 150;
      final sigW = width * w;
      final sigH = sigW * sig.height / sig.width;
      doc.addPage(pw.Page(
        pageFormat: PdfPageFormat(w, h),
        margin: pw.EdgeInsets.zero,
        build: (_) => pw.Stack(children: [
          pw.Positioned.fill(child: pw.Image(pw.MemoryImage(pages[i]), fit: pw.BoxFit.fill)),
          if (i == page)
            pw.Positioned(left: pos.dx * w, top: pos.dy * h, child: pw.SizedBox(width: sigW, height: sigH, child: pw.Image(pw.MemoryImage(signature!)))),
        ]),
      ));
    }
    return doc.save();
  }

  String get _fileName {
    final base = widget.doc.title.replaceAll(RegExp(r'[^\p{L}\p{N} _-]+', unicode: true), '').trim();
    return '${base.isEmpty ? 'Dokument' : (base.length > 60 ? base.substring(0, 60) : base)} - unterschrieben.pdf';
  }

  Future<void> _run(bool mail) async {
    if (signature == null) {
      Get.snackbar('sign_title'.tr, 'sign_need'.tr);
      return;
    }
    setState(() => busy = true);
    try {
      final bytes = await _signedPdf();
      if (mail && !kIsWeb) {
        final dir = await getTemporaryDirectory();
        final file = File('${dir.path}/$_fileName');
        await file.writeAsBytes(bytes, flush: true);
        try {
          await FlutterEmailSender.send(Email(subject: widget.doc.title, attachmentPaths: [file.path], isHTML: false));
        } on PlatformException {
          Get.snackbar('sign_title'.tr, 'forms_no_mail_app'.tr);
        }
      } else {
        await SharePlus.instance.share(ShareParams(
          files: [XFile.fromData(bytes, name: _fileName, mimeType: 'application/pdf')],
          fileNameOverrides: [_fileName],
          subject: widget.doc.title,
        ));
      }
    } catch (_) {
      Get.snackbar('sign_title'.tr, 'reply_pdf_error'.tr);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  /// Where the customer is: 1 fill in, 2 sign, 3 send.
  int get _step => signature == null ? (filledCount != null ? 2 : 1) : 3;

  Widget _steps() {
    final labels = ['sign_step_fill'.tr, 'sign_step_sign'.tr, 'sign_step_send'.tr];
    return Row(children: [
      for (var i = 0; i < 3; i++) ...[
        Builder(builder: (_) {
          final n = i + 1;
          final done = n < _step;
          final now = n == _step;
          return Row(mainAxisSize: MainAxisSize.min, children: [
            Container(
              width: 26,
              height: 26,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: done ? AppColors.success : now ? AppColors.purple : AppColors.line,
              ),
              child: done
                  ? const Icon(Icons.check_rounded, size: 16, color: Colors.white)
                  : Text('$n', style: TextStyle(color: now ? Colors.white : AppColors.muted, fontWeight: FontWeight.w800, fontSize: 12)),
            ),
            const SizedBox(width: 6),
            Text(labels[i],
                style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: done || now ? AppColors.navy : AppColors.muted)),
          ]);
        }),
        if (i < 2) const Expanded(child: Padding(padding: EdgeInsets.symmetric(horizontal: 6), child: Divider(color: AppColors.line, height: 1))),
      ],
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('sign_title'.tr, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: AppColors.navy)),
          Text(widget.doc.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12.5, color: AppColors.muted)),
        ]),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error.isNotEmpty
              ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(error, textAlign: TextAlign.center)))
              : Column(children: [
                  // Steps and tools
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
                    decoration: const BoxDecoration(
                      color: Color(0xFFF8FAFC),
                      border: Border(bottom: BorderSide(color: AppColors.line)),
                    ),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                      _steps(),
                      const SizedBox(height: 12),
                      Row(children: [
                        if (widget.doc.isPdf) ...[
                          Expanded(
                            child: DecoratedBox(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(14),
                                gradient: const LinearGradient(colors: [Color(0xFF4C1D95), Color(0xFF7C3AED)]),
                                boxShadow: [BoxShadow(color: AppColors.purple.withValues(alpha: 0.22), blurRadius: 14, offset: const Offset(0, 6))],
                              ),
                              child: TextButton.icon(
                                key: const Key('sign_autofill'),
                                onPressed: filling ? null : _autofill,
                                style: TextButton.styleFrom(
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 13),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                ),
                                icon: filling
                                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                    : const Icon(Icons.auto_fix_high_rounded, size: 19),
                                label: Text((filling ? 'autofill_working' : 'autofill').tr,
                                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                        ],
                        // The saved signature and "draw again"
                        Material(
                          color: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: AppColors.line)),
                          child: InkWell(
                            key: const Key('sign_draw'),
                            borderRadius: BorderRadius.circular(14),
                            onTap: _draw,
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                              child: Row(mainAxisSize: MainAxisSize.min, children: [
                                if (signature != null) ...[
                                  Image.memory(signature!, height: 28, width: 56, fit: BoxFit.contain),
                                  const SizedBox(width: 8),
                                ],
                                const Icon(Icons.draw_rounded, size: 18, color: AppColors.purple),
                                const SizedBox(width: 4),
                                Text((signature == null ? 'reply_sign' : 'reply_resign').tr,
                                    style: const TextStyle(color: AppColors.purple, fontWeight: FontWeight.w700)),
                              ]),
                            ),
                          ),
                        ),
                      ]),
                      if (filledCount != null) ...[
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(color: AppColors.successSoft, borderRadius: BorderRadius.circular(12)),
                          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            const Icon(Icons.check_rounded, size: 18, color: AppColors.success),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text('autofill_done'.trParams({'count': '$filledCount'}),
                                    style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.w700, fontSize: 13)),
                                if (missing.isNotEmpty)
                                  Text('${'autofill_missing'.tr} ${missing.join(', ')}',
                                      style: const TextStyle(color: AppColors.warning, fontSize: 12)),
                              ]),
                            ),
                          ]),
                        ),
                      ],
                      if (signature != null || pages.length > 1) ...[
                        const SizedBox(height: 4),
                        Row(children: [
                          if (signature != null) ...[
                            Text('sign_size'.tr, style: const TextStyle(color: AppColors.darkGray, fontSize: 13, fontWeight: FontWeight.w600)),
                            Expanded(
                              child: SliderTheme(
                                data: SliderTheme.of(context).copyWith(
                                  activeTrackColor: AppColors.purple,
                                  thumbColor: AppColors.purple,
                                  inactiveTrackColor: AppColors.line,
                                  overlayColor: AppColors.purple.withValues(alpha: 0.12),
                                  trackHeight: 4,
                                ),
                                child: Slider(value: width, min: 0.12, max: 0.6, onChanged: (v) => setState(() => width = v.clamp(0.12, 1 - pos.dx))),
                              ),
                            ),
                          ] else
                            const Spacer(),
                          if (pages.length > 1)
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.line),
                              ),
                              child: Row(mainAxisSize: MainAxisSize.min, children: [
                                IconButton(
                                  visualDensity: VisualDensity.compact,
                                  onPressed: page > 0 ? () => setState(() => page--) : null,
                                  icon: const Icon(Icons.chevron_left_rounded),
                                ),
                                Text('${page + 1} / ${pages.length}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
                                IconButton(
                                  visualDensity: VisualDensity.compact,
                                  onPressed: page < pages.length - 1 ? () => setState(() => page++) : null,
                                  icon: const Icon(Icons.chevron_right_rounded),
                                ),
                              ]),
                            ),
                        ]),
                      ],
                    ]),
                  ),
                  // The page, in its own scroll area
                  Expanded(
                    child: Container(
                      color: const Color(0xFFF1F5F9),
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
                        child: Column(children: [
                          Directionality(
                            textDirection: TextDirection.ltr,
                            child: AspectRatio(
                              aspectRatio: sizes[page].width / sizes[page].height,
                              child: DecoratedBox(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 12, offset: const Offset(0, 4))],
                                ),
                                child: LayoutBuilder(builder: (context, box) {
                                  return Stack(children: [
                                    Positioned.fill(child: Image.memory(pages[page], fit: BoxFit.fill)),
                                    if (signature != null)
                                      Positioned(
                                        left: pos.dx * box.maxWidth,
                                        top: pos.dy * box.maxHeight,
                                        width: width * box.maxWidth,
                                        child: GestureDetector(
                                          key: const Key('sign_drag'),
                                          onPanUpdate: (d) => setState(() {
                                            pos = Offset(
                                              (pos.dx + d.delta.dx / box.maxWidth).clamp(0.0, 1 - width),
                                              (pos.dy + d.delta.dy / box.maxHeight).clamp(0.0, 0.95),
                                            );
                                          }),
                                          child: Container(
                                            decoration: BoxDecoration(
                                              color: Colors.white.withValues(alpha: 0.35),
                                              borderRadius: BorderRadius.circular(6),
                                              border: Border.all(color: AppColors.purple, width: 1.6),
                                            ),
                                            child: Image.memory(signature!),
                                          ),
                                        ),
                                      ),
                                  ]);
                                }),
                              ),
                            ),
                          ),
                          if (signature != null) ...[
                            const SizedBox(height: 10),
                            Text('sign_drag_hint'.tr, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                          ],
                        ]),
                      ),
                    ),
                  ),
                  // Send: always visible
                  Container(
                    decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.line))),
                    child: SafeArea(
                      top: false,
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                          Row(children: [
                            Expanded(
                              flex: 3,
                              child: FilledButton.icon(
                                key: const Key('sign_mail'),
                                onPressed: busy ? null : () => _run(true),
                                style: FilledButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 13),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                ),
                                icon: busy
                                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                    : const Icon(Icons.mail_outline_rounded),
                                label: Text('reply_mail'.tr, style: const TextStyle(fontWeight: FontWeight.w800)),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              flex: 2,
                              child: OutlinedButton.icon(
                                key: const Key('sign_share'),
                                onPressed: busy ? null : () => _run(false),
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 13),
                                  side: const BorderSide(color: Color(0xFFE9D5FF)),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                ),
                                icon: const Icon(Icons.ios_share_rounded),
                                label: Text('reply_share'.tr, style: const TextStyle(fontWeight: FontWeight.w700)),
                              ),
                            ),
                          ]),
                          const SizedBox(height: 8),
                          Text('sign_note'.tr, style: const TextStyle(color: AppColors.muted, fontSize: 11.5, height: 1.35)),
                        ]),
                      ),
                    ),
                  ),
                ]),
    );
  }
}
