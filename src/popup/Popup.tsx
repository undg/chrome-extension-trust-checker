import { useCallback, useEffect, useState } from 'react'
import type { Config } from '@/shared/config'
import type { TrustpilotRating } from '@/shared/types'
import {
  buildTrustpilotUrl,
  extractDomain,
  extractRootDomain,
  type TabInfo,
} from '@/shared/utils'
import styles from './Popup.module.css'

type Tab = 'rating' | 'config'

export function Popup() {
  const [activeTab, setActiveTab] = useState<Tab>('rating')
  const [tabInfo, setTabInfo] = useState<TabInfo>({ domain: null, url: null })
  const [rating, setRating] = useState<TrustpilotRating | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<Config | null>(null)
  const [configLoaded, setConfigLoaded] = useState(false)
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

  // Load config on mount
  useEffect(() => {
    chrome.runtime
      .sendMessage({ type: 'GET_CONFIG' })
      .then((response) => {
        if (response?.config) {
          setConfig(response.config)
        }
        setConfigLoaded(true)
      })
      .catch(() => setConfigLoaded(true))
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

  const updateConfig = useCallback(async (updates: Partial<Config>) => {
    const response = await chrome.runtime.sendMessage({
      type: 'SET_CONFIG',
      updates,
    })

    if (response?.success) {
      setConfig((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }, [])

  const openTrustpilot = () => {
    if (tabInfo.domain) {
      const trustpilotUrl = rating?.url || buildTrustpilotUrl(tabInfo.domain)
      chrome.tabs.create({ url: trustpilotUrl })
    }
  }

  const renderStars = (ratingValue: number) => {
    const fullStars = Math.floor(ratingValue)
    const hasHalfStar = ratingValue % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <span
        className={styles.stars}
        role="img"
        aria-label={`${ratingValue} out of 5 stars`}
      >
        {'★'.repeat(fullStars)}
        {hasHalfStar && '½'}
        {'☆'.repeat(emptyStars)}
      </span>
    )
  }

  const renderRatingTab = () => (
    <div className={styles['tab-panel']}>
      {tabInfo.domain ? (
        <>
          <p className={styles.domain}>{tabInfo.domain}</p>

          <div className={styles['toggle-wrapper']}>
            <span className={styles['toggle-text']}>Full domain</span>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={config?.useRootDomain ?? true}
                onChange={() =>
                  updateConfig({ useRootDomain: !config?.useRootDomain })
                }
              />
              <span className={styles.slider}></span>
            </label>
            <span className={styles['toggle-text']}>Root domain</span>
          </div>

          {loading ? (
            <div className={styles['rating-container']}>
              <p className={styles['loading-text']}>Loading...</p>
            </div>
          ) : rating ? (
            <div className={styles['rating-container']}>
              <div className={styles['rating-stars']}>
                {renderStars(rating.rating)}
                <span className={styles['rating-value']}>
                  {rating.rating.toFixed(1)}
                </span>
              </div>
              <p className={styles['review-count']}>
                {rating.reviewCount.toLocaleString()} reviews
                {isCached && (
                  <span className={styles['cache-indicator']}> (cached)</span>
                )}
              </p>
              {rating.trustScore && (
                <p className={styles['trust-score']}>{rating.trustScore}</p>
              )}
            </div>
          ) : error ? (
            <p className={styles['error-message']}>{error}</p>
          ) : (
            <p className={styles['no-rating']}>No rating found</p>
          )}

          <button
            type="button"
            onClick={openTrustpilot}
            className={styles['trustpilot-btn']}
          >
            View on Trustpilot
          </button>
        </>
      ) : (
        <p className={styles.error}>Unable to get domain from current tab</p>
      )}
    </div>
  )

  const renderConfigTab = () => (
    <div className={styles['tab-panel']}>
      <div className={styles['config-section']}>
        <h3 className={styles['config-heading']}>Loading Mode</h3>
        <div className={styles['config-option']}>
          <label className={styles['config-radio']}>
            <input
              type="radio"
              name="autoFetch"
              checked={!config?.autoFetchOnPageLoad}
              onChange={() => updateConfig({ autoFetchOnPageLoad: false })}
            />
            <span>On-demand (manual fetch)</span>
          </label>
          <label className={styles['config-radio']}>
            <input
              type="radio"
              name="autoFetch"
              checked={config?.autoFetchOnPageLoad}
              onChange={() => updateConfig({ autoFetchOnPageLoad: true })}
            />
            <span>Automatic (fetch on page load)</span>
          </label>
        </div>
        <p className={styles['config-hint']}>
          {config?.autoFetchOnPageLoad
            ? 'Ratings are automatically fetched when you visit a website.'
            : 'Rating is fetched when you open the popup.'}
        </p>
      </div>

      <div className={styles['config-section']}>
        <h3 className={styles['config-heading']}>Domain Settings</h3>
        <label className={styles['config-checkbox']}>
          <input
            type="checkbox"
            checked={config?.useRootDomain ?? true}
            onChange={() =>
              updateConfig({ useRootDomain: !config?.useRootDomain })
            }
          />
          <span>Use root domain for lookups</span>
        </label>
        <p className={styles['config-hint']}>
          Example: blog.example.com → example.com
        </p>
      </div>

      <div className={styles['config-section']}>
        <h3 className={styles['config-heading']}>Cache Management</h3>
        <div className={styles['cache-buttons']}>
          <button
            type="button"
            onClick={handleClearDomainCache}
            className={styles['cache-btn']}
            disabled={!tabInfo.domain}
          >
            Clear Current Domain
          </button>
          <button
            type="button"
            onClick={handleClearCache}
            className={styles['cache-btn']}
          >
            Clear All Cache
          </button>
        </div>
        <p className={styles['config-hint']}>Cache expires after 30 minutes.</p>
      </div>
    </div>
  )

  return (
    <div className={styles.popup}>
      <h1 className={styles.title}>Trust Checker</h1>

      <div className={styles['tab-nav']}>
        <button
          type="button"
          className={`${styles['tab-btn']} ${activeTab === 'rating' ? styles['tab-btn-active'] : ''}`}
          onClick={() => setActiveTab('rating')}
        >
          Rating
        </button>
        <button
          type="button"
          className={`${styles['tab-btn']} ${activeTab === 'config' ? styles['tab-btn-active'] : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Config
        </button>
      </div>

      {activeTab === 'rating' ? renderRatingTab() : renderConfigTab()}
    </div>
  )
}
