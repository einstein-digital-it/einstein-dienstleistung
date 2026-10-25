import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Download } from "lucide-react";
import EinsteinLogo from "./EinsteinLogo";
import { format } from "date-fns";
import { jsPDF } from "jspdf";

const translations = {
  de: {
    invoice: "Rechnung",
    invoice_number: "Rechnungsnummer",
    date: "Datum",
    customer: "Kunde",
    service: "Dienstleistung",
    description: "Beschreibung",
    net_amount: "Nettobetrag",
    vat: "MwSt. (19%)",
    total: "Gesamtbetrag",
    print: "Drucken",
    booking_number: "Buchungsnummer",
    provider: "Dienstleister",
    address: "Adresse",
    thank_you: "Vielen Dank für Ihr Vertrauen!"
  },
  ar: {
    invoice: "فاتورة",
    invoice_number: "رقم الفاتورة",
    date: "التاريخ",
    customer: "العميل",
    service: "الخدمة",
    description: "الوصف",
    net_amount: "المبلغ الصافي",
    vat: "ضريبة القيمة المضافة (19%)",
    total: "المبلغ الإجمالي",
    print: "طباعة",
    booking_number: "رقم الحجز",
    provider: "مقدم الخدمة",
    address: "العنوان",
    thank_you: "شكراً لثقتكم!"
  },
  en: {
    invoice: "Invoice",
    invoice_number: "Invoice Number",
    date: "Date",
    customer: "Customer",
    service: "Service",
    description: "Description",
    net_amount: "Net Amount",
    vat: "VAT (19%)",
    total: "Total Amount",
    print: "Print",
    booking_number: "Booking Number",
    provider: "Provider",
    address: "Address",
    thank_you: "Thank you for your trust!"
  },
  tr: {
    invoice: "Fatura",
    invoice_number: "Fatura Numarasi",
    date: "Tarih",
    customer: "Musteri",
    service: "Hizmet",
    description: "Aciklama",
    net_amount: "Net Tutar",
    vat: "KDV (19%)",
    total: "Toplam Tutar",
    print: "Yazdir",
    booking_number: "Rezervasyon Numarasi",
    provider: "Saglayici",
    address: "Adres",
    thank_you: "Guveniniz icin tesekkurler!"
  },
  es: {
    invoice: "Factura",
    invoice_number: "Número de Factura",
    date: "Fecha",
    customer: "Cliente",
    service: "Servicio",
    description: "Descripción",
    net_amount: "Importe Neto",
    vat: "IVA (19%)",
    total: "Importe Total",
    print: "Imprimir",
    booking_number: "Número de Reserva",
    provider: "Proveedor",
    address: "Dirección",
    thank_you: "¡Gracias por su confianza!"
  }
};

