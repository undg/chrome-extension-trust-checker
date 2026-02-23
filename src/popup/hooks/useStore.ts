import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  clearCacheAtom,
  clearCacheLoadingAtom,
  clearDomainCacheAtom,
  configAtom,
  configLoadedAtom,
  errorAtom,
  initializePopupAtom,
  isCachedAtom,
  loadConfigAtom,
  loadingAtom,
  ratingAtom,
  tabInfoAtom,
  updateConfigAtom,
} from '../store'

// Hook for config-related state and actions
export function useConfig() {
  const config = useAtomValue(configAtom)
  const configLoaded = useAtomValue(configLoadedAtom)
  const updateConfig = useSetAtom(updateConfigAtom)

  return {
    config,
    configLoaded,
    updateConfig,
  }
}

// Hook for tab info
export function useTabInfo() {
  const tabInfo = useAtomValue(tabInfoAtom)
  return { tabInfo }
}

// Hook for rating state (read-only)
export function useRatingState() {
  const rating = useAtomValue(ratingAtom)
  const loading = useAtomValue(loadingAtom)
  const error = useAtomValue(errorAtom)
  const isCached = useAtomValue(isCachedAtom)

  return {
    rating,
    loading,
    error,
    isCached,
  }
}

// Hook for popup initialization
export function usePopupInit() {
  const configLoaded = useAtomValue(configLoadedAtom)
  const initialize = useSetAtom(initializePopupAtom)
  const loadConfig = useSetAtom(loadConfigAtom)

  // Load config on mount
  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  return {
    configLoaded,
    initialize,
  }
}

// Hook for cache management
export function useCache() {
  const clearCache = useSetAtom(clearCacheAtom)
  const clearDomainCache = useSetAtom(clearDomainCacheAtom)
  const isClearing = useAtomValue(clearCacheLoadingAtom)

  return {
    clearCache,
    clearDomainCache,
    isClearing,
  }
}
