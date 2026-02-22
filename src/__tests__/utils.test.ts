import { describe, expect, it } from 'vitest'
import { buildTrustpilotUrl, extractDomain } from '../shared/utils'

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
