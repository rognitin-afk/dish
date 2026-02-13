"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { uploadAudioToCloudinary } from "@/lib/cloudinary-upload";
import { AddCardButton } from "./AddCardButton";
import type { AudioType, CardType } from "@/types";
import { cn } from "@/lib/utils";

type Tab = "cards" | "audio";

export function AdminClient() {
  const [tab, setTab] = useState<Tab>("cards");

  const [cardList, setCardList] = useState<CardType[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);

  const [audioList, setAudioList] = useState<AudioType[]>([]);
  const [audioLoading, setAudioLoading] = useState(true);

  const [audioName, setAudioName] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioStatus, setAudioStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [audioError, setAudioError] = useState("");

  const fetchCards = async () => {
    try {
      const res = await fetch("/api/cards");
      if (res.ok) setCardList(await res.json());
    } catch {
      setCardList([]);
    } finally {
      setCardsLoading(false);
    }
  };

  const fetchAudio = async () => {
    try {
      const res = await fetch("/api/audio");
      if (res.ok) setAudioList(await res.json());
    } catch {
      setAudioList([]);
    } finally {
      setAudioLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    fetchAudio();
  }, []);

  const handleAudioUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !audioName.trim()) {
      setAudioError("Name and file are required.");
      return;
    }
    setAudioStatus("uploading");
    setAudioError("");
    try {
      const src = await uploadAudioToCloudinary(audioFile);
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: audioName.trim(), src }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Failed to save");
      }
      setAudioName("");
      setAudioFile(null);
      setAudioStatus("success");
      fetchAudio();
    } catch (err) {
      setAudioStatus("error");
      setAudioError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleDeleteAudio = async (id: string) => {
    try {
      const res = await fetch("/api/audio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchAudio();
    } catch {
      // ignore
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const res = await fetch("/api/cards", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchCards();
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <h1 className="text-lg font-semibold">Admin</h1>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Home
          </Link>
        </div>
      </header>

      {/* Toggle */}
      <div className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 flex">
          <button
            type="button"
            onClick={() => setTab("cards")}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              tab === "cards"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setTab("audio")}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              tab === "audio"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Audio
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {tab === "cards" && (
          <>
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Add card
              </h2>
              <AddCardButton onAdded={fetchCards} />
            </section>
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Card list
              </h2>
              {cardsLoading ? (
                <p className="text-muted-foreground text-sm">Loading…</p>
              ) : cardList.length === 0 ? (
                <p className="text-muted-foreground text-sm">No cards yet.</p>
              ) : (
                <ul className="space-y-3">
                  {cardList.map((card) => (
                    <li
                      key={card._id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                    >
                      <div className="relative shrink-0 size-14 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{card.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {card.description || "—"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCard(card._id)}
                        className="text-xs text-destructive hover:underline shrink-0"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {tab === "audio" && (
          <>
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Upload new audio
              </h2>
              <form onSubmit={handleAudioUpload} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={audioName}
                  onChange={(e) => setAudioName(e.target.value)}
                  placeholder="Audio name"
                  className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="file"
                  accept="audio/*,video/mpeg,.mp3,.mpeg,.wav,.ogg,.m4a,.aac,.flac,.webm"
                  onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                  className="text-sm text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded file:border file:border-input file:bg-muted file:text-foreground"
                />
                {audioError && (
                  <p className="text-sm text-destructive">{audioError}</p>
                )}
                <button
                  type="submit"
                  disabled={audioStatus === "uploading"}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {audioStatus === "uploading"
                    ? "Uploading…"
                    : audioStatus === "success"
                      ? "Saved. Upload another"
                      : "Upload & save"}
                </button>
              </form>
            </section>
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Audio list (play order on cards)
              </h2>
              {audioLoading ? (
                <p className="text-muted-foreground text-sm">Loading…</p>
              ) : audioList.length === 0 ? (
                <p className="text-muted-foreground text-sm">No audio yet.</p>
              ) : (
                <ul className="space-y-3">
                  {audioList.map((a) => (
                    <li
                      key={a._id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 px-3 rounded-md bg-muted/50"
                    >
                      <span className="text-sm truncate shrink-0 min-w-0">{a.name}</span>
                      <audio
                        controls
                        src={a.src}
                        preload="metadata"
                        className="h-8 w-full max-w-xs shrink"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteAudio(a._id)}
                        className="text-xs text-destructive hover:underline shrink-0 self-start sm:self-center"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
