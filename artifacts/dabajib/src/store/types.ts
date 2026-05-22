export interface GlobalExtra {
  id: string;
  name: string;
  price: number;
  type: "checkbox" | "radio";
}

export interface Extra {
  id: string;
  name: string;
  price: number;
  type: "checkbox" | "radio";
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  photo: string;
  category: string;
  stars: number;
  extras: Extra[];
}

export interface Store {
  id: string;
  name: string;
  category: string;
  logo: string;
  phone: string;
  rating: number;
  ratingSum: number;
  ratingCount: number;
  views: number;
  lat: number;
  lng: number;
  products: Product[];
}

export interface CartItem {
  storeId: string;
  storeName: string;
  storePhone: string;
  productId: string;
  productName: string;
  basePrice: number;
  selectedExtras: { id: string; name: string; price: number }[];
  quantity: number;
  totalPrice: number;
  note: string;
}

export interface DistanceTier {
  minKm: number;
  maxKm: number;
  priceDH: number;
}

export interface AppConfig {
  deliveryPhone1: string;
  deliveryPhone2: string;
  adminPassword: string;
  distanceTiers: DistanceTier[];
  layoutOrder: string[];
  globalExtras: GlobalExtra[];
  productCategories: string[];
}

export interface OrderRecord {
  id: string;
  timestamp: string;
  storeName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}
