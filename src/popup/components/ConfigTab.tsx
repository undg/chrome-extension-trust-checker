import { useEffect } from 'react'
import common from '../common.module.css'
import {
  useCache,
  useCacheStats,
  useConfig,
  useTabInfo,
} from '../hooks/useStore'
import styles from '../Popup.module.css'

function formatDuration(ms: number): string {
  if (ms <= 0) return 'expired'
  const minutes = Math.ceil(ms / 60000)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) return `${hours} hr`
  return `${hours} hr ${remainingMinutes} min`
}

export function ConfigTab() {
  const { config, updateConfig } = useConfig()
  const { tabInfo } = useTabInfo()
  const { clearCache, clearDomainCache, isClearing } = useCache()
  const { cacheSize, cacheInfo, loadCacheStats } = useCacheStats()

  useEffect(() => {
    loadCacheStats()
  }, [loadCacheStats, tabInfo.domain])

  return (
    <div className={styles.tabPanel}>
      <div className={styles.configSection}>
        <h3 className={styles.configHeading}>Loading Mode</h3>
        <div className={common.toggleWrapper}>
          <span className={common.toggleText}>On-demand</span>
          <label className={common.switch}>
            <input
              type="checkbox"
              checked={config?.autoFetchOnPageLoad}
              onChange={() =>
                updateConfig({
                  autoFetchOnPageLoad: !config?.autoFetchOnPageLoad,
                })
              }
            />
            <span className={common.slider}></span>
          </label>
          <span className={common.toggleText}>Automatic</span>
        </div>
        <p className={styles.configHint}>
          {config?.autoFetchOnPageLoad
            ? 'Ratings are automatically fetched when you visit a website.'
            : 'Rating is fetched when you open the popup.'}
        </p>
      </div>

      <div className={styles.configSection}>
        <h3 className={styles.configHeading}>Domain Settings</h3>
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
        <p className={styles.configHint}>
          Example: blog.example.com → example.com
        </p>
      </div>

      <div className={styles.configSection}>
        <h3 className={styles.configHeading}>Cache Management</h3>
        <div className={styles.cacheButtons}>
          <button
            type="button"
            onClick={clearDomainCache}
            className={`${common.btn} ${common.btnDanger}`}
            disabled={!tabInfo.domain || isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear Current Domain'}
          </button>
          <button
            type="button"
            onClick={clearCache}
            className={`${common.btn} ${common.btnDanger}`}
            disabled={isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear All Domains'}
          </button>
          <span>Cached websites: {cacheSize}</span>
        </div>
        <p className={styles.configHint}>
          {cacheInfo && cacheInfo.cached
            ? `Current domain expires in: ${formatDuration(cacheInfo.expiresIn)}`
            : 'Cache expires after 30 minutes.'}
        </p>
      </div>
    </div>
  )
}
