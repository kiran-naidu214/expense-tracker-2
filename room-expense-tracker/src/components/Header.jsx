import { Settings } from 'lucide-react'

export default function Header({ roomCode, onSettings }) {
  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #fff 30%, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Room Expenses
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {roomCode ? <span>Room <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{roomCode}</strong> · Track, Split, Settle</span> : 'Track, Split, and Settle.'}
          </p>
        </div>
        <button onClick={onSettings} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: 10, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}
