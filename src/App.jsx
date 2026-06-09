import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

const LOGO_SRC = "data:image/png;base64,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"

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  'https://tqjxiomperspxxpjlmzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxanhpb21wZXJzcHh4cGpsbXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDM5MTEsImV4cCI6MjA5NjUxOTkxMX0.gVUcSSkbgXxf2eZoyopOri5lVSb6am0-ck_sz0ij9Rc'
)

const ADMIN_PASSWORD = 'SidePocket2025'

const FINISH_POINTS = {
  'Winner': 50, 'Runner-Up': 30, '3rd Place': 20,
  '4th Place': 10, '5th-8th': 5, 'Participant': 2, 'DNS': 0,
}
const FINISH_OPTIONS = Object.keys(FINISH_POINTS)

const C = {
  gold: '#C9A84C', goldLight: '#f0d88a', goldDim: '#C9A84C33',
  black: '#0a0a0a', dark: '#111', mid: '#161616', card: '#131313',
  border: '#1f1f1f', border2: '#2a2a2a',
  text: '#e0e0e0', muted: '#555', faint: '#333',
  green: '#2ecc71', silver: '#8C9BAB', bronze: '#c4875a',
  whatsapp: '#25D366',
}

function rankColor(rank) {
  if (rank === 1) return C.gold
  if (rank === 2) return C.silver
  if (rank === 3) return C.bronze
  return C.muted
}
function finishColor(finish) {
  if (finish === 'Winner')    return C.gold
  if (finish === 'Runner-Up') return C.silver
  if (finish === '3rd Place') return C.bronze
  if (finish === '4th Place') return '#aaa'
  return C.muted
}

function computeRankings(players, results) {
  const map = {}
  players.forEach(p => {
    map[p.name] = { ...p, points: 0, wins: 0, runnerUps: 0, top4: 0, played: 0 }
  })
  results.forEach(r => {
    if (!map[r.player_name]) return
    map[r.player_name].points  += r.points || 0
    map[r.player_name].played  += 1
    if (r.finish === 'Winner')    map[r.player_name].wins     += 1
    if (r.finish === 'Runner-Up') map[r.player_name].runnerUps += 1
    if (['Winner','Runner-Up','3rd Place','4th Place'].includes(r.finish))
      map[r.player_name].top4 += 1
  })
  return Object.values(map).sort((a, b) =>
    b.points - a.points || b.wins - a.wins || b.top4 - a.top4
  )
}

