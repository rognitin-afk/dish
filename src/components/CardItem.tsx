"use client";

import Image from "next/image";
import { useRef, useState, useCallback, useEffect } from "react";
import type { CardType } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  card: CardType;
  audioList: { _id: string; src: string }[];
  getNextAudioIndex: () => number;
  activeCardId: string | null;
  onPlayStart: (cardId: string, audio: HTMLAudioElement) => void;
};

export function CardItem({ card, audioList, getNextAudioIndex, activeCardId, onPlayStart }: Props) {
  const [bounce, setBounce] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Stop bouncing when another card becomes active (user hovered another card)
  useEffect(() => {
    if (activeCardId !== null && activeCardId !== card._id) {
      setBounce(false);
    }
  }, [activeCardId, card._id]);

  const playNextOnce = useCallback(() => {
    if (audioList.length === 0) return;
    const idx = getNextAudioIndex();
    if (idx < 0 || !audioList[idx]) return;
    const src = audioList[idx]!.src;

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    const audio = new Audio(src);
    currentAudioRef.current = audio;
    audio.addEventListener("ended", () => setBounce(false));
    audio.play().catch(() => setBounce(false));
    setBounce(true);
    onPlayStart(card._id, audio);
  }, [audioList, getNextAudioIndex, card._id, onPlayStart]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={playNextOnce}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && playNextOnce()}
      onMouseEnter={playNextOnce}
      className={cn(
        "w-full max-w-80 min-w-0 flex-[0_1_20rem] rounded-xl overflow-hidden border border-border bg-card text-card-foreground shadow-sm transition-transform touch-manipulation",
        "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        bounce && "animate-bounce-card-loop"
      )}
    >
      <div className="relative aspect-4/3 bg-muted">
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{card.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {card.description || "—"}
        </p>
      </div>
    </div>
  );
}
