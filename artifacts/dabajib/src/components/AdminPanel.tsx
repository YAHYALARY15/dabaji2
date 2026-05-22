import { useState } from "react";
import {
  Lock, X, Activity, Store as StoreIcon, Settings, Route,
  Layout, Trash2, Plus, ChevronUp, ChevronDown, Edit2, Check, Package, Zap
} from "lucide-react";
import { useStores } from "../hooks/useStores";
import { useAppConfig } from "../hooks/useAppConfig";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { OrderRecord, Store, Product, GlobalExtra } from "../store/types";

interface AdminPanelProps {
  onClose: () => void;
}

function InputField({ label, value, onChange, type = "text", placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-2 text-white text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("analytics");
  const { stores, addStore, updateStore, deleteStore, deleteProductFromStore, deleteExtraFromProduct, resetAllViews } = useStores();
  const { config, setConfig } = useAppConfig();
  const [orders, setOrders] = useLocalStorage<OrderRecord[]>("dabajib_orders", []);
  const [visitors] = useLocalStorage<{ date: string }[]>("dabajib_visitors", []);

  const [purgeConfirm, setPurgeConfirm] = useState("");
  const [analyticsFilter, setAnalyticsFilter] = useState<"7" | "30">("7");

  // Store add form
  const [showAddStore, setShowAddStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreCategory, setNewStoreCategory] = useState("restaurant");
  const [newStorePhone, setNewStorePhone] = useState("");
  const [newStoreLat, setNewStoreLat] = useState("33.5731");
  const [newStoreLng, setNewStoreLng] = useState("-7.5898");
  const [newStoreLogo, setNewStoreLogo] = useState("");

  // Store edit state
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // Product add form per store
  const [addingProductStoreId, setAddingProductStoreId] = useState<string | null>(null);
  const [newProdName, setNewProdName] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCat, setNewProdCat] = useState("");
  const [newProdStars, setNewProdStars] = useState("5");
  const [newProdPhoto, setNewProdPhoto] = useState("");
  const [newProdSelectedExtras, setNewProdSelectedExtras] = useState<string[]>([]);

  // Global extras form
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  const [newExtraType, setNewExtraType] = useState<"checkbox" | "radio">("checkbox");

  // Product categories form
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Distance tiers form
  const [showAddTier, setShowAddTier] = useState(false);
  const [tierMin, setTierMin] = useState("");
  const [tierMax, setTierMax] = useState("");
  const [tierPrice, setTierPrice] = useState("");

  // WhatsApp config
  const [phone1, setPhone1] = useState(config.deliveryPhone1);
  const [phone2, setPhone2] = useState(config.deliveryPhone2);
  const [adminPwd, setAdminPwd] = useState("");

  // Analytics calculations
  const now = new Date();
  const filterDays = analyticsFilter === "7" ? 7 : 30;
  const cutoff = new Date(now.getTime() - filterDays * 24 * 60 * 60 * 1000);
  const filteredOrders = orders.filter(o => new Date(o.timestamp) >= cutoff);
  const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.deliveryFee, 0);
  const filteredVisitors = visitors.filter(v => new Date(v.date) >= cutoff);
  const totalViews = stores.reduce((acc, s) => acc + s.views, 0);

  const handlePurge = () => {
    if (purgeConfirm === "CONFIRMER") {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("dabajib_")) localStorage.removeItem(key);
      });
      window.location.reload();
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewStoreLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProdPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewProdPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    const store: Store = {
      id: "store-" + Date.now(),
      name: newStoreName,
      category: newStoreCategory,
      phone: newStorePhone,
      lat: parseFloat(newStoreLat),
      lng: parseFloat(newStoreLng),
      logo: newStoreLogo,
      rating: 0,
      ratingSum: 0,
      ratingCount: 0,
      views: 0,
      products: []
    };
    addStore(store);
    setShowAddStore(false);
    setNewStoreName(""); setNewStoreCategory("restaurant"); setNewStorePhone("");
    setNewStoreLat("33.5731"); setNewStoreLng("-7.5898"); setNewStoreLogo("");
  };

  const handleSaveEditStore = () => {
    if (editingStore) {
      updateStore(editingStore);
      setEditingStore(null);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingProductStoreId) return;
    const store = stores.find(s => s.id === addingProductStoreId);
    if (!store) return;
    const selectedExtras = config.globalExtras.filter(ge => newProdSelectedExtras.includes(ge.id));
    const product: Product = {
      id: "prod-" + Date.now(),
      name: newProdName,
      description: newProdDesc,
      price: parseFloat(newProdPrice) || 0,
      category: newProdCat,
      stars: parseInt(newProdStars, 10),
      photo: newProdPhoto,
      extras: selectedExtras
    };
    updateStore({ ...store, products: [...store.products, product] });
    setAddingProductStoreId(null);
    setNewProdName(""); setNewProdDesc(""); setNewProdPrice("");
    setNewProdCat(""); setNewProdStars("5"); setNewProdPhoto("");
    setNewProdSelectedExtras([]);
  };

  const toggleProdExtra = (extraId: string) => {
    setNewProdSelectedExtras(prev =>
      prev.includes(extraId) ? prev.filter(id => id !== extraId) : [...prev, extraId]
    );
  };

  const handleAddGlobalExtra = (e: React.FormEvent) => {
    e.preventDefault();
    const extra: GlobalExtra = {
      id: "ge-" + Date.now(),
      name: newExtraName,
      price: parseFloat(newExtraPrice) || 0,
      type: newExtraType
    };
    setConfig({ ...config, globalExtras: [...config.globalExtras, extra] });
    setShowAddExtra(false);
    setNewExtraName(""); setNewExtraPrice(""); setNewExtraType("checkbox");
  };

  const handleDeleteGlobalExtra = (id: string) => {
    setConfig({ ...config, globalExtras: config.globalExtras.filter(e => e.id !== id) });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setConfig({ ...config, productCategories: [...config.productCategories, newCatName.trim()] });
    setShowAddCat(false);
    setNewCatName("");
  };

  const handleDeleteCategory = (cat: string) => {
    setConfig({ ...config, productCategories: config.productCategories.filter(c => c !== cat) });
  };

  const handleAddTier = (e: React.FormEvent) => {
    e.preventDefault();
    const tier = { minKm: parseFloat(tierMin), maxKm: parseFloat(tierMax), priceDH: parseFloat(tierPrice) };
    const sorted = [...config.distanceTiers, tier].sort((a, b) => a.minKm - b.minKm);
    setConfig({ ...config, distanceTiers: sorted });
    setShowAddTier(false);
    setTierMin(""); setTierMax(""); setTierPrice("");
  };

  const handleDeleteTier = (idx: number) => {
    setConfig({ ...config, distanceTiers: config.distanceTiers.filter((_, i) => i !== idx) });
  };

  const handleSavePhones = () => {
    setConfig({ ...config, deliveryPhone1: phone1, deliveryPhone2: phone2 });
  };

  const handleSavePassword = () => {
    if (adminPwd.trim()) setConfig({ ...config, adminPassword: adminPwd.trim() });
  };

  const moveLayout = (index: number, dir: -1 | 1) => {
    const arr = [...config.layoutOrder];
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]];
    setConfig({ ...config, layoutOrder: arr });
  };

  const tabs = [
    { id: "analytics", icon: Activity, label: "Stats" },
    { id: "stores", icon: StoreIcon, label: "Boutiques" },
    { id: "extras", icon: Package, label: "Extras" },
    { id: "categories", icon: Zap, label: "Catégories" },
    { id: "config", icon: Settings, label: "Config" },
    { id: "tiers", icon: Route, label: "Tarifs" },
    { id: "layout", icon: Layout, label: "Interface" },
    { id: "purge", icon: Trash2, label: "Purge" },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/98 text-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A] bg-[#0E0E0E]">
        <div className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-lg">Panneau Développeur</h1>
        </div>
        <button data-testid="button-close-admin" onClick={onClose} className="p-2 bg-[#1E1E1E] rounded-full hover:bg-[#2A2A2A]">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-20 border-r border-[#2A2A2A] bg-[#0E0E0E] overflow-y-auto flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              data-testid={`button-admin-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex flex-col items-center justify-center py-3 space-y-1 border-b border-[#2A2A2A] transition-colors ${
                activeTab === tab.id ? "bg-[#1E1E1E] text-primary" : "text-muted-foreground hover:bg-[#181818]"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[8px] font-bold uppercase leading-none text-center">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── ANALYTICS ── */}
          {activeTab === "analytics" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Statistiques</h2>
                <div className="flex rounded-lg overflow-hidden border border-[#2A2A2A]">
                  <button onClick={() => setAnalyticsFilter("7")} className={`px-3 py-1.5 text-xs font-bold ${analyticsFilter === "7" ? "bg-primary text-primary-foreground" : "bg-[#181818] text-muted-foreground"}`}>7 jours</button>
                  <button onClick={() => setAnalyticsFilter("30")} className={`px-3 py-1.5 text-xs font-bold ${analyticsFilter === "30" ? "bg-primary text-primary-foreground" : "bg-[#181818] text-muted-foreground"}`}>30 jours</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Commandes", value: filteredOrders.length },
                  { label: "Revenus livraison", value: `${totalRevenue.toFixed(0)} DH` },
                  { label: "Visiteurs", value: filteredVisitors.length },
                  { label: "Vues boutiques", value: totalViews },
                  { label: "Boutiques", value: stores.length },
                  { label: "Produits", value: stores.reduce((a, s) => a + s.products.length, 0) },
                ].map(stat => (
                  <div key={stat.label} className="bg-[#181818] p-3 rounded-xl border border-[#2A2A2A]">
                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-primary mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              <button
                data-testid="button-reset-stats"
                onClick={() => {
                  if (confirm("Réinitialiser toutes les vues et statistiques à zéro ?")) {
                    resetAllViews();
                    setOrders([]);
                  }
                }}
                className="w-full bg-[#1E1E1E] border border-destructive/40 text-destructive font-bold py-3 rounded-xl text-sm"
              >
                Réinitialiser toutes les statistiques à zéro
              </button>

              <div className="bg-[#181818] rounded-xl border border-[#2A2A2A] p-3">
                <h3 className="text-sm font-bold mb-2">Classement des boutiques (vues)</h3>
                {[...stores].sort((a, b) => b.views - a.views).map(s => (
                  <div key={s.id} className="flex justify-between items-center py-1.5 border-b border-[#2A2A2A] last:border-0">
                    <span className="text-sm text-white">{s.name}</span>
                    <span className="text-primary font-bold text-sm">{s.views} vues</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STORES ── */}
          {activeTab === "stores" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Boutiques ({stores.length})</h2>
                <button
                  data-testid="button-add-store"
                  onClick={() => setShowAddStore(!showAddStore)}
                  className="flex items-center space-x-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </button>
              </div>

              {/* Add store form */}
              {showAddStore && (
                <form onSubmit={handleAddStore} className="bg-[#181818] rounded-xl p-4 border border-primary/40 space-y-3">
                  <h3 className="font-bold text-sm text-primary">Nouvelle Boutique</h3>
                  <InputField label="Nom du magasin" value={newStoreName} onChange={setNewStoreName} />
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Catégorie</label>
                    <select value={newStoreCategory} onChange={e => setNewStoreCategory(e.target.value)} className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-2 text-white text-sm">
                      {["restaurant","tacos","pizza","pharmacy","bakery","supermarket","cafe","shawarma"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <InputField label="Téléphone (WhatsApp)" value={newStorePhone} onChange={setNewStorePhone} />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label="Latitude" value={newStoreLat} onChange={setNewStoreLat} placeholder="33.5731" />
                    <InputField label="Longitude" value={newStoreLng} onChange={setNewStoreLng} placeholder="-7.5898" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Logo</label>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground" />
                    {newStoreLogo && <img src={newStoreLogo} className="mt-2 w-12 h-12 rounded-lg object-cover border border-[#2A2A2A]" />}
                  </div>
                  <div className="flex space-x-2 pt-1">
                    <button type="button" onClick={() => setShowAddStore(false)} className="flex-1 bg-[#2A2A2A] text-white py-2 rounded-lg text-sm font-bold">Annuler</button>
                    <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-bold">Créer</button>
                  </div>
                </form>
              )}

              {/* Store list */}
              {stores.map(s => (
                <div key={s.id} className="bg-[#181818] rounded-xl border border-[#2A2A2A] overflow-hidden">
                  {editingStore?.id === s.id ? (
                    <div className="p-3 space-y-2">
                      <InputField label="Nom" value={editingStore.name} onChange={v => setEditingStore({ ...editingStore, name: v })} />
                      <InputField label="Téléphone" value={editingStore.phone} onChange={v => setEditingStore({ ...editingStore, phone: v })} />
                      <div className="grid grid-cols-2 gap-2">
                        <InputField label="Lat" value={String(editingStore.lat)} onChange={v => setEditingStore({ ...editingStore, lat: parseFloat(v) || 0 })} />
                        <InputField label="Lng" value={String(editingStore.lng)} onChange={v => setEditingStore({ ...editingStore, lng: parseFloat(v) || 0 })} />
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => setEditingStore(null)} className="flex-1 bg-[#2A2A2A] py-2 rounded text-sm font-bold">Annuler</button>
                        <button onClick={handleSaveEditStore} className="flex-1 bg-primary text-primary-foreground py-2 rounded text-sm font-bold flex items-center justify-center space-x-1">
                          <Check className="w-4 h-4" /><span>Sauvegarder</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {s.logo ? <img src={s.logo} className="w-8 h-8 rounded-full object-cover" /> : (
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{s.name.charAt(0)}</div>
                            )}
                            <div>
                              <p className="font-bold text-sm">{s.name}</p>
                              <p className="text-[10px] text-muted-foreground">{s.category} • {s.phone} • {s.views} vues</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button data-testid={`button-edit-store-${s.id}`} onClick={() => setEditingStore({ ...s })} className="p-1.5 bg-[#2A2A2A] rounded text-muted-foreground hover:text-primary">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button data-testid={`button-delete-store-${s.id}`} onClick={() => { if (confirm(`Supprimer "${s.name}" ?`)) deleteStore(s.id); }} className="p-1.5 bg-[#2A2A2A] rounded text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Products section */}
                  <div className="border-t border-[#2A2A2A]">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{s.products.length} Produits</span>
                      <button
                        data-testid={`button-add-product-${s.id}`}
                        onClick={() => { setAddingProductStoreId(addingProductStoreId === s.id ? null : s.id); setNewProdCat(config.productCategories[0] ?? ""); }}
                        className="text-[10px] text-primary font-bold flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Ajouter produit</span>
                      </button>
                    </div>

                    {addingProductStoreId === s.id && (
                      <form onSubmit={handleAddProduct} className="px-3 pb-3 space-y-2 bg-[#121212]">
                        <InputField label="Nom du produit" value={newProdName} onChange={setNewProdName} />
                        <InputField label="Description" value={newProdDesc} onChange={setNewProdDesc} />
                        <div className="grid grid-cols-2 gap-2">
                          <InputField label="Prix (DH)" value={newProdPrice} onChange={setNewProdPrice} type="number" />
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Catégorie</label>
                            <select value={newProdCat} onChange={e => setNewProdCat(e.target.value)} className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded p-2 text-white text-xs">
                              {config.productCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Étoiles (1-5)</label>
                          <select value={newProdStars} onChange={e => setNewProdStars(e.target.value)} className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded p-2 text-white text-xs">
                            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Photo</label>
                          <input type="file" accept="image/*" onChange={handleProdPhotoUpload} className="w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#2A2A2A] file:text-white" />
                          {newProdPhoto && <img src={newProdPhoto} className="mt-1 w-10 h-10 rounded object-cover" />}
                        </div>
                        {config.globalExtras.length > 0 && (
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Suppléments (sélectionner)</label>
                            <div className="flex flex-wrap gap-1.5">
                              {config.globalExtras.map(ge => (
                                <button
                                  key={ge.id}
                                  type="button"
                                  onClick={() => toggleProdExtra(ge.id)}
                                  className={`text-[10px] px-2 py-1 rounded-full border font-medium transition-colors ${
                                    newProdSelectedExtras.includes(ge.id)
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-[#1E1E1E] text-muted-foreground border-[#2A2A2A]"
                                  }`}
                                >
                                  {ge.name} +{ge.price} DH
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex space-x-2 pt-1">
                          <button type="button" onClick={() => setAddingProductStoreId(null)} className="flex-1 bg-[#2A2A2A] py-2 rounded text-xs font-bold">Annuler</button>
                          <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2 rounded text-xs font-bold">Ajouter</button>
                        </div>
                      </form>
                    )}

                    {s.products.map(p => (
                      <div key={p.id} className="flex items-start justify-between px-3 py-2 border-t border-[#1A1A1A]">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-white">{p.name} — <span className="text-primary">{p.price} DH</span></p>
                          <p className="text-[9px] text-muted-foreground">{p.category}</p>
                          {p.extras.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.extras.map(e => (
                                <span key={e.id} className="text-[8px] bg-[#2A2A2A] text-muted-foreground px-1.5 py-0.5 rounded-full flex items-center space-x-1">
                                  <span>{e.name} +{e.price}DH</span>
                                  <button
                                    data-testid={`button-delete-extra-${e.id}`}
                                    onClick={() => deleteExtraFromProduct(s.id, p.id, e.id)}
                                    className="text-destructive/70 hover:text-destructive ml-0.5"
                                  >×</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          data-testid={`button-delete-product-${p.id}`}
                          onClick={() => { if (confirm(`Supprimer "${p.name}" ?`)) deleteProductFromStore(s.id, p.id); }}
                          className="ml-2 p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── GLOBAL EXTRAS ── */}
          {activeTab === "extras" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Suppléments Globaux</h2>
                <button data-testid="button-add-extra" onClick={() => setShowAddExtra(!showAddExtra)} className="flex items-center space-x-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold">
                  <Plus className="w-3.5 h-3.5" /><span>Ajouter</span>
                </button>
              </div>
              <p className="text-muted-foreground text-xs">Ces suppléments sont disponibles à la sélection lors de la création d'un produit.</p>

              {showAddExtra && (
                <form onSubmit={handleAddGlobalExtra} className="bg-[#181818] rounded-xl p-4 border border-primary/40 space-y-3">
                  <InputField label="Nom du supplément" value={newExtraName} onChange={setNewExtraName} placeholder="Ex: Extra fromage" />
                  <InputField label="Prix (DH)" value={newExtraPrice} onChange={setNewExtraPrice} type="number" placeholder="0.00" />
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Type</label>
                    <select value={newExtraType} onChange={e => setNewExtraType(e.target.value as "checkbox" | "radio")} className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-2 text-white text-sm">
                      <option value="checkbox">Checkbox (choix multiple)</option>
                      <option value="radio">Radio (choix unique)</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setShowAddExtra(false)} className="flex-1 bg-[#2A2A2A] py-2 rounded text-sm font-bold">Annuler</button>
                    <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2 rounded text-sm font-bold">Créer</button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {config.globalExtras.map(ge => (
                  <div key={ge.id} className="bg-[#181818] rounded-lg p-3 border border-[#2A2A2A] flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm text-white">{ge.name}</p>
                      <p className="text-[10px] text-muted-foreground">+{ge.price} DH • {ge.type}</p>
                    </div>
                    <button data-testid={`button-delete-global-extra-${ge.id}`} onClick={() => handleDeleteGlobalExtra(ge.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {config.globalExtras.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-6">Aucun supplément global créé.</p>
                )}
              </div>
            </div>
          )}

          {/* ── PRODUCT CATEGORIES ── */}
          {activeTab === "categories" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Catégories Produits</h2>
                <button data-testid="button-add-category" onClick={() => setShowAddCat(!showAddCat)} className="flex items-center space-x-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold">
                  <Plus className="w-3.5 h-3.5" /><span>Ajouter</span>
                </button>
              </div>
              <p className="text-muted-foreground text-xs">Les catégories disponibles pour organiser les produits au sein de chaque boutique.</p>

              {showAddCat && (
                <form onSubmit={handleAddCategory} className="bg-[#181818] rounded-xl p-4 border border-primary/40 space-y-3">
                  <InputField label="Nom de la catégorie" value={newCatName} onChange={setNewCatName} placeholder="Ex: Burgers, Desserts..." />
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setShowAddCat(false)} className="flex-1 bg-[#2A2A2A] py-2 rounded text-sm font-bold">Annuler</button>
                    <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2 rounded text-sm font-bold">Créer</button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {config.productCategories.map(cat => (
                  <div key={cat} className="bg-[#181818] rounded-lg p-3 border border-[#2A2A2A] flex justify-between items-center">
                    <span className="font-semibold text-sm text-white">{cat}</span>
                    <button data-testid={`button-delete-category-${cat}`} onClick={() => handleDeleteCategory(cat)} className="p-1.5 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {config.productCategories.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-6">Aucune catégorie définie.</p>
                )}
              </div>
            </div>
          )}

          {/* ── CONFIG ── */}
          {activeTab === "config" && (
            <div className="p-4 space-y-5">
              <h2 className="text-lg font-bold">Configuration</h2>

              <div className="bg-[#181818] rounded-xl p-4 border border-[#2A2A2A] space-y-3">
                <h3 className="font-bold text-sm text-primary">Numéros de livraison WhatsApp</h3>
                <InputField label="Responsable 1" value={phone1} onChange={setPhone1} placeholder="0771175565" />
                <InputField label="Responsable 2" value={phone2} onChange={setPhone2} placeholder="0771175566" />
                <button data-testid="button-save-phones" onClick={handleSavePhones} className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg text-sm">
                  Enregistrer les numéros
                </button>
              </div>

              <div className="bg-[#181818] rounded-xl p-4 border border-[#2A2A2A] space-y-3">
                <h3 className="font-bold text-sm text-primary">Mot de passe Administrateur</h3>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={adminPwd}
                    onChange={e => setAdminPwd(e.target.value)}
                    placeholder="Nouveau mot de passe..."
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-2 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <button data-testid="button-save-password" onClick={handleSavePassword} className="w-full bg-[#2A2A2A] text-white font-bold py-2.5 rounded-lg text-sm hover:bg-[#333]">
                  Mettre à jour le mot de passe
                </button>
              </div>
            </div>
          )}

          {/* ── TIERS ── */}
          {activeTab === "tiers" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Tarifs de Livraison</h2>
                <button data-testid="button-add-tier" onClick={() => setShowAddTier(!showAddTier)} className="flex items-center space-x-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold">
                  <Plus className="w-3.5 h-3.5" /><span>Ajouter</span>
                </button>
              </div>

              {showAddTier && (
                <form onSubmit={handleAddTier} className="bg-[#181818] rounded-xl p-4 border border-primary/40 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <InputField label="Min (km)" value={tierMin} onChange={setTierMin} type="number" placeholder="0" />
                    <InputField label="Max (km)" value={tierMax} onChange={setTierMax} type="number" placeholder="5" />
                    <InputField label="Prix (DH)" value={tierPrice} onChange={setTierPrice} type="number" placeholder="15" />
                  </div>
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setShowAddTier(false)} className="flex-1 bg-[#2A2A2A] py-2 rounded text-sm font-bold">Annuler</button>
                    <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2 rounded text-sm font-bold">Ajouter</button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {config.distanceTiers.map((t, idx) => (
                  <div key={idx} className="bg-[#181818] rounded-lg p-3 border border-[#2A2A2A] flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-white">{t.minKm} – {t.maxKm} km</p>
                      <p className="text-primary font-black text-lg">{t.priceDH} DH</p>
                    </div>
                    <button data-testid={`button-delete-tier-${idx}`} onClick={() => handleDeleteTier(idx)} className="p-1.5 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LAYOUT ── */}
          {activeTab === "layout" && (
            <div className="p-4 space-y-4">
              <h2 className="text-lg font-bold">Ordre de l'Interface</h2>
              <p className="text-muted-foreground text-xs">Réordonnez les blocs de la page d'accueil.</p>
              <div className="space-y-2">
                {config.layoutOrder.map((item, idx) => (
                  <div key={item} className="bg-[#181818] rounded-lg p-3 border border-[#2A2A2A] flex justify-between items-center">
                    <span className="text-sm font-semibold text-white capitalize">{item}</span>
                    <div className="flex space-x-1">
                      <button data-testid={`button-move-up-${item}`} onClick={() => moveLayout(idx, -1)} disabled={idx === 0} className="p-1.5 bg-[#2A2A2A] rounded disabled:opacity-30">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button data-testid={`button-move-down-${item}`} onClick={() => moveLayout(idx, 1)} disabled={idx === config.layoutOrder.length - 1} className="p-1.5 bg-[#2A2A2A] rounded disabled:opacity-30">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PURGE ── */}
          {activeTab === "purge" && (
            <div className="p-4 space-y-4">
              <h2 className="text-lg font-bold text-destructive">Purge Système</h2>
              <div className="bg-destructive/10 border border-destructive/40 rounded-xl p-4">
                <p className="text-sm text-destructive font-semibold mb-1">Attention — Action irréversible</p>
                <p className="text-xs text-muted-foreground">Cette action supprimera définitivement toutes les données: boutiques, produits, commandes, favoris, panier et configuration.</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Tapez CONFIRMER pour activer le bouton</label>
                <input
                  value={purgeConfirm}
                  onChange={e => setPurgeConfirm(e.target.value)}
                  placeholder="CONFIRMER"
                  className="w-full bg-[#121212] border border-destructive/40 rounded-lg p-2 text-white focus:outline-none focus:border-destructive"
                />
              </div>
              <button
                data-testid="button-purge"
                onClick={handlePurge}
                disabled={purgeConfirm !== "CONFIRMER"}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
                  purgeConfirm === "CONFIRMER"
                    ? "bg-destructive text-white active:scale-[0.98]"
                    : "bg-[#2A2A2A] text-muted-foreground cursor-not-allowed"
                }`}
              >
                Vider toutes les données
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
