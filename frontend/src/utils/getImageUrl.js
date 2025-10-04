// src/utils/getImageUrl.js
export function getImageUrl(imageUrl) {
  if (!imageUrl) return null;

  const rootURL = import.meta.env.VITE_API_URL.replace("/api", "");
  return rootURL + imageUrl;
}
