/**
 * Generates a 6-digit OTP
 * @returns {string} A 6-digit OTP
 */
export const generateOTP = () => {
  // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}; 