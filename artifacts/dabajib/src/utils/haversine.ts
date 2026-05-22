export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export function getDeliveryFee(distanceKm: number, tiers: { minKm: number; maxKm: number; priceDH: number }[]): number {
  const sorted = [...tiers].sort((a, b) => a.minKm - b.minKm);
  const tier = sorted.find(t => distanceKm >= t.minKm && distanceKm < t.maxKm);
  return tier ? tier.priceDH : (sorted[sorted.length - 1]?.priceDH ?? 40);
}
