// contexts/NotificationContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Snackbar, Text, useTheme } from 'react-native-paper';
import * as Notifications from 'expo-notifications'; // For future expansion

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


export const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const theme = useTheme();
  const [notification, setNotification] = useState(null); // { message: '', type: 'info|success|error' }
  const [isVisible, setIsVisible] = useState(false);

  // For simple in-app Snackbar style notifications
  const showAppNotification = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    setIsVisible(true);
    // Automatically dismiss after duration, or let Snackbar handle it
  }, []);


  // This would be for actual device push/local notifications using expo-notifications
  const scheduleLocalNotification = async (title, body, data = {}) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data, // Optional data payload
      },
      trigger: { seconds: 2 }, // Show in 2 seconds (or null for immediate if app is backgrounded)
    });
    // For in-app, we can also show our custom banner
    showAppNotification(`${title}: ${body}`, 'info');
  };


  const onDismissSnackBar = () => setIsVisible(false);

  const getBackgroundColor = () => {
    if (!notification) return theme.colors.surface;
    switch (notification.type) {
      case 'success':
        return '#4CAF50'; // Green
      case 'error':
        return theme.colors.error;
      case 'warning':
        return '#FFC107'; // Amber
      default: // info
        return theme.colors.primary; // Or a neutral color
    }
  };

  return (
    <NotificationContext.Provider value={{ showAppNotification, scheduleLocalNotification }}>
      {children}
      {notification && (
        <Snackbar
          visible={isVisible}
          onDismiss={onDismissSnackBar}
          duration={Snackbar.DURATION_MEDIUM}
          style={{ backgroundColor: getBackgroundColor() }}
          action={{
            label: 'Dismiss',
            onPress: onDismissSnackBar,
            textColor: 'white',
          }}
        >
          <Text style={{ color: 'white' }}>{notification.message}</Text>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
};