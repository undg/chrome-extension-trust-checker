import { useState, useEffect } from 'react'
import { TabInfo, extractDomain, buildTrustpilotUrl } from '../shared/utils'

export function Popup() {
  const [tabInfo, setTabInfo] = useState<TabInfo>({ domain: null, url: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0]
      const domain = extractDomain(currentTab?.url)
      setTabInfo({
        domain,
        url: currentTab?.url || null
      })
      setLoading(false)
    })
  }, [])

  const openTrustpilot = () => {
    if (tabInfo.domain) {
      const trustpilotUrl = buildTrustpilotUrl(tabInfo.domain)
      chrome.tabs.create({ url: trustpilotUrl })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="popup">
      <h1>Trust Checker</h1>
      
      {tabInfo.domain ? (
        <>
          <p className="domain">{tabInfo.domain}</p>
          <button 
            onClick={openTrustpilot}
            className="trustpilot-btn"
          >
            View Trustpilot Reviews
          </button>
        </>
      ) : (
        <p className="error">Unable to get domain from current tab</p>
      )}
    </div>
  )
}
