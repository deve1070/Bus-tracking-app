import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import BusMarker from './BusMarker';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Bus {
  id: string;
  busNumber: string;
  location: {
    lat: number;
    lng: number;
  };
  eta?: number;
}

const BusTracker: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    // Fetch initial bus data
    fetchBuses();

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for bus location updates
    socket.on('bus-location-update', (data: Bus) => {
      setBuses(prevBuses => {
        const index = prevBuses.findIndex(bus => bus.id === data.id);
        if (index === -1) {
          return [...prevBuses, data];
        }
        const newBuses = [...prevBuses];
        newBuses[index] = data;
        return newBuses;
      });
    });

    return () => {
      socket.off('bus-location-update');
    };
  }, [socket]);

  const fetchBuses = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/buses`);
      const data = await response.json();
      setBuses(data);
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  };

  return (
    <div className="bus-tracker">
      <MapContainer
        center={[9.145, 40.4897]} // Ethiopia coordinates
        zoom={13}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {buses.map(bus => (
          <BusMarker
            key={bus.id}
            position={[bus.location.lat, bus.location.lng]}
            busNumber={bus.busNumber}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default BusTracker; 