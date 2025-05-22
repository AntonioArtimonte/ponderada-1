import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store'; // For sensitive data like tokens
import { mockLogin, mockRegister, mockLogout, mockCheckSession } from '../services/authService'; // We'll create this

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // For initial loading state

  useEffect(() => {
    // Check for existing session on app startup
    const checkUserSession = async () => {
      try {
        const storedUser = await mockCheckSession(); // Simulates checking a token
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (e) {
        console.error("Failed to load user session", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserSession();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const userData = await mockLogin(email, password);
      setUser(userData);
      // In a real app, you'd store a token securely
      await SecureStore.setItemAsync('userToken', userData.token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setIsLoading(false);
      return userData;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const newUser = await mockRegister(userData);
      setUser(newUser);
      await SecureStore.setItemAsync('userToken', newUser.token);
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));
      setIsLoading(false);
      return newUser;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await mockLogout();
      setUser(null);
      await SecureStore.deleteItemAsync('userToken');
      await AsyncStorage.removeItem('userData');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const updateUserProfile = async (updatedData) => {
    // Simulate updating profile and then update context
    setUser(prevUser => ({ ...prevUser, ...updatedData }));
    await AsyncStorage.setItem('userData', JSON.stringify({ ...user, ...updatedData }));
    // In a real app, this would be an API call
  };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
