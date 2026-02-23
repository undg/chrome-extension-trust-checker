import common from '../common.module.css'
import { useCache, useConfig, useTabInfo } from '../hooks/useStore'
import styles from '../Popup.module.css'

export function ConfigTab() {
  const { config, updateConfig } = useConfig()
  const { tabInfo } = useTabInfo()
  const { clearCache, clearDomainCache, isClearing } = useCache()

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
            className={`${common.btn} ${common.btnPrimary}`}
            disabled={!tabInfo.domain || isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear Current Domain'}
          </button>
          <button
            type="button"
            onClick={clearCache}
            className={`${common.btn} ${common.btnPrimary}`}
            disabled={isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear All Cache'}
          </button>
        </div>
        <p className={styles.configHint}>Cache expires after 30 minutes.</p>
      </div>
    </div>
  )
}
