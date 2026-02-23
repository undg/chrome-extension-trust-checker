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

const MULTI_PART_TLDS = [
  'co.uk',
  'org.uk',
  'net.uk',
  'gov.uk',
  'ac.uk',
  'me.uk',
  'com.au',
  'net.au',
  'org.au',
  'gov.au',
  'edu.au',
  'com.br',
  'net.br',
  'org.br',
  'gov.br',
  'co.jp',
  'ne.jp',
  'or.jp',
  'go.jp',
  'com.cn',
  'net.cn',
  'org.cn',
  'gov.cn',
  'co.nz',
  'net.nz',
  'org.nz',
  'com.sg',
  'net.sg',
  'org.sg',
  'co.in',
  'net.in',
  'org.in',
  'co.kr',
  'net.kr',
  'or.kr',
]

export function extractRootDomain(domain: string): string {
  const parts = domain.toLowerCase().split('.')

  if (parts.length <= 2) {
    return domain
  }

  // Check for multi-part TLDs
  const lastTwo = parts.slice(-2).join('.')
  const lastThree = parts.slice(-3).join('.')

  if (MULTI_PART_TLDS.includes(lastThree)) {
    // For multi-part TLDs, root domain is the part before the TLD
    return `${parts.slice(-4, -3).join('.')}.${lastThree}`
  }

  if (MULTI_PART_TLDS.includes(lastTwo)) {
    return parts.slice(-3).join('.')
  }

  // Standard case: last two parts
  return parts.slice(-2).join('.')
}
