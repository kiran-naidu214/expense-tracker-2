import { useState, useEffect, useCallback } from 'react'
import RoomSetup from './components/RoomSetup'
import Header from './components/Header'
import TabBar from './components/TabBar'
import SummaryTab from './components/SummaryTab'
import ExpensesTab from './components/ExpensesTab'
import DepositsTab from './components/DepositsTab'
import SettingsPanel from './components/SettingsPanel'
import DeleteConfirm from './components/DeleteConfirm'
import Toast from './components/Toast'
import {
  joinOrCreateRoom, getRoommates, getExpenses, getDeposits,
  addRoommate, updateRoommate, deleteRoommate,
  addExpense, updateExpense, deleteExpense,
  addDeposit, updateDeposit, deleteDeposit,
  saveRoomNotes
} from './lib/supabase'

const CATEGORIES = ['Food', 'Rent', 'Utilities', 'Groceries', 'Entertainment', 'Transport', 'Other']

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
}

function computeSummary(roommates, expenses, deposits) {
  const s = { totalPot: 0, totalSpent: 0, moneyLeft: 0, byPerson: {} }
  roommates.forEach(r => { s.byPerson[r.name] = { deposited: 0, expenseShare: 0, balance: 0 } })
  deposits.forEach(d => {
    if (s.byPerson[d.deposited_by]) {
      s.totalPot += Number(d.amount)
      s.byPerson[d.deposited_by].deposited += Number(d.amount)
    }
  })
  expenses.forEach(e => {
    const among = e.split_among || []
    if (among.length > 0) {
      s.totalSpent += Number(e.amount)
      const share = Number(e.amount) / among.length
      among.forEach(p => { if (s.byPerson[p]) s.byPerson[p].expenseShare += share })
    }
  })
  roommates.forEach(r => {
    s.byPerson[r.name].balance = s.byPerson[r.name].deposited - s.byPerson[r.name].expenseShare
  })
  s.moneyLeft = s.totalPot - s.totalSpent
  return s
}

