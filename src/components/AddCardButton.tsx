"use client";

import { useState, useRef } from "react";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import { cn } from "@/lib/utils";

type Props = {
  onAdded: () => void;
};

export function AddCardButton({ onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }
    if (!imageFile) {
      setErrorMsg("Please select an image.");
      return;
    }
    setStatus("uploading");
    setErrorMsg("");
    try {
      const imageUrl = await uploadImageToCloudinary(imageFile);
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          image: imageUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Failed to save card");
      }
      // Reset UI first so modal closes even if onAdded fails (reference: Nithin AssetUpload)
      setStatus("idle");
      setTitle("");
      setDescription("");
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setOpen(false);
      try {
        onAdded();
      } catch {
        // Refresh failed; modal already closed
      }
    } catch (err) {
      setStatus("idle");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStatus("idle");
          setErrorMsg("");
        }}
        className="shrink-0 size-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center text-2xl font-light"
        aria-label="Add card"
      >
        +
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="bg-background border border-border rounded-xl shadow-xl max-w-md w-full p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Add card</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Card title"
                  className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                  className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Image</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="text-sm text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded file:border file:border-input file:bg-muted file:text-foreground"
                />
                {imageFile && (
                  <span className="text-xs text-muted-foreground truncate">{imageFile.name}</span>
                )}
              </label>
              {errorMsg && (
                <p className="text-sm text-destructive">{errorMsg}</p>
              )}
              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium",
                    "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "uploading"}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium",
                    "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  )}
                >
                  {status === "uploading" ? "Uploading…" : "Add card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
