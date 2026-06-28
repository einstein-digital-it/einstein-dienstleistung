import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { extensionId } = await req.json();
    if (!extensionId) return Response.json({ error: 'extensionId is required' }, { status: 400 });

    const ext = await base44.asServiceRole.entities.ServiceExtension.get(extensionId);
    if (!ext) return Response.json({ error: 'Extension not found' }, { status: 404 });

    const amount = ext.amount || 15;
    // السعر 15€ يُعامل كـ Brutto (شامل 19%)
    const net = parseFloat((amount / 1.19).toFixed(2));
    const tax = parseFloat((amount - net).toFixed(2));
    const total = amount;

    const invoiceNumber = `EXT-${ext.booking_number || ext.id.slice(-8).toUpperCase()}`;
    const issueDate = new Date().toLocaleDateString('de-DE');

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210;
    const margin = 20;
    let y = 20;

    const line = (x1, y1, x2, y2, color = [200, 200, 200]) => {
      doc.setDrawColor(...color);
      doc.line(x1, y1, x2, y2);
    };
    const rect = (x, yp, w, h, color) => {
      doc.setFillColor(...color);
      doc.rect(x, yp, w, h, 'F');
    };
    const text = (str, x, yp, opts = {}) => {
      doc.setFontSize(opts.size || 10);
      doc.setFont('helvetica', opts.style || 'normal');
      doc.setTextColor(...(opts.color || [34, 34, 34]));
      doc.text(String(str || ''), x, yp, { align: opts.align || 'left' });
    };

    // HEADER
    rect(0, 0, W, 40, [107, 70, 193]);
    text('Ein', margin, 18, { size: 22, style: 'bold', color: [255, 255, 255] });
    doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(224, 213, 255);
    doc.text('Stein', margin + 14, 18);
    text('Institut UG (haftungsbeschränkt)', margin, 24, { size: 8, color: [200, 180, 255] });

    const companyLines = ['EinStein Institut UG', 'Frankfurt, Deutschland', 'Tel: 069 27246275', 'info@einsteindienstleistung.de', 'www.e-in-s-tein.de'];
    companyLines.forEach((l, i) => {
      text(l, W - margin, 12 + i * 5, { size: 7.5, color: [220, 210, 255], align: 'right', style: i === 0 ? 'bold' : 'normal' });
    });

    y = 50;

    // TITLE
    text('RECHNUNG / INVOICE', margin, y, { size: 18, style: 'bold', color: [30, 58, 95] });
    y += 5;
    text('Erweiterungsantrag / Service Extension', margin, y + 4, { size: 10, color: [107, 70, 193] });
    y += 12;

    // META
    doc.setFontSize(9); doc.setTextColor(100, 100, 100);
    doc.text(`Nr: ${invoiceNumber}   |   Datum: ${issueDate}   |   Buchung: ${ext.booking_number || '-'}`, margin, y);
    rect(W - margin - 40, y - 5, 40, 7, [209, 250, 229]);
    text('Bezahlt / Paid', W - margin - 20, y, { size: 8, color: [6, 95, 70], align: 'center' });
    y += 8;

    line(margin, y, W - margin, y, [107, 70, 193]);
    line(margin, y + 0.5, W - margin, y + 0.5, [107, 70, 193]);
    y += 8;

    // TWO BOXES
    const boxW = (W - margin * 2 - 8) / 2;
    rect(margin, y, boxW, 32, [248, 247, 255]);
    doc.setDrawColor(107, 70, 193); doc.setLineWidth(0.8);
    doc.rect(margin, y, boxW, 32, 'S'); doc.setLineWidth(0.2);
    text('RECHNUNG AN / BILL TO', margin + 3, y + 6, { size: 7.5, style: 'bold', color: [107, 70, 193] });
    text(ext.customer_name || '', margin + 3, y + 12, { size: 9, style: 'bold' });
    text(ext.customer_email || '', margin + 3, y + 18, { size: 8.5, color: [80, 80, 80] });

    const rightX = margin + boxW + 8;
    rect(rightX, y, boxW, 32, [248, 247, 255]);
    doc.setDrawColor(107, 70, 193); doc.setLineWidth(0.8);
    doc.rect(rightX, y, boxW, 32, 'S'); doc.setLineWidth(0.2);
    text('DIENSTLEISTER / PROVIDER', rightX + 3, y + 6, { size: 7.5, style: 'bold', color: [107, 70, 193] });
    text('EinStein Institut', rightX + 3, y + 12, { size: 9, style: 'bold' });
    text(ext.provider_email || 'info@einsteindienstleistung.de', rightX + 3, y + 18, { size: 8.5, color: [80, 80, 80] });
    text(ext.provider_name || '', rightX + 3, y + 24, { size: 8.5, color: [80, 80, 80] });

    y += 40;

    // TABLE HEADER
    rect(margin, y, W - margin * 2, 9, [30, 58, 95]);
    text('Beschreibung / Description', margin + 3, y + 6, { size: 9, style: 'bold', color: [255, 255, 255] });
    text('Betrag (Brutto)', W - margin - 3, y + 6, { size: 9, style: 'bold', color: [255, 255, 255], align: 'right' });
    y += 9;

    // TABLE ROW
    rect(margin, y, W - margin * 2, 22, [252, 250, 255]);
    text('Erweiterungsantrag / Service Extension', margin + 3, y + 7, { size: 9, style: 'bold' });
    text(`Dienst: ${ext.service_name || '-'}`, margin + 3, y + 13, { size: 8, color: [100, 100, 100] });
    if (ext.description) {
      const desc = ext.description.length > 60 ? ext.description.slice(0, 60) + '...' : ext.description;
      text(desc, margin + 3, y + 18, { size: 7.5, color: [130, 130, 130] });
    }
    text(`€${total.toFixed(2)}`, W - margin - 3, y + 10, { size: 9, style: 'bold', align: 'right' });
    y += 22;

    line(margin, y, W - margin, y);
    y += 10;

    // TOTALS
    const totX = W - margin - 65;
    const valX = W - margin;

    const totRow = (label, val, bold = false, highlight = false) => {
      if (highlight) {
        rect(totX - 3, y - 5, 68, 9, [107, 70, 193]);
        text(label, totX, y, { size: 11, style: 'bold', color: [255, 255, 255] });
        text(val, valX, y, { size: 11, style: 'bold', color: [255, 255, 255], align: 'right' });
      } else {
        text(label, totX, y, { size: 9.5, style: bold ? 'bold' : 'normal', color: [80, 80, 80] });
        text(val, valX, y, { size: 9.5, style: bold ? 'bold' : 'normal', color: [30, 58, 95], align: 'right' });
      }
      y += 7;
    };

    totRow('Netto / Net:', `€${net.toFixed(2)}`);
    totRow('MwSt. 19% / VAT:', `€${tax.toFixed(2)}`);
    line(totX - 3, y - 2, valX, y - 2, [107, 70, 193]);
    y += 2;
    totRow('Gesamt / Total:', `€${total.toFixed(2)}`, true, true);

    y += 10;

    // FOOTER
    line(margin, y, W - margin, y);
    y += 6;
    text('EinStein Institut UG (haftungsbeschränkt) · Frankfurt, Deutschland · 069 27246275', W / 2, y, { size: 7.5, color: [130, 130, 130], align: 'center' });
    y += 5;
    text('info@einsteindienstleistung.de · www.e-in-s-tein.de', W / 2, y, { size: 7.5, color: [130, 130, 130], align: 'center' });
    y += 5;
    text('Vielen Dank für Ihr Vertrauen! / Thank you for your trust!', W / 2, y, { size: 8, style: 'bold', color: [107, 70, 193], align: 'center' });

    const pdfBytes = doc.output('arraybuffer');
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const file = new File([blob], `${invoiceNumber}.pdf`, { type: 'application/pdf' });

    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    return Response.json({ success: true, invoice_url: file_url, invoice_number: invoiceNumber });
  } catch (error) {
    console.error('Error generating extension invoice:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});