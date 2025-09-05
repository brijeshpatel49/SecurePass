const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    // Simple SMTP configuration - you can use any SMTP service
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify SMTP connection on startup
    if (process.env.NODE_ENV === "development") {
      this.transporter.verify((error, success) => {
        if (error) {
          console.error("❌ SMTP Connection Error:", error.message);
        }
      });
    }
  }

  async sendSimpleOTP(email, otp, type = "registration") {
    const subject =
      type === "registration"
        ? "SecurePass - Email Verification"
        : "SecurePass - Password Reset";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0; font-size: 24px;">🛡️ SecurePass</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Email Verification</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <h2 style="color: #333; margin-bottom: 15px;">Your Verification Code</h2>
            <p style="color: #666; margin-bottom: 25px;">
              Enter this code to ${
                type === "registration"
                  ? "complete your registration"
                  : "reset your password"
              }:
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #007bff;">
              <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; font-family: monospace;">${otp}</span>
            </div>
            
            <p style="color: #dc3545; font-size: 14px; margin-top: 15px;">
              ⏰ This code expires in 10 minutes
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This email was sent by SecurePass Password Manager<br>
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@securepass.com",
      to: email,
      subject: subject,
      html: html,
    };

    try {
      // Always try to send email first
      await this.transporter.sendMail(mailOptions);
      

      
      return { success: true };
    } catch (error) {
      console.error("OTP email sending failed:", error);
      

      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetOTP(email, otp) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SecurePass - Password Reset OTP",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin-bottom: 20px;">
                <span style="font-size: 30px;">🛡️</span>
              </div>
              <h1 style="color: #2d3748; margin: 0; font-size: 28px; font-weight: 700;">SecurePass</h1>
              <p style="color: #4a5568; margin: 10px 0 0 0; font-size: 16px; opacity: 0.8;">Password Reset Verification</p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <h2 style="color: #2d3748; margin-bottom: 20px; font-size: 24px;">Your Reset Code</h2>
              <p style="color: #4a5568; line-height: 1.6; margin-bottom: 30px; font-size: 16px;">
                Enter this verification code to reset your password:
              </p>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; margin: 30px 0; display: inline-block;">
                <div style="background: white; padding: 20px 40px; border-radius: 10px; box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <span style="font-size: 36px; font-weight: bold; color: #2d3748; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
                </div>
              </div>
              
              <p style="color: #e53e3e; font-size: 14px; font-weight: 600; margin-top: 20px;">
                ⏰ This code expires in 10 minutes
              </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 20px; border-radius: 15px; margin: 30px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #2d3748; margin-bottom: 15px; font-size: 16px;">🔒 Security Tips:</h3>
              <ul style="color: #4a5568; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Never share this code with anyone</li>
                <li>SecurePass will never ask for your code via phone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e2e8f0;">
              <p style="color: #a0aec0; font-size: 12px; margin: 0; line-height: 1.6;">
                This email was sent by SecurePass Password Manager<br>
                <strong>Need help?</strong> Contact our support team at support@securepass.com
              </p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("Email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, firstName) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to SecurePass! 🛡️",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🛡️ SecurePass</h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Welcome to Secure Password Management</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2d3748; margin-bottom: 20px;">Welcome, ${firstName}! 🎉</h2>
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
              Thank you for joining SecurePass! Your account has been successfully created and your digital security journey begins now.
            </p>
            
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #2d3748; margin-bottom: 15px;">🚀 Getting Started:</h3>
              <ul style="color: #4a5568; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Add your first password to your secure vault</li>
                <li>Use our password generator for strong passwords</li>
                <li>Enable two-factor authentication in settings</li>
                <li>Download our mobile app for on-the-go access</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Go to Dashboard
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
              <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 0;">
                Need help? Contact our support team at support@securepass.com
              </p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("Welcome email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  async send2FAOTP(email, otp) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SecurePass - Two-Factor Authentication Code",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin-bottom: 20px;">
                <span style="font-size: 30px;">🔐</span>
              </div>
              <h1 style="color: #2d3748; margin: 0; font-size: 28px; font-weight: 700;">SecurePass</h1>
              <p style="color: #4a5568; margin: 10px 0 0 0; font-size: 16px; opacity: 0.8;">Two-Factor Authentication</p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <h2 style="color: #2d3748; margin-bottom: 20px; font-size: 24px;">Your Security Code</h2>
              <p style="color: #4a5568; line-height: 1.6; margin-bottom: 30px; font-size: 16px;">
                Enter this verification code to complete your sign-in:
              </p>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; margin: 30px 0; display: inline-block;">
                <div style="background: white; padding: 20px 40px; border-radius: 10px; box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <span style="font-size: 36px; font-weight: bold; color: #2d3748; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
                </div>
              </div>
              
              <p style="color: #e53e3e; font-size: 14px; font-weight: 600; margin-top: 20px;">
                ⏰ This code expires in 5 minutes
              </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 20px; border-radius: 15px; margin: 30px 0; border-left: 4px solid #f39c12;">
              <h3 style="color: #2d3748; margin-bottom: 15px; font-size: 16px;">⚠️ Security Notice:</h3>
              <ul style="color: #4a5568; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Never share this code with anyone</li>
                <li>SecurePass will never ask for this code via phone</li>
                <li>If you didn't request this code, please secure your account immediately</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e2e8f0;">
              <p style="color: #a0aec0; font-size: 12px; margin: 0; line-height: 1.6;">
                This email was sent by SecurePass Password Manager<br>
                <strong>Need help?</strong> Contact our support team at support@securepass.com
              </p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("2FA OTP email sending failed:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
