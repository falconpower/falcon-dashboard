import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

interface OnboardingEvent {
  form_type?: string
  form_export?: string
  timestamp?: {
    seconds: number
    nanoseconds: number
  }
}

interface Stats {
  form_type: Record<string, number>
  form_export: Record<string, number>
}

function calculateStats(events: OnboardingEvent[]): Stats {
  const stats: Stats = {
    form_type: {},
    form_export: {},
  }

  events.forEach((event) => {
    const formType = event.form_type ?? 'Unknown'
    const formExport = event.form_export ?? 'Unknown'

    stats.form_type[formType] = (stats.form_type[formType] || 0) + 1
    stats.form_export[formExport] = (stats.form_export[formExport] || 0) + 1
  })

  return stats
}

function FalconDashboard() {
  // Dashboard component to display Firestore statistics
  const [onboardingData, setOnboardingData] = useState<OnboardingEvent[]>([])
  const [paywallData, setPaywallData] = useState<OnboardingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [onboardingStats, setOnboardingStats] = useState<Stats | null>(null)
  const [paywallStats, setPaywallStats] = useState<Stats | null>(null)

  useEffect(() => {
    //Initialize Firebase (replace with your config)
    const firebaseConfig = {
      apiKey: "AIzaSyB1ZQCKRZNllIy1fmB2xMBpM0IGs-aLWnQ",
      authDomain: "falcon-forms-840f3.firebaseapp.com",
      projectId: "falcon-forms-840f3",
      storageBucket: "falcon-forms-840f3.firebasestorage.app",
      messagingSenderId: "628416702669",
      appId: "1:628416702669:web:59cb90f337caea5aa4a184",
      measurementId: "G-94YDE6XH2W"
    };
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)

    // Fetch data from Firestore
    const fetchData = async () => {
      try {
        // Fetch from onboardingEvents
        const onboardingSnapshot = await getDocs(collection(db, 'onboardingEvents'))
        const onboardingDocuments = onboardingSnapshot.docs.map(doc => doc.data() as OnboardingEvent)
        setOnboardingData(onboardingDocuments)
        setOnboardingStats(calculateStats(onboardingDocuments))

        // Fetch from paywallEvents
        const paywallSnapshot = await getDocs(collection(db, 'paywallEvents'))
        const paywallDocuments = paywallSnapshot.docs.map(doc => doc.data() as OnboardingEvent)
        setPaywallData(paywallDocuments)
        setPaywallStats(calculateStats(paywallDocuments))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const onboardingTotal = onboardingData.length
  const paywallTotal = paywallData.length
  const overallConversion = onboardingTotal > 0 ? (paywallTotal / onboardingTotal) * 100 : 0

  return (
    <div className="falcon-dashboard">
      <h1>Falcon Dashboard: {onboardingTotal}</h1>
      {loading && <p>Loading...</p>}
      {!loading && onboardingData.length === 0 && paywallData.length === 0 && <p>No data available</p>}

      {!loading && onboardingData.length > 0 && (
        <div>
          <h2>Onboarding Events Statistics</h2>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h3>Form Type Counts</h3>
              <ul>
                {(() => {
                  const entries = Object.entries(onboardingStats?.form_type || {}).sort((a, b) => b[1] - a[1])
                  const total = entries.reduce((sum, [, count]) => sum + count, 0)
                  return entries.map(([type, count]) => {
                    const percentage = ((count / total) * 100).toFixed(2)
                    return (
                      <li key={type}>
                        {type === '' ? '(empty)' : type}: <strong>{count}</strong> ({percentage}%)
                      </li>
                    )
                  })
                })()}
              </ul>
            </div>
            <div>
              <h3>Form Export Counts</h3>
              <ul>
                {(() => {
                  const entries = Object.entries(onboardingStats?.form_export || {}).sort((a, b) => b[1] - a[1])
                  const total = entries.reduce((sum, [, count]) => sum + count, 0)
                  return entries.map(([exp, count]) => {
                    const percentage = ((count / total) * 100).toFixed(2)
                    return (
                      <li key={exp}>
                        {exp === '' ? '(empty)' : exp}: <strong>{count}</strong> ({percentage}%)
                      </li>
                    )
                  })
                })()}
              </ul>
            </div>
          </div>
          {/* <h2>Onboarding Raw Data ({onboardingData.length} records)</h2>
          <pre>{JSON.stringify(onboardingData, null, 2)}</pre> */}
        </div>
      )}

      {!loading && paywallData.length > 0 && (
        <div>
          <h2>Paywall Events Statistics</h2>
          <p>
            Conversion from onboarding to paywall (overall): <strong>{overallConversion.toFixed(2)}%</strong> ({paywallTotal} / {onboardingTotal})
          </p>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h3>Form Type Counts</h3>
              <ul>
                {(() => {
                  const entries = Object.entries(paywallStats?.form_type || {}).sort((a, b) => b[1] - a[1])
                  const total = entries.reduce((sum, [, count]) => sum + count, 0)
                  return entries.map(([type, count]) => {
                    const percentage = ((count / total) * 100).toFixed(2)
                    return (
                      <li key={type}>
                        {type === '' ? '(empty)' : type}: <strong>{count}</strong> ({percentage}%)
                      </li>
                    )
                  })
                })()}
              </ul>
            </div>
            <div>
              <h3>Form Export Counts</h3>
              <ul>
                {(() => {
                  const entries = Object.entries(paywallStats?.form_export || {}).sort((a, b) => b[1] - a[1])
                  const total = entries.reduce((sum, [, count]) => sum + count, 0)
                  return entries.map(([exp, count]) => {
                    const percentage = ((count / total) * 100).toFixed(2)
                    return (
                      <li key={exp}>
                        {exp === '' ? '(empty)' : exp}: <strong>{count}</strong> ({percentage}%)
                      </li>
                    )
                  })
                })()}
              </ul>
            </div>
          </div>
          <h2>Paywall Raw Data ({paywallData.length} records)</h2>
          
          <pre>{JSON.stringify(paywallData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default FalconDashboard
