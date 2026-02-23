import { scrapeRating } from '@/api/scrapeRating'
import { ratingCache } from '@/shared/cache'
import { extractDomain, extractRootDomain } from '@/shared/utils'

console.log('Trust Checker service worker started')

const pendingFetches = new Set<string>()

async function updateBadge(domain: string): Promise<void> {
  const cached = await ratingCache.get(domain)

  if (cached) {
    setBadge(cached.rating)
    return
  }

  if (pendingFetches.has(domain)) {
    return
  }

  pendingFetches.add(domain)

  try {
    const rating = await scrapeRating(domain)

    if (rating) {
      await ratingCache.set(domain, rating)
      setBadge(rating.rating)
    } else {
      chrome.action.setBadgeText({ text: '' })
    }
  } finally {
    pendingFetches.delete(domain)
  }
}

function setBadge(rating: number): void {
  chrome.action.setBadgeText({
    text: rating > 0 ? rating.toFixed(1) : '',
  })

  let color = '#808080'
  if (rating >= 4) {
    color = '#00b67a'
  } else if (rating >= 3) {
    color = '#73ccf1'
  } else if (rating >= 2) {
    color = '#ffbf37'
  } else if (rating > 0) {
    color = '#e51e25'
  }

  chrome.action.setBadgeBackgroundColor({ color })
}

async function handleTabChange(url?: string): Promise<void> {
  if (
    !url ||
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://')
  ) {
    chrome.action.setBadgeText({ text: '' })
    return
  }

  const fullDomain = extractDomain(url)
  if (!fullDomain) {
    chrome.action.setBadgeText({ text: '' })
    return
  }

  const domain = extractRootDomain(fullDomain)
  await updateBadge(domain)
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Trust Checker extension installed')
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'UPDATE_BADGE') {
    setBadge(message.rating as number)
    sendResponse({ success: true })
    return true
  }

  if (message.type === 'CLEAR_CACHE') {
    const domain = message.domain as string | undefined
    ratingCache
      .clear(domain)
      .then(() => {
        sendResponse({ success: true })
      })
      .catch(() => {
        sendResponse({ success: false })
      })
    return true
  }

  if (message.type === 'GET_CACHED_RATING') {
    const domain = message.domain as string
    ratingCache
      .get(domain)
      .then((cached) => {
        sendResponse({ rating: cached })
      })
      .catch(() => {
        sendResponse({ rating: null })
      })
    return true
  }

  if (message.type === 'REFRESH_RATING') {
    const domain = message.domain as string
    ratingCache
      .clear(domain)
      .then(async () => {
        await updateBadge(domain)
        const cached = await ratingCache.get(domain)
        sendResponse({ success: true, rating: cached })
      })
      .catch(() => {
        sendResponse({ success: false })
      })
    return true
  }

  return true
})

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)
  await handleTabChange(tab.url)
})

chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
  if (changeInfo.url || (changeInfo.status === 'complete' && tab.url)) {
    await handleTabChange(tab.url)
  }
})
