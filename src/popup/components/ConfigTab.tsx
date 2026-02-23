import { useCache, useConfig, useTabInfo } from '../hooks/useStore'
import styles from '../Popup.module.css'

export function ConfigTab() {
  const { config, updateConfig } = useConfig()
  const { tabInfo } = useTabInfo()
  const { clearCache, clearDomainCache } = useCache()

  return (
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
            onClick={clearDomainCache}
            className={styles['cache-btn']}
            disabled={!tabInfo.domain}
          >
            Clear Current Domain
          </button>
          <button
            type="button"
            onClick={clearCache}
            className={styles['cache-btn']}
          >
            Clear All Cache
          </button>
        </div>
        <p className={styles['config-hint']}>Cache expires after 30 minutes.</p>
      </div>
    </div>
  )
}
