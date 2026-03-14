export function getEmailRedirectUrl(path = "/dashboard") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${normalizedPath}`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (baseUrl) {
    return `${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
  }

  return `http://localhost:3000${normalizedPath}`;
}
