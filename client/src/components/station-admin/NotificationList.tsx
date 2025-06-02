import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Badge,
  Heading,
  Spinner,
  useToast
} from '@chakra-ui/react';
import axios from 'axios';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'broadcast' | 'driver';
  read: boolean;
  createdAt: string;
  recipient: string | { firstName: string; lastName: string };
}

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('http://localhost:3000/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotifications(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Notifications</Heading>
      <VStack spacing={4} align="stretch">
        {notifications.length === 0 ? (
          <Text>No notifications found</Text>
        ) : (
          notifications.map((notification) => (
            <Box
              key={notification._id}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              bg={notification.read ? 'gray.50' : 'white'}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Heading size="sm">{notification.title}</Heading>
                <Badge colorScheme={notification.type === 'broadcast' ? 'blue' : 'green'}>
                  {notification.type}
                </Badge>
              </Box>
              <Text mb={2}>{notification.message}</Text>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" color="gray.500">
                  {new Date(notification.createdAt).toLocaleString()}
                </Text>
                {typeof notification.recipient === 'object' && (
                  <Text fontSize="sm" color="gray.500">
                    To: {notification.recipient.firstName} {notification.recipient.lastName}
                  </Text>
                )}
              </Box>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default NotificationList; 