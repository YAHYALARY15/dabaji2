import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, User, Lock, ChevronRight, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "";

type Step = "landing" | "phone" | "register" | "login" | "pin-login";

export function AuthView() {
  const { login } = useAuth();
  const [step, setStep] = useState<Step>("landing");
  const [mode, setMode] = useState<"register" | "login">("register");

  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState<string[]>(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const confirmPinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => { setError(""); }, [step]);

  const handlePinInput = (
    idx: number,
    val: string,
    arr: string[],
    setArr: (v: string[]) => void,
    refs: React.RefObject<HTMLInputElement | null>[]
  ) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...arr];
    next[idx] = val;
    setArr(next);
    if (val && idx < 3) refs[idx + 1].current?.focus();
  };

  const handlePinKeyDown = (
    idx: number,
    e: React.KeyboardEvent,
    arr: string[],
    setArr: (v: string[]) => void,
    refs: React.RefObject<HTMLInputElement | null>[]
  ) => {
    if (e.key === "Backspace" && !arr[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
      const next = [...arr];
      next[idx - 1] = "";
      setArr(next);
    }
  };

  const handlePhoneSubmit = async () => {
    const cleaned = phone.replace(/\s+/g, "").replace(/^00/, "+").replace(/^0/, "+212");
    if (!cleaned || cleaned.length < 8) { setError("Numéro invalide"); return; }
    setPhone(cleaned);
    if (mode === "register") {
      setStep("register");
    } else {
      setStep("pin-login");
    }
  };

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) { setError("Remplissez tous les champs"); return; }
    const p = pin.join("");
    const cp = confirmPin.join("");
    if (p.length < 4) { setError("Code PIN incomplet"); return; }
    if (p !== cp) { setError("Les codes PIN ne correspondent pas"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), phone, pin: p }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur"); setLoading(false); return; }
      login(data.token, data.user);
    } catch {
      setError("Impossible de se connecter au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const p = pin.join("");
    if (p.length < 4) { setError("Code PIN incomplet"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin: p }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur"); setLoading(false); return; }
      login(data.token, data.user);
    } catch {
      setError("Impossible de se connecter au serveur");
    } finally {
      setLoading(false);
    }
  };

  const PinGrid = ({
    value, onChange, refs, label
  }: {
    value: string[];
    onChange: (v: string[]) => void;
    refs: React.RefObject<HTMLInputElement | null>[];
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">{label}</label>
      <div className="flex space-x-3 justify-center">
        {value.map((digit, i) => (
          <input
            key={i}
            ref={refs[i]}
            type={showPin ? "text" : "password"}
            maxLength={1}
            inputMode="numeric"
            value={digit}
            onChange={e => handlePinInput(i, e.target.value, value, onChange, refs)}
            onKeyDown={e => handlePinKeyDown(i, e, value, onChange, refs)}
            className={`w-14 h-14 rounded-xl text-center text-2xl font-black bg-[#1E1E1E] border transition-all focus:outline-none ${
              digit ? "border-primary text-primary shadow-[0_0_12px_rgba(255,215,0,0.2)]" : "border-[#2A2A2A] text-white"
            }`}
          />
        ))}
      </div>
    </div>
  );

  const pageVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "38vh" }}>
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
          alt="Dabaji food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#0D0D0D]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-primary font-black text-5xl italic drop-shadow-lg tracking-tight">Dabaji</h1>
          <p className="text-white/80 text-base font-semibold mt-1 tracking-[0.25em]">دباجي</p>
          <p className="text-white/50 text-xs mt-2 tracking-widest uppercase">Livraison Rapide · المغرب</p>
        </div>
        {(step !== "landing") && (
          <button
            onClick={() => { setStep(step === "phone" ? "landing" : "phone"); setPin(["","","",""]); setConfirmPin(["","","",""]); setError(""); }}
            className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <div className="flex-1 bg-[#0D0D0D] px-6 pt-6 pb-10 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">

          {step === "landing" && (
            <motion.div key="landing" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col flex-1">
              <h2 className="text-white font-bold text-2xl mb-1">Bienvenue</h2>
              <p className="text-muted-foreground text-sm mb-8">Commandez vos plats préférés en quelques secondes.</p>
              <div className="space-y-3 mt-auto">
                <button
                  onClick={() => { setMode("register"); setStep("phone"); }}
                  className="w-full bg-primary text-primary-foreground font-black text-base py-4 rounded-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform shadow-[0_0_24px_rgba(255,215,0,0.3)]"
                >
                  <User className="w-5 h-5" />
                  <span>Créer un compte</span>
                </button>
                <button
                  onClick={() => { setMode("login"); setStep("phone"); }}
                  className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-white font-bold text-base py-4 rounded-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform"
                >
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <span>Se connecter</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === "phone" && (
            <motion.div key="phone" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col flex-1">
              <h2 className="text-white font-bold text-xl mb-1">
                {mode === "register" ? "Votre numéro" : "Connexion"}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {mode === "register" ? "Entrez votre numéro de téléphone pour créer votre compte." : "Entrez votre numéro pour accéder à votre compte."}
              </p>
              <div className="space-y-2 mb-4">
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    autoFocus
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handlePhoneSubmit()}
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3.5 text-white text-base focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              {error && <p className="text-destructive text-sm text-center mb-3">{error}</p>}
              <button
                onClick={handlePhoneSubmit}
                className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl flex items-center justify-center space-x-2 mt-auto active:scale-[0.98] transition-transform"
              >
                <span>Continuer</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === "register" && (
            <motion.div key="register" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col flex-1 overflow-y-auto space-y-4">
              <div>
                <h2 className="text-white font-bold text-xl mb-1">Créer votre compte</h2>
                <p className="text-muted-foreground text-sm">Complétez vos informations pour continuer.</p>
              </div>
              <div className="flex items-center space-x-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-white text-sm font-medium">{phone}</span>
                <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input autoFocus type="text" placeholder="Mohammed" value={firstName} onChange={e => setFirstName(e.target.value)}
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">Nom de famille</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" placeholder="Alami" value={lastName} onChange={e => setLastName(e.target.value)}
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Afficher les codes</span>
                <button onClick={() => setShowPin(p => !p)} className="p-1.5">
                  {showPin ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              <PinGrid value={pin} onChange={setPin} refs={pinRefs} label="Créer votre code PIN (4 chiffres)" />
              <PinGrid value={confirmPin} onChange={setConfirmPin} refs={confirmPinRefs} label="Confirmer le code PIN" />
              {error && <p className="text-destructive text-sm text-center">{error}</p>}
              <button onClick={handleRegister} disabled={loading}
                className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform disabled:opacity-60 mt-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Créer mon compte</span><ChevronRight className="w-5 h-5" /></>}
              </button>
            </motion.div>
          )}

          {step === "pin-login" && (
            <motion.div key="pin-login" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col flex-1">
              <h2 className="text-white font-bold text-xl mb-1">Entrez votre code PIN</h2>
              <p className="text-muted-foreground text-sm mb-6">Votre accès sécurisé à Dabaji.</p>
              <div className="flex items-center space-x-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 mb-6">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-white text-sm font-medium">{phone}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">Afficher les chiffres</span>
                <button onClick={() => setShowPin(p => !p)} className="p-1.5">
                  {showPin ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              <PinGrid value={pin} onChange={setPin} refs={pinRefs} label="Code PIN" />
              {error && <p className="text-destructive text-sm text-center mt-3">{error}</p>}
              <button onClick={handleLogin} disabled={loading}
                className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform disabled:opacity-60 mt-auto">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock className="w-5 h-5" /><span>Accéder</span></>}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}