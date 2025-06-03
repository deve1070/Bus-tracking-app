import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { API_URL } from '../../config';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import StatsCard from '@/components/CardItem';

interface Bus {
  busNumber: string;
  routeNumber: string;
  deviceId: string;
  location?: {
    lat: number;
    lng: number;
  };
  speed?: number;
  heading?: number;
  status?: string;
  lastUpdate?: string;
}

export default function Simulator() {
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<any>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  useEffect(() => {
    // Request location permissions
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
    })();

    // Set up WebSocket connection
    const newSocket = io(API_URL);
    setSocket(newSocket);

    // Listen for bus updates
    newSocket.on('busLocationUpdate', (updatedBuses: Bus[]) => {
      console.log('Received bus updates:', updatedBuses);
      setBuses(updatedBuses);
    });

    // Fetch initial bus list
    fetchBuses();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const fetchBuses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bus/status`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched buses:', data);
        setBuses(data);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
      setErrorMsg('Failed to fetch buses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startTracking = async (bus: Bus) => {
    if (!socket) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    // Request location permissions again before starting tracking
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Location permission is required to simulate bus location');
      return;
    }

    setSelectedBus(bus);
    setIsTracking(true);
    try {
      // Start watching position
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
          
          // Send location update to server
          socket.emit('gps-update', {
            deviceId: bus.deviceId,
            busNumber: bus.busNumber,
            routeNumber: bus.routeNumber,
            location: {
              lat: newLocation.coords.latitude,
              lng: newLocation.coords.longitude,
            },
            speed: newLocation.coords.speed || 0,
            heading: newLocation.coords.heading || 0,
            status: 'active',
            lastUpdate: new Date().toISOString(),
          });
        }
      );
    } catch (error) {
      console.error('Tracking error:', error);
      Alert.alert('Error', 'Failed to start tracking. Please try again.');
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    setSelectedBus(null);
    // Stop watching position
    Location.stopLocationUpdatesAsync('bus-tracking');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#22c55e'; // green-600
      case 'inactive':
        return '#4b5563'; // gray-600
      case 'maintenance':
        return '#dc2626'; // red-600
      default:
        return '#2563eb'; // blue-600
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'activity';
      case 'inactive':
        return 'clock';
      case 'maintenance':
        return 'right';
      default:
        return 'bus';
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
      <Text style={styles.title}>Bus Simulator</Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {buses.map((bus) => (
          <Pressable 
            key={bus.deviceId}
            style={styles.busCard}
            onPress={() => startTracking(bus)}
          >
            <StatsCard
              title={`Bus ${bus.busNumber}`}
              icon={getStatusIcon(bus.status || '')}
              value={`Route: ${bus.routeNumber}`}
              size={18}
              iconColor={getStatusColor(bus.status || '')}
              subtitle={
                <View style={styles.subtitleContainer}>
                  {bus.speed !== undefined && (
                    <Text style={styles.subtitleText}>
                      Speed: {bus.speed.toFixed(1)} km/h
                    </Text>
                  )}
                  {bus.lastUpdate && (
                    <Text style={styles.subtitleText}>
                      Last update: {new Date(bus.lastUpdate).toLocaleTimeString()}
                    </Text>
                  )}
                </View>
              }
            />
          </Pressable>
        ))}

        {buses.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No buses available</Text>
          </View>
        )}

        {selectedBus && isTracking && (
          <View style={styles.trackingContainer}>
            <Text style={styles.trackingTitle}>
              Simulating Bus {selectedBus.busNumber}
            </Text>
            
            {location && (
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>
                  Latitude: {location.coords.latitude.toFixed(6)}
                </Text>
                <Text style={styles.locationText}>
                  Longitude: {location.coords.longitude.toFixed(6)}
                </Text>
                <Text style={styles.locationText}>
                  Speed: {(location.coords.speed || 0).toFixed(1)} km/h
                </Text>
                <Text style={styles.locationText}>
                  Heading: {(location.coords.heading || 0).toFixed(1)}°
                </Text>
              </View>
            )}

            {errorMsg && (
              <Text style={styles.errorText}>{errorMsg}</Text>
            )}

            <Pressable
              style={[styles.button, styles.stopButton]}
              onPress={stopTracking}
            >
              <Text style={styles.buttonText}>Stop Simulation</Text>
            </Pressable>
          </View>
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
  busCard: {
    marginBottom: 15,
  },
  subtitleContainer: {
    marginTop: 8,
  },
  subtitleText: {
    color: '#ABB5D8',
    fontSize: 12,
    marginTop: 2,
  },
  trackingContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1A1D35',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2D45',
  },
  trackingTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  locationInfo: {
    gap: 8,
  },
  locationText: {
    color: '#ABB5D8',
    fontSize: 14,
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#ABB5D8',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  stopButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 