import { Braces, LayoutList } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getCollection } from '../services/api'

function pretty(value) {
  return JSON.stringify(value, null, 2)
}

function inferLabel(item, fallbackPrefix, index) {
  return (
    item?.name ||
    item?.title ||
    item?.full_name ||
    item?.section_name ||
    item?.organizer_section ||
    `${fallbackPrefix} ${index + 1}`
  )
}

function JsonPanel({ payload }) {
  return (
    <pre className="max-h-[28rem] overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
      {pretty(payload)}
    </pre>
  )
}

function UiPanel({ title, payload }) {
  const items = useMemo(() => getCollection(payload), [payload])

  if (!payload) {
    return <p className="text-sm text-slate-500">No response selected yet.</p>
  }

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">No list data available in this response.</p>
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-500">
        Showing {items.length} item{items.length === 1 ? '' : 's'} from {title}.
      </p>
      <div className="space-y-2">
        {items.slice(0, 12).map((item, index) => (
          <div key={`${inferLabel(item, 'Item', index)}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">{inferLabel(item, 'Item', index)}</p>
            {'country_code' in (item || {}) ? (
              <p className="mt-1 text-xs text-slate-600">Country: {item.country_code || 'Unknown'}</p>
            ) : null}
            {'city' in (item || {}) ? <p className="mt-1 text-xs text-slate-600">City: {item.city || 'Unknown'}</p> : null}
            {'start_datetime' in (item || {}) ? (
              <p className="mt-1 text-xs text-slate-600">Start: {item.start_datetime || 'Unknown'}</p>
            ) : null}
          </div>
        ))}
      </div>
      {items.length > 12 ? <p className="text-xs text-slate-500">Only first 12 items are previewed.</p> : null}
    </div>
  )
}

export default function ResultsViewer({ result }) {
  const [tab, setTab] = useState('ui')

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-auto">
      <header className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Latest Result</h2>
        <p className="mt-1 text-sm text-slate-500">
          {result?.title ? `${result.title} • ${result.endpoint}` : 'Run any endpoint test to inspect output.'}
        </p>
      </header>

      <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setTab('ui')}
          className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm ${
            tab === 'ui' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          <LayoutList className="h-4 w-4" />
          UI View
        </button>
        <button
          type="button"
          onClick={() => setTab('json')}
          className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm ${
            tab === 'json' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          <Braces className="h-4 w-4" />
          Raw JSON
        </button>
      </div>

      {tab === 'ui' ? <UiPanel title={result?.title} payload={result?.payload} /> : <JsonPanel payload={result?.payload || {}} />}
    </aside>
  )
}
