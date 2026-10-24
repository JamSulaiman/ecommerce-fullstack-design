import nodemailer from 'nodemailer';

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

const storeName = () => process.env.STORE_NAME || 'Brand Store';

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be configured for Gmail delivery.');
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const sender = process.env.EMAIL_FROM || `${storeName()} <${process.env.EMAIL_USER}>`;
  try {
    const info = await getTransporter().sendMail({
      from: sender,
      to,
      subject,
      html,
    });
    return { sent: true, message: '', messageId: info.messageId };
  } catch (error) {
    const message = `Email delivery failed: ${error.message}`;
    console.error(message);
    return { sent: false, message };
  }
};

const buildOrderHtml = (order, customer, status) => {
  const copy = {
    pending: ['Order received', 'Thank you for shopping with us! Your order is waiting for confirmation.'],
    confirmed: ['Order confirmed', 'Good news! We have confirmed your order and are getting it ready.'],
    shipped: ['Order shipped', 'Your order has been shipped and is on its way to the address below.'],
    delivered: ['Order delivered', 'Your order has been delivered. We hope you enjoy it!'],
    cancelled: ['Order cancelled', 'Your order has been cancelled. If you did not ask for this, please contact us.'],
  }[status];
  if (!copy) throw new Error(`Unsupported order email status: ${status}`);

  const address = order.shippingAddress || {};
  const items = order.orderItems.map((item) => `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(item.name)} × ${item.qty}</td>
    <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">$${(item.price * item.qty).toFixed(2)}</td>
  </tr>`).join('');
  const shippingAddress = address.address
    ? `<p style="margin:16px 0 4px;font-weight:600">Shipping to</p>
       <p style="margin:0;color:#444;line-height:1.5">${escapeHtml(address.fullName)}<br>${escapeHtml(address.address)}, ${escapeHtml(address.city)} ${escapeHtml(address.postalCode)}<br>Phone: ${escapeHtml(address.phone)}</p>`
    : '';

  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#222">
    <h2 style="margin:0 0 8px">${escapeHtml(copy[0])}</h2>
    <p style="margin:0 0 16px;color:#444">Hi ${escapeHtml(customer.name)}, ${escapeHtml(copy[1])}</p>
    <p style="margin:0 0 12px;font-size:13px;color:#666">Order #${escapeHtml(String(order._id))} · Status: <b>${escapeHtml(status.toUpperCase())}</b></p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${items}
      <tr><td style="padding-top:10px;font-weight:700">Total</td><td style="padding-top:10px;text-align:right;font-weight:700">$${order.totalPrice.toFixed(2)}</td></tr>
    </table>
    <p style="margin:8px 0 0;font-size:13px;color:#666">Payment: ${escapeHtml(order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod)}</p>
    ${shippingAddress}
    <p style="margin-top:24px;font-size:12px;color:#999">— ${escapeHtml(storeName())}</p>
  </div>`;
};

export const sendOrderStatusEmail = async (order, customer, status) => {
  try {
    const recipient = customer?.email;
    if (!recipient) {
      const message = 'Customer email address is missing.';
      console.warn(message);
      return { sent: false, message };
    }
    const subject = {
      pending: 'Order received',
      confirmed: 'Order confirmed',
      shipped: 'Order shipped',
      delivered: 'Order delivered',
      cancelled: 'Order cancelled',
    }[status];
    if (!subject) throw new Error(`Unsupported order email status: ${status}`);
    return await sendEmail({
      to: recipient,
      subject: `${subject} — #${String(order._id).slice(-6).toUpperCase()}`,
      html: buildOrderHtml(order, customer, status),
    });
  } catch (error) {
    const message = `Email request failed: ${error.message}`;
    console.error(message);
    return { sent: false, message };
  }
};

export const sendEmailVerificationCode = async (recipient, code) => {
  try {
    if (!recipient) {
      const message = 'Email recipient is missing.';
      console.warn(message);
      return { sent: false, message };
    }
    return await sendEmail({
      to: recipient,
      subject: `Verify your email — ${storeName()}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#222">
        <h2>Verify your email address</h2>
        <p>Enter this code in the store to verify your email address. It expires in 10 minutes.</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:8px">${escapeHtml(code)}</p>
        <p style="font-size:12px;color:#777">If you did not request this, you can ignore this email.</p>
        <p style="font-size:12px;color:#999">— ${escapeHtml(storeName())}</p>
      </div>`,
    });
  } catch (error) {
    const message = `Verification email request failed: ${error.message}`;
    console.error(message);
    return { sent: false, message };
  }
};
