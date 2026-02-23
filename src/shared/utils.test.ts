import { describe, expect, it } from 'vitest'
import { buildTrustpilotUrl, extractDomain, extractRootDomain } from './utils'

describe('extractDomain', () => {
  it('extracts domain from URL with www', () => {
    expect(extractDomain('https://www.example.com')).toBe('example.com')
  })

  it('extracts domain from URL without www', () => {
    expect(extractDomain('https://example.com')).toBe('example.com')
  })

  it('returns null for undefined URL', () => {
    expect(extractDomain(undefined)).toBeNull()
  })

  it('returns null for invalid URL', () => {
    expect(extractDomain('not-a-url')).toBeNull()
  })
})

describe('buildTrustpilotUrl', () => {
  it('builds correct Trustpilot URL', () => {
    expect(buildTrustpilotUrl('example.com')).toBe(
      'https://www.trustpilot.com/review/example.com',
    )
  })
})

describe('extractRootDomain', () => {
  it('returns domain unchanged for simple domains', () => {
    expect(extractRootDomain('example.com')).toBe('example.com')
    expect(extractRootDomain('google.com')).toBe('google.com')
    expect(extractRootDomain('site.org')).toBe('site.org')
  })

  it('extracts root domain from subdomains', () => {
    expect(extractRootDomain('blog.example.com')).toBe('example.com')
    expect(extractRootDomain('www.example.com')).toBe('example.com')
    expect(extractRootDomain('api.github.com')).toBe('github.com')
    expect(extractRootDomain('deep.nested.subdomain.example.com')).toBe(
      'example.com',
    )
  })

  it('handles two-part TLDs correctly', () => {
    expect(extractRootDomain('example.co.uk')).toBe('example.co.uk')
    expect(extractRootDomain('shop.example.co.uk')).toBe('example.co.uk')
    expect(extractRootDomain('blog.shop.example.co.uk')).toBe('example.co.uk')
  })

  it('handles other multi-part TLDs', () => {
    expect(extractRootDomain('example.com.au')).toBe('example.com.au')
    expect(extractRootDomain('shop.example.com.au')).toBe('example.com.au')
    expect(extractRootDomain('example.org.uk')).toBe('example.org.uk')
    expect(extractRootDomain('shop.example.org.uk')).toBe('example.org.uk')
  })

  it('handles mixed-case domains', () => {
    expect(extractRootDomain('BLOG.Example.COM')).toBe('example.com')
    expect(extractRootDomain('SHOP.Example.CO.UK')).toBe('example.co.uk')
  })
})
