import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { getMockUsers, addMockUser } from '../utils/mockData';

export const mockLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getMockUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        resolve({ ...user, token: 'fake-jwt-token' });
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 1000);
  });
};

export const mockRegister = (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getMockUsers();
      if (users.some(u => u.email === userData.email)) {
        reject(new Error('Email already exists'));
        return;
      }
      const newUser = addMockUser(userData);
      resolve({ ...newUser, token: 'fake-jwt-token-new' });
    }, 1000);
  });
};

export const mockLogout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

export const mockCheckSession = async () => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const userDataString = await AsyncStorage.getItem('userData');
            if (token && userDataString) {
                resolve(JSON.parse(userDataString));
            } else {
                resolve(null);
            }
        } catch (e) {
            resolve(null);
        }
    }, 500);
  });
};

export const mockRequestPasswordReset = (phone) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getMockUsers();
      // we look up user by phone property now
      if (users.some(u => u.phone === phone)) {
        console.log(`OTP reset SMS sent to ${phone} (simulated). OTP: 123456`);
        resolve({ message: 'OTP sent to your phone.' });
      } else {
        reject(new Error('Phone number not found.'));
      }
    }, 1000);
  });
};

// Verify OTP against phone + reset password
export const mockVerifyOtpAndResetPassword = (phone, otp, newPassword) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (otp === '123456') {
        const users = getMockUsers();
        const idx = users.findIndex(u => u.phone === phone);
        if (idx > -1) {
          users[idx].password = newPassword; // update
          console.log(`Password for ${phone} reset (simulated).`);
          resolve({ message: 'Password reset successfully.' });
        } else {
          reject(new Error('User not found during password update.'));
        }
      } else {
        reject(new Error('Invalid OTP.'));
      }
    }, 1000);
  });
};
