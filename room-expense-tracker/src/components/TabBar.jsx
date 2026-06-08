export default function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'deposits', label: 'Deposits' },
  ]
  return (
    <div className="tab-bar">
      {tabs.map(t => (
        <button key={t.id} className={'tab-btn' + (active === t.id ? ' active' : '')} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}
