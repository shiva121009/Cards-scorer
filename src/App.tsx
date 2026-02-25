import { useState, useMemo, useEffect } from 'react'
import './App.css'

const ROUNDS = 13
const PLAYERS = 4
const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4']
const STORAGE_KEY = 'scoreboard-data'

function loadSaved(): { playerNames: string[]; scores: (number | '')[][] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.playerNames) || !Array.isArray(data.scores)) return null
    if (data.playerNames.length !== PLAYERS || data.scores.length !== ROUNDS) return null
    const valid = data.scores.every((row: unknown) => Array.isArray(row) && row.length === PLAYERS)
    if (!valid) return null
    const scores = data.scores.map((row: (number | string)[]) =>
      row.map((v) => (v === '' || v === null || v === undefined ? '' : Number(v)))
    ) as (number | '')[][]
    const names = data.playerNames.slice(0, PLAYERS).map((n: unknown) => String(n ?? ''))
    return { playerNames: names, scores }
  } catch {
    return null
  }
}

function App() {
  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    const saved = loadSaved()
    return saved ? saved.playerNames : DEFAULT_NAMES.slice()
  })
  const [scores, setScores] = useState<(number | '')[][]>(() => {
    const saved = loadSaved()
    return saved ? saved.scores : Array(ROUNDS).fill(null).map(() => Array(PLAYERS).fill('') as (number | '')[])
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ playerNames, scores }))
  }, [playerNames, scores])

  const num = (v: number | '') => (v === '' ? 0 : Number(v))

  const totals = useMemo(() => {
    return [0, 1, 2, 3].map((p) =>
      scores.reduce((sum, row) => sum + num(row[p]), 0)
    )
  }, [scores])

  const rankings = useMemo(() => {
    const withIndex = totals.map((t, i) => ({ total: t, playerIndex: i }))
    withIndex.sort((a, b) => b.total - a.total)
    const labels = ['Winner', 'Second', 'Third', 'Chutiya'] as const
    return withIndex.map((item, rank) => ({
      ...item,
      label: labels[rank],
    }))
  }, [totals])

  const currentRoundIndex = useMemo(() => {
    const idx = scores.findIndex((row) => row.some((cell) => cell === ''))
    return idx === -1 ? -1 : idx
  }, [scores])

  const canEditRound = (round: number) =>
    currentRoundIndex >= 0 && round <= currentRoundIndex

  const setScore = (round: number, player: number, value: string) => {
    if (!canEditRound(round)) return
    const next = value === '' ? '' : Number(value)
    if (next !== '' && Number.isNaN(next)) return
    setScores((prev) => {
      const nextScores = prev.map((row) => row.slice())
      nextScores[round][player] = next
      return nextScores
    })
  }

  const setPlayerName = (index: number, name: string) => {
    setPlayerNames((prev) => {
      const next = prev.slice()
      next[index] = name || DEFAULT_NAMES[index]
      return next
    })
  }

  return (
    <div className="score-app">
      <header className="score-header">
        <div className="score-title-wrap">
          <h1>Score Board</h1>
          <span className="accent-bar" />
        </div>
        <p className="subtitle">4 players · 13 rounds · Points negative bhi ho sakte hain</p>
        {currentRoundIndex >= 0 && (
          <span className="live-badge">Round {currentRoundIndex + 1} chal raha hai</span>
        )}
      </header>

      <div className="table-wrap">
        <table className="score-table">
          <thead>
            <tr>
              <th className="round-col">Round</th>
              {playerNames.map((name, i) => (
                <th key={i} className="player-head">
                  <input
                    type="text"
                    className="player-name-input"
                    value={name}
                    onChange={(e) => setPlayerName(i, e.target.value)}
                    placeholder={DEFAULT_NAMES[i]}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scores.map((row, r) => {
              const locked = !canEditRound(r)
              const isCurrent = r === currentRoundIndex
              return (
                <tr key={r} className={`${locked ? 'round-locked' : ''} ${isCurrent ? 'round-current' : ''}`.trim()}>
                  <td className="round-num"><span className="round-pill">{r + 1}</span></td>
                  {row.map((val, p) => (
                    <td key={p} className="score-cell">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={val === '' ? '' : val}
                        onChange={(e) => setScore(r, p, e.target.value)}
                        placeholder="0"
                        disabled={locked}
                        readOnly={locked}
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
            <tr className="total-row">
              <td className="round-col">Total</td>
              {totals.map((t, i) => (
                <td key={i} className="total-cell">{t}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <section className="rankings-section">
        <h2>Rankings</h2>
        {totals.every((t) => t === 0) && scores.flat().every((v) => v === '') ? (
          <p className="rankings-placeholder">13 rounds ke points daalo, yahan rankings dikhegi</p>
        ) : (
          <ul className="rankings-list">
            {rankings.map(({ playerIndex, total, label }) => (
              <li key={playerIndex} className={`rank-item rank-${label.toLowerCase()}`}>
                <span className="rank-label">{label}</span>
                <span className="rank-name">{playerNames[playerIndex]}</span>
                <span className="rank-total">{total}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App
