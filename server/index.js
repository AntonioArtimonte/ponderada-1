const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { generateOTP } = require('./utils/otpUtils');

const app = express();
const port = process.env.PORT || 3001;

// Development mode flag
const isDevelopment = true;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Body:', req.body);
  next();
});

// Store OTPs temporarily (in a real app, this would be in a database)
const otpStore = new Map();

// Email configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.mailersend.net',
  port: 587,
  secure: false,
  auth: {
    user: 'MS_pBD3fw@test-r6ke4n11vw9gon12.mlsender.net',
    pass: 'mssp.GTmLtN0.z86org8d261lew13.HSlmMgQ'
  },
  tls: {
    rejectUnauthorized: true
  }
});

// Test email configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Routes
app.post('/api/reset-password/request', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Password reset requested for email:', email);

    if (!email) {
      console.log('Error: Email is required');
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log('Generated OTP for', email, ':', otp);
    
    // Store OTP
    otpStore.set(email, {
      code: otp,
      timestamp: Date.now(),
      attempts: 0
    });
    console.log('OTP stored for', email);

    if (isDevelopment) {
      // In development, just log the OTP
      console.log('\n=== DEVELOPMENT MODE ===');
      console.log('Password Reset Code:', otp);
      console.log('In production, this would be sent to:', email);
      console.log('========================\n');
      
      res.json({ 
        message: 'Reset code sent successfully',
        developmentMode: true,
        otp: otp // Only included in development mode
      });
      return;
    }

    // Production mode - send email
    console.log('Attempting to send email to:', email);
    try {
      await transporter.sendMail({
        from: {
          name: 'My Dev App',
          address: 'MS_pBD3fw@test-r6ke4n11vw9gon12.mlsender.net'
        },
        to: email,
        subject: 'Password Reset Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
            <p style="color: #666; font-size: 16px;">Your reset code is:</p>
            <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h2 style="color: #333; letter-spacing: 5px; margin: 0;">${otp}</h2>
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          </div>
        `
      });
      console.log('Reset email sent successfully to:', email);
      res.json({ message: 'Reset code sent successfully' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // If email sending fails, still return the OTP in development
      if (isDevelopment) {
        res.json({ 
          message: 'Reset code generated (email sending failed)',
          developmentMode: true,
          otp: otp
        });
      } else {
        throw emailError;
      }
    }
  } catch (error) {
    console.error('Error in /reset-password/request:', error);
    res.status(500).json({ error: 'Failed to send reset code' });
  }
});

app.post('/api/reset-password/verify', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    console.log('Password reset verification attempt for:', email);

    if (!email || !code || !newPassword) {
      console.log('Error: Missing required fields');
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    const storedData = otpStore.get(email);
    console.log('Stored OTP data for', email, ':', storedData ? 'Found' : 'Not found');
    
    if (!storedData) {
      console.log('Error: Invalid or expired reset code for', email);
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    // Check if OTP has expired (10 minutes)
    if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
      console.log('Error: Reset code expired for', email);
      otpStore.delete(email);
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    // Check if too many attempts
    if (storedData.attempts >= 3) {
      console.log('Error: Too many failed attempts for', email);
      otpStore.delete(email);
      return res.status(400).json({ error: 'Too many failed attempts' });
    }

    // Verify OTP
    if (storedData.code !== code) {
      console.log('Error: Invalid reset code for', email);
      storedData.attempts++;
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    // Here you would update the user's password in your database
    // await updateUserPassword(email, newPassword);
    console.log('Password reset successful for', email);

    // Clear OTP after successful reset
    otpStore.delete(email);
    console.log('OTP cleared for', email);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in /reset-password/verify:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${port}`);
  console.log('Available routes:');
  console.log('- POST /api/reset-password/request');
  console.log('- POST /api/reset-password/verify');
}); 