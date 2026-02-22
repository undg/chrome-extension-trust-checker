console.log('Trust Checker service worker started')

chrome.runtime.onInstalled.addListener(() => {
  console.log('Trust Checker extension installed')
})

// Handle badge updates
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'UPDATE_BADGE') {
    const rating = message.rating as number

    // Set badge text (rounded rating)
    chrome.action.setBadgeText({
      text: rating > 0 ? rating.toFixed(1) : '',
    })

    // Set badge color based on rating
    let color = '#808080' // gray for no rating
    if (rating >= 4) {
      color = '#00b67a' // green
    } else if (rating >= 3) {
      color = '#73ccf1' // blue
    } else if (rating >= 2) {
      color = '#ffbf37' // yellow
    } else if (rating > 0) {
      color = '#e51e25' // red
    }

    chrome.action.setBadgeBackgroundColor({ color })

    sendResponse({ success: true })
  }

  return true
})

// Clear badge when switching tabs
chrome.tabs.onActivated.addListener(() => {
  chrome.action.setBadgeText({ text: '' })
})

chrome.tabs.onUpdated.addListener(() => {
  chrome.action.setBadgeText({ text: '' })
})
