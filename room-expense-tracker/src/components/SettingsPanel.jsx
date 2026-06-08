import { useState } from 'react'
import { X, Pencil, Trash2, Check } from 'lucide-react'

export default function SettingsPanel({ open, onClose, roomCode, roommates, notes, onAddRoommate, onUpdateRoommate, onDeleteRoommate, onSaveNotes, onLeaveRoom, onResetAll }) {
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [localNotes, setLocalNotes] = useState(notes)

  useState(() => { setLocalNotes(notes) }, [notes])

  return (
    <>
      {open && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(4px)' }} onClick={onClose} />}
      <div className={'settings-panel' + (open ? '' : ' hidden')}>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Settings</h2>
            <button onClick={onClose} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>

          {/* Roommates */}
          <section style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid var(--border)' }}>
            <p className="section-label" style={{ marginBottom: 14 }}>Roommates</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {roommates.map(rm => (
                <div key={rm.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `hsl(${rm.name?.charCodeAt(0) * 137 % 360}, 60%, 35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                    {rm.name?.[0]?.toUpperCase()}
                  </div>
                  {editId === rm.id ? (
                    <>
                      <input className="field" style={{ flex: 1, fontSize: 13, padding: '4px 8px' }} value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && (onUpdateRoommate(rm.id, rm.name, editName), setEditId(null))} autoFocus />
                      <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { onUpdateRoommate(rm.id, rm.name, editName); setEditId(null) }}><Check size={13} /></button>
                      <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setEditId(null)}><X size={13} /></button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{rm.name}</span>
                      <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { setEditId(rm.id); setEditName(rm.name) }}><Pencil size={13} /></button>
                      <button className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => onDeleteRoommate(rm)}><Trash2 size={13} /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="field" style={{ flex: 1 }} placeholder="New name" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && newName.trim() && (onAddRoommate(newName.trim()), setNewName(''))} />
              <button className="btn-primary" onClick={() => { if(newName.trim()) { onAddRoommate(newName.trim()); setNewName('') } }} style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>Add</button>
            </div>
          </section>

          {/* Notes */}
          <section style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid var(--border)' }}>
            <p className="section-label" style={{ marginBottom: 10 }}>Shared Notes</p>
            <textarea className="field" rows={4} placeholder="WiFi password, shopping list..." value={localNotes} onChange={e => setLocalNotes(e.target.value)} style={{ resize: 'vertical' }} />
            <button className="btn-ghost" style={{ marginTop: 8, color: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={() => onSaveNotes(localNotes)}>Save Notes</button>
          </section>

          {/* Room info */}
          <section>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Current Room</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--accent)', letterSpacing: '0.06em' }}>{roomCode}</span>
                <button className="btn-ghost" onClick={onLeaveRoom}>Switch Room</button>
              </div>
            </div>
            <button className="btn-danger" style={{ width: '100%', padding: '10px', textAlign: 'center', borderRadius: 10 }} onClick={onResetAll}>Reset All Data</button>
          </section>
        </div>
      </div>
    </>
  )
}
