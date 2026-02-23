import common from '../common.module.css'
import { useCache, useConfig, useTabInfo } from '../hooks/useStore'
import styles from '../Popup.module.css'

export function ConfigTab() {
  const { config, updateConfig } = useConfig()
  const { tabInfo } = useTabInfo()
  const { clearCache, clearDomainCache, isClearing } = useCache()

  return (
    <div className={styles['tab-panel']}>
      <div className={styles['config-section']}>
        <h3 className={styles['config-heading']}>Loading Mode</h3>
        <div className={common['toggle-wrapper']}>
          <span className={common['toggle-text']}>On-demand</span>
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
          <span className={common['toggle-text']}>Automatic</span>
        </div>
        <p className={styles['config-hint']}>
          {config?.autoFetchOnPageLoad
            ? 'Ratings are automatically fetched when you visit a website.'
            : 'Rating is fetched when you open the popup.'}
        </p>
      </div>

      <div className={styles['config-section']}>
        <h3 className={styles['config-heading']}>Domain Settings</h3>
        <div className={common['toggle-wrapper']}>
          <span className={common['toggle-text']}>Full domain</span>
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
          <span className={common['toggle-text']}>Root domain</span>
        </div>
        <p className={styles['config-hint']}>
          Example: blog.example.com → example.com
        </p>
      </div>

      <div className={styles['config-section']}>
        <h3 className={styles['config-heading']}>Cache Management</h3>
        <div className={styles['cache-buttons']}>
          <button
            type="button"
            onClick={clearDomainCache}
            className={`${common.btn} ${common['btn-primary']}`}
            disabled={!tabInfo.domain || isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear Current Domain'}
          </button>
          <button
            type="button"
            onClick={clearCache}
            className={`${common.btn} ${common['btn-primary']}`}
            disabled={isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear All Cache'}
          </button>
        </div>
        <p className={styles['config-hint']}>Cache expires after 30 minutes.</p>
      </div>
    </div>
  )
}
