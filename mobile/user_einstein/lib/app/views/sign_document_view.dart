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
  String error = '';

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
