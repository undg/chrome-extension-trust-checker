import { useEffect, useState } from 'react'
import { ratingAPI } from '../shared/api'
import type { TrustpilotRating } from '../shared/types'
import {
  buildTrustpilotUrl,
  extractDomain,
  type TabInfo,
} from '../shared/utils'

export function Popup() {
  const [tabInfo, setTabInfo] = useState<TabInfo>({ domain: null, url: null })
  const [rating, setRating] = useState<TrustpilotRating | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0]
      const domain = extractDomain(currentTab?.url)

      setTabInfo({
        domain,
        url: currentTab?.url || null,
      })

      if (domain) {
        try {
          const ratingData = await ratingAPI.fetchRating(domain)
          setRating(ratingData)

          // Update badge with rating
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

      setLoading(false)
    })
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

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="popup">
      <h1>Trust Checker</h1>

      {tabInfo.domain ? (
        <>
          <p className="domain">{tabInfo.domain}</p>

          {rating ? (
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
