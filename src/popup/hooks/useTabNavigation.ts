import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'

type Tab = 'rating' | 'config'

//  @TODO (undg) 2026-02-23: tmp, flip it back
const activeTabAtom = atom<Tab>('config')

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
