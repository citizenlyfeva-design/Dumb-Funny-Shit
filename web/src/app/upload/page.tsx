"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setProgress("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setProgress("Done! Processing on Bunny...");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed");
      setUploading(false);
      setProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <Link href="/" className="text-white/70">
          Cancel
        </Link>
        <h1 className="font-bold">Upload Shit</h1>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="text-[#c6ff00] font-bold disabled:opacity-40"
        >
          {uploading ? "..." : "Post"}
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <label className="w-full max-w-sm aspect-[9/16] rounded-2xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer hover:border-[#c6ff00] transition">
          {file ? (
            <div className="text-center p-4">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-sm text-white/80 truncate max-w-[200px]">
                {file.name}
              </p>
              <p className="text-xs text-white/50 mt-1">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          ) : (
            <>
              <div className="text-5xl mb-3">💩</div>
              <p className="font-semibold">Tap to select video</p>
              <p className="text-sm text-white/50 mt-1">
                Vertical shorts work best
              </p>
            </>
          )}
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption... (keep it dumb)"
          className="w-full max-w-sm bg-white/10 rounded-xl p-4 text-white placeholder:text-white/40 resize-none h-24 outline-none focus:ring-2 focus:ring-[#c6ff00]"
          maxLength={150}
          disabled={uploading}
        />

        {progress && (
          <p className="text-[#c6ff00] text-sm font-medium">{progress}</p>
        )}
        {error && (
          <p className="text-red-400 text-sm text-center max-w-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
