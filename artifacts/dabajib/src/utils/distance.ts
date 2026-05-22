/// <reference types="@types/google.maps" />
import { haversineKm } from "./haversine";

declare global {
  interface Window {
    __googleMapsLoaded?: boolean;
    __googleMapsLoading?: boolean;
    __googleMapsCallbacks?: (() => void)[];
  }
}

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.__googleMapsLoaded) { resolve(); return; }
    if (!MAPS_API_KEY) { reject(new Error("No API key")); return; }

    if (window.__googleMapsLoading) {
      window.__googleMapsCallbacks = window.__googleMapsCallbacks ?? [];
      window.__googleMapsCallbacks.push(resolve);
      return;
    }

    window.__googleMapsLoading = true;
    window.__googleMapsCallbacks = [resolve];

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.__googleMapsLoaded = true;
      window.__googleMapsLoading = false;
      (window.__googleMapsCallbacks ?? []).forEach(cb => cb());
      window.__googleMapsCallbacks = [];
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

export async function getRoadDistanceKm(
  userLat: number, userLng: number,
  storeLat: number, storeLng: number
): Promise<{ distanceKm: number; isRoad: boolean }> {
  if (!MAPS_API_KEY) {
    return { distanceKm: haversineKm(userLat, userLng, storeLat, storeLng), isRoad: false };
  }

  try {
    await loadGoogleMapsScript();

    return new Promise((resolve) => {
      const service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [new google.maps.LatLng(userLat, userLng)],
          destinations: [new google.maps.LatLng(storeLat, storeLng)],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (
            status === google.maps.DistanceMatrixStatus.OK &&
            response &&
            response.rows[0]?.elements[0]?.status === "OK"
          ) {
            const meters = response.rows[0].elements[0].distance.value;
            resolve({ distanceKm: meters / 1000, isRoad: true });
          } else {
            resolve({
              distanceKm: haversineKm(userLat, userLng, storeLat, storeLng),
              isRoad: false,
            });
          }
        }
      );
    });
  } catch {
    return { distanceKm: haversineKm(userLat, userLng, storeLat, storeLng), isRoad: false };
  }
}

export { haversineKm };
