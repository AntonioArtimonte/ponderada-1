// contexts/NotificationContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { View, StyleSheet, Animated, Platform, StatusBar } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import * as Notifications from 'expo-notifications'; // For future expansion
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@notifications';

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
  const [slideAnim] = useState(new Animated.Value(-100));

  const saveNotification = async (message, type) => {
    try {
      const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
      
      const newNotification = {
        id: Date.now().toString(),
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      notifications.unshift(newNotification);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  // For simple in-app Snackbar style notifications
  const showAppNotification = useCallback(async (message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    setIsVisible(true);
    
    // Save notification to storage
    await saveNotification(message, type);
    
    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    // Auto dismiss after duration
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }, duration);
  }, [slideAnim]);


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


  const onDismissSnackBar = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  const getBackgroundColor = () => {
    if (!notification) return theme.colors.surface;
    switch (notification.type) {
      case 'success':
        return theme.colors.primary;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.secondary;
      default: // info
        return theme.colors.primary; // Or a neutral color
    }
  };

  const getIcon = () => {
    if (!notification) return 'information';
    switch (notification.type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      default:
        return 'information';
    }
  };

  return (
    <NotificationContext.Provider value={{ showAppNotification, scheduleLocalNotification }}>
      {children}
      {notification && (
        <Animated.View
          style={[
            styles.notificationContainer,
            {
              transform: [{ translateY: slideAnim }],
              backgroundColor: getBackgroundColor(),
            },
          ]}
        >
          <View style={styles.notificationContent}>
            <MaterialCommunityIcons
              name={getIcon()}
              size={24}
              color="white"
              style={styles.icon}
            />
            <Text style={styles.notificationText}>{notification.message}</Text>
          </View>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 47 : StatusBar.currentHeight + 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  notificationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
});