function useToast() {
  const [toast, setToast] = useState(null)
  const show = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }
  return [toast, show]
}

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (!targetDate) { setTimeLeft(null); return }
    const calc = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) { setTimeLeft({ expired: true }); return }
      setTimeLeft({
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return timeLeft
}

// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab,         setTab]         = useState('rankings')
  const [players,     setPlayers]     = useState([])
  const [results,     setResults]     = useState([])
  const [settings,    setSettings]    = useState({})
  const [loading,     setLoading]     = useState(true)
  const [isAdmin,     setIsAdmin]     = useState(false)
  const [toast,       showToast]      = useToast()

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: p }, { data: r }, { data: s }] = await Promise.all([
      supabase.from('players').select('*').order('created_at'),
      supabase.from('tournament_results').select('*').order('date', { ascending: false }),
      supabase.from('settings').select('*'),
    ])
    setPlayers(p || [])
    setResults(r || [])
    const sMap = {}
    ;(s || []).forEach(row => { sMap[row.key] = row.value })
    setSettings(sMap)
    setLoading(false)
  }

  const ranked = useMemo(() => computeRankings(players, results), [players, results])
  const tournaments = useMemo(() => {
    const map = {}
    results.forEach(r => {
      const key = `${r.tournament_name}__${r.date}`
      if (!map[key]) map[key] = { name: r.tournament_name, date: r.date, results: [] }
      map[key].results.push(r)
    })
    return Object.values(map).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [results])

  if (loading) return <LoadingScreen />

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.text, fontFamily: 'Arial, sans-serif' }}>

      {/* Header */}
      <div style={{ background: C.dark, borderBottom: `1px solid ${C.border}`, padding: '0 16px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '18px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={LOGO_SRC}
                alt="SidePocket"
                style={{ height: 48, width: 'auto', display: 'block' }}
              />
            </div>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.gold, border: `1px solid ${C.goldDim}`, padding: '4px 10px', borderRadius: 2 }}>
              LIVE RANKINGS
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            {[['rankings','Rankings'],['tournaments','Tournaments'],['admin', isAdmin ? 'Admin ✓' : 'Admin']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 18px', fontSize: 11, letterSpacing: '0.15em',
                color: tab === key ? C.gold : C.muted,
                borderBottom: tab === key ? `2px solid ${C.gold}` : '2px solid transparent',
                marginBottom: -1, transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 80px' }}>
        {tab === 'rankings'    && <RankingsTab ranked={ranked} totalTournaments={tournaments.length} totalPlayers={players.length} settings={settings} />}
        {tab === 'tournaments' && <TournamentsTab tournaments={tournaments} />}
        {tab === 'admin'       && (
          isAdmin
            ? <AdminTab players={players} results={results} settings={settings} onRefresh={fetchAll} showToast={showToast} />
            : <LoginScreen onLogin={(pw) => {
                if (pw === ADMIN_PASSWORD) { setIsAdmin(true); showToast('Admin access granted') }
                else showToast('Incorrect password', 'error')
              }} />
        )}
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#4a1010' : C.gold,
          color: toast.type === 'error' ? '#ff8080' : C.black,
          padding: '10px 24px', borderRadius: 3, fontSize: 12, fontWeight: 700,
          letterSpacing: '0.1em', zIndex: 100, whiteSpace: 'nowrap',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}>{toast.msg}</div>
      )}
    </div>
  )
}

// ── Loading ───────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.black, gap: 16 }}>
      <span style={{ fontSize: 32, color: C.gold }}>◈</span>
      <div style={{ fontSize: 11, letterSpacing: '0.25em', color: C.muted }}>LOADING RANKINGS…</div>
    </div>
  )
}

