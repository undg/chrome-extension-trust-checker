import { atom } from 'jotai'
import type { Config } from '@/shared/config'
import type { TrustpilotRating } from '@/shared/types'
import { extractDomain, extractRootDomain, type TabInfo } from '@/shared/utils'

// Base atoms
export const configAtom = atom<Config | null>(null)
export const configLoadedAtom = atom<boolean>(false)
export const tabInfoAtom = atom<TabInfo>({ domain: null, url: null })
export const ratingAtom = atom<TrustpilotRating | null>(null)
export const loadingAtom = atom<boolean>(false)
export const errorAtom = atom<string | null>(null)
export const isCachedAtom = atom<boolean>(false)
export const clearCacheLoadingAtom = atom<boolean>(false)

// Derived atom for effective domain based on config
export const effectiveDomainAtom = atom((get) => {
  const tabInfo = get(tabInfoAtom)
  const config = get(configAtom)

  if (!tabInfo.url) return null

  const fullDomain = extractDomain(tabInfo.url)
  if (!fullDomain) return null

  const useRootDomain = config?.useRootDomain ?? true
  return useRootDomain ? extractRootDomain(fullDomain) : fullDomain
})

// Action atom to load config
export const loadConfigAtom = atom(null, async (_, set) => {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' })
    if (response?.config) {
      set(configAtom, response.config)
    }
  } finally {
    set(configLoadedAtom, true)
  }
})

// Action atom to update config
export const updateConfigAtom = atom(
  null,
  async (get, set, updates: Partial<Config>) => {
    const current = get(configAtom)
    const previousUseRootDomain = current?.useRootDomain ?? true

    const response = await chrome.runtime.sendMessage({
      type: 'SET_CONFIG',
      updates,
    })

    if (response?.success) {
      set(configAtom, current ? { ...current, ...updates } : null)

      // If useRootDomain setting changed, reinitialize for new domain mode
      if (
        updates.useRootDomain !== undefined &&
        updates.useRootDomain !== previousUseRootDomain
      ) {
        // Clear current rating since domain mode changed
        set(ratingAtom, null)
        set(isCachedAtom, false)
        // Update badge to clear it until new rating is fetched
        chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', rating: 0 })
        // Reinitialize popup with new domain mode
        await set(initializePopupAtom)
      }
    }
  },
)

// Action atom to load current tab info
export const loadTabInfoAtom = atom(null, async (get, set) => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const currentTab = tabs[0]
  const fullDomain = extractDomain(currentTab?.url)
  const config = get(configAtom)

  const domain = fullDomain
    ? (config?.useRootDomain ?? true)
      ? extractRootDomain(fullDomain)
      : fullDomain
    : null

  set(tabInfoAtom, {
    domain,
    url: currentTab?.url || null,
  })
})

// Action atom to load cached rating
export const loadCachedRatingAtom = atom(null, async (get, set) => {
  const domain = get(tabInfoAtom).domain
  if (!domain) return

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_CACHED_RATING',
      domain,
    })

    if (response?.rating) {
      set(ratingAtom, response.rating)
      set(isCachedAtom, true)
      set(errorAtom, null)
      // Update badge with cached rating
      chrome.runtime.sendMessage({
        type: 'UPDATE_BADGE',
        rating: response.rating.rating,
      })
    } else {
      set(ratingAtom, null)
      set(isCachedAtom, false)
      set(errorAtom, null)
      // Clear badge when no cached rating
      chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', rating: 0 })
    }
  } catch {
    set(ratingAtom, null)
    set(isCachedAtom, false)
    set(errorAtom, null)
  }
})

// Action atom to fetch fresh rating
export const fetchRatingAtom = atom(null, async (get, set) => {
  const domain = get(tabInfoAtom).domain
  if (!domain) return

  set(loadingAtom, true)
  set(errorAtom, null)

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'REFRESH_RATING',
      domain,
    })

    if (response?.success && response.rating) {
      set(ratingAtom, response.rating)
      set(isCachedAtom, false)
      set(errorAtom, null)
      chrome.runtime.sendMessage({
        type: 'UPDATE_BADGE',
        rating: response.rating.rating,
      })
    } else {
      set(ratingAtom, null)
      set(errorAtom, 'No rating found')
    }
  } catch {
    set(errorAtom, 'Failed to fetch rating')
  } finally {
    set(loadingAtom, false)
  }
})

// Action atom to initialize popup (load tab info and cached rating, fetch if needed)
export const initializePopupAtom = atom(null, async (get, set) => {
  const configLoaded = get(configLoadedAtom)
  if (!configLoaded) return

  // Load tab info
  await set(loadTabInfoAtom)

  const domain = get(tabInfoAtom).domain
  if (!domain) return

  // Try to load cached rating first
  await set(loadCachedRatingAtom)

  // For on-demand mode: fetch fresh rating if no cached data
  const config = get(configAtom)
  if (!config?.autoFetchOnPageLoad && !get(ratingAtom)) {
    await set(fetchRatingAtom)
  }
})

// Action atom to clear all cache
export const clearCacheAtom = atom(null, async (_, set) => {
  set(clearCacheLoadingAtom, true)
  try {
    await chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' })
    set(ratingAtom, null)
    set(isCachedAtom, false)
    // Clear badge when cache is cleared
    chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', rating: 0 })
  } catch {
    set(errorAtom, 'Failed to clear cache')
  } finally {
    set(clearCacheLoadingAtom, false)
  }
})

// Action atom to clear current domain cache
export const clearDomainCacheAtom = atom(null, async (get, set) => {
  const domain = get(tabInfoAtom).domain
  if (!domain) return

  set(clearCacheLoadingAtom, true)
  try {
    await chrome.runtime.sendMessage({
      type: 'CLEAR_CACHE',
      domain,
    })
    set(ratingAtom, null)
    set(isCachedAtom, false)
    // Clear badge when cache is cleared
    chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', rating: 0 })
  } catch {
    set(errorAtom, 'Failed to clear cache')
  } finally {
    set(clearCacheLoadingAtom, false)
  }
})
