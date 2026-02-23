import { buildTrustpilotUrl } from '@/shared/utils'
import common from '../common.module.css'
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
      <div className={styles.tabPanel}>
        <p className={styles.error}>Unable to get domain from current tab</p>
      </div>
    )
  }

  return (
    <div className={styles.tabPanel}>
      <p className={styles.domain}>{tabInfo.domain}</p>

      <div className={common.toggleWrapper}>
        <span className={common.toggleText}>Full domain</span>
        <label className={common.switch}>
          <input
            type="checkbox"
            checked={config?.useRootDomain ?? true}
            onChange={() =>
              updateConfig({ useRootDomain: !config?.useRootDomain })
            }
          />
          <span className={common.slider}></span>
        </label>
        <span className={common.toggleText}>Root domain</span>
      </div>

      {loading ? (
        <div className={styles.ratingContainer}>
          <p className={styles.loadingText}>Loading...</p>
        </div>
      ) : rating ? (
        <div className={styles.ratingContainer}>
          <div className={styles.ratingStars}>
            <StarRating rating={rating.rating} />
            <span className={styles.ratingValue}>
              {rating.rating.toFixed(1)}
            </span>
          </div>
          <p className={styles.reviewCount}>
            {rating.reviewCount.toLocaleString()} reviews
            {isCached && (
              <span className={styles.cacheIndicator}> (cached)</span>
            )}
          </p>
          {rating.trustScore && (
            <p className={styles.trustScore}>{rating.trustScore}</p>
          )}
        </div>
      ) : error ? (
        <p className={styles.errorMessage}>{error}</p>
      ) : (
        <p className={styles.noRating}>No rating found</p>
      )}

      <button
        type="button"
        onClick={openTrustpilot}
        className={`${common.btn} ${common.btnPrimary}`}
      >
        View on Trustpilot
      </button>
    </div>
  )
}