export default function App() {
  const [room, setRoom] = useState(null)
  const [showRoomSetup, setShowRoomSetup] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState('summary')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [roommates, setRoommates] = useState([])
  const [expenses, setExpenses] = useState([])
  const [deposits, setDeposits] = useState([])
  const [notes, setNotes] = useState('')
  const [summary, setSummary] = useState({ totalPot: 0, totalSpent: 0, moneyLeft: 0, byPerson: {} })
  const [deleteState, setDeleteState] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  const loadRoomData = useCallback(async (roomObj) => {
    try {
      const [rms, exps, deps] = await Promise.all([
        getRoommates(roomObj.id),
        getExpenses(roomObj.id),
        getDeposits(roomObj.id),
      ])
      setRoommates(rms)
      setExpenses(exps)
      setDeposits(deps)
      setNotes(roomObj.notes || '')
      setSummary(computeSummary(rms, exps, deps))
    } catch (e) { showToast(e.message, 'error') }
  }, [])

  // Auto-rejoin saved room on load
  useEffect(() => {
    const saved = localStorage.getItem('currentRoom')
    const savedPass = localStorage.getItem('currentPass')
    if (saved && savedPass) handleJoin(saved, savedPass, null, true)
  }, [])

  useEffect(() => {
    setSummary(computeSummary(roommates, expenses, deposits))
  }, [roommates, expenses, deposits])

  // Called from RoomSetup — returns result so RoomSetup can handle step transitions
  const handleJoin = async (code, password, roommateNames = null, silent = false) => {
    setLoading(true)
    try {
      const result = await joinOrCreateRoom(code, password)

      if (result.status === 'wrong_password') {
        setLoading(false)
        return { status: 'wrong_password' }
      }

      const r = result.room

      // If new room and roommate names provided, insert them
      if (result.status === 'created' && roommateNames && roommateNames.length > 0) {
        for (const name of roommateNames) {
          await addRoommate(r.id, name)
        }
      }

      setRoom(r)
      localStorage.setItem('currentRoom', r.code)
      localStorage.setItem('currentPass', password)
      await loadRoomData(r)
      setShowRoomSetup(false)

      if (!silent) {
        showToast(result.status === 'created' ? `Room ${r.code} created!` : `Joined room ${r.code}`)
      }

      setLoading(false)
      return { status: result.status }
    } catch (e) {
      showToast(e.message, 'error')
      setLoading(false)
      return { status: 'error' }
    }
  }

  const leaveRoom = () => {
    setRoom(null); setShowRoomSetup(true); setShowSettings(false)
    setRoommates([]); setExpenses([]); setDeposits([])
    localStorage.removeItem('currentRoom')
    localStorage.removeItem('currentPass')
  }

  // ── Roommates ──────────────────────────────────────────────────────
  const handleAddRoommate = async (name) => {
    try { const rm = await addRoommate(room.id, name); setRoommates(p => [...p, rm]); showToast(name + ' added') }
    catch (e) { showToast(e.message, 'error') }
  }

  const handleUpdateRoommate = async (id, oldName, newName) => {
    try {
      await updateRoommate(id, newName)
      setExpenses(p => p.map(e => ({ ...e, paid_by: e.paid_by === oldName ? newName : e.paid_by, split_among: e.split_among.map(x => x === oldName ? newName : x) })))
      setDeposits(p => p.map(d => ({ ...d, deposited_by: d.deposited_by === oldName ? newName : d.deposited_by })))
      setRoommates(p => p.map(r => r.id === id ? { ...r, name: newName } : r))
      showToast('Name updated')
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleDeleteRoommate = async (rm) => {
    try { await deleteRoommate(rm.id); setRoommates(p => p.filter(r => r.id !== rm.id)); showToast(rm.name + ' removed') }
    catch (e) { showToast(e.message, 'error') }
  }

  // ── Expenses ───────────────────────────────────────────────────────
  const handleAddExpense = async (data) => {
    try { const exp = await addExpense(room.id, data); setExpenses(p => [exp, ...p]); showToast('Expense added') }
    catch (e) { showToast(e.message, 'error'); throw e }
  }

  const handleUpdateExpense = async (id, data) => {
    try { await updateExpense(id, data); setExpenses(p => p.map(e => e.id === id ? { ...e, ...data } : e)); showToast('Expense updated') }
    catch (e) { showToast(e.message, 'error') }
  }

  const handleDeleteExpense = async (id) => {
    try { await deleteExpense(id); setExpenses(p => p.filter(e => e.id !== id)); showToast('Expense deleted') }
    catch (e) { showToast(e.message, 'error') }
  }

  // ── Deposits ───────────────────────────────────────────────────────
  const handleAddDeposit = async (data) => {
    try { const dep = await addDeposit(room.id, data); setDeposits(p => [dep, ...p]); showToast('Deposit added') }
    catch (e) { showToast(e.message, 'error'); throw e }
  }

  const handleUpdateDeposit = async (id, data) => {
    try { await updateDeposit(id, data); setDeposits(p => p.map(d => d.id === id ? { ...d, ...data } : d)); showToast('Deposit updated') }
    catch (e) { showToast(e.message, 'error') }
  }

  const handleDeleteDeposit = async (id) => {
    try { await deleteDeposit(id); setDeposits(p => p.filter(d => d.id !== id)); showToast('Deposit deleted') }
    catch (e) { showToast(e.message, 'error') }
  }

  // ── Notes ──────────────────────────────────────────────────────────
  const handleSaveNotes = async (val) => {
    try { await saveRoomNotes(room.id, val); setNotes(val); showToast('Notes saved') }
    catch (e) { showToast(e.message, 'error') }
  }

  // ── Delete confirm ─────────────────────────────────────────────────
  const confirmDelete = (type, payload) => setDeleteState({ type, payload })
  const cancelDelete = () => setDeleteState(null)
  const executeDelete = async () => {
    const { type, payload } = deleteState; setDeleteState(null)
    if (type === 'expense') await handleDeleteExpense(payload)
    if (type === 'deposit') await handleDeleteDeposit(payload)
    if (type === 'roommate') await handleDeleteRoommate(payload)
    if (type === 'resetAll') {
      for (const e of expenses) await deleteExpense(e.id)
      for (const d of deposits) await deleteDeposit(d.id)
      setExpenses([]); setDeposits([]); showToast('All data reset')
    }
  }

  const names = roommates.map(r => r.name)

  return (
    <>
      {showRoomSetup && (
        <RoomSetup
          onJoin={handleJoin}
          loading={loading}
          hasRoom={!!room}
          onCancel={() => setShowRoomSetup(false)}
        />
      )}

      <div style={{ minHeight: '100vh', paddingBottom: 24 }}>
        <Header roomCode={room?.code} onSettings={() => setShowSettings(true)} onSwitchRoom={() => setShowRoomSetup(true)} />
        <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
          <TabBar active={activeTab} onChange={setActiveTab} />
          <div style={{ marginTop: 24 }}>
            {activeTab === 'summary' && <SummaryTab summary={summary} roommates={names} />}
            {activeTab === 'expenses' && <ExpensesTab expenses={expenses} roommates={names} categories={CATEGORIES} onAdd={handleAddExpense} onUpdate={handleUpdateExpense} onDelete={id => confirmDelete('expense', id)} />}
            {activeTab === 'deposits' && <DepositsTab deposits={deposits} roommates={names} onAdd={handleAddDeposit} onUpdate={handleUpdateDeposit} onDelete={id => confirmDelete('deposit', id)} />}
          </div>
        </main>
      </div>

      <SettingsPanel
        open={showSettings} onClose={() => setShowSettings(false)}
        roomCode={room?.code} roommates={roommates} notes={notes}
        onAddRoommate={handleAddRoommate} onUpdateRoommate={handleUpdateRoommate}
        onDeleteRoommate={rm => confirmDelete('roommate', rm)}
        onSaveNotes={handleSaveNotes} onLeaveRoom={leaveRoom}
        onResetAll={() => confirmDelete('resetAll', null)}
      />

      {deleteState && <DeleteConfirm onConfirm={executeDelete} onCancel={cancelDelete} />}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </>
  )
}
