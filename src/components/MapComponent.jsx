import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L, { control } from 'leaflet';
import 'leaflet-routing-machine';

const MapComponent = () => {
    const [positions, setPositions] = useState([]);
    const mapRef = useRef(null);
    const routingRef = useRef(null);

    const MapEventsHandler = () => {
        useMapEvents({
            click(e) {
                const newPositions = [...positions, e.latlng]
                setPositions(newPositions)

                if (newPositions) {
                    const map = e.target
                    L.Routing.control({
                        waypoints: newPositions.map(pos => L.latLng(pos.lat, pos.lng)),
                        routeWhileDragging: true
                    }).addTo(map)
                }
            }
        })
        return null
    }

    const updateRoute = (waypoints) => {
        const mapa = L.map('mapId').setView([51.505, -0.09], 13)
        const map = mapRef.current;
        const contr = L.Routing.control({
            waypoints: [
                L.latLng(51.5, -0.09),
                L.latLng(51.51, -0.1)
              ],
            routeWhileDragging: true
        }).addTo(mapa)
        
        if (mapa && contr) {
            if (routingRef.current) {
                map.removeControl(routingRef.current);
                
            }
            routingRef.current = L.Routing.control({
                waypoints: waypoints.map(pos => L.latLng(pos.lat, pos.lng)),
                routeWhileDragging: true,
            }).addTo(map);
            
        }
    };
    const removeWaypoint = (indexToRemove) => {
        setPositions((prevWaypoints) => {
            const updatedWaypoints = prevWaypoints.filter((_, index) => index !== indexToRemove);

            updateRoute(updatedWaypoints);

            return updatedWaypoints;
        });
    };

    return (
        <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            style={{ height: "100vh", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {positions.map((position, idx) => (
                <Marker key={idx} position={position}>
                    <Popup closeOnClick:true>
                        <p>Latitud: {position.lat}</p>
                        <p>Longitud: {position.lng}</p>
                        <button onClick={() => removeWaypoint(idx)}>Eliminar</button>
                    </Popup>
                </Marker>
            ))}
            <MapEventsHandler />
        </MapContainer>
    );
};

export default MapComponent;
