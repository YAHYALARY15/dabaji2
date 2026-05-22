import {
  LayoutGrid, Utensils, Flame, ChefHat, Pizza,
  Pill, ShoppingCart, Wheat, Coffee
} from "lucide-react";

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  all: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=128&q=80",
  restaurant: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=128&q=80",
  tacos: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=128&q=80",
  shawarma: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=128&q=80",
  pizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=128&q=80",
  pharmacy: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=128&q=80",
  supermarket: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=128&q=80",
  bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=128&q=80",
  cafe: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=128&q=80",
};

export function CategoryBar({ selectedCategory, onSelectCategory }: CategoryBarProps) {
  const categories = [
    { id: "all",        label: "Tous",           icon: LayoutGrid  },
    { id: "restaurant", label: "Restaurants",    icon: Utensils    },
    { id: "tacos",      label: "Tacos",          icon: Flame       },
    { id: "shawarma",   label: "Shawarma",       icon: ChefHat     },
    { id: "pizza",      label: "Pizza",          icon: Pizza       },
    { id: "pharmacy",   label: "Pharmacie",      icon: Pill        },
    { id: "supermarket",label: "Supermarché",    icon: ShoppingCart},
    { id: "bakery",     label: "Boulangerie",    icon: Wheat       },
    { id: "cafe",       label: "Cafés",          icon: Coffee      },
  ];

  return (
    <div className="flex overflow-x-auto py-4 px-4 space-x-4 no-scrollbar">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = selectedCategory === cat.id;
        const imgUrl = CATEGORY_IMAGES[cat.id];

        return (
          <button
            key={cat.id}
            data-testid={`category-${cat.id}`}
            onClick={() => onSelectCategory(cat.id)}
            className="flex flex-col items-center flex-shrink-0 space-y-2 focus:outline-none"
          >
            <div
              className={`w-16 h-16 rounded-full overflow-hidden relative border-2 transition-all ${
                isActive ? "border-primary shadow-[0_0_12px_rgba(255,215,0,0.4)]" : "border-transparent"
              }`}
            >
              {/* Background food photo */}
              <img
                src={imgUrl}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              {/* Dark overlay */}
              <div className={`absolute inset-0 ${isActive ? "bg-black/40" : "bg-black/55"}`} />
              {/* Icon on top */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className={`w-6 h-6 drop-shadow-lg ${isActive ? "text-primary" : "text-white/90"}`} />
              </div>
            </div>
            <div className="text-center">
              <span className={`block text-[11px] font-semibold ${isActive ? "text-white" : "text-muted-foreground"}`}>
                {cat.label}
              </span>
              <span className="block text-[8px] text-primary mt-0.5 font-medium">Livraison Rapide</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
