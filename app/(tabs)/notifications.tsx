import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { API_URL } from '../../config';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'broadcast' | 'driver' | 'info' | 'warning' | 'error';
  recipient: 'all' | string;
  timestamp: string;
  isRead?: boolean;
  busNumber?: string;
  routeNumber?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Set up WebSocket connection
    const newSocket = io(API_URL);
    setSocket(newSocket);

    // Listen for new notifications
    newSocket.on('new-notification', (notification: Notification) => {
      setNotifications(prevNotifications => [notification, ...prevNotifications]);
    });

    // Fetch initial notifications
    fetchNotifications();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else if (response.status === 401) {
        setError('Please log in to view notifications');
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId ? { ...notification, isRead: true } : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning':
        return '#f59e0b'; // amber-500
      case 'error':
        return '#ef4444'; // red-500
      case 'broadcast':
        return '#3b82f6'; // blue-500
      case 'driver':
        return '#10b981'; // green-500
      default:
        return '#3b82f6'; // blue-500
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '🚨';
      case 'broadcast':
        return '📢';
      case 'driver':
        return '🚌';
      default:
        return 'ℹ️';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4285F4']}
            tintColor="#4285F4"
          />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No notifications available</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <Pressable 
              key={notification.id}
              style={[
                styles.notificationCard,
                { borderLeftColor: getNotificationColor(notification.type) },
                !notification.isRead && styles.unreadCard
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </Text>
                <Text style={styles.notificationType}>
                  {notification.type.toUpperCase()}
                </Text>
                <Text style={styles.notificationTime}>
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </Text>
              </View>

              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>

              {(notification.busNumber || notification.routeNumber) && (
                <View style={styles.notificationDetails}>
                  {notification.busNumber && (
                    <Text style={styles.notificationDetail}>
                      Bus: {notification.busNumber}
                    </Text>
                  )}
                  {notification.routeNumber && (
                    <Text style={styles.notificationDetail}>
                      Route: {notification.routeNumber}
                    </Text>
                  )}
                </View>
              )}
            </Pressable>
          ))
        )}
      </ScrollView>
     </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0D23',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  notificationCard: {
    backgroundColor: '#1A1D35',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
  },
  unreadCard: {
    backgroundColor: '#2A2D45',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  notificationType: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  notificationTime: {
    color: '#ABB5D8',
    fontSize: 12,
  },
  notificationTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  notificationDetails: {
    flexDirection: 'row',
    gap: 15,
  },
  notificationDetail: {
    color: '#ABB5D8',
    fontSize: 14,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#ABB5D8',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#1A1D35',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
});