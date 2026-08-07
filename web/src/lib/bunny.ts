const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID!;
const API_KEY = process.env.BUNNY_API_KEY!;
const CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME!;

export function getPlaybackUrl(videoId: string) {
  return `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?autoplay=true&loop=true&muted=true&preload=true`;
}

export function getThumbnailUrl(videoId: string) {
  return `https://${CDN_HOSTNAME}/${videoId}/thumbnail.jpg`;
}

export function getEmbedUrl(videoId: string) {
  return `https://player.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`;
}

export async function createBunnyVideo(title: string) {
  const res = await fetch(
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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny create video failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    videoId: data.guid as string,
    uploadUrl: `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${data.guid}`,
  };
}
