import { formatCurrency } from '../utils'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

export default function SummaryTab({ summary, roommates }) {
  const stats = [
    { label: 'Total Pot', value: summary.totalPot, icon: <TrendingUp size={18} />, color: 'var(--green)', cls: 'animate-fade-up-1' },
    { label: 'Total Spent', value: summary.totalSpent, icon: <TrendingDown size={18} />, color: 'var(--accent-2)', cls: 'animate-fade-up-2' },
    { label: 'Balance Left', value: summary.moneyLeft, icon: <Wallet size={18} />, color: 'var(--accent)', cls: 'animate-fade-up-3' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {stats.map(s => (
          <div key={s.label} className={'stat-card ' + s.cls}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p className="section-label">{s.label}</p>
              <span style={{ color: s.color, opacity: 0.8 }}>{s.icon}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: s.color, marginTop: 12, letterSpacing: '-0.02em' }}>
              {formatCurrency(s.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="card animate-fade-up-4">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Member Balances</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Positive = get refund · Negative = owes money</p>
          </div>
        </div>
        {roommates.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No roommates yet. Add them in Settings.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th style={{ textAlign: 'right' }}>Deposited</th>
                  <th style={{ textAlign: 'right' }}>Spent Share</th>
                  <th style={{ textAlign: 'right' }}>Net Balance</th>
                </tr>
              </thead>
              <tbody>
                {roommates.map(name => {
                  const p = summary.byPerson?.[name] || { deposited: 0, expenseShare: 0, balance: 0 }
                  const isPos = p.balance >= 0
                  return (
                    <tr key={name}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${name.charCodeAt(0) * 137 % 360}, 60%, 35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                            {name[0].toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--green)', fontWeight: 500 }}>{formatCurrency(p.deposited)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--accent-2)', fontWeight: 500 }}>{formatCurrency(p.expenseShare)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, color: isPos ? 'var(--green)' : 'var(--accent-2)' }}>
                        {isPos ? '+' : ''}{formatCurrency(p.balance)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
