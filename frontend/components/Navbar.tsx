import { Layers } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/[0.06] backdrop-blur-md bg-black/25">
      <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Layers size={14} className="text-white" />
          </div>
          <span
            className="font-semibold text-white text-sm tracking-wide"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Flashcards
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25 tracking-wide">
            Beta
          </span>
        </div>
        <span className="text-xs text-white/25 hidden sm:block">
          Powered by Llama 3.3
        </span>
      </div>
    </nav>
  );
}
