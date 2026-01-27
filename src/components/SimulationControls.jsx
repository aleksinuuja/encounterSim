import { useState } from 'react'

function SimulationControls({ onRun, isRunning, partyCount, monsterCount }) {
  const [numSimulations, setNumSimulations] = useState(100)

  const canRun = partyCount > 0 && monsterCount > 0 && !isRunning

  const handleSubmit = (e) => {
    e.preventDefault()
    if (canRun) {
      onRun(numSimulations)
    }
  }

  return (
    <div className="simulation-controls">
      <form onSubmit={handleSubmit}>
        <label>
          Number of Simulations
          <input
            type="number"
            value={numSimulations}
            onChange={(e) => setNumSimulations(Math.max(1, parseInt(e.target.value, 10) || 1))}
            min="1"
            max="10000"
            disabled={isRunning}
          />
        </label>
        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={!canRun}
        >
          {isRunning ? 'Running...' : 'Run Simulation'}
        </button>
      </form>
      {partyCount === 0 && (
        <p className="warning">Add at least one party member</p>
      )}
      {monsterCount === 0 && (
        <p className="warning">Add at least one monster</p>
      )}
    </div>
  )
}

export default SimulationControls
