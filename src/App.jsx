import { useState, useEffect } from 'react'
import PartySetup from './components/PartySetup'
import MonsterSetup from './components/MonsterSetup'
import SimulationControls from './components/SimulationControls'
import ResultsSummary from './components/ResultsSummary'
import FightLog from './components/FightLog'
import { runSimulations } from './engine/combat'
import './App.css'

const STORAGE_KEYS = {
  party: 'dnd-sim-party',
  monsters: 'dnd-sim-monsters'
}

function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage might be full or disabled
  }
}

function App() {
  const [party, setParty] = useState(() => loadFromStorage(STORAGE_KEYS.party, []))
  const [monsters, setMonsters] = useState(() => loadFromStorage(STORAGE_KEYS.monsters, []))
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [summary, setSummary] = useState(null)

  // Persist to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.party, party)
  }, [party])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.monsters, monsters)
  }, [monsters])

  const handleRunSimulation = (numSimulations) => {
    setIsRunning(true)
    setResults(null)
    setSummary(null)

    // Use setTimeout to allow UI to update before running
    setTimeout(() => {
      const { results: simResults, summary: simSummary } = runSimulations(
        party,
        monsters,
        numSimulations
      )
      setResults(simResults)
      setSummary(simSummary)
      setIsRunning(false)
    }, 50)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>D&D Encounter Simulator</h1>
        <p className="subtitle">Test if your party can survive the encounter</p>
      </header>

      <main className="app-main">
        <div className="setup-grid">
          <PartySetup party={party} setParty={setParty} />
          <MonsterSetup monsters={monsters} setMonsters={setMonsters} />
        </div>

        <SimulationControls
          onRun={handleRunSimulation}
          isRunning={isRunning}
          partyCount={party.length}
          monsterCount={monsters.length}
        />

        {(summary || isRunning) && (
          <section className="results-section">
            <h2>Results</h2>
            {isRunning ? (
              <div className="loading">Running simulations...</div>
            ) : (
              <>
                <ResultsSummary summary={summary} />
                <FightLog results={results} />
              </>
            )}
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>v0.3 - Death saves and yo-yo healing</p>
      </footer>
    </div>
  )
}

export default App
