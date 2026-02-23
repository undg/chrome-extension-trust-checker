import { useCallback, useState } from 'react'

type Tab = 'rating' | 'config'

interface UseTabNavigationReturn {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
}

export function useTabNavigation(): UseTabNavigationReturn {
  const [activeTab, setActiveTab] = useState<Tab>('rating')

  const handleSetActiveTab = useCallback((tab: Tab) => {
    setActiveTab(tab)
  }, [])

  return {
    activeTab,
    setActiveTab: handleSetActiveTab,
  }
}
