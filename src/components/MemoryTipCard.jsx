// src/components/MemoryTipCard.jsx
import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

export default function MemoryTipCard({ tip, explanation, question, isCorrect, userSelected }) {
  const memoryTip = tip || question?.memoryTip;
  const conceptExp = explanation || question?.explanation;

  if (!memoryTip && !conceptExp) return null;

  return (
    <div className="mt-5 rounded-md border border-zinc-800 dark:border-white/50 bg-amber-50/50 dark:bg-[#202020] p-5 text-sm sm:text-base">
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-amber-700 dark:text-[#D1B280]">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div className="space-y-2 flex-1 leading-relaxed">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-sm border border-amber-800 dark:border-white/45 bg-amber-100 dark:bg-[#362D1F] px-2.5 py-1 text-xs font-bold text-amber-900 dark:text-[#D1B280]">
              <Sparkles className="h-3.5 w-3.5" />
              Memory Retention Hack
            </span>
          </div>

          {memoryTip && (
            <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-[#E3E3E3]">
              {memoryTip}
            </p>
          )}

          {conceptExp && (
            <p className="text-sm sm:text-base text-zinc-700 dark:text-[#9B9A97] pt-2 border-t border-zinc-800 dark:border-white/30">
              <span className="text-zinc-900 dark:text-[#E3E3E3] font-bold">Concept Rule: </span>
              {conceptExp}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
