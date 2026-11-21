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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('sign_title'.tr)),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error.isNotEmpty
              ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(error, textAlign: TextAlign.center)))
              : Column(children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 10, 16, 4),
                    child: Row(children: [
                      if (widget.doc.isPdf) ...[
                        FilledButton.icon(
                          key: const Key('sign_autofill'),
                          onPressed: filling ? null : _autofill,
                          icon: filling
                              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Icon(Icons.auto_fix_high_rounded),
                          label: Text((filling ? 'autofill_working' : 'autofill').tr),
                        ),
                        const SizedBox(width: 8),
                      ],
                      OutlinedButton.icon(
                        key: const Key('sign_draw'),
                        onPressed: _draw,
                        icon: const Icon(Icons.draw_rounded),
                        label: Text((signature == null ? 'reply_sign' : 'reply_resign').tr),
                      ),
                      const Spacer(),
                      if (pages.length > 1) ...[
                        IconButton(onPressed: page > 0 ? () => setState(() => page--) : null, icon: const Icon(Icons.chevron_left_rounded)),
                        Text('${page + 1} / ${pages.length}'),
                        IconButton(onPressed: page < pages.length - 1 ? () => setState(() => page++) : null, icon: const Icon(Icons.chevron_right_rounded)),
                      ],
                    ]),
                  ),
                  if (filledCount != null)
                    Container(
                      width: double.infinity,
                      margin: const EdgeInsets.fromLTRB(16, 4, 16, 4),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: AppColors.successSoft, borderRadius: BorderRadius.circular(12)),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('autofill_done'.trParams({'count': '$filledCount'}),
                            style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.w700, fontSize: 13)),
                        if (missing.isNotEmpty)
                          Text('${'autofill_missing'.tr} ${missing.join(', ')}',
                              style: const TextStyle(color: AppColors.warning, fontSize: 12)),
                      ]),
                    ),
                  if (signature != null)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(children: [
                        Text('sign_size'.tr, style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                        Expanded(
                          child: Slider(value: width, min: 0.12, max: 0.6, onChanged: (v) => setState(() => width = v.clamp(0.12, 1 - pos.dx))),
                        ),
                      ]),
                    ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Center(
                        child: AspectRatio(
                          aspectRatio: sizes[page].width / sizes[page].height,
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
                                      decoration: BoxDecoration(border: Border.all(color: AppColors.purple, width: 1.5)),
                                      child: Image.memory(signature!),
                                    ),
                                  ),
                                ),
                            ]);
                          }),
                        ),
                      ),
                    ),
                  ),
                  SafeArea(
                    top: false,
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                      child: Column(children: [
                        Text('sign_hint'.tr, style: const TextStyle(color: AppColors.muted, fontSize: 12), textAlign: TextAlign.center),
                        const SizedBox(height: 8),
                        Row(children: [
                          Expanded(
                            child: FilledButton.icon(
                              key: const Key('sign_mail'),
                              onPressed: busy ? null : () => _run(true),
                              icon: const Icon(Icons.mail_outline_rounded),
                              label: Text('reply_mail'.tr),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: OutlinedButton.icon(
                              key: const Key('sign_share'),
                              onPressed: busy ? null : () => _run(false),
                              icon: const Icon(Icons.picture_as_pdf_outlined),
                              label: Text('reply_share'.tr),
                            ),
                          ),
                        ]),
                      ]),
                    ),
                  ),
                ]),
    );
  }
}
