import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID!;
const API_KEY = process.env.BUNNY_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || "Dumb funny shit";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Create video in Bunny
    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          title: caption.slice(0, 100) || "Dumb funny shit",
        }),
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

    // 2. Upload the file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadRes = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
      {
        method: "PUT",
        headers: {
          AccessKey: API_KEY,
          "Content-Type": "application/octet-stream",
        },
        body: buffer,
      }
    );

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      console.error("Bunny upload failed:", uploadRes.status, text);
      return NextResponse.json(
        { error: `Bunny upload failed: ${uploadRes.status}` },
        { status: 500 }
      );
    }

    // 3. Save to Supabase
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

    return NextResponse.json({
      success: true,
      videoId,
      supabaseId: data?.id,
      message: "Video uploaded and is processing",
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
