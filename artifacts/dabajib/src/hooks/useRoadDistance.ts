import { useState, useEffect } from "react";
import { getRoadDistanceKm } from "../utils/distance";
import { haversineKm, getDeliveryFee } from "../utils/haversine";
import { DistanceTier } from "../store/types";

interface StoreCoords {
  storeId: string;
  lat: number;
  lng: number;
}

interface UseRoadDistanceResult {
  deliveryFee: number;
  distanceKm: number;
  isRoad: boolean;
  loading: boolean;
}

export function useRoadDistance(
  userCoords: { lat: number; lng: number } | null,
  storeCoordsList: StoreCoords[],
  tiers: DistanceTier[]
): UseRoadDistanceResult {
  const [result, setResult] = useState<UseRoadDistanceResult>({
    deliveryFee: tiers[0]?.priceDH ?? 10,
    distanceKm: 0,
    isRoad: false,
    loading: false,
  });

  useEffect(() => {
    if (!userCoords || storeCoordsList.length === 0) {
      setResult({ deliveryFee: tiers[0]?.priceDH ?? 10, distanceKm: 0, isRoad: false, loading: false });
      return;
    }

    let cancelled = false;
    setResult(prev => ({ ...prev, loading: true }));

    async function calculate() {
      if (!userCoords) return;

      // Calculate distance to each store and find the maximum
      const distances = await Promise.all(
        storeCoordsList.map(s =>
          getRoadDistanceKm(userCoords.lat, userCoords.lng, s.lat, s.lng)
        )
      );

      if (cancelled) return;

      let maxDist = 0;
      let anyRoad = false;
      distances.forEach(d => {
        if (d.distanceKm > maxDist) maxDist = d.distanceKm;
        if (d.isRoad) anyRoad = true;
      });

      const fee = getDeliveryFee(maxDist, tiers);
      setResult({ deliveryFee: fee, distanceKm: maxDist, isRoad: anyRoad, loading: false });
    }

    calculate().catch(() => {
      if (cancelled) return;
      // Ultimate fallback: Haversine on first store
      const s = storeCoordsList[0];
      if (!userCoords || !s) return;
      const d = haversineKm(userCoords.lat, userCoords.lng, s.lat, s.lng);
      setResult({ deliveryFee: getDeliveryFee(d, tiers), distanceKm: d, isRoad: false, loading: false });
    });

    return () => { cancelled = true; };
  }, [
    userCoords?.lat, userCoords?.lng,
    storeCoordsList.map(s => s.storeId).join(","),
    tiers.length
  ]);

  return result;
}
