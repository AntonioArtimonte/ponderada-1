// screens/Main/NotificationsScreen.js

import React, { useState, useCallback } from 'react';
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
  Button,
  Chip,
  FAB,
} from 'react-native-paper';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    title: 'New Product Alert!',
    message: 'Check out the latest arrivals in electronics.',
    date: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: '2',
    title: 'Order Shipped',
    message: 'Your order #12345 has been shipped.',
    date: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
  {
    id: '3',
    title: 'Special Offer',
    message: 'Get 20% off on all T‑shirts this weekend!',
    date: new Date(Date.now() - 172800000).toISOString(),
    read: false,
  },
];

export default function NotificationsScreen() {
  const theme = useTheme();
  const { scheduleLocalNotification, showAppNotification } = useNotifications();

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('All'); // All | Unread | Read
  const [refreshing, setRefreshing] = useState(false);

  const filtered = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.read;
    if (filter === 'Read') return n.read;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // In a real app you'd re-fetch; here we just wait 1s
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const markAsRead = id => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = id => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            setNotifications(prev => prev.filter(n => n.id !== id)),
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        markAsRead(item.id);
        showAppNotification(`Notification: ${item.title}`, 'info');
      }}
      onLongPress={() => handleDelete(item.id)}
    >
      <List.Item
        title={item.title}
        description={item.message}
        descriptionNumberOfLines={2}
        left={props => (
          <List.Icon
            {...props}
            icon={item.read ? 'email-open-outline' : 'email-outline'}
            color={item.read ? theme.colors.disabled : theme.colors.primary}
          />
        )}
        right={props => (
          <Text {...props} style={styles.dateText}>
            {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
          </Text>
        )}
        style={[styles.listItem, !item.read && styles.unreadItem]}
      />
      <Divider />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topButtons}>
        <Button
          mode="outlined"
          onPress={() =>
            scheduleLocalNotification(
              'Test Notification',
              'This is a test device notification!',
              { screen: 'ProductDetail', id: 'some-product-id' }
            )
          }
          style={styles.testButton}
        >
          Test Device Notification
        </Button>
        <Button
          mode="outlined"
          onPress={() => showAppNotification('Test In-App Message', 'success')}
          style={styles.testButton}
        >
          Test In-App Snackbar
        </Button>
      </View>

      <View style={styles.chipRow}>
        {['All', 'Unread', 'Read'].map(f => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={styles.chip}
          >
            {f}
          </Chip>
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
            <Text>No notifications to show.</Text>
          </View>
        }
      />

      <FAB
        icon="delete"
        label="Clear All"
        small
        style={styles.fab}
        onPress={() =>
          Alert.alert(
            'Clear All',
            'Delete all notifications?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Clear',
                style: 'destructive',
                onPress: () => setNotifications([]),
              },
            ]
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  testButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chip: {
    marginHorizontal: 4,
  },
  listItem: {
    paddingVertical: 8,
  },
  unreadItem: {
    backgroundColor: '#eef',
  },
  dateText: {
    fontSize: 12,
    color: 'grey',
    alignSelf: 'center',
    marginRight: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
