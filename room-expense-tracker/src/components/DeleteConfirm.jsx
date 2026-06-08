export default function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div className="overlay" style={{ zIndex: 60 }}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Confirm Delete</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Are you sure? This action cannot be undone.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1, padding: 12 }} onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 12, background: 'var(--accent-2)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Delete</button>
        </div>
      </div>
    </div>
  )
}
