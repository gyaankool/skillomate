const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('📧 SMTP transporter verified successfully');
  } catch (error) {
    console.error('❌ SMTP verification failed:', error.message);
  }
};

// Send email function
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  welcomeEmail: (username) => ({
    subject: process.env.EMAIL_WELCOME_SUBJECT || 'Welcome to GetSkilled Homework Helper!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316; text-align: center;">Welcome to GetSkilled Homework Helper!</h1>
        <p>Hello ${username},</p>
        <p>Thank you for joining GetSkilled Homework Helper! We're excited to have you on board.</p>
        <p>Where doubt finds its answer - that's our promise to you.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Get Started
          </a>
        </div>
        <p>Best regards,<br>The GetSkilled Homework Helper Team</p>
      </div>
    `
  }),
  
  verificationEmail: (username, verificationToken) => ({
    subject: process.env.EMAIL_VERIFICATION_SUBJECT || 'Verify Your GetSkilled Homework Helper Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316; text-align: center;">Verify Your Account</h1>
        <p>Hello ${username},</p>
        <p>Please click the button below to verify your GetSkilled Homework Helper account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}" 
             style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Verify Account
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">
          ${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}
        </p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The GetSkilled Homework Helper Team</p>
      </div>
    `
  })
};

module.exports = {
  transporter,
  verifyTransporter,
  sendEmail,
  emailTemplates
};
