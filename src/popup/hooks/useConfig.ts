import { useCallback, useEffect, useState } from 'react'
import type { Config } from '@/shared/config'

interface UseConfigReturn {
  config: Config | null
  configLoaded: boolean
  updateConfig: (updates: Partial<Config>) => Promise<void>
}

export function useConfig(): UseConfigReturn {
  const [config, setConfig] = useState<Config | null>(null)
  const [configLoaded, setConfigLoaded] = useState(false)

  const updateConfig = useCallback(async (updates: Partial<Config>) => {
    const response = await chrome.runtime.sendMessage({
      type: 'SET_CONFIG',
      updates,
    })

    if (response?.success) {
      setConfig((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }, [])

  useEffect(() => {
    chrome.runtime
      .sendMessage({ type: 'GET_CONFIG' })
      .then((response) => {
        if (response?.config) {
          setConfig(response.config)
        }
        setConfigLoaded(true)
      })
      .catch(() => setConfigLoaded(true))
  }, [])

  return {
    config,
    configLoaded,
    updateConfig,
  }
}
