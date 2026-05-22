import { Store, AppConfig } from "./types";

export const DEFAULT_STORES: Store[] = [
  {
    id: "store-1", name: "Chez Hassan", category: "restaurant",
    logo: "", phone: "0612345678", rating: 4.8, ratingSum: 48, ratingCount: 10, views: 0,
    lat: 33.5731, lng: -7.5898,
    products: [
      { id: "p1", name: "Tajine de Poulet", description: "Tajine traditionnel marocain au poulet et légumes frais", price: 45, photo: "", category: "Plats", stars: 5, extras: [
        { id: "e1", name: "Sauce piquante", price: 3, type: "checkbox" },
        { id: "e2", name: "Pain supplémentaire", price: 5, type: "checkbox" }
      ]},
      { id: "p2", name: "Couscous Royal", description: "Couscous aux sept légumes et viande tendre", price: 55, photo: "", category: "Plats", stars: 5, extras: [] },
      { id: "p3", name: "Pastilla au Pigeon", description: "Pastilla feuilletée sucrée-salée, spécialité marocaine", price: 65, photo: "", category: "Spécialités", stars: 4, extras: [] }
    ]
  },
  {
    id: "store-2", name: "Pizza Medina", category: "pizza",
    logo: "", phone: "0698765432", rating: 4.5, ratingSum: 45, ratingCount: 10, views: 0,
    lat: 33.5831, lng: -7.5798,
    products: [
      { id: "p4", name: "Pizza Margherita", description: "Tomate fraîche, mozzarella fondante, basilic", price: 49, photo: "", category: "Pizzas", stars: 4, extras: [
        { id: "e3", name: "Extra fromage", price: 8, type: "checkbox" },
        { id: "e4", name: "Taille XL", price: 15, type: "radio" }
      ]},
      { id: "p5", name: "Pizza Poulet BBQ", description: "Sauce BBQ maison, poulet grillé, oignons caramélisés", price: 55, photo: "", category: "Pizzas", stars: 5, extras: [
        { id: "e5", name: "Extra fromage", price: 8, type: "checkbox" }
      ]}
    ]
  },
  {
    id: "store-3", name: "Tacos House", category: "tacos",
    logo: "", phone: "0677889900", rating: 4.7, ratingSum: 47, ratingCount: 10, views: 0,
    lat: 33.5631, lng: -7.6098,
    products: [
      { id: "p6", name: "Tacos XL Poulet", description: "Poulet croustillant, frites maison, fromage fondu", price: 45, photo: "", category: "Tacos", stars: 5, extras: [
        { id: "e6", name: "Sauce algérienne", price: 3, type: "checkbox" },
        { id: "e7", name: "Extra fromage", price: 5, type: "checkbox" }
      ]},
      { id: "p7", name: "Tacos Viande Hachée", description: "Viande hachée épicée, légumes croquants, sauce", price: 50, photo: "", category: "Tacos", stars: 4, extras: [] }
    ]
  },
  {
    id: "store-4", name: "Pharmacie du Marché", category: "pharmacy",
    logo: "", phone: "0661234567", rating: 4.9, ratingSum: 49, ratingCount: 10, views: 0,
    lat: 33.5731, lng: -7.5698,
    products: [
      { id: "p8", name: "Paracétamol 1000mg", description: "Boîte de 16 comprimés effervescents", price: 12, photo: "", category: "Médicaments", stars: 5, extras: [] },
      { id: "p9", name: "Vitamine C 500mg", description: "Boîte de 30 comprimés, immunité renforcée", price: 35, photo: "", category: "Vitamines", stars: 5, extras: [] }
    ]
  },
  {
    id: "store-5", name: "Boulangerie Malika", category: "bakery",
    logo: "", phone: "0655443322", rating: 4.6, ratingSum: 46, ratingCount: 10, views: 0,
    lat: 33.5781, lng: -7.5948,
    products: [
      { id: "p10", name: "Pain Complet", description: "Pain artisanal de blé complet, cuit au four à bois", price: 5, photo: "", category: "Pains", stars: 4, extras: [] },
      { id: "p11", name: "Msemen x6", description: "Galettes feuilletées traditionnelles dorées", price: 15, photo: "", category: "Viennoiseries", stars: 5, extras: [] },
      { id: "p12", name: "Croissant au beurre", description: "Croissant pur beurre croustillant à l'extérieur, moelleux à l'intérieur", price: 8, photo: "", category: "Viennoiseries", stars: 5, extras: [] }
    ]
  }
];

export const DEFAULT_CONFIG: AppConfig = {
  deliveryPhone1: "0771175565",
  deliveryPhone2: "0771175566",
  adminPassword: "DabaJib.2026",
  distanceTiers: [
    { minKm: 0, maxKm: 2, priceDH: 10 },
    { minKm: 2, maxKm: 5, priceDH: 15 },
    { minKm: 5, maxKm: 10, priceDH: 25 },
    { minKm: 10, maxKm: 999, priceDH: 40 }
  ],
  layoutOrder: ["categories", "featured", "stores"],
  globalExtras: [
    { id: "ge1", name: "Sauce piquante", price: 3, type: "checkbox" },
    { id: "ge2", name: "Extra fromage", price: 8, type: "checkbox" },
    { id: "ge3", name: "Sauce algérienne", price: 3, type: "checkbox" },
    { id: "ge4", name: "Sauce mayo", price: 3, type: "checkbox" },
    { id: "ge5", name: "Pain supplémentaire", price: 5, type: "checkbox" },
    { id: "ge6", name: "Taille XL", price: 15, type: "radio" },
    { id: "ge7", name: "Taille M", price: 0, type: "radio" },
    { id: "ge8", name: "Boisson incluse", price: 10, type: "checkbox" }
  ],
  productCategories: ["Plats", "Spécialités", "Pizzas", "Tacos", "Pains", "Viennoiseries", "Médicaments", "Vitamines", "Boissons", "Desserts"]
};
