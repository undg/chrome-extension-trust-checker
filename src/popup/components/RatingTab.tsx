import { buildTrustpilotUrl } from '@/shared/utils'
import { useConfig, useRatingState, useTabInfo } from '../hooks/useStore'
import styles from '../Popup.module.css'
import { StarRating } from './StarRating'

export function RatingTab() {
  const { config, updateConfig } = useConfig()
  const { tabInfo } = useTabInfo()
  const { rating, loading, error, isCached } = useRatingState()

  const openTrustpilot = () => {
    if (tabInfo.domain) {
      const trustpilotUrl = rating?.url || buildTrustpilotUrl(tabInfo.domain)
      chrome.tabs.create({ url: trustpilotUrl })
    }
  }

  if (!tabInfo.domain) {
    return (
      <div className={styles['tab-panel']}>
        <p className={styles.error}>Unable to get domain from current tab</p>
      </div>
    )
  }

  return (
    <div className={styles['tab-panel']}>
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
            <StarRating rating={rating.rating} />
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
    </div>
  )
}
