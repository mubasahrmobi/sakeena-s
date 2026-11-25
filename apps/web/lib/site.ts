export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Sakeena’s";

/** Make an image address absolute (uploaded photos are stored as /img/…). */
export const abs = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`);

export const SOCIALS = [
  { name: "Instagram", url: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
  { name: "Facebook", url: process.env.NEXT_PUBLIC_FACEBOOK_URL },
  { name: "TikTok", url: process.env.NEXT_PUBLIC_TIKTOK_URL },
].filter((s): s is { name: string; url: string } => !!s.url);
