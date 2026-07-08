import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, syncFromRemote } from '../../../../../data/mockDb';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function fmt(amount: number): string {
  return `Rs. ${amount.toFixed(2)}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await syncFromRemote();
    const { id } = await params;
    const order = getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create a new PDF document using standard StandardFonts (no files to load, works inside Next.js bundling)
    const pdfDoc = await PDFDocument.create();
    
    // Helvetica font
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const page = pdfDoc.addPage([595.27, 841.89]); // A4 Size in points
    const { width, height } = page.getSize();
    
    // Brand Colors
    const primaryDark = rgb(0.176, 0.165, 0.161); // #2d2a29
    const brandStrip = rgb(0.243, 0.22, 0.212); // #3e3836
    const peachColor = rgb(1, 0.867, 0.824); // #ffddd2
    const mutedColor = rgb(0.54, 0.45, 0.44); // #8a7370
    const lightBg = rgb(0.99, 0.97, 0.96); // #fdf8f5

    // ─── HEADER BACKGROUND ───────────────────────────────────────────────────
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width: width,
      height: 100,
      color: primaryDark,
    });

    // Brand Name
    page.drawText('NURTURE & DEW', {
      x: 50,
      y: height - 45,
      size: 20,
      font: fontBold,
      color: peachColor,
    });

    // Tagline
    page.drawText('Premium Organic Baby Skin Care', {
      x: 50,
      y: height - 62,
      size: 9,
      font: fontNormal,
      color: rgb(0.78, 0.73, 0.71),
    });

    // Tax Invoice label
    page.drawText('TAX INVOICE', {
      x: width - 180,
      y: height - 45,
      size: 16,
      font: fontBold,
      color: peachColor,
    });

    // GSTIN label
    page.drawText('GSTIN: 19AABCN1234F1Z5', {
      x: width - 180,
      y: height - 60,
      size: 8,
      font: fontNormal,
      color: rgb(0.7, 0.65, 0.63),
    });

    // Brand Address Strip
    page.drawRectangle({
      x: 0,
      y: height - 122,
      width: width,
      height: 22,
      color: brandStrip,
    });
    page.drawText('42, Himalayan Botanicals Park, Uttarakhand - 248 001, India', {
      x: 50,
      y: height - 114,
      size: 8,
      font: fontNormal,
      color: rgb(0.78, 0.73, 0.71),
    });

    // ─── METADATA SECTION ────────────────────────────────────────────────────
    const orderDate = new Date(order.createdAt);
    const dateStr = orderDate.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const timeStr = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    let y = height - 160;

    // Col 1: Invoice Details
    page.drawText('INVOICE NO:', { x: 50, y, size: 7, font: fontBold, color: mutedColor });
    page.drawText(order.id.toUpperCase(), { x: 50, y: y - 12, size: 9, font: fontNormal, color: primaryDark });

    page.drawText('INVOICE DATE:', { x: 50, y: y - 32, size: 7, font: fontBold, color: mutedColor });
    page.drawText(`${dateStr} · ${timeStr}`, { x: 50, y: y - 44, size: 9, font: fontNormal, color: primaryDark });

    page.drawText('PAYMENT STATUS:', { x: 50, y: y - 64, size: 7, font: fontBold, color: mutedColor });
    page.drawText(order.status, { x: 50, y: y - 76, size: 9, font: fontNormal, color: primaryDark });

    page.drawText('PAYMENT METHOD:', { x: 50, y: y - 96, size: 7, font: fontBold, color: mutedColor });
    page.drawText(order.paymentIntentId ? 'Card (Stripe)' : 'Simulated Payment', { x: 50, y: y - 108, size: 9, font: fontNormal, color: primaryDark });

    // Col 2: Customer details
    const col2X = width / 2 + 10;
    page.drawText('CUSTOMER NAME:', { x: col2X, y, size: 7, font: fontBold, color: mutedColor });
    page.drawText(order.customerName, { x: col2X, y: y - 12, size: 9, font: fontNormal, color: primaryDark });

    page.drawText('EMAIL:', { x: col2X, y: y - 32, size: 7, font: fontBold, color: mutedColor });
    page.drawText(order.customerEmail, { x: col2X, y: y - 44, size: 9, font: fontNormal, color: primaryDark });

    page.drawText('DELIVERY ADDRESS:', { x: col2X, y: y - 64, size: 7, font: fontBold, color: mutedColor });
    
    // Address wrap
    const addressStr = `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`;
    const words = addressStr.split(' ');
    let line = '';
    let addY = y - 76;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const widthTest = fontNormal.widthOfTextAtSize(testLine, 9);
      if (widthTest > 220 && n > 0) {
        page.drawText(line, { x: col2X, y: addY, size: 9, font: fontNormal, color: primaryDark });
        line = words[n] + ' ';
        addY -= 12;
      } else {
        line = testLine;
      }
    }
    page.drawText(line, { x: col2X, y: addY, size: 9, font: fontNormal, color: primaryDark });

    y = y - 140;

    // Divider Line
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 0.5,
      color: rgb(0.85, 0.8, 0.78),
    });

    y -= 25;

    // ─── ITEMS TABLE ─────────────────────────────────────────────────────────
    const colX = [50, 80, 360, 430, 480];
    const headers = ['#', 'Product Description', 'Unit Price', 'Qty', 'Amount'];

    // Table Header Background
    page.drawRectangle({
      x: 50,
      y: y - 18,
      width: width - 100,
      height: 22,
      color: primaryDark,
    });

    headers.forEach((h, i) => {
      page.drawText(h, {
        x: colX[i],
        y: y - 10,
        size: 8,
        font: fontBold,
        color: peachColor,
      });
    });

    y -= 18;

    order.items.forEach((item, idx) => {
      y -= 24;
      // Zebra striping
      if (idx % 2 === 1) {
        page.drawRectangle({
          x: 50,
          y: y,
          width: width - 100,
          height: 24,
          color: lightBg,
        });
      }

      page.drawText(String(idx + 1), { x: colX[0], y: y + 8, size: 8.5, font: fontNormal, color: primaryDark });
      
      // Wrap long product names
      let nameText = item.productName;
      if (nameText.length > 40) nameText = nameText.substring(0, 37) + '...';
      page.drawText(nameText, { x: colX[1], y: y + 8, size: 8.5, font: fontNormal, color: primaryDark });
      
      page.drawText(fmt(item.price), { x: colX[2], y: y + 8, size: 8.5, font: fontNormal, color: primaryDark });
      page.drawText(String(item.quantity), { x: colX[3] + 5, y: y + 8, size: 8.5, font: fontNormal, color: primaryDark });
      page.drawText(fmt(item.price * item.quantity), { x: colX[4], y: y + 8, size: 8.5, font: fontNormal, color: primaryDark });
    });

    // Table Border
    page.drawRectangle({
      x: 50,
      y,
      width: width - 100,
      height: (order.items.length * 24) + 22,
      borderColor: rgb(0.85, 0.8, 0.78),
      borderWidth: 0.5,
    });

    y -= 30;

    // ─── TOTALS SECTION ──────────────────────────────────────────────────────
    const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = order.total - subtotal;
    const totX = width - 230;

    // Subtotal
    page.drawText('Subtotal:', { x: totX, y, size: 8.5, font: fontNormal, color: mutedColor });
    page.drawText(fmt(subtotal), { x: width - 110, y, size: 8.5, font: fontNormal, color: primaryDark });

    y -= 16;

    // Shipping
    page.drawText('Shipping & Handling:', { x: totX, y, size: 8.5, font: fontNormal, color: mutedColor });
    page.drawText(shipping === 0 ? 'FREE' : fmt(shipping), { x: width - 110, y, size: 8.5, font: fontNormal, color: primaryDark });

    y -= 22;

    // Total Paid Box
    page.drawRectangle({
      x: totX - 10,
      y: y - 5,
      width: 190,
      height: 18,
      color: primaryDark,
    });
    page.drawText('TOTAL PAID:', { x: totX, y, size: 9, font: fontBold, color: peachColor });
    page.drawText(fmt(order.total), { x: width - 110, y, size: 9, font: fontBold, color: peachColor });

    y -= 40;

    // ─── THANK YOU NOTE ──────────────────────────────────────────────────────
    page.drawText("Thank you for choosing Nurture & Dew. We care deeply about your baby's delicate skin.", {
      x: 50,
      y,
      size: 8.5,
      font: fontItalic,
      color: mutedColor,
    });
    
    page.drawText('For support, contact us at support@nurturedew.in | www.nurturedew.in', {
      x: 50,
      y: y - 14,
      size: 8,
      font: fontNormal,
      color: mutedColor,
    });

    // ─── FOOTER ──────────────────────────────────────────────────────────────
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 36,
      color: primaryDark,
    });

    page.drawText('This is a computer-generated invoice. No signature required.', {
      x: 50,
      y: 14,
      size: 7,
      font: fontNormal,
      color: rgb(0.6, 0.55, 0.53),
    });

    page.drawText(`Generated: ${new Date().toLocaleString('en-IN')}`, {
      x: width - 200,
      y: 14,
      size: 7,
      font: fontNormal,
      color: rgb(0.6, 0.55, 0.53),
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    const fileName = `NurtureDew_Invoice_${order.id}_${orderDate.toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
