import { User, LogOut, MapPin, Clock, Shield, Phone, Calendar } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function AccountView() {
  const { user, logout } = useAuth();

  const joined = user?.createdAt
    ? new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(user.createdAt))
    : "—";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 bg-background/95 backdrop-blur-md z-30 px-4 py-4 border-b border-[#2A2A2A]">
        <h1 className="text-white font-bold text-xl">Mon Compte</h1>
      </div>

      <div className="p-4 space-y-5">
        {/* Profile Card */}
        <div className="bg-[#181818] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="h-24 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
              alt="cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-black/30 to-transparent" />
          </div>
          <div className="px-4 pb-4 -mt-8 flex items-end space-x-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 border-4 border-[#181818] flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="pb-1">
              <h2 className="text-white font-bold text-base leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : "—"}
              </h2>
              <p className="text-muted-foreground text-xs">Membre depuis {joined}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="bg-[#181818] rounded-xl border border-[#2A2A2A] divide-y divide-[#2A2A2A]">
          {[
            { icon: Phone,    label: "Téléphone",  value: user?.phone ?? "—" },
            { icon: Calendar, label: "Inscrit le",  value: user?.createdAt ? new Intl.DateTimeFormat("fr-FR").format(new Date(user.createdAt)) : "—" },
            { icon: MapPin,   label: "Ville",       value: "Casablanca" },
            { icon: Clock,    label: "Support",     value: "24/7" },
            { icon: Shield,   label: "Version",     value: "v2.0" },
          ].map(item => (
            <div key={item.label} className="flex items-center px-4 py-3 space-x-3">
              <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground text-sm flex-1">{item.label}</span>
              <span className="text-white text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="bg-[#181818] rounded-xl border border-[#2A2A2A] p-4 space-y-2">
          <h3 className="text-white font-bold text-sm">À propos de Dabaji</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Dabaji est une plateforme de livraison multi-vendeurs dédiée aux villes marocaines. Commandez vos repas préférés en quelques clics.
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed text-right" dir="rtl">
            دباجي منصة توصيل متعددة البائعين مخصصة للمدن المغربية.
          </p>
        </div>

        {/* Logout */}
        <button
          data-testid="button-logout"
          onClick={() => {
            if (confirm("Voulez-vous vraiment vous déconnecter ?")) logout();
          }}
          className="w-full bg-[#181818] border border-destructive/30 text-destructive font-bold py-4 rounded-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform"
        >
          <LogOut className="w-5 h-5" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}
