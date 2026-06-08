export default function Toast({ message, type = 'success' }) {
  const color = type === 'error' ? 'var(--accent-2)' : 'var(--green)'
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--surface2)', border: `1px solid ${color}33`,
      borderRadius: 12, padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 10,
      zIndex: 100, animation: 'fadeUp 0.3s ease',
      boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${color}22`,
      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
      whiteSpace: 'nowrap', maxWidth: 'calc(100vw - 32px)'
    }}>
      <span style={{ color }}>{type === 'error' ? '✕' : '✓'}</span>
      {message}
    </div>
  )
}
