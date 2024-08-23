import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import ButtonAppBar from './AppBar';
import AnchorTemporaryDrawer from './Drawer';
import { Button } from '@mui/material';

const MapComponent = () => {
    const [positions, setPositions] = useState([]);
    const [state, setState] = useState({ bottom: false });
    const [center, setCenter] = useState([2.4474770389145304, -76.6044044494629])
    const mapRef = useRef(null);
    const routingControlRef = useRef(null);
    const token = localStorage.getItem('token');

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

            // Si se desea trazar rutas según las conexiones en el archivo JSON
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

    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState({ ...state, [anchor]: open });
    };

    const saveLocations = async () => {

        try {
            const ubicacion = {
                nombre: "Ubicación 1",
                posX: 10.1234,
                posY: -20.5678
              };
              fetch('http://localhost:3000/api/ubicaciones', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(ubicacion)
              })
              .then(response => response.json())
              .then(data => console.log('Ubicación guardada:', data))
              .catch(error => console.error('Error:', error));
            console.log('Ubicaciones guardadas:', response.data);
        } catch (error) {
            console.error('Error al guardar ubicaciones:', error);
        }
    };

    return (
        <>
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: "80vh", width: "100%", maskRepeat: "no-repeat" }}
                ref={mapRef}
                trackResize={true}
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
            <Button variant='contained' color='success' onClick={saveLocations}>Guardar Ubicaciones</Button>
        </>
    );
};

export default MapComponent;
