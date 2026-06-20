export interface ParsedVideo {
  provider: "youtube" | "vimeo" | "unknown";
  id: string | null;
  embedUrl: string;
  thumbnail: string;
}

/**
 * Parses a YouTube or Vimeo URL into an embeddable URL + thumbnail.
 * Supports the common formats Angel might paste:
 *   - https://www.youtube.com/watch?v=ID
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/embed/ID
 *   - https://www.youtube.com/shorts/ID
 *   - https://vimeo.com/ID
 *   - https://player.vimeo.com/video/ID
 */
export function parseVideo(rawUrl: string): ParsedVideo {
  const url = (rawUrl || "").trim();

  // --- YouTube ---
  const yt =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/) ||
    url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (yt && yt[1]) {
    const id = yt[1];
    return {
      provider: "youtube",
      id,
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // --- Vimeo ---
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm && vm[1]) {
    const id = vm[1];
    return {
      provider: "vimeo",
      id,
      embedUrl: `https://player.vimeo.com/video/${id}`,
      // vumbnail is a free Vimeo thumbnail proxy
      thumbnail: `https://vumbnail.com/${id}.jpg`,
    };
  }

  return {
    provider: "unknown",
    id: null,
    embedUrl: url,
    thumbnail: "",
  };
}

export function isValidVideoUrl(url: string): boolean {
  return parseVideo(url).provider !== "unknown";
}
