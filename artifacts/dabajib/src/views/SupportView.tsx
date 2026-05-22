import { MessageCircle } from "lucide-react";

export function SupportView() {
  const handleSupport = () => {
    window.open("https://wa.me/212771175565", "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center pb-20">
      <div className="w-32 h-32 rounded-full bg-[#181818] flex items-center justify-center mb-8 relative border-2 border-[#25D366]/20">
        <div className="absolute inset-0 rounded-full bg-[#25D366] opacity-10 animate-ping"></div>
        <MessageCircle className="w-16 h-16 text-[#25D366]" />
      </div>
      
      <h1 className="text-white font-bold text-3xl mb-3 tracking-tight">Support Client</h1>
      <p className="text-muted-foreground text-lg mb-2">
        Besoin d'aide? Notre équipe est disponible 24/7
      </p>
      <p className="text-primary font-medium text-xl mb-10" dir="rtl">
        تواصل معنا في أي وقت
      </p>

      <button 
        onClick={handleSupport}
        className="w-full max-w-sm bg-[#25D366] text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-[#25D366]/20 active:scale-95 transition-transform"
      >
        Contacter le Support
      </button>
    </div>
  );
}
