console.log('Trust Checker service worker started')

chrome.runtime.onInstalled.addListener(() => {
  console.log('Trust Checker extension installed')
})
