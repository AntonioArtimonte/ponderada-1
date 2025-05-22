import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext'; // We'll create this
import AppNavigator from './navigation/AppNavigator';
import { theme } from './constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NotificationProvider>
          <AppNavigator />
          <StatusBar style="light" backgroundColor={theme.colors.primary} />
        </NotificationProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
