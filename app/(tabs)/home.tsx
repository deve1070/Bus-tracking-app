import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { API_URL } from '../../config';
import io from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface BusLocation {
  deviceId: string;
  busNumber: string;
  routeNumber: string;
  location: {
    lat: number;
    lng: number;
  };
  speed: number;
  heading: number;
  status: string;
  lastUpdate: string;
  currentStation?: {
    name: string;
    location: {
      lat: number;
      lng: number;
    };
  };
  nextStation?: {
    name: string;
    location: {
      lat: number;
      lng: number;
    };
  };
  eta?: number;
  distanceToNext?: number;
}

export default function Location() {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [fromCoord, setFromCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [toCoord, setToCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [busLocations, setBusLocations] = useState<Record<string, BusLocation>>({});
  const [selectedBus, setSelectedBus] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(API_URL);

    // Listen for connection events
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    // Listen for GPS updates
    socket.on('gps-update', (data: BusLocation) => {
      console.log('Received GPS update:', data);
      setBusLocations(prev => ({
        ...prev,
        [data.deviceId]: data
      }));
    });

    // Listen for bus location updates
    socket.on('busLocationUpdate', (data: BusLocation[]) => {
      console.log('Received bus location update:', data);
      const locations: Record<string, BusLocation> = {};
      data.forEach(bus => {
        locations[bus.deviceId] = bus;
      });
      setBusLocations(locations);
    });

    // Get initial bus locations
    fetchInitialLocations();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchInitialLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bus/locations`);
      if (response.ok) {
        const data = await response.json();
        const locations: Record<string, BusLocation> = {};
        data.forEach((bus: BusLocation) => {
          locations[bus.deviceId] = bus;
        });
        setBusLocations(locations);
      }
    } catch (error) {
      console.error('Error fetching initial bus locations:', error);
    }
  };

  const getBusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const geocodeCity = async (city: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'BusTrackerApp/1.0 (your-email@example.com)',
          },
        }
      );

      const data = await response.json();
      console.log('Geocoded Data:', data);

      if (data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      } else {
        alert(`Could not find location: ${city}`);
        return null;
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      alert('Failed to fetch location');
      return null;
    }
  };

  const handleSearch = async () => {
    const from = await geocodeCity(fromCity);
    const to = await geocodeCity(toCity);
    if (from && to) {
      setFromCoord(from);
      setToCoord(to);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0D23' }}>
      <MapView
        style={{ width, height }}
        initialRegion={{
          latitude: 9.03,
          longitude: 38.74,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        {fromCoord && <Marker coordinate={fromCoord} title="From" />}
        {toCoord && <Marker coordinate={toCoord} title="To" />}
        {fromCoord && toCoord && (
          <Polyline
            coordinates={[fromCoord, toCoord]}
            strokeColor="#4285F4"
            strokeWidth={3}
          />
        )}

        {/* Render custom bus markers */}
        {Object.values(busLocations).map((bus) => (
          <Marker
            key={bus.deviceId}
            coordinate={{
              latitude: bus.location.lat,
              longitude: bus.location.lng,
            }}
            onPress={() => setSelectedBus(bus.deviceId)}
          >
            <View style={[styles.busMarker, { backgroundColor: getBusColor(bus.status) }]}>
              <Ionicons 
                name="bus" 
                size={24} 
                color="white" 
                style={{ transform: [{ rotate: `${bus.heading}deg` }] }}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Selected bus info panel */}
      {selectedBus && busLocations[selectedBus] && (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Bus {busLocations[selectedBus].busNumber}</Text>
          <Text style={styles.infoText}>Route: {busLocations[selectedBus].routeNumber}</Text>
          <Text style={styles.infoText}>Status: {busLocations[selectedBus].status}</Text>
          <Text style={styles.infoText}>Speed: {busLocations[selectedBus].speed.toFixed(1)} km/h</Text>
          {busLocations[selectedBus].currentStation && (
            <Text style={styles.infoText}>Current Station: {busLocations[selectedBus].currentStation.name}</Text>
          )}
          {busLocations[selectedBus].nextStation && (
            <Text style={styles.infoText}>Next Station: {busLocations[selectedBus].nextStation.name}</Text>
          )}
          {busLocations[selectedBus].eta && (
            <Text style={styles.infoText}>ETA: {busLocations[selectedBus].eta} minutes</Text>
          )}
          <Text style={styles.infoText}>
            Last update: {new Date(busLocations[selectedBus].lastUpdate).toLocaleTimeString()}
          </Text>
        </View>
      )}

      {/* Search box */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="From City"
          value={fromCity}
          onChangeText={setFromCity}
          style={styles.input}
          placeholderTextColor="#ABB5D8"
          onSubmitEditing={handleSearch}
        />
        <TextInput
          placeholder="To City"
          value={toCity}
          onChangeText={setToCity}
          style={styles.input}
          placeholderTextColor="#ABB5D8"
          onSubmitEditing={handleSearch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    position: 'absolute',
    top: 40,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#1A1D35',
    padding: 15,
    borderRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#2A2D45',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#2A2D45',
    marginBottom: 10,
    padding: 8,
    color: 'white',
  },
  infoBox: {
    position: 'absolute',
    bottom: 20,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#1A1D35',
    padding: 15,
    borderRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#2A2D45',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white',
  },
  infoText: {
    color: '#ABB5D8',
    marginBottom: 4,
  },
  busMarker: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});