import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your computer's local IP address here
const API_URL = 'http://192.168.1.1:3000'; // Replace with your actual IP address

// Fallback to AsyncStorage if json-server is not available
const FALLBACK_TO_ASYNC_STORAGE = true;

// Users
export const saveUser = async (user) => {
  try {
    if (FALLBACK_TO_ASYNC_STORAGE) {
      await AsyncStorage.setItem(`@user_${user.id}`, JSON.stringify(user));
      return user;
    }
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving user:', error);
    if (FALLBACK_TO_ASYNC_STORAGE) {
      await AsyncStorage.setItem(`@user_${user.id}`, JSON.stringify(user));
      return user;
    }
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    if (FALLBACK_TO_ASYNC_STORAGE) {
      const user = await AsyncStorage.getItem(`@user_${userId}`);
      return user ? JSON.parse(user) : null;
    }
    const response = await fetch(`${API_URL}/users/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting user:', error);
    if (FALLBACK_TO_ASYNC_STORAGE) {
      const user = await AsyncStorage.getItem(`@user_${userId}`);
      return user ? JSON.parse(user) : null;
    }
    throw error;
  }
};

// Favorites
export const saveFavorites = async (userId, favorites) => {
  try {
    if (FALLBACK_TO_ASYNC_STORAGE) {
      await AsyncStorage.setItem(`@favorites_${userId}`, JSON.stringify(favorites));
      return favorites;
    }
    const response = await fetch(`${API_URL}/favorites/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(favorites),
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving favorites:', error);
    if (FALLBACK_TO_ASYNC_STORAGE) {
      await AsyncStorage.setItem(`@favorites_${userId}`, JSON.stringify(favorites));
      return favorites;
    }
    throw error;
  }
};

export const getFavorites = async (userId) => {
  try {
    if (FALLBACK_TO_ASYNC_STORAGE) {
      const favorites = await AsyncStorage.getItem(`@favorites_${userId}`);
      return favorites ? JSON.parse(favorites) : [];
    }
    const response = await fetch(`${API_URL}/favorites/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting favorites:', error);
    if (FALLBACK_TO_ASYNC_STORAGE) {
      const favorites = await AsyncStorage.getItem(`@favorites_${userId}`);
      return favorites ? JSON.parse(favorites) : [];
    }
    throw error;
  }
};

// Notifications
export const saveNotification = async (notification) => {
  try {
    const notificationWithTimestamp = {
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    };

    if (FALLBACK_TO_ASYNC_STORAGE) {
      const notifications = await AsyncStorage.getItem('@notifications');
      const allNotifications = notifications ? JSON.parse(notifications) : [];
      allNotifications.push(notificationWithTimestamp);
      await AsyncStorage.setItem('@notifications', JSON.stringify(allNotifications));
      return notificationWithTimestamp;
    }

    const response = await fetch(`${API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationWithTimestamp),
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving notification:', error);
    if (FALLBACK_TO_ASYNC_STORAGE) {
      const notifications = await AsyncStorage.getItem('@notifications');
      const allNotifications = notifications ? JSON.parse(notifications) : [];
      allNotifications.push(notificationWithTimestamp);
      await AsyncStorage.setItem('@notifications', JSON.stringify(allNotifications));
      return notificationWithTimestamp;
    }
    throw error;
  }
};

export const getNotifications = async (userId) => {
  try {
    if (FALLBACK_TO_ASYNC_STORAGE) {
      const notifications = await AsyncStorage.getItem('@notifications');
      const allNotifications = notifications ? JSON.parse(notifications) : [];
      return allNotifications.filter(n => n.userId === userId);
    }
    const response = await fetch(`${API_URL}/notifications?userId=${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting notifications:', error);
    if (FALLBACK_TO_ASYNC_STORAGE) {
      const notifications = await AsyncStorage.getItem('@notifications');
      const allNotifications = notifications ? JSON.parse(notifications) : [];
      return allNotifications.filter(n => n.userId === userId);
    }
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    if (FALLBACK_TO_ASYNC_STORAGE) {
      const notifications = await AsyncStorage.getItem('@notifications');
      const allNotifications = notifications ? JSON.parse(notifications) : [];
      const updatedNotifications = allNotifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem('@notifications', JSON.stringify(updatedNotifications));
      return updatedNotifications.find(n => n.id === notificationId);
    }
    const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ read: true }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    if (FALLBACK_TO_ASYNC_STORAGE) {
      const notifications = await AsyncStorage.getItem('@notifications');
      const allNotifications = notifications ? JSON.parse(notifications) : [];
      const updatedNotifications = allNotifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem('@notifications', JSON.stringify(updatedNotifications));
      return updatedNotifications.find(n => n.id === notificationId);
    }
    throw error;
  }
}; 