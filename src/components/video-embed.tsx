function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (parsed.pathname.startsWith("/shorts/")) {
        return `https://www.youtube.com/embed/${parsed.pathname.split("/")[2]}`;
      }
      return null;
    }
    if (host === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
    if (host === "vimeo.com") {
      return `https://player.vimeo.com/video/${parsed.pathname.slice(1)}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function VideoEmbed({ url }: { url: string }) {
  const embedUrl = getEmbedUrl(url);

  if (embedUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border">
        <iframe
          src={embedUrl}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (/\.(mp4|webm|ogg)$/i.test(new URL(url).pathname)) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video src={url} controls className="w-full rounded-lg border" />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block truncate rounded-lg border p-3 text-sm text-primary underline underline-offset-4"
    >
      {url}
    </a>
  );
}
