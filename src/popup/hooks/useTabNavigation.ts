import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'

type Tab = 'rating' | 'config'

const activeTabAtom = atom<Tab>('rating')

export function useTabNavigation() {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom)

  const handleSetActiveTab = useCallback(
    (tab: Tab) => {
      setActiveTab(tab)
    },
    [setActiveTab],
  )

  return {
    activeTab,
    setActiveTab: handleSetActiveTab,
  }
}
