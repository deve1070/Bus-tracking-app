import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const RealTimeMapVisualization: React.FC = () => {
  const [busLocations, setBusLocations] = useState<Record<string, BusLocation>>({});
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(import.meta.env.VITE_REACT_APP_WS_URL || 'http://localhost:3000');

    // Listen for GPS updates
    socket.on('gps-update', (data: BusLocation) => {
      setBusLocations(prev => ({
        ...prev,
        [data.deviceId]: data
      }));
    });

    // Get initial bus locations
    fetchInitialLocations();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchInitialLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bus/locations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const locations: Record<string, BusLocation> = {};
        data.forEach((bus: BusLocation) => {
          locations[bus.deviceId] = bus;
        });
        setBusLocations(locations);

        // Set map center to the first bus location if available
        const firstBus = Object.values(locations)[0];
        if (firstBus) {
          setCenter([firstBus.location.lat, firstBus.location.lng]);
        }
      }
    } catch (error) {
      console.error('Error fetching initial bus locations:', error);
    }
  };

  const getBusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-gray-600';
      case 'maintenance':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {Object.values(busLocations).map((bus) => (
          <Marker
            key={bus.deviceId}
            position={[bus.location.lat, bus.location.lng]}
            icon={L.divIcon({
              className: 'bus-marker',
              html: `<div class="bus-icon ${getBusColor(bus.status)}" style="transform: rotate(${bus.heading}deg)">🚌</div>`,
              iconSize: [30, 30],
            })}
            eventHandlers={{
              click: () => setSelectedBus(bus.deviceId)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-lg">Bus {bus.busNumber}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Route:</span> {bus.routeNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Speed:</span> {bus.speed} km/h
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>{' '}
                    <span className={getBusColor(bus.status)}>
                      {bus.status}
                    </span>
                  </p>
                  {bus.currentStation && (
                    <p className="text-sm">
                      <span className="font-medium">Current Station:</span>{' '}
                      {bus.currentStation.name}
                    </p>
                  )}
                  {bus.nextStation && (
                    <p className="text-sm">
                      <span className="font-medium">Next Station:</span>{' '}
                      {bus.nextStation.name}
                    </p>
                  )}
                  {bus.eta && (
                    <p className="text-sm">
                      <span className="font-medium">ETA:</span> {bus.eta} minutes
                    </p>
                  )}
                  {bus.distanceToNext && (
                    <p className="text-sm">
                      <span className="font-medium">Distance to Next:</span>{' '}
                      {bus.distanceToNext} meters
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Last Update: {new Date(bus.lastUpdate).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RealTimeMapVisualization; 