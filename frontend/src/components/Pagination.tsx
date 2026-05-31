interface Props {
  currentPage: number
  lastPage: number
  onChange: (page: number) => void
}

export default function Pagination({ currentPage, lastPage, onChange }: Props) {
  if (lastPage <= 1) return null

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1,
  )

  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      <button className="btn-outline px-3 py-1.5" disabled={currentPage <= 1} onClick={() => onChange(currentPage - 1)}>
        ‹
      </button>
      {pages.map((p, idx) => {
        const gap = idx > 0 && p - pages[idx - 1] > 1
        return (
          <span key={p} className="flex items-center gap-1">
            {gap && <span className="px-1 text-slate-400">…</span>}
            <button
              onClick={() => onChange(p)}
              className={`min-w-9 rounded-lg px-3 py-1.5 text-sm ${
                p === currentPage
                  ? 'bg-brand-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          </span>
        )
      })}
      <button
        className="btn-outline px-3 py-1.5"
        disabled={currentPage >= lastPage}
        onClick={() => onChange(currentPage + 1)}
      >
        ›
      </button>
    </div>
  )
}
