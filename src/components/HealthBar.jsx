import { CheckCircle2, LoaderCircle, TriangleAlert } from 'lucide-react'

function formatDate(dateString) {
  if (!dateString) {
    return 'Unknown'
  }

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return dateString
  }

  return date.toLocaleString()
}

export default function HealthBar({ loading, error, payload }) {
  const statusLabel = loading ? 'Checking API' : error ? 'API Unavailable' : 'API Online'
  const icon = loading ? (
    <LoaderCircle className="h-4 w-4 animate-spin" />
  ) : error ? (
    <TriangleAlert className="h-4 w-4" />
  ) : (
    <CheckCircle2 className="h-4 w-4" />
  )

  const statusClass = loading
    ? 'bg-amber-100 text-amber-700'
    : error
      ? 'bg-red-100 text-red-700'
      : 'bg-emerald-100 text-emerald-700'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${statusClass}`}>
          {icon}
          {statusLabel}
        </div>
        <p className="text-sm text-slate-600">
          Last sync:{' '}
          <span className="font-medium text-slate-800">{formatDate(payload?.last_sync_time)}</span>
        </p>
      </div>
      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
    </div>
  )
}
