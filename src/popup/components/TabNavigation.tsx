import styles from '../Popup.module.css'

type Tab = 'rating' | 'config'

interface TabNavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className={styles['tab-nav']}>
      <button
        type="button"
        className={`${styles['tab-btn']} ${activeTab === 'rating' ? styles['tab-btn-active'] : ''}`}
        onClick={() => onTabChange('rating')}
      >
        Rating
      </button>
      <button
        type="button"
        className={`${styles['tab-btn']} ${activeTab === 'config' ? styles['tab-btn-active'] : ''}`}
        onClick={() => onTabChange('config')}
      >
        Config
      </button>
    </div>
  )
}
