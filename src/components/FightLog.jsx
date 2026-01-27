import { useState } from 'react'

function FightLog({ results }) {
  const [expandedId, setExpandedId] = useState(null)

  if (!results || results.length === 0) {
    return null
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="fight-log">
      <h3>Fight Results</h3>
      <div className="fight-list">
        {results.map((result) => (
          <div key={result.id} className="fight-item">
            <button
              className={`fight-header ${result.partyWon ? 'party-won' : 'party-lost'}`}
              onClick={() => toggleExpand(result.id)}
            >
              <span className="fight-id">#{result.id}</span>
              <span className={`fight-outcome ${result.partyWon ? 'win' : 'loss'}`}>
                {result.partyWon ? 'Victory' : 'Defeat'}
              </span>
              <span className="fight-rounds">{result.totalRounds} rounds</span>
              <span className="fight-survivors">
                {result.partyWon
                  ? `${result.survivingParty.length} survived`
                  : `${result.survivingMonsters.length} monsters left`
                }
              </span>
              <span className="expand-icon">{expandedId === result.id ? '▼' : '▶'}</span>
            </button>

            {expandedId === result.id && (
              <div className="fight-details">
                <div className="survivors-info">
                  {result.partyWon ? (
                    <p><strong>Survivors:</strong> {result.survivingParty.join(', ')}</p>
                  ) : (
                    <p><strong>Remaining monsters:</strong> {result.survivingMonsters.join(', ')}</p>
                  )}
                </div>
                <table className="log-table">
                  <thead>
                    <tr>
                      <th>Rnd</th>
                      <th>Actor</th>
                      <th>Target</th>
                      <th>Roll</th>
                      <th>vs AC</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.log.map((entry, idx) => (
                      <tr
                        key={idx}
                        className={
                          entry.actionType === 'heal'
                            ? 'log-heal'
                            : entry.targetDowned
                            ? 'log-death'
                            : entry.hit
                            ? 'log-hit'
                            : 'log-miss'
                        }
                      >
                        <td>{entry.round}</td>
                        <td>{entry.actorName}</td>
                        <td>{entry.targetName}</td>
                        {entry.actionType === 'heal' ? (
                          <>
                            <td colSpan="2" className="heal-label">HEAL</td>
                            <td>
                              <span className="healing">
                                +{entry.healRoll} HP
                              </span>
                              {' '}
                              ({entry.targetHpBefore} → {entry.targetHpAfter})
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              {entry.attackRoll}
                              {entry.attackRoll === 20 && ' (CRIT)'}
                              {entry.attackRoll === 1 && ' (FUMBLE)'}
                              {' → '}{entry.totalAttack}
                            </td>
                            <td>{entry.targetAC}</td>
                            <td>
                              {entry.hit ? (
                                <>
                                  <span className="damage">
                                    {entry.damageRoll} dmg
                                    {entry.isCritical && '!'}
                                  </span>
                                  {' '}
                                  ({entry.targetHpBefore} → {entry.targetHpAfter})
                                  {entry.targetDowned && <span className="downed"> DOWNED</span>}
                                </>
                              ) : (
                                <span className="miss">Miss</span>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FightLog
