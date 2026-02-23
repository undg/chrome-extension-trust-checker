import { useEffect, useRef, useState } from 'react'
import type { TrustpilotRating } from '@/shared/types'
import {
  buildTrustpilotUrl,
  extractDomain,
  extractRootDomain,
  type TabInfo,
} from '@/shared/utils'
import styles from './Popup.module.css'

const STORAGE_KEY = 'trustchecker_useRootDomain'

export function Popup() {
  const [tabInfo, setTabInfo] = useState<TabInfo>({ domain: null, url: null })
  const [rating, setRating] = useState<TrustpilotRating | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useRootDomain, setUseRootDomain] = useState(true)
  const [storageLoaded, setStorageLoaded] = useState(false)
  const [isCached, setIsCached] = useState(false)
  const isFirstLoad = useRef(true)

  // Load saved preference on mount
  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY] !== undefined) {
        setUseRootDomain(result[STORAGE_KEY])
      }
      setStorageLoaded(true)
    })
  }, [])

  // Save preference when changed
  useEffect(() => {
    if (storageLoaded) {
      chrome.storage.local.set({ [STORAGE_KEY]: useRootDomain })
    }
  }, [useRootDomain, storageLoaded])

  // Fetch rating when tab or preference changes
  useEffect(() => {
    if (!storageLoaded) return

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0]
      const fullDomain = extractDomain(currentTab?.url)
      const domain = fullDomain
        ? useRootDomain
          ? extractRootDomain(fullDomain)
          : fullDomain
        : null

      setTabInfo({
        domain,
        url: currentTab?.url || null,
      })

      if (domain) {
        try {
          const response = await chrome.runtime.sendMessage({
            type: 'GET_CACHED_RATING',
            domain,
          })

          if (response?.rating) {
            setRating(response.rating)
            setIsCached(true)
          } else {
            setRating(null)
            setIsCached(false)
          }
        } catch {
          setError('Failed to load rating')
          setIsCached(false)
        }
      }

      if (isFirstLoad.current) {
        setLoading(false)
        isFirstLoad.current = false
      }
    })
  }, [useRootDomain, storageLoaded])

  const openTrustpilot = () => {
    if (tabInfo.domain) {
      const trustpilotUrl = rating?.url || buildTrustpilotUrl(tabInfo.domain)
      chrome.tabs.create({ url: trustpilotUrl })
    }
  }

  const handleToggleChange = () => {
    setUseRootDomain(!useRootDomain)
    setError(null)
  }

  const handleRefresh = async () => {
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
        chrome.runtime.sendMessage({
          type: 'UPDATE_BADGE',
          rating: response.rating.rating,
        })
      } else {
        setRating(null)
        setError('No rating found')
      }
    } catch {
      setError('Failed to refresh rating')
    } finally {
      setLoading(false)
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

  return (
    <div className={styles.popup}>
      <h1 className={styles.title}>Trust Checker</h1>

      {tabInfo.domain ? (
        <>
          <p className={styles.domain}>{tabInfo.domain}</p>

          <div className={styles['toggle-wrapper']}>
            <span className={styles['toggle-text']}>Full domain</span>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={useRootDomain}
                onChange={handleToggleChange}
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

          <div className={styles['button-group']}>
            <button
              type="button"
              onClick={openTrustpilot}
              className={styles['trustpilot-btn']}
            >
              View on Trustpilot
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className={styles['refresh-btn']}
              disabled={loading}
              title="Force refresh from Trustpilot"
            >
              ↻
            </button>
          </div>
        </>
      ) : (
        <p className={styles.error}>Unable to get domain from current tab</p>
      )}
    </div>
  )
}
