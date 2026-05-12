import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/**
 * RouteMap Component
 * Displays a Leaflet map with an activity route
 */
function RouteMap({ coordinates, height = "300px" }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) return;

    // Initialize map if not already created
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [coordinates[0].lat, coordinates[0].lng],
        13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing layers (except tile layer)
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Create route polyline
    const latLngs = coordinates.map((coord) => [coord.lat, coord.lng]);
    const polyline = L.polyline(latLngs, {
      color: "#fc4c02", // Strava orange
      weight: 4,
      opacity: 0.8,
    }).addTo(map);

    // Add start marker
    L.marker([coordinates[0].lat, coordinates[0].lng])
      .bindPopup("<b>Start</b>")
      .addTo(map);

    // Add finish marker
    const finish = coordinates[coordinates.length - 1];
    L.marker([finish.lat, finish.lng])
      .bindPopup("<b>Finish</b>")
      .addTo(map);

    // Fit map to route bounds
    map.fitBounds(polyline.getBounds(), { padding: [20, 20] });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coordinates]);

  if (!coordinates || coordinates.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        No GPS data available for this activity
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden",
      }}
      className="border"
    />
  );
}

RouteMap.propTypes = {
  coordinates: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    })
  ),
  height: PropTypes.string,
};

export default RouteMap;
