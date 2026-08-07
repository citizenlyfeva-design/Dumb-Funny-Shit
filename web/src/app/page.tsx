"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getPlaybackUrl, getThumbnailUrl } from "@/lib/bunny";
import { useUser } from "@/lib/auth";

type Video = {
  id: string;
  bunny_video_id: string;
  caption: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: any;
};

function VideoCard({
  video,
  isActive,
}: {
  video: Video;
  isActive: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes_count || 0);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  const toggleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : Math.max(0, c - 1)));

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (newLiked) {
        await supabase
          .from("likes")
          .insert({ user_id: user.id, video_id: video.id });
      } else {
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("video_id", video.id);
      }
    } catch (e) {
      console.error("Like error", e);
    }
  };

  const playbackUrl = getPlaybackUrl(video.bunny_video_id);

  return (
    <div className="relative h-[100dvh] w-full snap-start flex items-center justify-center bg-<video
  ref={videoRef}
  src={playbackUrl}
  className="absolute inset-0 h-full w-full object-cover"
  loop
  muted
  playsInline
  autoPlay
  preload="auto"
  poster={getThumbnailUrl(video.bunny_video_id)}
  controls={false}
/> 

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
        <button
          onClick={toggleLike}
          className="flex flex-col items-center gap-1"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition ${
              liked
                ? "bg-[#c6ff00] text-black scale-110"
                : "bg-white/20 text-white"
            }`}
          >
            {liked ? "❤️" : "🤍"}
          </div>
          <span className="text-xs font-semibold text-white">
            {likeCount > 999
              ? `${(likeCount / 1000).toFixed(1)}k`
              : likeCount}
          </span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            💬
          </div>
          <span className="text-xs font-semibold text-white">
            {video.comments_count || 0}
          </span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            ↗️
          </div>
          <span className="text-xs font-semibold text-white">Share</span>
        </button>
      </div>

      <div className="absolute left-4 right-20 bottom-8 z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#c6ff00] flex items-center justify-center text-xl">
            💩
          </div>
          <span className="font-bold text-white">
            @{video.profiles?.username || "anonymous"}
          </span>
          <button className="ml-2 px-3 py-1 rounded-full border border-white/60 text-xs font-semibold">
            Follow
          </button>
        </div>
        <p className="text-white text-sm leading-snug">
          {video.caption || "Dumb funny shit"}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadVideos() {
      const { data, error } = await supabase
        .from("videos")
        .select(
          `
          id,
          bunny_video_id,
          caption,
          likes_count,
          comments_count,
          created_at
        `
        )
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) {
        console.error("Failed to load videos:", error);
      } else {
        setVideos(data || []);
      }
      setLoading(false);
    }

    loadVideos();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollTop / window.innerHeight);
      setActiveIndex(index);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4 pb-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💩</span>
          <span className="font-black text-lg tracking-tight text-[#c6ff00]">
            DUMB FUNNY SHIT
          </span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/upload"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl"
          >
            ➕
          </Link>
          {user ? (
            <Link
              href="/profile"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl"
            >
              👤
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl"
            >
              🔑
            </Link>
          )}
        </div>
      </header>

      {loading ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-[#c6ff00] text-4xl animate-bounce">💩</div>
        </div>
      ) : videos.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="text-6xl">💩</div>
          <h2 className="text-xl font-bold text-[#c6ff00]">No videos yet</h2>
          <p className="text-white/60">
            Be the first to upload some dumb funny shit
          </p>
          <Link
            href="/upload"
            className="mt-4 px-6 py-3 rounded-full bg-[#c6ff00] text-black font-bold"
          >
            Upload first video
          </Link>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="h-full w-full overflow-y-scroll snap-y-mandatory hide-scrollbar"
        >
          {videos.map((video, i) => (
            <VideoCard
              key={video.id}
              video={video}
              isActive={i === activeIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}
