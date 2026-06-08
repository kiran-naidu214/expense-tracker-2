import { useState } from 'react'
import { formatCurrency, formatDate, getTodayDate } from '../utils'
import { Pencil, Trash2, Check, X } from 'lucide-react'

const CATEGORY_COLORS = {
  Food: '#f97316', Rent: '#6366f1', Utilities: '#0ea5e9', Groceries: '#22c55e',
  Entertainment: '#ec4899', Transport: '#f59e0b', Other: '#94a3b8', General: '#94a3b8'
}

export default function ExpensesTab({ expenses, roommates, categories, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState({ date: getTodayDate(), amount: '', description: '', paid_by: '', split_among: roommates, category: 'Food' })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})

  const handleAdd = async () => {
    if (!form.description.trim() || !form.amount || form.split_among.length === 0 || !form.paid_by) return
    setLoading(true)
    try {
      await onAdd({ date: form.date, amount: parseFloat(form.amount), description: form.description.trim(), paid_by: form.paid_by, split_among: form.split_among, category: form.category })
      setForm({ date: getTodayDate(), amount: '', description: '', paid_by: '', split_among: roommates, category: 'Food' })
    } finally { setLoading(false) }
  }

  const toggleSplit = (name) => {
    setForm(f => ({ ...f, split_among: f.split_among.includes(name) ? f.split_among.filter(x => x !== name) : [...f.split_among, name] }))
  }

  const startEdit = (e) => {
    setEditId(e.id)
    setEditData({ date: e.date, amount: e.amount, description: e.description, paid_by: e.paid_by, split_among: [...e.split_among], category: e.category || 'General' })
  }

  const saveEdit = async () => {
    await onUpdate(editId, { ...editData, amount: parseFloat(editData.amount) })
    setEditId(null)
  }

  const toggleEditSplit = (name) => {
    setEditData(d => ({ ...d, split_among: d.split_among.includes(name) ? d.split_among.filter(x => x !== name) : [...d.split_among, name] }))
  }

  const filtered = [...expenses]
    .filter(e => filter === 'all' || e.paid_by === filter || e.split_among?.includes(filter))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Add form */}
      <div className="card animate-fade-up">
        <div className="card-inner">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Add Expense</h2>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Description</label>
              <input type="text" className="field" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Dinner, WiFi" />
            </div>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Category</label>
              <select className="field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Paid By</label>
            <select className="field" value={form.paid_by} onChange={e => setForm(f => ({ ...f, paid_by: e.target.value }))}>
              <option value="" disabled>Select payer</option>
              {roommates.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span className="section-label">Split Among</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" style={{ padding: '3px 10px' }} onClick={() => setForm(f => ({ ...f, split_among: [...roommates] }))}>All</button>
                <button className="btn-ghost" style={{ padding: '3px 10px' }} onClick={() => setForm(f => ({ ...f, split_among: [] }))}>Clear</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {roommates.map(r => (
                <button key={r} className={'chip' + (form.split_among.includes(r) ? ' selected' : '')} onClick={() => toggleSplit(r)}>{r}</button>
              ))}
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAdd} disabled={loading || !form.amount || !form.description || !form.paid_by}>
            {loading ? <span className="spinner" /> : 'Add Expense'}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="animate-fade-up-2">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span className="section-label">History ({filtered.length})</span>
          <select className="field" style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Members</option>
            {roommates.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 && <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)' }}>No expenses yet.</div>}
          {filtered.map(exp => (
            <div key={exp.id} className={'expense-row' + (editId === exp.id ? ' editing' : '')}>
              {editId === exp.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input type="date" className="field" style={{ fontSize: 12 }} value={editData.date} onChange={e => setEditData(d => ({ ...d, date: e.target.value }))} />
                    <input type="number" className="field" style={{ fontSize: 12 }} value={editData.amount} onChange={e => setEditData(d => ({ ...d, amount: e.target.value }))} />
                  </div>
                  <input type="text" className="field" style={{ fontSize: 12 }} value={editData.description} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <select className="field" style={{ fontSize: 12 }} value={editData.paid_by} onChange={e => setEditData(d => ({ ...d, paid_by: e.target.value }))}>
                      {roommates.map(r => <option key={r}>{r}</option>)}
                    </select>
                    <select className="field" style={{ fontSize: 12 }} value={editData.category} onChange={e => setEditData(d => ({ ...d, category: e.target.value }))}>
                      {['Food','Rent','Utilities','Groceries','Entertainment','Transport','Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {roommates.map(r => (
                      <button key={r} className={'chip' + (editData.split_among?.includes(r) ? ' selected' : '')} onClick={() => toggleEditSplit(r)} style={{ fontSize: 11 }}>{r}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn-ghost" onClick={() => setEditId(null)} style={{ padding: '6px 14px' }}><X size={14} /></button>
                    <button className="btn-primary" onClick={saveEdit} style={{ padding: '6px 14px' }}><Check size={14} /></button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', color: 'var(--text-muted)', fontWeight: 600 }}>{formatDate(exp.date)}</span>
                      <span style={{ ...badgeStyle, background: (CATEGORY_COLORS[exp.category] || '#94a3b8') + '22', color: CATEGORY_COLORS[exp.category] || '#94a3b8', borderColor: (CATEGORY_COLORS[exp.category] || '#94a3b8') + '44' }}>{exp.category || 'General'}</span>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Paid by <strong style={{ color: 'var(--text)' }}>{exp.paid_by}</strong> · Split: <span>{exp.split_among?.length === roommates.length ? 'Everyone' : exp.split_among?.join(', ')}</span>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--accent-2)' }}>{formatCurrency(exp.amount)}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                      <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => startEdit(exp)}><Pencil size={13} /></button>
                      <button className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => onDelete(exp.id)}><Trash2 size={13} /></button>
                    </div>
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

const badgeStyle = { display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', border: '1px solid' }
