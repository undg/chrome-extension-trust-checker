import { useEffect } from 'react'
import { ConfigTab } from './components/ConfigTab'
import { RatingTab } from './components/RatingTab'
import { TabNavigation } from './components/TabNavigation'
import { useConfig, usePopupInit } from './hooks/useStore'
import { useTabNavigation } from './hooks/useTabNavigation'
import styles from './Popup.module.css'

export function Popup() {
  const { activeTab, setActiveTab } = useTabNavigation()
  const { configLoaded } = useConfig()
  const { initialize } = usePopupInit()

  // Initialize popup on mount
  useEffect(() => {
    if (configLoaded) {
      initialize()
    }
  }, [configLoaded, initialize])

  return (
    <div className={styles.popup}>
      <h1 className={styles.title}>Trust Checker</h1>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'rating' && <RatingTab />}
      {activeTab === 'config' && <ConfigTab />}
    </div>
  )
}
