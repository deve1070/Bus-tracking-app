import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface BusMarkerProps {
  position: [number, number];
  rotation?: number;
  busNumber: string;
}

const BusMarker: React.FC<BusMarkerProps> = ({ position, rotation = 0, busNumber }) => {
  const markerRef = useRef<L.Marker | null>(null);
  const iconRef = useRef<L.DivIcon | null>(null);

  useEffect(() => {
    // Create custom bus icon
    const busIcon = L.divIcon({
      className: 'custom-bus-icon',
      html: `
        <div class="bus-marker" style="transform: rotate(${rotation}deg)">
          <img src="/bus-icon.png" alt="Bus" style="width: 32px; height: 32px;" />
          <div class="bus-number">${busNumber}</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    iconRef.current = busIcon;

    // Create marker if it doesn't exist
    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon: busIcon }).addTo(map);
    } else {
      // Update existing marker
      markerRef.current.setLatLng(position);
      markerRef.current.setIcon(busIcon);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [position, rotation, busNumber]);

  return null;
};

export default BusMarker; 