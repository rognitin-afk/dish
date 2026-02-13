"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { CardItem } from "./CardItem";
import type { CardType, AudioType } from "@/types";

export function HomeClient() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [audioList, setAudioList] = useState<AudioType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const nextAudioIndexRef = useRef(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const onPlayStart = useCallback((cardId: string, audio: HTMLAudioElement) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    currentAudioRef.current = audio;
    setActiveCardId(cardId);
  }, []);

  const getNextAudioIndex = useCallback(() => {
    const list = audioList.map((a) => ({ _id: a._id, src: a.src }));
    if (list.length === 0) return -1;
    const idx = nextAudioIndexRef.current % list.length;
    nextAudioIndexRef.current += 1;
    return idx;
  }, [audioList]);

  const fetchData = async () => {
    try {
      const [cardsRes, audioRes] = await Promise.all([
        fetch("/api/cards"),
        fetch("/api/audio"),
      ]);
      if (cardsRes.ok) setCards(await cardsRes.json());
      if (audioRes.ok) setAudioList(await audioRes.json());
      setError("");
    } catch {
      setError("Failed to load cards or audio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
          <h1 className="text-lg font-semibold">Cards</h1>
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-6xl mx-auto">
        {error && (
          <p className="text-destructive text-sm mb-4">{error}</p>
        )}
        <div className="flex flex-wrap justify-around gap-4">
          {cards.map((card) => (
            <CardItem
              key={card._id}
              card={card}
              audioList={audioList.map((a) => ({ _id: a._id, src: a.src }))}
              getNextAudioIndex={getNextAudioIndex}
              activeCardId={activeCardId}
              onPlayStart={onPlayStart}
            />
          ))}
        </div>
        {cards.length === 0 && !error && (
          <p className="text-muted-foreground text-center py-8">
            No cards yet. Add cards in Admin.
          </p>
        )}
      </main>
    </div>
  );
}
