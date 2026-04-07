const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "")

const defaultBackendUrl = "http://localhost:5001"

export const BACKEND_URL = trimTrailingSlash(
  import.meta.env.VITE_BACKEND_URL || defaultBackendUrl
)

export const API_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`
)

export const buildAssetUrl = (assetPath) => {
  if (!assetPath) return ""
  if (/^https?:\/\//i.test(assetPath)) return assetPath
  return `${BACKEND_URL}${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`
}
