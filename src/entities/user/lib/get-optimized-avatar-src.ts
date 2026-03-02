export function getOptimizedAvatarSrc(src: string, size: number) {
  try {
    const url = new URL(src);
    const targetSize = size * 2;

    if (url.hostname === "avatars.githubusercontent.com") {
      url.searchParams.set("s", String(targetSize));
      return url.toString();
    }

    if (url.hostname.endsWith(".supabase.co")) {
      url.searchParams.set("width", String(targetSize));
      url.searchParams.set("height", String(targetSize));
      url.searchParams.set("quality", "70");
    }

    return url.toString();
  } catch {
    return src;
  }
}