// ── Rankings Tab ──────────────────────────────────────────────────────────────
function RankingsTab({ ranked, totalTournaments, totalPlayers, settings }) {
  const active   = ranked.filter(p => p.played > 0)
  const inactive = ranked.filter(p => p.played === 0)
  const siteUrl  = window.location.origin
  const nextDate = settings?.next_tournament_date || null
  const nextName = settings?.next_tournament_name || 'Next Tournament'
  const timeLeft = useCountdown(nextDate)

  function shareWhatsApp() {
    const champion = ranked[0]?.wins > 0 ? ranked[0].name : null
    const topThree = active.slice(0, 3).map((p, i) => `${['🥇','🥈','🥉'][i]} ${p.name} — ${p.points}pts`).join('\n')
    const msg = `🎱 *SidePocket Rankings* | Newcastle KZN\n\n${topThree ? topThree + '\n\n' : ''}Check the full live standings:\n${siteUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div>

      {/* Countdown */}
      {nextDate && timeLeft && !timeLeft.expired && (
        <div style={{ background: '#13110a', border: `1px solid ${C.goldDim}`, borderRadius: 4, padding: '16px 20px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: C.gold, marginBottom: 10 }}>NEXT TOURNAMENT</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ddd', marginBottom: 12 }}>{nextName}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {[['DAYS', timeLeft.days], ['HRS', timeLeft.hours], ['MIN', timeLeft.minutes], ['SEC', timeLeft.seconds]].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, fontVariantNumeric: 'tabular-nums', minWidth: 40 }}>
                  {String(val).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 8, letterSpacing: '0.15em', color: C.muted, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nextDate && timeLeft?.expired && (
        <div style={{ background: '#13110a', border: `1px solid ${C.goldDim}`, borderRadius: 4, padding: '14px 20px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em' }}>🎱 {nextName} — happening now or results incoming</div>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[['PLAYERS', totalPlayers], ['TOURNAMENTS', totalTournaments], ['CHAMPION', ranked[0]?.wins > 0 ? ranked[0]?.name.split(' ')[0] : '—']].map(([label, val]) => (
          <div key={label} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: label === 'CHAMPION' ? C.gold : '#fff' }}>{val}</div>
            <div style={{ fontSize: 8, letterSpacing: '0.2em', color: C.muted, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Podium */}
      {active.length >= 3 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'flex-end' }}>
          {[active[1], active[0], active[2]].map((p, i) => {
            const pos = [2, 1, 3][i]
            const isFirst = pos === 1
            return (
              <div key={p.id} style={{
                flex: 1, background: isFirst ? '#1a1500' : C.card,
                border: `1px solid ${isFirst ? C.goldDim : C.border}`,
                borderRadius: 4, padding: isFirst ? '20px 12px' : '14px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: isFirst ? 22 : 18, marginBottom: 6 }}>
                  {pos === 1 ? '🏆' : pos === 2 ? '🥈' : '🥉'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ddd', marginBottom: 4 }}>{p.name.split(' ')[0]}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: rankColor(pos) }}>
                  {p.points}<span style={{ fontSize: 9, color: C.muted, marginLeft: 2 }}>pts</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Standings */}
      <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.muted, marginBottom: 10 }}>FULL STANDINGS</div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ display: 'flex', padding: '8px 14px', borderBottom: `1px solid ${C.border}`, background: C.dark }}>
          {[['#', 32], ['PLAYER', null], ['W', 36], ['P', 36], ['PTS', 44]].map(([label, w]) => (
            <div key={label} style={{ width: w, flex: w ? undefined : 1, fontSize: 8, letterSpacing: '0.2em', color: C.muted, textAlign: w && label !== 'PLAYER' ? 'center' : 'left' }}>
              {label}
            </div>
          ))}
        </div>
        {active.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', padding: '12px 14px',
            borderBottom: `1px solid ${C.border}`,
            background: i % 2 === 0 ? C.card : '#0f0f0f',
          }}>
            <div style={{ width: 32, fontSize: 11, fontWeight: 700, color: rankColor(i + 1) }}>
              {i === 0 ? '🏆' : i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>{p.division}</div>
            </div>
            <div style={{ width: 36, textAlign: 'center', fontSize: 12, color: p.wins > 0 ? C.green : C.muted, fontWeight: p.wins > 0 ? 700 : 400 }}>{p.wins}</div>
            <div style={{ width: 36, textAlign: 'center', fontSize: 12, color: C.muted }}>{p.played}</div>
            <div style={{ width: 44, textAlign: 'center', fontSize: 14, fontWeight: 700, color: C.gold }}>{p.points}</div>
          </div>
        ))}
        {active.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: C.muted, fontSize: 12 }}>
            No results yet. Add tournament results in the Admin tab.
          </div>
        )}
      </div>

      {/* WhatsApp Share */}
      <button onClick={shareWhatsApp} style={{
        width: '100%', padding: '14px', background: '#0d2b18',
        border: `1px solid ${C.whatsapp}44`, borderRadius: 4,
        color: C.whatsapp, fontSize: 12, fontWeight: 700,
        letterSpacing: '0.1em', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>💬</span>
        SHARE RANKINGS ON WHATSAPP
      </button>

      {inactive.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.faint, marginBottom: 8 }}>REGISTERED — AWAITING FIRST RESULT</div>
          {inactive.map(p => (
            <div key={p.id} style={{ padding: '10px 14px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 3, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.faint }}>{p.name}</span>
              <span style={{ fontSize: 9, color: C.faint }}>{p.division}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 8, color: C.faint, textAlign: 'right', letterSpacing: '0.1em' }}>
        W = Wins · P = Played · PTS = Total Points
      </div>
    </div>
  )
}

// ── Tournaments Tab ───────────────────────────────────────────────────────────
function TournamentsTab({ tournaments }) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.muted, marginBottom: 16 }}>
        TOURNAMENT HISTORY — {tournaments.length} EVENTS
      </div>
      {tournaments.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: C.muted, fontSize: 12 }}>
          No tournaments recorded yet.
        </div>
      )}
      {tournaments.map((t, ti) => {
        const winner = t.results.find(r => r.finish === 'Winner')
        const sorted = [...t.results].sort((a, b) => (b.points || 0) - (a.points || 0))
        return (
          <div key={ti} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, marginBottom: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#e0e0e0' }}>{t.name}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                  {new Date(t.date + 'T12:00:00').toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              {winner && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.2em', color: C.gold }}>CHAMPION</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, marginTop: 3 }}>{winner.player_name}</div>
                </div>
              )}
            </div>
            <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sorted.map((r, ri) => (
                <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 9, padding: '2px 8px', borderRadius: 2, border: `1px solid ${finishColor(r.finish)}44`, color: finishColor(r.finish), letterSpacing: '0.08em', minWidth: 80, textAlign: 'center' }}>
                    {r.finish}
                  </div>
                  <div style={{ flex: 1, fontSize: 12, color: '#999' }}>{r.player_name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>+{r.points}pts</div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  return (
    <div style={{ maxWidth: 360, margin: '60px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 24, color: C.gold, marginBottom: 16 }}>◈</div>
      <div style={{ fontSize: 13, letterSpacing: '0.15em', color: '#aaa', marginBottom: 24 }}>ADMIN ACCESS</div>
      <input type="password" placeholder="Enter admin password" value={pw}
        onChange={e => setPw(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onLogin(pw)}
        style={{ ...inputStyle, marginBottom: 12, textAlign: 'center' }}
        autoComplete="current-password"
      />
      <button onClick={() => onLogin(pw)} style={btnStyle}>ENTER</button>
    </div>
  )
}

// ── Admin Tab ─────────────────────────────────────────────────────────────────
function AdminTab({ players, results, settings, onRefresh, showToast }) {
  const [adminTab, setAdminTab] = useState('players')
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {[['players','Players'],['tournament','Record Tournament'],['upcoming','Next Tournament'],['delete','Delete']].map(([key,label]) => (
          <button key={key} onClick={() => setAdminTab(key)} style={{
            background: adminTab === key ? C.gold : C.card,
            color: adminTab === key ? C.black : C.muted,
            border: `1px solid ${adminTab === key ? C.gold : C.border}`,
            padding: '8px 14px', fontSize: 10, letterSpacing: '0.1em',
            borderRadius: 3, cursor: 'pointer', fontWeight: adminTab === key ? 700 : 400,
          }}>{label}</button>
        ))}
      </div>
      {adminTab === 'players'    && <PlayersAdmin    players={players} onRefresh={onRefresh} showToast={showToast} />}
      {adminTab === 'tournament' && <TournamentAdmin players={players} onRefresh={onRefresh} showToast={showToast} />}
      {adminTab === 'upcoming'   && <UpcomingAdmin   settings={settings} onRefresh={onRefresh} showToast={showToast} />}
      {adminTab === 'delete'     && <DeleteAdmin     players={players} results={results} onRefresh={onRefresh} showToast={showToast} />}
    </div>
  )
}

// ── Players Admin ─────────────────────────────────────────────────────────────
function PlayersAdmin({ players, onRefresh, showToast }) {
  const [name, setName] = useState('')
  const [div,  setDiv]  = useState('Div 1')
  const [joined, setJoined] = useState('T1')
  const [saving, setSaving] = useState(false)

  async function addPlayer() {
    if (!name.trim()) return
    setSaving(true)
    const { error } = await supabase.from('players').insert({ name: name.trim(), division: div, joined_tournament: joined })
    setSaving(false)
    if (error) { showToast('Error adding player', 'error'); return }
    showToast(`${name.trim()} added`)
    setName('')
    onRefresh()
  }

  return (
    <div>
      <div style={sectionLabel}>ADD PLAYER</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        <input style={inputStyle} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()} />
        <div style={{ display: 'flex', gap: 10 }}>
          <select style={{ ...inputStyle, flex: 1 }} value={div} onChange={e => setDiv(e.target.value)}>
            {['Div 1','Div 2','Div 3','Unranked'].map(d => <option key={d}>{d}</option>)}
          </select>
          <input style={{ ...inputStyle, width: 90 }} placeholder="Joined (T1)" value={joined} onChange={e => setJoined(e.target.value)} />
        </div>
        <button style={btnStyle} onClick={addPlayer} disabled={saving}>{saving ? 'SAVING…' : 'ADD PLAYER'}</button>
      </div>
      <div style={sectionLabel}>CURRENT ROSTER — {players.length} PLAYERS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {players.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 3 }}>
            <span style={{ flex: 1, fontSize: 13, color: '#bbb' }}>{p.name}</span>
            <span style={{ fontSize: 9, color: C.muted }}>{p.division}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tournament Admin ──────────────────────────────────────────────────────────
function TournamentAdmin({ players, onRefresh, showToast }) {
  const [tName,    setTName]    = useState('')
  const [tDate,    setTDate]    = useState(new Date().toISOString().split('T')[0])
  const [finishes, setFinishes] = useState({})
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    const init = {}
    players.forEach(p => { init[p.name] = 'Participant' })
    setFinishes(init)
  }, [players])

  const setFinish = (name, val) => setFinishes(prev => ({ ...prev, [name]: val }))

  async function saveTournament() {
    if (!tName.trim()) { showToast('Add a tournament name', 'error'); return }
    setSaving(true)
    const rows = players.map(p => ({
      tournament_name: tName.trim(), date: tDate, player_name: p.name,
      finish: finishes[p.name] || 'Participant',
      points: FINISH_POINTS[finishes[p.name]] ?? 2,
    }))
    const { error } = await supabase.from('tournament_results').insert(rows)
    setSaving(false)
    if (error) { showToast('Error saving tournament', 'error'); return }
    showToast(`${tName.trim()} saved! Rankings updated.`)
    setTName('')
    onRefresh()
  }

  return (
    <div>
      <div style={sectionLabel}>TOURNAMENT DETAILS</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 180 }} placeholder="Tournament name (e.g. Tournament 2)" value={tName} onChange={e => setTName(e.target.value)} />
        <input style={{ ...inputStyle, width: 155 }} type="date" value={tDate} onChange={e => setTDate(e.target.value)} />
      </div>
      <div style={sectionLabel}>SET EACH PLAYER'S FINISH</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {players.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 3 }}>
            <span style={{ flex: 1, fontSize: 13, color: '#bbb' }}>{p.name}</span>
            <select value={finishes[p.name] || 'Participant'} onChange={e => setFinish(p.name, e.target.value)}
              style={{ ...inputStyle, width: 140, padding: '6px 10px', fontSize: 11 }}>
              {FINISH_OPTIONS.map(o => <option key={o} value={o}>{o} (+{FINISH_POINTS[o]}pts)</option>)}
            </select>
          </div>
        ))}
      </div>
      <button style={btnStyle} onClick={saveTournament} disabled={saving}>
        {saving ? 'SAVING…' : 'SAVE & UPDATE RANKINGS'}
      </button>
    </div>
  )
}

// ── Upcoming Tournament Admin ─────────────────────────────────────────────────
function UpcomingAdmin({ settings, onRefresh, showToast }) {
  const [name, setName] = useState(settings?.next_tournament_name || '')
  const [date, setDate] = useState(settings?.next_tournament_date || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await Promise.all([
      supabase.from('settings').upsert({ key: 'next_tournament_name', value: name }),
      supabase.from('settings').upsert({ key: 'next_tournament_date', value: date }),
    ])
    setSaving(false)
    showToast('Countdown updated!')
    onRefresh()
  }

  async function clear() {
    setSaving(true)
    await Promise.all([
      supabase.from('settings').upsert({ key: 'next_tournament_name', value: '' }),
      supabase.from('settings').upsert({ key: 'next_tournament_date', value: '' }),
    ])
    setName('')
    setDate('')
    setSaving(false)
    showToast('Countdown cleared')
    onRefresh()
  }

  return (
    <div>
      <div style={sectionLabel}>SET NEXT TOURNAMENT COUNTDOWN</div>
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
        This countdown appears on the Rankings page for all players to see.
        Update it before each tournament. Clear it after.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <input style={inputStyle} placeholder="Tournament name (e.g. Tournament 2)" value={name} onChange={e => setName(e.target.value)} />
        <input style={inputStyle} type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={btnStyle} onClick={save} disabled={saving}>{saving ? 'SAVING…' : 'SET COUNTDOWN'}</button>
        <button style={{ ...btnStyle, background: 'none', color: C.muted, border: `1px solid ${C.border}` }} onClick={clear}>CLEAR</button>
      </div>
    </div>
  )
}

// ── Delete Admin ──────────────────────────────────────────────────────────────
function DeleteAdmin({ players, results, onRefresh, showToast }) {
  const tournaments = useMemo(() => {
    const map = {}
    results.forEach(r => { map[r.tournament_name] = r.tournament_name })
    return Object.keys(map)
  }, [results])

  async function deletePlayer(id, name) {
    if (!window.confirm(`Remove ${name}? Their results will stay on record.`)) return
    await supabase.from('players').delete().eq('id', id)
    showToast(`${name} removed`)
    onRefresh()
  }

  async function deleteTournament(name) {
    if (!window.confirm(`Delete all results for "${name}"? This cannot be undone.`)) return
    await supabase.from('tournament_results').delete().eq('tournament_name', name)
    showToast(`${name} deleted`)
    onRefresh()
  }

  return (
    <div>
      <div style={sectionLabel}>DELETE TOURNAMENT RESULTS</div>
      {tournaments.length === 0 && <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>No tournaments yet.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
        {tournaments.map(t => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 3 }}>
            <span style={{ flex: 1, fontSize: 13, color: '#bbb' }}>{t}</span>
            <button onClick={() => deleteTournament(t)} style={dangerBtnStyle}>Delete</button>
          </div>
        ))}
      </div>
      <div style={sectionLabel}>REMOVE PLAYER FROM ROSTER</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {players.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 3 }}>
            <span style={{ flex: 1, fontSize: 13, color: '#bbb' }}>{p.name}</span>
            <button onClick={() => deletePlayer(p.id, p.name)} style={dangerBtnStyle}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Shared Styles ─────────────────────────────────────────────────────────────
const inputStyle = {
  background: C.mid, border: `1px solid ${C.border2}`, color: '#ddd',
  padding: '11px 14px', fontSize: 13, borderRadius: 3, outline: 'none',
  fontFamily: 'Arial, sans-serif', width: '100%',
}
const btnStyle = {
  background: C.gold, color: C.black, border: 'none',
  padding: '12px 24px', fontSize: 11, fontWeight: 700,
  letterSpacing: '0.12em', borderRadius: 3, cursor: 'pointer',
  width: '100%', fontFamily: 'Arial, sans-serif',
}
const dangerBtnStyle = {
  background: 'none', color: '#c44', border: '1px solid #3a1010',
  padding: '5px 12px', fontSize: 10, borderRadius: 3, cursor: 'pointer',
}
const sectionLabel = {
  fontSize: 9, letterSpacing: '0.22em', color: C.gold,
  marginBottom: 12, borderBottom: `1px solid ${C.border}`, paddingBottom: 8,
}
