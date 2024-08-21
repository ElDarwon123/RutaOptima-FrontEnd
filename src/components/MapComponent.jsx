import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

const MapComponent = () => {
    const [positions, setPositions] = useState([]);
    const mapRef = useRef(null);
    const routingControlRef = useRef(null);

    const MapEventsHandler = () => {
        useMapEvents({
            click(e) {
                const newPositions = [...positions, e.latlng];
                setPositions(newPositions);
                updateRoute(newPositions);
            }
        });
        return null;
    };

    const updateRoute = (waypoints) => {
        const map = mapRef.current;
        
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        routingControlRef.current = L.Routing.control({
            waypoints: waypoints.map(pos => L.latLng(pos.lat, pos.lng)),
            routeWhileDragging: true,
        }).addTo(map);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const json = JSON.parse(e.target.result);
            const { ubicaciones, conexiones } = json;

            const newPositions = ubicaciones.map(ubicacion => ({
                lat: ubicacion.posX,
                lng: ubicacion.posY,
                nombre: ubicacion.nombre
            }));

            setPositions(newPositions);
            updateRoute(newPositions);

            // Opcional: Si deseas trazar rutas según las conexiones en el archivo JSON
            const map = mapRef.current;

            conexiones.forEach(conn => {
                const loc1 = newPositions.find(loc => loc.nombre === conn.ubicacion1);
                const loc2 = newPositions.find(loc => loc.nombre === conn.ubicacion2);

                if (loc1 && loc2) {
                    const route = [L.latLng(loc1.lat, loc1.lng), L.latLng(loc2.lat, loc2.lng)];
                    L.Routing.control({
                        waypoints: route,
                        routeWhileDragging: true,
                    }).addTo(map);
                }
            });
        };

        if (file) {
            reader.readAsText(file);
        }
    };

    useEffect(() => {
        const map = mapRef.current;
        if (positions.length > 0 && map) {
            updateRoute(positions);
        }
    }, [positions]);

    const removeWaypoint = (indexToRemove) => {
        const updatedPositions = positions.filter((_, index) => index !== indexToRemove);
        setPositions(updatedPositions);
        updateRoute(updatedPositions);
    };

    return (
        <>
            <MapContainer
                center={[51.505, -0.09]}
                zoom={13}
                style={{ height: "80vh", width: "100%" }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {positions.map((position, idx) => (
                    <Marker key={idx} position={[position.lat, position.lng]}>
                        <Popup closeOnClick={true}>
                            <p>Nombre: {position.nombre}</p>
                            <p>Latitud: {position.lat}</p>
                            <p>Longitud: {position.lng}</p>
                            <button onClick={() => removeWaypoint(idx)}>Eliminar</button>
                        </Popup>
                    </Marker>
                ))}
                <MapEventsHandler />
            </MapContainer>
            <hr />
            <p>Ingrese archivo JSON con las ubicaciones</p>
            <input type="file" accept=".json" onChange={handleFileUpload} />
        </>
    );
};

export default MapComponent;
