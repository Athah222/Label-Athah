'use server';
import dotenv from 'dotenv';
dotenv.config();

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { generateInvoicePDF } from '@/lib/invoice-generator';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay API keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment.');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- Create Order Action ---
const CreateOrderInputSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('INR'),
});

export async function createRazorpayOrder(
  input: z.infer<typeof CreateOrderInputSchema>
) {
  const validation = CreateOrderInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error('Invalid input for createRazorpayOrder');
  }

  const options = {
    amount: Math.round(validation.data.amount * 100), // Amount in the smallest currency unit
    currency: validation.data.currency,
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    throw new Error('Failed to create Razorpay order.');
  }
}

// --- Verify Payment Action ---
const VerifyPaymentInputSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function verifyPayment(
  input: z.infer<typeof VerifyPaymentInputSchema>
) {
  const validation = VerifyPaymentInputSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: 'Invalid verification data.' };
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    validation.data;

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    return { success: true, message: 'Payment verified successfully.' };
  } else {
    return {
      success: false,
      message: 'Payment verification failed. Signature mismatch.',
    };
  }
}

// --- Order Confirmation Email Action ---
const OrderConfirmationEmailSchema = z.object({
  orderId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  totalAmount: z.number(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
    size: z.string().nullable()
  }))
});

export async function sendOrderConfirmationEmail(input: z.infer<typeof OrderConfirmationEmailSchema>) {
  const validation = OrderConfirmationEmailSchema.safeParse(input);
  if (!validation.success) {
    console.error('Invalid input for email confirmation:', validation.error);
    return { success: false };
  }

  const { orderId, customerName, customerEmail, totalAmount, items } = validation.data;
  const adminEmail = 'label.athah910@gmail.com';

  const invoiceBuffer = await generateInvoicePDF({
    orderId,
    customerName,
    customerEmail,
    totalAmount,
    items
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: adminEmail,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (Size: ${item.size || 'N/A'})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const customerMailOptions = {
    from: '"Athah" <label.athah910@gmail.com>',
    to: customerEmail,
    subject: `Order Confirmed: #${orderId.substring(0, 6).toUpperCase()}`,
    html: `
      <div style="font-family: 'Lora', serif; color: #241010; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8c7a6b; letter-spacing: 2px;">ATHAH</h1>
          <p style="text-transform: uppercase; font-size: 12px; tracking: 1px;">Thank you for your purchase</p>
        </div>
        <p>Dear ${customerName},</p>
        <p>Your order <strong>#${orderId.substring(0, 6).toUpperCase()}</strong> has been successfully placed and is now being processed. Please find your invoice attached.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; font-weight: bold; text-align: right;">Total:</td>
              <td style="padding: 10px; font-weight: bold; text-align: right; color: #8c7a6b;">${formatPrice(totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; line-height: 1.6;">
          <p>We'll notify you as soon as your order has been shipped. You can track your order status in your account dashboard.</p>
          <p>If you have any questions, feel free to contact us at label.athah910@gmail.com.</p>
        </div>
        <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #666;">
          <p>&copy; ${new Date().getFullYear()} Athah. Timeless Elegance, Redefined.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Invoice-${orderId.substring(0, 8).toUpperCase()}.pdf`,
        content: invoiceBuffer,
      },
    ],
  };

  const adminMailOptions = {
    from: '"Athah Shop Alerts" <label.athah910@gmail.com>',
    to: adminEmail,
    subject: `New Order Received! #${orderId.substring(0, 6).toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #8c7a6b;">Notification: New Order Placed</h2>
        <p>You have received a new order on Athah.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
        <p><strong>Total Amount:</strong> ${formatPrice(totalAmount)}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p>Check the admin dashboard for more details.</p>
        <a href="https://labelathah.com/admin/orders/${orderId}" style="display: inline-block; padding: 10px 20px; background-color: #8c7a6b; color: white; text-decoration: none; border-radius: 5px;">View Order in Dashboard</a>
      </div>
    `,
    attachments: [
      {
        filename: `Invoice-${orderId.substring(0, 8).toUpperCase()}.pdf`,
        content: invoiceBuffer,
      },
    ],
  };

  try {
    await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}

// --- Shipping Notification Email Action ---
const ShippingNotificationEmailSchema = z.object({
  orderId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
});

export async function sendShippingNotificationEmail(input: z.infer<typeof ShippingNotificationEmailSchema>) {
  const validation = ShippingNotificationEmailSchema.safeParse(input);
  if (!validation.success) {
    console.error('Invalid input for shipping notification:', validation.error);
    return { success: false };
  }

  const { orderId, customerName, customerEmail } = validation.data;
  const adminEmail = 'label.athah910@gmail.com';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: adminEmail,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: '"Athah" <label.athah910@gmail.com>',
    to: customerEmail,
    subject: `Your Athah Order #${orderId.substring(0, 6).toUpperCase()} has Shipped!`,
    html: `
      <div style="font-family: 'Lora', serif; color: #241010; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8c7a6b; letter-spacing: 2px;">ATHAH</h1>
          <p style="text-transform: uppercase; font-size: 12px; tracking: 1px;">Great News!</p>
        </div>
        
        <p>Dear ${customerName},</p>
        <p>We are excited to let you know that your order <strong>#${orderId.substring(0, 6).toUpperCase()}</strong> has been shipped!</p>
        
        <p>Shipping details and tracking information will be shared with you shortly in a separate message.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; line-height: 1.6;">
          <p>Thank you for choosing Athah. We hope you love your purchase!</p>
          <p>If you have any questions, feel free to contact us at label.athah910@gmail.com.</p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #666;">
          <p>&copy; ${new Date().getFullYear()} Athah. Timeless Elegance, Redefined.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Shipping notification email failed:', error);
    return { success: false, error };
  }
}
