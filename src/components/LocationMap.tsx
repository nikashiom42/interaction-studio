import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface Location {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}

interface LocationMapProps {
  locations: Location[];
  selectedLocationId?: string;
  onLocationSelect?: (locationId: string) => void;
}

// Component to update map view when selection changes
const MapController = ({ selectedLocation }: { selectedLocation?: Location }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.setView([selectedLocation.lat, selectedLocation.lng], 13, {
        animate: true,
      });
    }
  }, [selectedLocation, map]);

  return null;
};

const LocationMap = ({ locations, selectedLocationId, onLocationSelect }: LocationMapProps) => {
  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);

  // Center map on Georgia (Tbilisi area)
  const center: [number, number] = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : [41.7151, 44.8271]; // Tbilisi coordinates

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={selectedLocation ? 13 : 8}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController selectedLocation={selectedLocation} />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            eventHandlers={{
              click: () => {
                onLocationSelect?.(location.id);
              },
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-foreground">{location.name}</div>
                <div className="text-muted-foreground">{location.city}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LocationMap;
