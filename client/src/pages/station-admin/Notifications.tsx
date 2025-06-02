import React from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  useColorModeValue
} from '@chakra-ui/react';
import NotificationForm from '../../components/station-admin/NotificationForm';
import NotificationList from '../../components/station-admin/NotificationList';

const Notifications: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleNotificationSent = () => {
    // This will be passed to NotificationForm to trigger a refresh of the notification list
    window.location.reload();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box
          p={6}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <Heading size="lg" mb={6}>Notification Center</Heading>
          <NotificationForm onNotificationSent={handleNotificationSent} />
        </Box>

        <Box
          p={6}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <NotificationList />
        </Box>
      </VStack>
    </Container>
  );
};

export default Notifications; 