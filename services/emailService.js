import { generateOTP } from '../utils/otpUtils';

// Store OTPs temporarily (in a real app, this would be in a database)
const otpStore = new Map();

const API_URL = 'http://10.128.1.56:3001/api';

export const sendPasswordResetEmail = async (email) => {
  try {
    const response = await fetch(`${API_URL}/reset-password/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send reset code');
    }

    return data;
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw new Error(error.message || 'Failed to send reset code. Please try again.');
  }
};

export const verifyOtpAndResetPassword = async (email, otp, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/reset-password/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code: otp, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }

    return true;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error(error.message || 'Failed to reset password. Please try again.');
  }
}; 