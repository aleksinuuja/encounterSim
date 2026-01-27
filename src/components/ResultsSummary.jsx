function ResultsSummary({ summary }) {
  if (!summary) {
    return null
  }

  const { totalSimulations, partyWins, partyWinPercentage, averageRounds, survivorCounts } = summary

  // Sort survivors by count (descending)
  const sortedSurvivors = Object.entries(survivorCounts)
    .sort((a, b) => b[1] - a[1])

  const winClass = partyWinPercentage >= 70
    ? 'win-high'
    : partyWinPercentage >= 40
    ? 'win-medium'
    : 'win-low'

  return (
    <div className="results-summary">
      <div className="win-percentage-container">
        <div className={`win-percentage ${winClass}`}>
          {partyWinPercentage.toFixed(1)}%
        </div>
        <div className="win-label">Party Win Rate</div>
        <div className="win-details">
          {partyWins} / {totalSimulations} simulations
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat">
          <div className="stat-value">{averageRounds.toFixed(1)}</div>
          <div className="stat-label">Avg Rounds</div>
        </div>
      </div>

      {sortedSurvivors.length > 0 && (
        <div className="survivors">
          <h4>Survivor Frequency</h4>
          <div className="survivor-bars">
            {sortedSurvivors.map(([name, count]) => {
              const pct = (count / totalSimulations) * 100
              return (
                <div key={name} className="survivor-row">
                  <span className="survivor-name">{name}</span>
                  <div className="survivor-bar-container">
                    <div
                      className="survivor-bar"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="survivor-pct">{pct.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsSummary
