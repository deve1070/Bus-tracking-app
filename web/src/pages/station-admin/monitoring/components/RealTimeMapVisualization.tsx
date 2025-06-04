import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
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
}

const RealTimeMapVisualization: React.FC = () => {
  const mapRef = useRef<L.Map>(null);
  const [busLocations, setBusLocations] = React.useState<Record<string, BusLocation>>({});
  const [center, setCenter] = React.useState<[number, number]>([9.0302, 38.7625]); // Default to Addis Ababa

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(import.meta.env.VITE_REACT_APP_WS_URL || 'http://localhost:3000');

    // Listen for bus location updates
    socket.on('busLocationUpdate', (data: BusLocation[]) => {
      const newBusLocations: Record<string, BusLocation> = {};
      data.forEach(bus => {
        newBusLocations[bus.deviceId] = bus;
      });
      setBusLocations(newBusLocations);

      // Update map center if we have bus locations
      if (data.length > 0) {
        const firstBus = data[0];
        setCenter([firstBus.location.lat, firstBus.location.lng]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {Object.values(busLocations).map((bus) => (
        <Marker
          key={bus.deviceId}
          position={[bus.location.lat, bus.location.lng]}
          icon={icon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{bus.busNumber}</h3>
              <p className="text-sm text-gray-600">Route: {bus.routeNumber}</p>
              <p className="text-sm text-gray-600">Speed: {bus.speed.toFixed(1)} km/h</p>
              <p className="text-sm text-gray-600">Status: {bus.status}</p>
              <p className="text-sm text-gray-600">
                Last Update: {new Date(bus.lastUpdate).toLocaleTimeString()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default RealTimeMapVisualization; 