import { useEffect, useRef } from "react";

export default function MapDisplay({ lat, lng, setLatLng, setAddress, interactive = false }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!window.google?.maps) return;

    const center = { lat, lng };
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 15,
      center,
    });

    // Marker setup
    markerRef.current = new window.google.maps.Marker({
      position: center,
      map,
      draggable: interactive,
    });

    if (interactive && setLatLng) {
      map.addListener("click", async (e) => {
        const clickedLatLng = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        };

        markerRef.current.setPosition(clickedLatLng);
        setLatLng(clickedLatLng);

        // 🔁 Reverse geocode if setAddress provided
        if (setAddress) {
          try {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${clickedLatLng.lat},${clickedLatLng.lng}&key=${apiKey}`
            );
            const data = await res.json();
            if (data.results[0]) {
              setAddress(data.results[0].formatted_address);
            }
          } catch (err) {
            console.error("Reverse geocoding failed:", err);
          }
        }
      });
    }

    return () => {
      window.google.maps.event.clearInstanceListeners(map);
    };
  }, [lat, lng, interactive, setLatLng, setAddress]);

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-gray-200">
      <div ref={mapRef} className="h-64 w-full" />
    </div>
  );
}
