import { ExternalLink } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import EndpointCard from './components/EndpointCard'
import HealthBar from './components/HealthBar'
import LoadingSpinner from './components/LoadingSpinner'
import ResultsViewer from './components/ResultsViewer'
import {
  getCollection,
  getCountries,
  getEvents,
  getHealth,
  getSectionsByCountry,
  searchSections,
} from './services/api'

function toCountryLabel(country, index) {
  if (typeof country === 'string') {
    return country
  }
  return country?.name || country?.country_name || country?.country_code || `Country ${index + 1}`
}

function sectionLabel(section, index) {
  return section?.name || section?.section_name || section?.full_name || `Section ${index + 1}`
}

function eventLabel(event, index) {
  return event?.title || event?.name || `Event ${index + 1}`
}

function clampLimit(rawValue, max = 500) {
  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 50
  }
  return Math.min(Math.floor(parsed), max)
}

function App() {
  const [healthLoading, setHealthLoading] = useState(true)
  const [healthError, setHealthError] = useState('')
  const [healthPayload, setHealthPayload] = useState(null)

  const [latestResult, setLatestResult] = useState(null)

  const [countriesLoading, setCountriesLoading] = useState(false)
  const [countriesError, setCountriesError] = useState('')
  const [countriesPayload, setCountriesPayload] = useState(null)

  const [countryCode, setCountryCode] = useState('TR')
  const [countrySectionsLoading, setCountrySectionsLoading] = useState(false)
  const [countrySectionsError, setCountrySectionsError] = useState('')
  const [countrySectionsPayload, setCountrySectionsPayload] = useState(null)

  const [sectionsCity, setSectionsCity] = useState('')
  const [sectionsLimit, setSectionsLimit] = useState(50)
  const [sectionsLoading, setSectionsLoading] = useState(false)
  const [sectionsError, setSectionsError] = useState('')
  const [sectionsPayload, setSectionsPayload] = useState(null)

  const [eventsUpcoming, setEventsUpcoming] = useState('all')
  const [eventsOrganizerSection, setEventsOrganizerSection] = useState('')
  const [eventsLimit, setEventsLimit] = useState(50)
  const [eventsSkip, setEventsSkip] = useState(0)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState('')
  const [eventsPayload, setEventsPayload] = useState(null)

  useEffect(() => {
    async function fetchHealth() {
      try {
        setHealthLoading(true)
        setHealthError('')
        const payload = await getHealth()
        setHealthPayload(payload)
      } catch (error) {
        setHealthError(error.message || 'Could not connect to API health endpoint.')
      } finally {
        setHealthLoading(false)
      }
    }

    fetchHealth()
  }, [])

  const countries = useMemo(() => getCollection(countriesPayload), [countriesPayload])
  const countrySections = useMemo(() => getCollection(countrySectionsPayload), [countrySectionsPayload])
  const sections = useMemo(() => getCollection(sectionsPayload), [sectionsPayload])
  const events = useMemo(() => getCollection(eventsPayload), [eventsPayload])

  async function handleFetchCountries() {
    try {
      setCountriesLoading(true)
      setCountriesError('')
      const payload = await getCountries()
      setCountriesPayload(payload)
      setLatestResult({ title: 'Countries', endpoint: '/api/v1/countries', payload })
    } catch (error) {
      setCountriesError(error.message || 'Failed to fetch countries.')
    } finally {
      setCountriesLoading(false)
    }
  }

  async function handleFetchSectionsByCountry() {
    const code = countryCode.trim().toUpperCase()
    if (!code) {
      setCountrySectionsError('Please enter a country code like TR, IT, or DE.')
      return
    }

    try {
      setCountrySectionsLoading(true)
      setCountrySectionsError('')
      const payload = await getSectionsByCountry(code)
      setCountrySectionsPayload(payload)
      setLatestResult({ title: `Sections in ${code}`, endpoint: `/api/v1/countries/${code}/sections`, payload })
    } catch (error) {
      setCountrySectionsError(error.message || 'Failed to fetch sections for this country.')
    } finally {
      setCountrySectionsLoading(false)
    }
  }

  async function handleSearchSections() {
    const limit = clampLimit(sectionsLimit)

    try {
      setSectionsLoading(true)
      setSectionsError('')
      const payload = await searchSections({
        city: sectionsCity.trim() || undefined,
        limit,
      })
      setSectionsPayload(payload)
      setLatestResult({ title: 'All Sections Search', endpoint: '/api/v1/sections', payload })
    } catch (error) {
      setSectionsError(error.message || 'Failed to search sections.')
    } finally {
      setSectionsLoading(false)
    }
  }

  async function handleFetchEvents() {
    try {
      setEventsLoading(true)
      setEventsError('')
      const payload = await getEvents({
        is_upcoming:
          eventsUpcoming === 'all' ? undefined : eventsUpcoming === 'upcoming' ? true : false,
        organizer_section: eventsOrganizerSection.trim() || undefined,
        limit: clampLimit(eventsLimit, 500),
        skip: Math.max(0, Number(eventsSkip) || 0),
      })
      setEventsPayload(payload)
      setLatestResult({ title: 'Global Events Feed', endpoint: '/api/v1/events', payload })
    } catch (error) {
      setEventsError(error.message || 'Failed to fetch events.')
    } finally {
      setEventsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                ESN API Test Area
              </h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                A simple playground to explore the ESN Activities global data network.
              </p>
            </div>
            <a
              href="https://esn-activities-api.onrender.com/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Swagger UI
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </header>

        <div className="mb-6">
          <HealthBar loading={healthLoading} error={healthError} payload={healthPayload} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
          <main className="space-y-6">
            <EndpointCard title="Countries" endpoint="/api/v1/countries">
              <button
                type="button"
                onClick={handleFetchCountries}
                disabled={countriesLoading}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Fetch Countries
              </button>

              {countriesLoading ? <LoadingSpinner label="Fetching countries..." /> : null}

              {countriesError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {countriesError}
                </p>
              ) : null}

              {countries.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {countries.map((country, index) => (
                    <span
                      key={`${toCountryLabel(country, index)}-${index}`}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {toCountryLabel(country, index)}
                    </span>
                  ))}
                </div>
              ) : null}
            </EndpointCard>

            <EndpointCard title="Sections by Country" endpoint="/api/v1/countries/{country_code}/sections">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Country Code</span>
                <input
                  type="text"
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                  placeholder="TR"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
                />
              </label>

              <button
                type="button"
                onClick={handleFetchSectionsByCountry}
                disabled={countrySectionsLoading}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Fetch Sections
              </button>

              {countrySectionsLoading ? <LoadingSpinner label="Fetching sections..." /> : null}

              {countrySectionsError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {countrySectionsError}
                </p>
              ) : null}

              {countrySections.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {countrySections.map((section, index) => (
                    <span
                      key={`${sectionLabel(section, index)}-${index}`}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {sectionLabel(section, index)}
                    </span>
                  ))}
                </div>
              ) : null}
            </EndpointCard>

            <EndpointCard title="Search All Sections" endpoint="/api/v1/sections">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-1">
                  <span className="mb-1 block text-sm font-medium text-slate-700">City (Optional)</span>
                  <input
                    type="text"
                    value={sectionsCity}
                    onChange={(event) => setSectionsCity(event.target.value)}
                    placeholder="Istanbul"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
                  />
                </label>
                <label className="block sm:col-span-1">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Limit (max 500)</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={sectionsLimit}
                    onChange={(event) => setSectionsLimit(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleSearchSections}
                disabled={sectionsLoading}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Search Sections
              </button>

              {sectionsLoading ? <LoadingSpinner label="Searching sections..." /> : null}

              {sectionsError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {sectionsError}
                </p>
              ) : null}

              {sections.length > 0 ? (
                <div className="space-y-2">
                  {sections.slice(0, 10).map((section, index) => (
                    <div key={`${sectionLabel(section, index)}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-900">{sectionLabel(section, index)}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {section.city || 'Unknown city'} • {section.country_code || 'Unknown country'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </EndpointCard>

            <EndpointCard title="Global Events Feed" endpoint="/api/v1/events">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">is_upcoming</span>
                  <select
                    value={eventsUpcoming}
                    onChange={(event) => setEventsUpcoming(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
                  >
                    <option value="all">All</option>
                    <option value="upcoming">Upcoming Only (true)</option>
                    <option value="past">Past Only (false)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Organizer Section (Optional)</span>
                  <input
                    type="text"
                    value={eventsOrganizerSection}
                    onChange={(event) => setEventsOrganizerSection(event.target.value)}
                    placeholder="ESN Ankara"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Limit</span>
                  <input
                    type="number"
                    min="1"
                    value={eventsLimit}
                    onChange={(event) => setEventsLimit(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Skip</span>
                  <input
                    type="number"
                    min="0"
                    value={eventsSkip}
                    onChange={(event) => setEventsSkip(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleFetchEvents}
                disabled={eventsLoading}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Fetch Events
              </button>

              {eventsLoading ? <LoadingSpinner label="Fetching events..." /> : null}

              {eventsError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {eventsError}
                </p>
              ) : null}

              {events.length > 0 ? (
                <div className="space-y-2">
                  {events.slice(0, 8).map((event, index) => (
                    <div key={`${eventLabel(event, index)}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-900">{eventLabel(event, index)}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {event.organizer_section || 'Unknown organizer'}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">{event.start_datetime || 'No date provided'}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </EndpointCard>
          </main>

          <ResultsViewer result={latestResult} />
        </div>
      </div>
    </div>
  )
}

export default App
