import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  'https://tqjxiomperspxxpjlmzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxanhpb21wZXJzcHh4cGpsbXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDM5MTEsImV4cCI6MjA5NjUxOTkxMX0.gVUcSSkbgXxf2eZoyopOri5lVSb6am0-ck_sz0ij9Rc'
)

// ── Config ────────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'SidePocket2025'

const FINISH_POINTS = {
  'Winner': 50, 'Runner-Up': 30, '3rd Place': 20,
  '4th Place': 10, '5th-8th': 5, 'Participant': 2, 'DNS': 0,
}
const FINISH_OPTIONS = Object.keys(FINISH_POINTS)

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  gold: '#C9A84C', goldLight: '#f0d88a', goldDim: '#C9A84C33',
  black: '#0a0a0a', dark: '#111', mid: '#161616', card: '#131313',
  border: '#1f1f1f', border2: '#2a2a2a',
  text: '#e0e0e0', muted: '#555', faint: '#333',
  green: '#2ecc71', greenDim: '#1a4731',
  silver: '#8C9BAB', bronze: '#c4875a',
}

// ── Rank helpers ──────────────────────────────────────────────────────────────
function rankColor(rank) {
  if (rank === 1) return C.gold
  if (rank === 2) return C.silver
  if (rank === 3) return C.bronze
  return C.muted
}
function rankBg(rank) {
  if (rank === 1) return '#1a1500'
  if (rank === 2) return '#0f1215'
  if (rank === 3) return '#110d09'
  return C.card
}
function finishColor(finish) {
  if (finish === 'Winner')    return C.gold
  if (finish === 'Runner-Up') return C.silver
  if (finish === '3rd Place') return C.bronze
  if (finish === '4th Place') return '#aaa'
  return C.muted
}

// ── Compute rankings ──────────────────────────────────────────────────────────
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
    if (r.finish === 'Runner-Up') map[r.player_name].runnerUps+= 1
    if (['Winner','Runner-Up','3rd Place','4th Place'].includes(r.finish))
      map[r.player_name].top4 += 1
  })
  return Object.values(map).sort((a, b) =>
    b.points - a.points || b.wins - a.wins || b.top4 - a.top4
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null)
  const show = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }
  return [toast, show]
}

// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab,         setTab]         = useState('rankings')
  const [players,     setPlayers]     = useState([])
  const [results,     setResults]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [isAdmin,     setIsAdmin]     = useState(false)
  const [toast,       showToast]      = useToast()

  // ── Fetch data ──────────────────────────────────────────────────────────
  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from('players').select('*').order('created_at'),
      supabase.from('tournament_results').select('*').order('date', { ascending: false }),
    ])
    setPlayers(p || [])
    setResults(r || [])
    setLoading(false)
  }

  const ranked = useMemo(() => computeRankings(players, results), [players, results])

  // ── Group results by tournament ─────────────────────────────────────────
  const tournaments = useMemo(() => {
    const map = {}
    results.forEach(r => {
      const key = `${r.tournament_name}__${r.date}`
      if (!map[key]) map[key] = { name: r.tournament_name, date: r.date, results: [] }
      map[key].results.push(r)
    })
    return Object.values(map).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [results])

  // ── Screen ──────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.text, fontFamily: 'Arial, sans-serif' }}>

      {/* Header */}
      <div style={{ background: C.dark, borderBottom: `1px solid ${C.border}`, padding: '0 16px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '18px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24, color: C.gold }}>◈</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.15em', color: '#fff' }}>SIDEPOCKET</div>
                <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.muted, marginTop: 1 }}>NEWCASTLE · KZN</div>
              </div>
            </div>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.gold, border: `1px solid ${C.goldDim}`, padding: '4px 10px', borderRadius: 2 }}>
              LIVE RANKINGS
            </div>
          </div>
          {/* Nav */}
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
        {tab === 'rankings'    && <RankingsTab ranked={ranked} totalTournaments={tournaments.length} totalPlayers={players.length} />}
        {tab === 'tournaments' && <TournamentsTab tournaments={tournaments} />}
        {tab === 'admin'       && (
          isAdmin
            ? <AdminTab players={players} results={results} onRefresh={fetchAll} showToast={showToast} />
            : <LoginScreen onLogin={(pw) => {
                if (pw === ADMIN_PASSWORD) { setIsAdmin(true); showToast('Admin access granted') }
                else showToast('Incorrect password', 'error')
              }} />
        )}
      </div>

      {/* Toast */}
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
function RankingsTab({ ranked, totalTournaments, totalPlayers }) {
  const active = ranked.filter(p => p.played > 0)
  const inactive = ranked.filter(p => p.played === 0)

  return (
    <div>
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {[['PLAYERS', totalPlayers], ['TOURNAMENTS', totalTournaments], ['CHAMPION', ranked[0]?.wins > 0 ? ranked[0]?.name.split(' ')[0] : '—']].map(([label, val]) => (
          <div key={label} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: label === 'CHAMPION' ? C.gold : '#fff' }}>{val}</div>
            <div style={{ fontSize: 8, letterSpacing: '0.2em', color: C.muted, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Podium — top 3 */}
      {active.length >= 3 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'flex-end' }}>
          {[active[1], active[0], active[2]].map((p, i) => {
            const pos = [2, 1, 3][i]
            const isFirst = pos === 1
            return (
              <div key={p.id} style={{
                flex: 1, background: isFirst ? '#1a1500' : C.card,
                border: `1px solid ${isFirst ? C.goldDim : C.border}`,
                borderRadius: 4, padding: isFirst ? '20px 12px' : '14px 12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: isFirst ? 22 : 18, marginBottom: 6 }}>
                  {pos === 1 ? '🏆' : pos === 2 ? '🥈' : '🥉'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ddd', marginBottom: 4 }}>
                  {p.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: rankColor(pos) }}>
                  {p.points}
                  <span style={{ fontSize: 9, color: C.muted, marginLeft: 2 }}>pts</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Section label */}
      <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.muted, marginBottom: 10 }}>FULL STANDINGS</div>

      {/* Table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, overflow: 'hidden' }}>
        {/* Header */}
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
            <div style={{ width: 32, fontSize: 11, fontWeight: 700, color: rankColor(i + 1), textAlign: 'left' }}>
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

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  return (
    <div style={{ maxWidth: 360, margin: '60px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 24, color: C.gold, marginBottom: 16 }}>◈</div>
      <div style={{ fontSize: 13, letterSpacing: '0.15em', color: '#aaa', marginBottom: 24 }}>ADMIN ACCESS</div>
      <input
        type="password"
        placeholder="Enter admin password"
        value={pw}
        onChange={e => setPw(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onLogin(pw)}
        style={{ width: '100%', padding: '12px 16px', background: C.mid, border: `1px solid ${C.border2}`, color: '#ddd', fontSize: 14, borderRadius: 3, outline: 'none', marginBottom: 12, textAlign: 'center' }}
        autoComplete="current-password"
      />
      <button onClick={() => onLogin(pw)} style={btnStyle}>ENTER</button>
    </div>
  )
}

// ── Admin Tab ─────────────────────────────────────────────────────────────────
function AdminTab({ players, results, onRefresh, showToast }) {
  const [adminTab, setAdminTab] = useState('players')

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['players','Players'],['tournament','Record Tournament'],['delete','Delete']].map(([key,label]) => (
          <button key={key} onClick={() => setAdminTab(key)} style={{
            background: adminTab === key ? C.gold : C.card,
            color: adminTab === key ? C.black : C.muted,
            border: `1px solid ${adminTab === key ? C.gold : C.border}`,
            padding: '8px 14px', fontSize: 10, letterSpacing: '0.1em',
            borderRadius: 3, cursor: 'pointer', fontWeight: adminTab === key ? 700 : 400,
          }}>{label}</button>
        ))}
      </div>

      {adminTab === 'players'    && <PlayersAdmin    players={players}   onRefresh={onRefresh} showToast={showToast} />}
      {adminTab === 'tournament' && <TournamentAdmin players={players}   onRefresh={onRefresh} showToast={showToast} />}
      {adminTab === 'delete'     && <DeleteAdmin     players={players}   results={results} onRefresh={onRefresh} showToast={showToast} />}
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
          <input style={{ ...inputStyle, width: 90 }} placeholder="Joined" value={joined} onChange={e => setJoined(e.target.value)} />
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
  const [tName,   setTName]   = useState('')
  const [tDate,   setTDate]   = useState(new Date().toISOString().split('T')[0])
  const [finishes, setFinishes] = useState({})
  const [saving,  setSaving]  = useState(false)

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
      tournament_name: tName.trim(),
      date: tDate,
      player_name: p.name,
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
            <select
              value={finishes[p.name] || 'Participant'}
              onChange={e => setFinish(p.name, e.target.value)}
              style={{ ...inputStyle, width: 140, padding: '6px 10px', fontSize: 11 }}
            >
              {FINISH_OPTIONS.map(o => (
                <option key={o} value={o}>{o} (+{FINISH_POINTS[o]}pts)</option>
              ))}
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

// ── Delete Admin ──────────────────────────────────────────────────────────────
function DeleteAdmin({ players, results, onRefresh, showToast }) {
  const tournaments = useMemo(() => {
    const map = {}
    results.forEach(r => { map[r.tournament_name] = r.tournament_name })
    return Object.keys(map)
  }, [results])

  async function deletePlayer(id, name) {
    if (!window.confirm(`Remove ${name}? This will NOT delete their results.`)) return
    await supabase.from('players').delete().eq('id', id)
    showToast(`${name} removed from roster`)
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
