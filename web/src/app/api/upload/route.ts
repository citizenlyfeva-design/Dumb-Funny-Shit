import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID!;
const API_KEY = process.env.BUNNY_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const caption = body.caption || "Dumb funny shit";
    const title = (caption || "Dumb funny shit").slice(0, 100);

    // 1. Create empty video in Bunny
    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ title }),
      }
    );

    if (!createRes.ok) {
      const text = await createRes.text();
      console.error("Bunny create failed:", createRes.status, text);
      return NextResponse.json(
        { error: `Bunny create failed: ${createRes.status}` },
        { status: 500 }
      );
    }

    const bunnyData = await createRes.json();
    const videoId = bunnyData.guid as string;

    // 2. Save metadata to Supabase immediately
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("videos")
      .insert({
        bunny_video_id: videoId,
        caption: caption || null,
        user_id: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
    }

    // 3. Return the video ID so the client can upload directly to Bunny
    return NextResponse.json({
      success: true,
      videoId,
      uploadUrl: `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
      supabaseId: data?.id,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
