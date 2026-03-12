export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-6 mt-12">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
        <span>
          <span className="text-white/40 font-medium">Flashcards</span> — AI
          micro-tool
        </span>
        <span>
          &copy; {new Date().getFullYear()} &middot; MVP &middot; More features
          coming soon
        </span>
      </div>
    </footer>
  );
}
