import { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { Button } from "@mui/material";

const MapComponent = () => {
  const [positions, setPositions] = useState([]);
  const [jsonContent, setJsonContent] = useState(null);
  const [center, setCenter] = useState([2.4474770389145304, -76.6044044494629]);
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const token = localStorage.getItem("token");

  const handleMapClick = (e) => {
    const clickedOnMarker = positions.some((pos) =>
      L.latLng(pos.lat, pos.lng).equals(e.latlng)
    );

    if (!clickedOnMarker) {
      const newPositions = [...positions, e.latlng];
      setPositions(newPositions);
      updateRoute(newPositions);
    }
  };

  const MapEventsHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  const updateRoute = (waypoints) => {
    const map = mapRef.current;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    routingControlRef.current = L.Routing.control({
      waypoints: waypoints.map((pos) => L.latLng(pos.lat, pos.lng)),
      routeWhileDragging: true,
    }).addTo(map);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const json = JSON.parse(e.target.result);
      setJsonContent(json);

      const { ubicaciones, conexiones } = json;

      const newPositions = ubicaciones.map((ubicacion) => ({
        lat: ubicacion.posX,
        lng: ubicacion.posY,
        nombre: ubicacion.nombre,
      }));

      setPositions(newPositions);
      updateRoute(newPositions);

      const map = mapRef.current;

      conexiones.forEach((conn) => {
        const loc1 = newPositions.find((loc) => loc.nombre === conn.ubicacion1);
        const loc2 = newPositions.find((loc) => loc.nombre === conn.ubicacion2);

        if (loc1 && loc2) {
          const route = [
            L.latLng(loc1.lat, loc1.lng),
            L.latLng(loc2.lat, loc2.lng),
          ];
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

  const removeWaypoint = (indexToRemove, e) => {
    L.DomEvent.stopPropagation(e); 
    const updatedPositions = positions.filter(
      (_, index) => index !== indexToRemove
    );
    setPositions(updatedPositions);
    updateRoute(updatedPositions);
  };

  const saveLocations = async () => {
    try {
      const locationPromises = positions.map((position, idx) => {
        const ubicacion = {
          nombre: `Ubicacion ${idx + 1}`,
          posX: position.lat,
          posY: position.lng,
        };
        return fetch("http://localhost:3000/api/ubicaciones", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(ubicacion),
        });
      });

      const responses = await Promise.all(locationPromises);
      responses.forEach((response) =>
        response.json().then((data) => console.log("Ubicación guardada:", data))
      );
    } catch (error) {
      console.error("Error al guardar ubicaciones:", error);
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
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {positions.map((position, idx) => (
          <Marker key={idx} position={[position.lat, position.lng]}>
            <Popup closeOnClick={true}>
              <p>Nombre: {position.nombre}</p>
              <p>Latitud: {position.lat}</p>
              <p>Longitud: {position.lng}</p>
              <button onClick={(e) => removeWaypoint(idx, e)}>Eliminar</button>
            </Popup>
          </Marker>
        ))}
        <MapEventsHandler />
      </MapContainer>
      <hr />
      <p>Ingrese archivo JSON con las ubicaciones</p>
      <input type="file" accept=".json" onChange={handleFileUpload} />
      <Button variant="contained" color="success" onClick={saveLocations}>
        Guardar Ubicaciones
      </Button>
      <hr />
      {jsonContent && (
        <div>
          <h3>Contenido del JSON:</h3>
          <pre>{JSON.stringify(jsonContent, null, 2)}</pre>
        </div>
      )}
    </>
  );
};

export default MapComponent;
