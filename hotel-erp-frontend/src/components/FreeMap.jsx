import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import L from 'leaflet';
import { Spin } from 'antd';

// Fix for default Leaflet marker icon not showing up properly in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const RoutingMachine = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      show: true,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: "#1890ff", weight: 6 }]
      },
      createMarker: function(i, wp, nWps) {
        if (i === 0) {
          // start marker
          return L.marker(wp.latLng, {
            icon: L.divIcon({
               className: 'custom-div-icon',
               html: "<div style='background-color:#1890ff; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);'></div>",
               iconSize: [16, 16],
               iconAnchor: [8, 8]
            })
          }).bindPopup("Vị trí của bạn");
        }
        if (i === nWps - 1) {
          // end marker: we return null to avoid duplicating the existing static marker
          return null; 
        }
      }
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, start, end]);

  return null;
};

const FreeMap = ({ lat, lng, title }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLocating(false);
        },
        (error) => {
          console.warn("Could not get user location:", error);
          setLocating(false);
        }
      );
    } else {
      setLocating(false);
    }
  }, []);

  if (!lat || !lng) return <p>Chưa có dữ liệu bản đồ cho địa điểm này.</p>;

  const destPosition = [lat, lng];

  return (
    <div style={{ height: '450px', width: '100%', borderRadius: '8px', overflow: 'hidden', zIndex: 1, position: 'relative' }}>
      {locating && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Spin size="large" />
          <p style={{ marginTop: 10, color: '#1890ff', fontWeight: 500 }}>Đang định vị để tìm đường...</p>
        </div>
      )}
      <MapContainer 
        center={destPosition} 
        zoom={userLocation ? 13 : 15} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={destPosition}>
          <Popup>
            <strong>{title}</strong>
          </Popup>
        </Marker>

        {userLocation && <RoutingMachine start={userLocation} end={destPosition} />}
      </MapContainer>
    </div>
  );
};

export default FreeMap;
