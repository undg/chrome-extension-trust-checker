import { useCallback, useEffect, useState } from 'react'
import type { Config } from '@/shared/config'
import type { TrustpilotRating } from '@/shared/types'
import { extractDomain, extractRootDomain, type TabInfo } from '@/shared/utils'

interface UseRatingReturn {
  tabInfo: TabInfo
  rating: TrustpilotRating | null
  loading: boolean
  error: string | null
  isCached: boolean
  handleFetchRating: () => Promise<void>
  handleClearCache: () => Promise<void>
  handleClearDomainCache: () => Promise<void>
}

export function useRating(
  config: Config | null,
  configLoaded: boolean,
): UseRatingReturn {
  const [tabInfo, setTabInfo] = useState<TabInfo>({ domain: null, url: null })
  const [rating, setRating] = useState<TrustpilotRating | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)

  const loadCachedRating = useCallback(async (domain: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_CACHED_RATING',
        domain,
      })

      if (response?.rating) {
        setRating(response.rating)
        setIsCached(true)
        setError(null)
      } else {
        setRating(null)
        setIsCached(false)
        setError(null)
      }
    } catch {
      setRating(null)
      setIsCached(false)
      setError(null)
    }
  }, [])

  const handleFetchRating = useCallback(async () => {
    if (!tabInfo.domain) return

    setLoading(true)
    setError(null)

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'REFRESH_RATING',
        domain: tabInfo.domain,
      })

      if (response?.success && response.rating) {
        setRating(response.rating)
        setIsCached(false)
        setError(null)
        chrome.runtime.sendMessage({
          type: 'UPDATE_BADGE',
          rating: response.rating.rating,
        })
      } else {
        setRating(null)
        setError('No rating found')
      }
    } catch {
      setError('Failed to fetch rating')
    } finally {
      setLoading(false)
    }
  }, [tabInfo.domain])

  const handleClearCache = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' })
      setRating(null)
      setIsCached(false)
    } catch {
      setError('Failed to clear cache')
    }
  }, [])

  const handleClearDomainCache = useCallback(async () => {
    if (!tabInfo.domain) return
    try {
      await chrome.runtime.sendMessage({
        type: 'CLEAR_CACHE',
        domain: tabInfo.domain,
      })
      setRating(null)
      setIsCached(false)
    } catch {
      setError('Failed to clear cache')
    }
  }, [tabInfo.domain])

  // Load rating when popup opens
  useEffect(() => {
    if (!configLoaded) return

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0]
      const fullDomain = extractDomain(currentTab?.url)
      const domain = fullDomain
        ? (config?.useRootDomain ?? true)
          ? extractRootDomain(fullDomain)
          : fullDomain
        : null

      setTabInfo({
        domain,
        url: currentTab?.url || null,
      })

      if (!domain) return

      // Try to load cached rating first
      await loadCachedRating(domain)

      // For on-demand mode: fetch fresh rating when popup opens if no cached data
      if (!config?.autoFetchOnPageLoad) {
        const response = await chrome.runtime.sendMessage({
          type: 'GET_CACHED_RATING',
          domain,
        })
        if (!response?.rating) {
          // No cached rating, fetch it now
          handleFetchRating()
        }
      }
    })
  }, [
    configLoaded,
    config?.useRootDomain,
    config?.autoFetchOnPageLoad,
    loadCachedRating,
    handleFetchRating,
  ])

  return {
    tabInfo,
    rating,
    loading,
    error,
    isCached,
    handleFetchRating,
    handleClearCache,
    handleClearDomainCache,
  }
}
