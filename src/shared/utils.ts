export interface TabInfo {
  domain: string | null
  url: string | null
}

export function extractDomain(url: string | undefined): string | null {
  if (!url) return null

  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export function buildTrustpilotUrl(domain: string): string {
  return `https://www.trustpilot.com/review/${domain}`
}
