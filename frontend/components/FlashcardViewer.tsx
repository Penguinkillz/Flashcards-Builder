"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlashCard } from "@/lib/api";

interface Props {
  cards: FlashCard[];
}

export function FlashcardViewer({ cards }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Reset flip immediately when navigating — done directly in handlers (no useEffect)
  const goPrev = () => {
    if (currentIndex > 0) {
      setFlipped(false);
      setCurrentIndex((i) => i - 1);
    }
  };

  const goNext = () => {
    if (currentIndex < cards.length - 1) {
      setFlipped(false);
      setCurrentIndex((i) => i + 1);
    }
  };

  const card = cards[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Header row: label + card counter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Your flashcards</h2>
          <p className="text-xs text-white/35 mt-0.5">
            Click a card to reveal the answer
          </p>
        </div>
        <span className="text-sm tabular-nums">
          <span className="font-semibold text-white">{currentIndex + 1}</span>
          <span className="text-white/30"> / </span>
          <span className="text-white/50">{cards.length}</span>
        </span>
      </div>

      {/*
       * Flip card
       * — CSS 3D transform handles the flip (not Framer Motion rotateY)
       * — Framer Motion (AnimatePresence + key) handles fade between cards
       * — perspective-1000 / preserve-3d / backface-hidden / rotate-y-180
       *   are defined as custom utilities in globals.css
       */}
      <div
        className="perspective-1000 h-56 cursor-pointer select-none"
        onClick={() => setFlipped((f) => !f)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14, ease: "easeInOut" }}
            className="h-full"
          >
            {/* Inner div rotates on flip — CSS only */}
            <div
              className={cn(
                "preserve-3d relative h-full transition-transform duration-[400ms] ease-in-out",
                flipped && "rotate-y-180"
              )}
            >
              {/* Front face */}
              <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center p-7 rounded-2xl bg-white/[0.04] border border-white/10 shadow-xl hover:border-white/[0.15] transition-colors duration-200">
                <div className="overflow-y-auto max-h-36 w-full text-center">
                  <p className="text-[17px] font-semibold text-white leading-relaxed">
                    {card.front}
                  </p>
                </div>
                <span className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[10px] text-white/20 whitespace-nowrap">
                  <RotateCcw size={9} />
                  Click to flip
                </span>
              </div>

              {/* Back face — rotated 180° so it starts hidden, reveals on flip */}
              <div className="backface-hidden rotate-y-180 absolute inset-0 flex items-center justify-center p-7 rounded-2xl bg-sky-950/60 border border-sky-500/25 shadow-xl shadow-sky-900/20">
                <div className="overflow-y-auto max-h-40 w-full text-center">
                  <p className="text-base text-sky-100 leading-relaxed">
                    {card.back}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.06] disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft size={15} />
          Previous
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex === cards.length - 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.06] disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </motion.div>
  );
}
