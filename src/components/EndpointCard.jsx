export default function EndpointCard({ title, endpoint, children, footer }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 font-mono text-xs text-slate-500">GET {endpoint}</p>
      </header>
      <div className="space-y-4">{children}</div>
      {footer ? <div className="mt-4 border-t border-slate-100 pt-4">{footer}</div> : null}
    </section>
  )
}
