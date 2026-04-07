const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "")

const defaultBackendUrl = import.meta.env.PROD ? "" : "http://localhost:5001"

export const BACKEND_URL = trimTrailingSlash(
  import.meta.env.VITE_BACKEND_URL || defaultBackendUrl
)

export const API_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL || (BACKEND_URL ? `${BACKEND_URL}/api` : "/api")
)

export const buildAssetUrl = (assetPath) => {
  if (!assetPath) return ""
  if (/^https?:\/\//i.test(assetPath)) return assetPath
  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`
  return BACKEND_URL ? `${BACKEND_URL}${normalizedPath}` : normalizedPath
}
