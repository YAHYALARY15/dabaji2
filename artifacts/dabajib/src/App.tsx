import { useState, useEffect } from "react";
import { FeedView } from "./views/FeedView";
import { FavoritesView } from "./views/FavoritesView";
import { CartView } from "./views/CartView";
import { AccountView } from "./views/AccountView";
import { SupportView } from "./views/SupportView";
import { AuthView } from "./views/AuthView";
import { BottomNav } from "./components/BottomNav";
import { AdminPanel } from "./components/AdminPanel";
import { useAppConfig } from "./hooks/useAppConfig";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";

function AppShell() {
  const [currentView, setCurrentView] = useState("feed");
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { config } = useAppConfig();
  const { user, loading } = useAuth();

// Keep Backend Alive
useEffect(() => {
  const backendUrl = import.meta.env.VITE_API_URL;
  if (!backendUrl) return;
  
  const ping = () => {
    fetch(`${backendUrl}/health`).catch(() => {});
  };
  
  ping();
  const interval = setInterval(ping, 25 * 60 * 1000);
  
  return () => clearInterval(interval);
}, []);
  useEffect(() => {
    try {
      const visitors = JSON.parse(localStorage.getItem("dabajib_visitors") || "[]");
      visitors.push({ date: new Date().toISOString() });
      localStorage.setItem("dabajib_visitors", JSON.stringify(visitors));
    } catch {}
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-primary font-black text-4xl italic">Dabaji</h1>
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  const handleAdminTrigger = () => {
    if (localStorage.getItem("dabajib_admin_unlocked") === "true") {
      setShowAdmin(true);
    } else {
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === config.adminPassword) {
      localStorage.setItem("dabajib_admin_unlocked", "true");
      setShowPasswordModal(false);
      setShowAdmin(true);
      setPasswordInput("");
      setPasswordError("");
    } else {
      setPasswordError("Mot de passe incorrect");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative min-h-[100dvh] bg-background text-foreground shadow-2xl overflow-hidden">
      {currentView === "feed"      && <FeedView onAdminTrigger={handleAdminTrigger} />}
      {currentView === "favorites" && <FavoritesView />}
      {currentView === "cart"      && <CartView />}
      {currentView === "account"   && <AccountView />}
      {currentView === "support"   && <SupportView />}

      <BottomNav currentView={currentView} onChangeView={setCurrentView} />

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-xl w-full max-w-xs">
            <h3 className="text-white font-bold text-lg mb-4 text-center">Accès Admin</h3>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                autoFocus
                placeholder="Mot de passe"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-white focus:outline-none focus:border-primary mb-2"
              />
              {passwordError && <p className="text-destructive text-xs mb-4 text-center">{passwordError}</p>}
              <div className="flex space-x-3 mt-4">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 bg-[#2A2A2A] text-white py-2 rounded-lg font-medium">Annuler</button>
                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-bold">Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
