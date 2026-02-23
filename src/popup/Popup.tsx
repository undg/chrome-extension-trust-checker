import { useEffect, useRef, useState } from 'react'
import { Api } from '@/api/api'
import type { TrustpilotRating } from '@/shared/types'
import {
  buildTrustpilotUrl,
  extractDomain,
  extractRootDomain,
  type TabInfo,
} from '@/shared/utils'

const STORAGE_KEY = 'trustchecker_useRootDomain'
const ratingClient = new Api({ strategy: 'scraper' })

export function Popup() {
  const [tabInfo, setTabInfo] = useState<TabInfo>({ domain: null, url: null })
  const [rating, setRating] = useState<TrustpilotRating | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useRootDomain, setUseRootDomain] = useState(true)
  const [storageLoaded, setStorageLoaded] = useState(false)
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
          const ratingData = await ratingClient.fetchRating(domain)
          setRating(ratingData)

          if (ratingData) {
            chrome.runtime.sendMessage({
              type: 'UPDATE_BADGE',
              rating: ratingData.rating,
            })
          }
        } catch {
          setError('Failed to fetch rating')
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

  const renderStars = (ratingValue: number) => {
    const fullStars = Math.floor(ratingValue)
    const hasHalfStar = ratingValue % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <span
        className="stars"
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
    <div className="popup">
      <h1>Trust Checker</h1>

      {tabInfo.domain ? (
        <>
          <p className="domain">{tabInfo.domain}</p>

          <div className="toggle-wrapper">
            <span className="toggle-text">Full domain</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={useRootDomain}
                onChange={handleToggleChange}
              />
              <span className="slider"></span>
            </label>
            <span className="toggle-text">Root domain</span>
          </div>

          {loading ? (
            <div className="rating-container">
              <p className="loading-text">Loading...</p>
            </div>
          ) : rating ? (
            <div className="rating-container">
              <div className="rating-stars">
                {renderStars(rating.rating)}
                <span className="rating-value">{rating.rating.toFixed(1)}</span>
              </div>
              <p className="review-count">
                {rating.reviewCount.toLocaleString()} reviews
              </p>
              {rating.trustScore && (
                <p className="trust-score">{rating.trustScore}</p>
              )}
            </div>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <p className="no-rating">No rating found</p>
          )}

          <button
            type="button"
            onClick={openTrustpilot}
            className="trustpilot-btn"
          >
            View on Trustpilot
          </button>
        </>
      ) : (
        <p className="error">Unable to get domain from current tab</p>
      )}
    </div>
  )
}