export default function InvoicePreview({ booking, netAmount, vatAmount, totalAmount, lang = "de" }) {
  const invoiceRef = useRef(null);
  const t = translations[lang] || translations.de;
  const isRTL = lang === "ar";
  
  const invoiceNumber = `INV-${booking?.booking_number || booking?.id?.slice(-6) || "000000"}`;
  const invoiceDate = format(new Date(), "dd.MM.yyyy");

  const handlePrint = () => {
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
    const txt = (str, x, yp, opts = {}) => {
      doc.setFontSize(opts.size || 10);
      doc.setFont('helvetica', opts.style || 'normal');
      doc.setTextColor(...(opts.color || [34, 34, 34]));
      doc.text(String(str || ''), x, yp, { align: opts.align || 'left' });
    };

    // Header
    rect(0, 0, W, 40, [107, 70, 193]);
    txt('Ein', margin, 18, { size: 22, style: 'bold', color: [255, 255, 255] });
    doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(224, 213, 255);
    doc.text('Stein', margin + 14, 18);
    txt('Inhaber: Beshr Alhoury Alhomsi', margin, 24, { size: 8, color: [200, 180, 255] });
    ['EinStein', 'Robert-Dißmann-Str. 8', '65936 Frankfurt am Main', 'Tel: 069 27246275', 'info@einsteindienstleistung.de', 'www.einsteindienstleistung.com'].forEach((l, i) => {
      txt(l, W - margin, 12 + i * 5, { size: 7.5, color: [220, 210, 255], align: 'right', style: i === 0 ? 'bold' : 'normal' });
    });

    y = 50;
    txt('RECHNUNG / INVOICE', margin, y, { size: 18, style: 'bold', color: [30, 58, 95] });
    y += 8;
    txt(`Nr: ${invoiceNumber}   |   Datum: ${invoiceDate}   |   Buchung: ${booking?.booking_number || '-'}`, margin, y, { size: 9, color: [100, 100, 100] });
    y += 8;
    line(margin, y, W - margin, y, [107, 70, 193]);
    y += 8;

    // Two boxes
    const boxW = (W - margin * 2 - 8) / 2;
    rect(margin, y, boxW, 32, [248, 247, 255]);
    doc.setDrawColor(107, 70, 193); doc.setLineWidth(0.8);
    doc.rect(margin, y, boxW, 32, 'S'); doc.setLineWidth(0.2);
    txt('RECHNUNG AN / BILL TO', margin + 3, y + 6, { size: 7.5, style: 'bold', color: [107, 70, 193] });
    txt(booking?.customer_name || '', margin + 3, y + 12, { size: 9, style: 'bold' });
    txt(booking?.customer_email || '', margin + 3, y + 18, { size: 8.5, color: [80, 80, 80] });
    txt(booking?.customer_phone || '', margin + 3, y + 23, { size: 8.5, color: [80, 80, 80] });
    txt(booking?.address || '', margin + 3, y + 28, { size: 8.5, color: [80, 80, 80] });

    const rightX = margin + boxW + 8;
    rect(rightX, y, boxW, 32, [248, 247, 255]);
    doc.setDrawColor(107, 70, 193); doc.setLineWidth(0.8);
    doc.rect(rightX, y, boxW, 32, 'S'); doc.setLineWidth(0.2);
    txt('DIENSTLEISTER / PROVIDER', rightX + 3, y + 6, { size: 7.5, style: 'bold', color: [107, 70, 193] });
    txt(booking?.provider_name || 'EinStein Institut', rightX + 3, y + 12, { size: 9, style: 'bold' });
    txt('info@einsteindienstleistung.de', rightX + 3, y + 18, { size: 8.5, color: [80, 80, 80] });
    txt(`Datum: ${booking?.date || '-'} ${booking?.time ? '| ' + booking.time : ''}`, rightX + 3, y + 24, { size: 8.5, color: [80, 80, 80] });
    y += 40;

    // Table
    rect(margin, y, W - margin * 2, 9, [30, 58, 95]);
    txt('Beschreibung / Description', margin + 3, y + 6, { size: 9, style: 'bold', color: [255, 255, 255] });
    txt('Datum', margin + 120, y + 6, { size: 9, style: 'bold', color: [255, 255, 255] });
    txt('Betrag', W - margin - 3, y + 6, { size: 9, style: 'bold', color: [255, 255, 255], align: 'right' });
    y += 9;
    rect(margin, y, W - margin * 2, 16, [252, 250, 255]);
    txt(booking?.service_name || booking?.category || '-', margin + 3, y + 6, { size: 9, style: 'bold' });
    txt(`${booking?.date || '-'} ${booking?.time || ''}`, margin + 120, y + 8, { size: 9 });
    txt(`€${netAmount?.toFixed(2)}`, W - margin - 3, y + 8, { size: 9, style: 'bold', align: 'right' });
    y += 16;
    line(margin, y, W - margin, y);
    y += 10;

    // Totals
    const totX = W - margin - 65;
    const valX = W - margin;
    const totRow = (label, val, highlight = false) => {
      if (highlight) {
        rect(totX - 3, y - 5, 68, 9, [107, 70, 193]);
        txt(label, totX, y, { size: 11, style: 'bold', color: [255, 255, 255] });
        txt(val, valX, y, { size: 11, style: 'bold', color: [255, 255, 255], align: 'right' });
      } else {
        txt(label, totX, y, { size: 9.5, color: [80, 80, 80] });
        txt(val, valX, y, { size: 9.5, color: [30, 58, 95], align: 'right' });
      }
      y += 7;
    };
    totRow('Netto / Net:', `€${netAmount?.toFixed(2)}`);
    totRow('MwSt. 19% / VAT:', `€${vatAmount?.toFixed(2)}`);
    line(totX - 3, y - 2, valX, y - 2, [107, 70, 193]);
    y += 2;
    totRow('Gesamt / Total:', `€${totalAmount?.toFixed(2)}`, true);
    y += 10;

    // Footer
    line(margin, y, W - margin, y);
    y += 6;
    txt('EinStein · Inh. Beshr Alhoury Alhomsi · Robert-Dißmann-Str. 8 · 65936 Frankfurt am Main · 069 27246275', W / 2, y, { size: 7.5, color: [130, 130, 130], align: 'center' });
    y += 5;
    txt('info@einsteindienstleistung.de · www.einsteindienstleistung.com', W / 2, y, { size: 7.5, color: [130, 130, 130], align: 'center' });
    y += 5;
    txt(t.thank_you, W / 2, y, { size: 8, style: 'bold', color: [107, 70, 193], align: 'center' });

    doc.save(`${invoiceNumber}.pdf`);
  };

  return (
    <div>
      <Card className="border-0 shadow-lg overflow-hidden mb-4">
        <div ref={invoiceRef} className="invoice-container p-6 bg-white" dir={isRTL ? "rtl" : "ltr"}>
          {/* Header */}
          <div className="header flex justify-between items-start mb-8 pb-4 border-b-2 border-[#6B46C1]">
            <div className="logo-section flex items-center gap-3">
              <EinsteinLogo size={50} />
              <div>
                <div className="company-name text-2xl font-bold text-[#1e3a5f]">EinStein</div>
                <div className="company-sub text-xs text-[#6B46C1]">Institut</div>
              </div>
            </div>
            <div className={`invoice-meta ${isRTL ? "text-left" : "text-right"}`}>
              <div className="invoice-title text-2xl font-bold text-[#6B46C1] mb-2">{t.invoice}</div>
              <div className="text-sm text-gray-600">
                <p>{t.invoice_number}: <strong>{invoiceNumber}</strong></p>
                <p>{t.date}: <strong>{invoiceDate}</strong></p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="customer-section bg-gray-50 p-4 rounded-lg mb-6">
            <div className="section-title font-bold text-[#1e3a5f] mb-2 text-sm">{t.customer}</div>
            <div className="customer-info text-gray-700">
              <p className="font-medium">{booking?.customer_name}</p>
              <p>{booking?.customer_email}</p>
              <p>{booking?.customer_phone}</p>
              {booking?.address && <p>{booking?.address}</p>}
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1">{t.booking_number}</div>
            <div className="font-mono font-bold text-[#1e3a5f]">{booking?.booking_number}</div>
          </div>

          {/* Items Table */}
          <table className="items-table w-full mb-6">
            <thead>
              <tr className="bg-[#6B46C1] text-white">
                <th className="p-3 text-start">{t.service}</th>
                <th className="p-3 text-start">{t.description}</th>
                <th className="p-3 text-end">{t.net_amount}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium">{booking?.service_name || booking?.category}</td>
                <td className="p-3 text-gray-600">
                  {booking?.date && `${booking.date} `}
                  {booking?.time && `${booking.time}`}
                  {booking?.description && ` - ${booking.description.substring(0, 50)}...`}
                </td>
                <td className="p-3 text-end font-medium">{netAmount?.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className={`totals ${isRTL ? "me-auto" : "ms-auto"} w-72`}>
            <div className="totals-row flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">{t.net_amount}</span>
              <span className="font-medium">{netAmount?.toFixed(2)} €</span>
            </div>
            <div className="totals-row flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">{t.vat}</span>
              <span className="font-medium">{vatAmount?.toFixed(2)} €</span>
            </div>
            <div className="totals-row total flex justify-between py-3 border-t-2 border-[#6B46C1] font-bold text-lg text-[#1e3a5f]">
              <span>{t.total}</span>
              <span>{totalAmount?.toFixed(2)} €</span>
            </div>
          </div>

          {/* Footer */}
          <div className="footer mt-10 text-center text-gray-600 text-sm border-t border-gray-200 pt-6">
            <div className="thank-you text-base text-[#6B46C1] font-bold mb-2">{t.thank_you}</div>
            <div className="company-details leading-relaxed">
              <p>EinStein · Inhaber: Beshr Alhoury Alhomsi</p>
              <p>Robert-Dißmann-Str. 8, 65936 Frankfurt am Main</p>
              <p>Tel: 069 27246275 | info@einsteindienstleistung.de</p>
              <p>www.einsteindienstleistung.com</p>
            </div>
          </div>
        </div>
      </Card>

      <Button 
        onClick={handlePrint}
        className="w-full bg-[#6B46C1] hover:bg-[#805AD5] gap-2"
      >
        <Download className="w-4 h-4" />
        {t.print}
      </Button>
    </div>
  );
}