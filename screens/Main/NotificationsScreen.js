// screens/Main/NotificationsScreen.js

import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  useTheme,
  List,
  Divider,
  IconButton,
  Surface,
} from 'react-native-paper';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@notifications';

export default function NotificationsScreen() {
  const theme = useTheme();
  const { showAppNotification } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        ));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      showAppNotification('Failed to load notifications', 'error');
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filtered = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.read;
    if (filter === 'Read') return n.read;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, []);

  const markAsRead = async (id) => {
    try {
      const updatedNotifications = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showAppNotification('Failed to mark notification as read', 'error');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedNotifications = notifications.filter(n => n.id !== id);
              await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
              setNotifications(updatedNotifications);
              showAppNotification('Notification deleted', 'info');
            } catch (error) {
              console.error('Error deleting notification:', error);
              showAppNotification('Failed to delete notification', 'error');
            }
          },
        },
      ]
    );
  };

  const clearAll = async () => {
    Alert.alert(
      'Clear All',
      'Delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
              setNotifications([]);
              showAppNotification('All notifications cleared', 'info');
            } catch (error) {
              console.error('Error clearing notifications:', error);
              showAppNotification('Failed to clear notifications', 'error');
            }
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
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

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return theme.colors.primary;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.secondary;
      default:
        return theme.colors.primary;
    }
  };

  const renderItem = ({ item }) => (
    <Surface style={[styles.notificationItem, !item.read && styles.unreadItem]}>
      <TouchableOpacity
        onPress={() => {
          if (!item.read) markAsRead(item.id);
        }}
        onLongPress={() => handleDelete(item.id)}
        style={styles.touchable}
      >
        <View style={styles.notificationContent}>
          <IconButton
            icon={getNotificationIcon(item.type)}
            size={24}
            iconColor={getNotificationColor(item.type)}
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.timestamp}>
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </Text>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    </Surface>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filterContainer}>
        {['All', 'Unread', 'Read'].map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && { color: 'white' },
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications to show.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {notifications.length > 0 && (
        <IconButton
          icon="delete"
          size={24}
          iconColor={theme.colors.error}
          style={styles.clearButton}
          onPress={clearAll}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  unreadItem: {
    backgroundColor: '#f8f9fa',
  },
  touchable: {
    padding: 12,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    margin: 0,
  },
  textContainer: {
    flex: 1,
    marginLeft: 8,
  },
  message: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: 'white',
    elevation: 4,
  },
});
