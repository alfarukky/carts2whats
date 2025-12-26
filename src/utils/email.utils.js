import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send admin notification email
export const sendAdminNotification = async (contactData) => {
  const { name, email, phone, subject, message } = contactData;
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact Form Submission - MorishCart`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Sent from MorishCart Contact Form<br>
      Time: ${new Date().toLocaleString()}</small></p>
    `,
  };

  const transporter = createTransporter();
  return await transporter.sendMail(mailOptions);
};

// Send customer confirmation email
export const sendCustomerConfirmation = async (contactData) => {
  const { name, email, message } = contactData;
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Thank you for contacting MorishCart',
    html: `
      <h3>Thank you for contacting us!</h3>
      <p>Hi ${name},</p>
      <p>Thank you for reaching out to MorishCart. We've received your message and will get back to you within 24 hours.</p>
      
      <h4>Your message:</h4>
      <p style="background: #f5f5f5; padding: 10px; border-left: 3px solid #28a745;">
        "${message}"
      </p>
      
      <p>Best regards,<br>
      <strong>MorishCart Team</strong></p>
      
      <hr>
      <p><small>This is an automated confirmation email. Please do not reply to this email.</small></p>
    `,
  };

  const transporter = createTransporter();
  return await transporter.sendMail(mailOptions);
};

// Send both emails with error handling
export const sendContactEmails = async (contactData) => {
  const results = {
    adminEmail: { success: false, error: null },
    customerEmail: { success: false, error: null }
  };

  // Send admin notification
  try {
    await sendAdminNotification(contactData);
    results.adminEmail.success = true;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    results.adminEmail.error = error.message;
  }

  // Send customer confirmation
  try {
    await sendCustomerConfirmation(contactData);
    results.customerEmail.success = true;
  } catch (error) {
    console.error('Failed to send customer confirmation:', error);
    results.customerEmail.error = error.message;
  }

  return results;
};
