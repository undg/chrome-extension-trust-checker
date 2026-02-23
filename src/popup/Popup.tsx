import { ConfigTab } from './components/ConfigTab'
import { RatingTab } from './components/RatingTab'
import { TabNavigation } from './components/TabNavigation'
import { useConfig } from './hooks/useConfig'
import { useRating } from './hooks/useRating'
import { useTabNavigation } from './hooks/useTabNavigation'
import styles from './Popup.module.css'

export function Popup() {
  const { activeTab, setActiveTab } = useTabNavigation()
  const { config, configLoaded, updateConfig } = useConfig()
  const {
    tabInfo,
    rating,
    loading,
    error,
    isCached,
    handleClearCache,
    handleClearDomainCache,
  } = useRating(config, configLoaded)

  return (
    <div className={styles.popup}>
      <h1 className={styles.title}>Trust Checker</h1>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'rating' && (
        <RatingTab
          tabInfo={tabInfo}
          rating={rating}
          loading={loading}
          error={error}
          isCached={isCached}
          config={config}
          onUpdateConfig={updateConfig}
        />
      )}
      {activeTab === 'config' && (
        <ConfigTab
          config={config}
          tabInfo={tabInfo}
          onUpdateConfig={updateConfig}
          onClearCache={handleClearCache}
          onClearDomainCache={handleClearDomainCache}
        />
      )}
    </div>
  )
}
