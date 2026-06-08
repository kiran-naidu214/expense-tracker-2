import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, Plus, X, Check } from 'lucide-react'

// Step 1: Enter room code
// Step 2: Set/enter password  (if room taken by wrong password → show error, clear)
// Step 3: Add roommates (only shown for newly created rooms; existing rooms skip this)

export default function RoomSetup({ onJoin, loading, hasRoom, onCancel }) {
  const [step, setStep] = useState(1)           // 1 = room code, 2 = password, 3 = add roommates
  const [roomCode, setRoomCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isNewRoom, setIsNewRoom] = useState(false)
  const [roomCodeError, setRoomCodeError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Roommates step
  const [names, setNames] = useState([])
  const [nameInput, setNameInput] = useState('')

  // Step 1 → 2: just validate code non-empty
  const handleCodeNext = () => {
    if (!roomCode.trim()) { setRoomCodeError('Please enter a room code.'); return }
    setRoomCodeError('')
    setStep(2)
  }

  // Step 2: try joining/creating room
  const handlePasswordNext = async () => {
    if (!password.trim()) { setPasswordError('Please enter a password.'); return }
    setPasswordError('')

    const result = await onJoin(roomCode, password)

    if (result?.status === 'wrong_password') {
      // Room code is taken by someone else
      setPasswordError('This room code is already taken by someone else. Try a different room code.')
      setStep(1)
      setRoomCode('')
      setPassword('')
      return
    }

    if (result?.status === 'created') {
      // New room — go to roommates step
      setIsNewRoom(true)
      setStep(3)
      return
    }

    // status === 'joined' — existing room, done (App handles navigation)
  }

  // Roommate input
  const addName = () => {
    const n = nameInput.trim()
    if (!n) return
    if (names.some(x => x.toLowerCase() === n.toLowerCase())) { setNameInput(''); return }
    setNames(p => [...p, n])
    setNameInput('')
  }

  const removeName = (i) => setNames(p => p.filter((_, idx) => idx !== i))

  const handleFinish = () => onJoin(roomCode, password, names)

  return (
    <div className="overlay" style={{ zIndex: 60 }}>
      <div className="modal animate-fade-up" style={{ maxWidth: 420 }}>

        {/* ── Step 1: Room Code ── */}
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Enter Room Code</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>Enter an existing code to join, or a new one to create a room.</p>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Room Code</label>
              <input
                className="field"
                value={roomCode}
                onChange={e => { setRoomCode(e.target.value.toUpperCase()); setRoomCodeError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCodeNext()}
                placeholder="e.g. ROOM101"
                maxLength={20}
                style={{ textAlign: 'center', fontSize: 20, letterSpacing: '0.1em', fontWeight: 700, fontFamily: 'var(--font-display)' }}
                autoFocus
              />
            </div>

            {roomCodeError && (
              <div style={{ background: 'rgba(247,112,111,0.1)', border: '1px solid rgba(247,112,111,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--accent-2)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <span>{roomCodeError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {hasRoom && <button className="btn-ghost" style={{ flex: 1, padding: 12 }} onClick={onCancel}>Cancel</button>}
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleCodeNext} disabled={!roomCode}>
                Next <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Password ── */}
        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>Set a Password</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
                Room code: <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>{roomCode}</strong>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>If this is a new room, set any password. If joining an existing room, enter the room's password.</p>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="field"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPasswordError('') }}
                  onKeyDown={e => e.key === 'Enter' && handlePasswordNext()}
                  placeholder="Enter password"
                  style={{ paddingRight: 44 }}
                  autoFocus
                />
                <button onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div style={{ background: 'rgba(247,112,111,0.1)', border: '1px solid rgba(247,112,111,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--accent-2)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <span>{passwordError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn-ghost" style={{ flex: 1, padding: 12 }} onClick={() => { setStep(1); setPassword(''); setPasswordError('') }}>← Back</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handlePasswordNext} disabled={!password || loading}>
                {loading ? <span className="spinner" /> : <>Enter Room <ArrowRight size={15} /></>}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Add Roommates (new room only) ── */}
        {step === 3 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>Add Roommates</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>Add your roommates' names. You can also do this later in Settings.</p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Roommate Name</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="field"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addName()}
                  placeholder="e.g. Chandu"
                  autoFocus
                />
                <button className="btn-primary" style={{ padding: '10px 16px', flexShrink: 0 }} onClick={addName} disabled={!nameInput.trim()}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Name chips */}
            {names.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, padding: '12px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                {names.map((n, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(124,111,247,0.15)', border: '1px solid rgba(124,111,247,0.3)', borderRadius: 20, padding: '4px 10px 4px 12px', fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}>
                    {n}
                    <button onClick={() => removeName(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', display: 'flex', padding: 0, opacity: 0.7 }}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {names.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, textAlign: 'center' }}>No roommates added yet — you can add them later too.</p>
            )}

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleFinish}>
              <Check size={16} /> Done — Enter Room
            </button>
          </>
        )}
      </div>
    </div>
  )
}
