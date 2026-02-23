interface Config {
  autoFetchOnPageLoad: boolean
  useRootDomain: boolean
}

const CONFIG_KEY = 'trustchecker_config'
const DEFAULT_CONFIG: Config = {
  autoFetchOnPageLoad: false,
  useRootDomain: true,
}

class ConfigStore {
  private cache: Config | null = null

  async get(): Promise<Config> {
    if (this.cache) return this.cache

    const result = await chrome.storage.local.get([CONFIG_KEY])
    const stored = result[CONFIG_KEY] as Partial<Config> | undefined

    this.cache = {
      ...DEFAULT_CONFIG,
      ...stored,
    }

    return this.cache
  }

  async set(updates: Partial<Config>): Promise<void> {
    const current = await this.get()
    this.cache = { ...current, ...updates }
    await chrome.storage.local.set({ [CONFIG_KEY]: this.cache })
  }

  async reset(): Promise<void> {
    this.cache = { ...DEFAULT_CONFIG }
    await chrome.storage.local.set({ [CONFIG_KEY]: this.cache })
  }
}

export const configStore = new ConfigStore()
export type { Config }
