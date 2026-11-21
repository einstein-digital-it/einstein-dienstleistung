// Reads and fills the form fields of a PDF (used by the Laravel backend, "auto-fill").
// Lives in front_end so it uses the pdf-lib installed with the website.
//
//   node pdf-form.mjs fields <in.pdf>
//     → JSON { fields: [{ name, type, options, page, rect }], signature: { page, x, y, w, h } | null, pages: [{ w, h }] }
//   node pdf-form.mjs fill <in.pdf> <values.json> <out.pdf>
//     → writes the filled PDF (fields flattened so every viewer shows the values)
//
// Rects are in PDF points from the bottom-left corner of the page.
import fs from 'node:fs';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFOptionList, PDFSignature } from 'pdf-lib';

const [, , cmd, input, valuesFile, output] = process.argv;
const fail = (msg) => { process.stderr.write(msg + '\n'); process.exit(1); };
if (!cmd || !input) fail('usage: fields <in.pdf> | fill <in.pdf> <values.json> <out.pdf>');

const pdf = await PDFDocument.load(fs.readFileSync(input), { ignoreEncryption: true });
const pages = pdf.getPages();
const pageIndexOf = (widget) => {
  const ref = widget.P();
  const i = ref ? pages.findIndex((p) => p.ref === ref) : -1;
  return i >= 0 ? i : 0;
};
const typeOf = (f) =>
  f instanceof PDFTextField ? 'text'
    : f instanceof PDFCheckBox ? 'checkbox'
      : f instanceof PDFDropdown ? 'dropdown'
        : f instanceof PDFRadioGroup ? 'radio'
          : f instanceof PDFOptionList ? 'list'
            : f instanceof PDFSignature ? 'signature' : 'other';
const SIGN = /unterschrift|signatur|signature|unterzeichn/i;

let form;
try { form = pdf.getForm(); } catch { form = null; }
const fields = form ? form.getFields() : [];

if (cmd === 'fields') {
  const list = [];
  let signature = null;
  for (const f of fields) {
    const type = typeOf(f);
    const widget = f.acroField.getWidgets()[0];
    const r = widget?.getRectangle();
    const page = widget ? pageIndexOf(widget) : 0;
    const rect = r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null;
    const name = f.getName();
    // The place for the signature: a signature field, or a text field named like one
    if (rect && (type === 'signature' || (type === 'text' && SIGN.test(name)))) {
      signature ??= { page, ...rect };
      continue; // the signature goes there as an image, not as text
    }
    if (type === 'signature' || type === 'other') continue;
    const options = type === 'dropdown' || type === 'radio' || type === 'list' ? f.getOptions() : undefined;
    list.push({ name, type, ...(options ? { options } : {}), page, rect });
  }
  process.stdout.write(JSON.stringify({ fields: list, signature, pages: pages.map((p) => ({ w: p.getWidth(), h: p.getHeight() })) }));
} else if (cmd === 'fill') {
  if (!valuesFile || !output) fail('fill needs <values.json> <out.pdf>');
  const values = JSON.parse(fs.readFileSync(valuesFile, 'utf8'));
  let filled = 0;
  for (const f of fields) {
    const v = values[f.getName()];
    if (v === undefined || v === null || v === '') continue;
    try {
      if (f instanceof PDFTextField) { f.setText(String(v)); filled++; }
      else if (f instanceof PDFCheckBox) { if (v === true || /^(true|ja|yes|x|1)$/i.test(String(v))) { f.check(); filled++; } }
      else if (f instanceof PDFDropdown || f instanceof PDFOptionList || f instanceof PDFRadioGroup) {
        const opt = f.getOptions().find((o) => o.toLowerCase() === String(v).toLowerCase());
        if (opt) { f.select(opt); filled++; }
      }
    } catch { /* a field that cannot take this value is left empty */ }
  }
  try { form?.flatten(); } catch { /* some forms cannot be flattened; the values are still set */ }
  fs.writeFileSync(output, await pdf.save());
  process.stdout.write(JSON.stringify({ filled }));
} else {
  fail('unknown command ' + cmd);
}
