import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

export interface InvoiceData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size: string | null;
  }>;
}

export async function generateInvoicePDF(order: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header Branding
    doc.fillColor('#241010')
       .font('Helvetica-Bold')
       .fontSize(24)
       .text('ATHAH', 50, 50)
       .fontSize(10)
       .font('Helvetica')
       .text('Timeless Elegance, Redefined.', 50, 75)
       .moveDown();

    // Invoice Meta Information
    doc.fillColor('#444444')
       .fontSize(10)
       .text(`Invoice Number: ATH-${order.orderId.substring(0, 8).toUpperCase()}`, 0, 50, { align: 'right' })
       .text(`Order Date: ${format(new Date(), 'MMMM d, yyyy')}`, 0, 65, { align: 'right' })
       .moveDown();

    doc.moveTo(50, 100).lineTo(550, 100).stroke('#eeeeee');

    // Customer Billing Info
    doc.fillColor('#241010')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Billed To:', 50, 120)
       .font('Helvetica')
       .fontSize(10)
       .text(order.customerName, 50, 140)
       .text(order.customerEmail, 50, 155)
       .moveDown();

    // Table Header
    const tableTop = 220;
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .text('Item Description', 50, tableTop)
       .text('Size', 250, tableTop)
       .text('Qty', 320, tableTop, { width: 30, align: 'center' })
       .text('Price', 370, tableTop, { width: 80, align: 'right' })
       .text('Total', 470, tableTop, { width: 80, align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#eeeeee');

    // Table Rows
    let currentY = tableTop + 30;
    doc.font('Helvetica').fontSize(10);

    order.items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      
      doc.text(item.name, 50, currentY, { width: 190 })
         .text(item.size || 'N/A', 250, currentY)
         .text(item.quantity.toString(), 320, currentY, { width: 30, align: 'center' })
         .text(formatCurrency(item.price), 370, currentY, { width: 80, align: 'right' })
         .text(formatCurrency(itemTotal), 470, currentY, { width: 80, align: 'right' });

      currentY += 25;
    });

    // Summary
    doc.moveTo(50, currentY + 10).lineTo(550, currentY + 10).stroke('#eeeeee');
    
    currentY += 30;
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('Grand Total:', 350, currentY)
       .fillColor('#8c7a6b')
       .text(formatCurrency(order.totalAmount), 470, currentY, { width: 80, align: 'right' });

    // Footer
    doc.fillColor('#aaaaaa')
       .fontSize(8)
       .font('Helvetica')
       .text('Thank you for shopping with Athah. This is a computer-generated invoice and does not require a physical signature.', 50, 750, { align: 'center', width: 500 });

    doc.end();
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}
