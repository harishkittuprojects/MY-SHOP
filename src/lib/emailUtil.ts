import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendAdminOrderNotification = async (orderId: string, type: 'order' | 'subscription', data: any) => {
  const adminEmail = process.env.SMTP_USER || "madurfoods@gmail.com";
  const subject = type === 'subscription' ? `MADUR.IN: New Subscription - #${orderId}` : `MADUR.IN: New Order - #${orderId}`;
  
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2F6B3F;">New ${type === 'subscription' ? 'Subscription' : 'Order'} Received!</h2>
      <p><strong>ID:</strong> #${orderId}</p>
      <p><strong>Customer:</strong> ${data.customer_name || 'N/A'}</p>
      <p><strong>Phone:</strong> ${data.customer_phone || 'N/A'}</p>
      <p><strong>Address:</strong> ${data.address || data.shipping_address || 'N/A'}</p>
      <p><strong>Total:</strong> ₹${data.total_amount || data.amount || 'N/A'}</p>
      <hr />
      <p>Please check the <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">Admin Dashboard</a> for full details.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Madur.in Admin" <admin@madur.in>',
      to: adminEmail,
      subject: subject,
      html: htmlContent,
    });
    console.log(`Admin ${type} notification sent to ${adminEmail}`);
  } catch (error) {
    console.error(`Failed to send admin ${type} notification:`, error);
  }
};
