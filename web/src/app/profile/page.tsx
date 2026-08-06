"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, signOut } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [username, setUsername] = useState("you");
  const [videoCount, setVideoCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profile?.username) setUsername(profile.username);

      const { count } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setVideoCount(count || 0);
    }

    loadProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#c6ff00] text-4xl animate-bounce">💩</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <Link href="/" className="text-white/70 text-xl">
          ←
        </Link>
        <h1 className="font-bold">Profile</h1>
        <button onClick={handleSignOut} className="text-sm text-white/50">
          Log out
        </button>
      </header>

      <div className="flex flex-col items-center pt-10 px-6">
        <div className="w-24 h-24 rounded-full bg-[#c6ff00] flex items-center justify-center text-5xl mb-4">
          💩
        </div>
        <h2 className="text-xl font-black">@{username}</h2>
        <p className="text-white/60 text-sm mt-1">{user.email}</p>

        <div className="flex gap-8 mt-6 mb-8">
          <div className="text-center">
            <div className="font-bold text-lg">{videoCount}</div>
            <div className="text-xs text-white/50">Videos</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">0</div>
            <div className="text-xs text-white/50">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">0</div>
            <div className="text-xs text-white/50">Following</div>
          </div>
        </div>

        <div className="w-full mt-6 grid grid-cols-3 gap-1">
          {Array.from({ length: Math.min(videoCount, 9) }).map((_, i) => (
            <div
              key={i}
              className="aspect-[9/16] bg-white/10 rounded-sm flex items-center justify-center text-2xl"
            >
              🎬
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
