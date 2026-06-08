import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Simple SHA-256 hash for password
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'roomexp_salt_v1')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Room ──────────────────────────────────────────────────────────────────────
// status: 'created' | 'joined' | 'wrong_password' | 'taken'
export async function joinOrCreateRoom(roomCode, password) {
  const code = roomCode.trim().toUpperCase()
  const hashedPassword = await hashPassword(password)

  // Check if room exists
  let { data: room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .single()

  if (error && error.code === 'PGRST116') {
    // Room does NOT exist — create it with this password (no default roommates)
    const { data: newRoom, error: createError } = await supabase
      .from('rooms')
      .insert({ code, password_hash: hashedPassword, notes: '' })
      .select()
      .single()
    if (createError) throw createError
    return { room: newRoom, status: 'created' }
  }

  if (error) throw error

  // Room EXISTS — check password
  if (room.password_hash !== hashedPassword) {
    return { room: null, status: 'wrong_password' }
  }

  return { room, status: 'joined' }
}

// ── Roommates ─────────────────────────────────────────────────────────────────
export async function getRoommates(roomId) {
  const { data, error } = await supabase
    .from('roommates').select('*').eq('room_id', roomId).order('created_at')
  if (error) throw error
  return data
}

export async function addRoommate(roomId, name) {
  const { data, error } = await supabase
    .from('roommates').insert({ room_id: roomId, name }).select().single()
  if (error) throw error
  return data
}

export async function updateRoommate(id, name) {
  const { error } = await supabase.from('roommates').update({ name }).eq('id', id)
  if (error) throw error
}

export async function deleteRoommate(id) {
  const { error } = await supabase.from('roommates').delete().eq('id', id)
  if (error) throw error
}

// ── Expenses ──────────────────────────────────────────────────────────────────
export async function getExpenses(roomId) {
  const { data, error } = await supabase
    .from('expenses').select('*').eq('room_id', roomId).order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function addExpense(roomId, expense) {
  const { data, error } = await supabase
    .from('expenses').insert({ room_id: roomId, ...expense }).select().single()
  if (error) throw error
  return data
}

export async function updateExpense(id, expense) {
  const { error } = await supabase.from('expenses').update(expense).eq('id', id)
  if (error) throw error
}

export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

// ── Deposits ──────────────────────────────────────────────────────────────────
export async function getDeposits(roomId) {
  const { data, error } = await supabase
    .from('deposits').select('*').eq('room_id', roomId).order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function addDeposit(roomId, deposit) {
  const { data, error } = await supabase
    .from('deposits').insert({ room_id: roomId, ...deposit }).select().single()
  if (error) throw error
  return data
}

export async function updateDeposit(id, deposit) {
  const { error } = await supabase.from('deposits').update(deposit).eq('id', id)
  if (error) throw error
}

export async function deleteDeposit(id) {
  const { error } = await supabase.from('deposits').delete().eq('id', id)
  if (error) throw error
}

// ── Notes ─────────────────────────────────────────────────────────────────────
export async function saveRoomNotes(roomId, notes) {
  const { error } = await supabase.from('rooms').update({ notes }).eq('id', roomId)
  if (error) throw error
}
