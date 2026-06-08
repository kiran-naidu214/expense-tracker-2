import { useState } from 'react'
import { formatCurrency, formatDate, getTodayDate } from '../utils'
import { Pencil, Trash2, Check, X } from 'lucide-react'

export default function DepositsTab({ deposits, roommates, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState({ date: getTodayDate(), amount: '', deposited_by: '' })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})

  const handleAdd = async () => {
    if (!form.amount || !form.deposited_by) return
    setLoading(true)
    try {
      await onAdd({ date: form.date, amount: parseFloat(form.amount), deposited_by: form.deposited_by })
      setForm({ date: getTodayDate(), amount: '', deposited_by: '' })
    } finally { setLoading(false) }
  }

  const startEdit = (d) => { setEditId(d.id); setEditData({ date: d.date, amount: d.amount, deposited_by: d.deposited_by }) }
  const saveEdit = async () => { await onUpdate(editId, { ...editData, amount: parseFloat(editData.amount) }); setEditId(null) }

  const filtered = [...deposits]
    .filter(d => filter === 'all' || d.deposited_by === filter)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card animate-fade-up">
        <div className="card-inner">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Add Deposit</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Date</label>
              <input type="date" className="field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Amount (₹)</label>
              <input type="number" className="field" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" step="0.01" min="0" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Deposited By</label>
            <select className="field" value={form.deposited_by} onChange={e => setForm(f => ({ ...f, deposited_by: e.target.value }))}>
              <option value="" disabled>Select person</option>
              {roommates.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAdd} disabled={loading || !form.amount || !form.deposited_by}>
            {loading ? <span className="spinner" /> : 'Add Deposit'}
          </button>
        </div>
      </div>

      <div className="animate-fade-up-2">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span className="section-label">History ({filtered.length})</span>
          <select className="field" style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Members</option>
            {roommates.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 && <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)' }}>No deposits yet.</div>}
          {filtered.map(dep => (
            <div key={dep.id} className={'expense-row' + (editId === dep.id ? ' editing' : '')}>
              {editId === dep.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input type="date" className="field" style={{ fontSize: 12 }} value={editData.date} onChange={e => setEditData(d => ({ ...d, date: e.target.value }))} />
                    <input type="number" className="field" style={{ fontSize: 12 }} value={editData.amount} onChange={e => setEditData(d => ({ ...d, amount: e.target.value }))} />
                  </div>
                  <select className="field" style={{ fontSize: 12 }} value={editData.deposited_by} onChange={e => setEditData(d => ({ ...d, deposited_by: e.target.value }))}>
                    {roommates.map(r => <option key={r}>{r}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn-ghost" onClick={() => setEditId(null)}><X size={14} /></button>
                    <button className="btn-primary" onClick={saveEdit} style={{ padding: '6px 14px' }}><Check size={14} /></button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `hsl(${dep.deposited_by?.charCodeAt(0) * 137 % 360}, 60%, 35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12 }}>
                        {dep.deposited_by?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{dep.deposited_by}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(dep.date)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--green)' }}>+{formatCurrency(dep.amount)}</span>
                    <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => startEdit(dep)}><Pencil size={13} /></button>
                    <button className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => onDelete(dep.id)}><Trash2 size={13} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
