"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateFromFiles, generateFromTopic, type FlashCard } from "@/lib/api";
import { FlashcardViewer } from "@/components/FlashcardViewer";

export function FlashcardsApp() {
  const [topic, setTopic] = useState("");
  const [sourcesText, setSourcesText] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cards, setCards] = useState<FlashCard[]>([]);
  // Bumped each generation so FlashcardViewer resets internal state (index, flip)
  const [generationId, setGenerationId] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFiles = files && files.length > 0;

  const clearFiles = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleGenerate() {
    const topicTrimmed = topic.trim();
    const sourcesTrimmed = sourcesText.trim();

    if (!topicTrimmed && !sourcesTrimmed && !hasFiles) {
      setError("Enter a topic, paste some notes, or upload a file.");
      return;
    }

    setLoading(true);
    setError("");
    setCards([]);

    try {
      let data;
      // Routing logic: topic + no files → JSON endpoint; files attached → multipart endpoint
      if (topicTrimmed && !hasFiles) {
        data = await generateFromTopic(topicTrimmed, sourcesTrimmed || null);
      } else {
        data = await generateFromFiles(topicTrimmed, sourcesTrimmed, files);
      }
      setCards(data.cards);
      setGenerationId((id) => id + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 pt-16 pb-24">
      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-10"
      >
        <h1
          className="text-[42px] sm:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          <span className="text-white">Generate </span>
          <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            Flashcards
          </span>
          <span className="text-white"> Instantly</span>
        </h1>
        <p className="text-white/45 text-lg max-w-md mx-auto leading-relaxed">
          Enter a topic or paste your notes — get study-ready cards powered by
          AI.
        </p>
      </motion.div>

      {/* ── Input form ── */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
        className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 shadow-2xl shadow-black/40 space-y-4 mb-10"
      >
        {/* Topic */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-2">
            Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Photosynthesis, World War II, Python decorators"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/15 transition-colors duration-200"
          />
        </div>

        {/* Paste notes */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-2">
            Paste notes{" "}
            <span className="normal-case font-normal text-white/25">
              (optional)
            </span>
          </label>
          <textarea
            value={sourcesText}
            onChange={(e) => setSourcesText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your notes, article text, or any content here…"
            rows={4}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/15 transition-colors duration-200 resize-none"
          />
        </div>

        {/* File upload */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-2">
            Upload PDF / DOCX{" "}
            <span className="normal-case font-normal text-white/25">
              (optional, max 10 MB)
            </span>
          </label>
          <div
            className={cn(
              "border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200",
              hasFiles
                ? "border-sky-500/30 bg-sky-500/[0.04]"
                : "border-white/[0.10] hover:border-sky-500/35 hover:bg-sky-500/[0.03]"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              multiple
              className="hidden"
              onChange={(e) => setFiles(e.target.files)}
            />
            {hasFiles ? (
              <div className="flex flex-wrap gap-2 items-center justify-center">
                {Array.from(files!).map((f, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full"
                  >
                    <FileText size={11} />
                    {f.name}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={clearFiles}
                  className="flex items-center gap-1 text-xs text-white/35 hover:text-white/60 px-2 py-1 transition-colors"
                >
                  <X size={11} /> Clear
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-white/25 pointer-events-none">
                <Upload size={18} />
                <span className="text-sm">Click to upload</span>
                <span className="text-xs text-white/15">PDF or DOCX</span>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-red-400/90 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-4 py-2.5"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/20 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Generating…</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Generate flashcards</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-white/20">
          ⌘ + Enter to generate
        </p>
      </motion.div>

      {/* ── Flashcard viewer (appears after generation) ── */}
      <AnimatePresence>
        {cards.length > 0 && (
          <FlashcardViewer key={generationId} cards={cards} />
        )}
      </AnimatePresence>
    </main>
  );
}
