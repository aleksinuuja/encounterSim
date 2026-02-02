import { useState } from 'react'

function FightLog({ results }) {
  const [expandedId, setExpandedId] = useState(null)

  if (!results || results.length === 0) {
    return null
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const renderDeathSaveResult = (entry) => {
    if (entry.recoveredFromNat20) {
      return (
        <span className="nat20-recovery">
          NAT 20! Recovers with 1 HP
        </span>
      )
    }

    const successes = '●'.repeat(entry.deathSaveSuccesses) + '○'.repeat(3 - entry.deathSaveSuccesses)
    const failures = '●'.repeat(entry.deathSaveFailures) + '○'.repeat(3 - Math.min(3, entry.deathSaveFailures))

    return (
      <>
        <span className={entry.deathSaveSuccess ? 'death-save-success' : 'death-save-failure'}>
          {entry.deathSaveRoll}
          {entry.deathSaveRoll === 1 && ' (2 fails)'}
        </span>
        {' '}
        <span className="death-save-tally">
          <span className="successes">{successes}</span>
          {' / '}
          <span className="failures">{failures}</span>
        </span>
        {entry.stabilized && <span className="stabilized"> STABILIZED</span>}
        {entry.died && <span className="died"> DIED</span>}
      </>
    )
  }

  const getRowClass = (entry) => {
    if (entry.actionType === 'deathSave') {
      if (entry.recoveredFromNat20) return 'log-nat20-recovery'
      if (entry.died) return 'log-died'
      if (entry.stabilized) return 'log-stabilized'
      return entry.deathSaveSuccess ? 'log-death-save-success' : 'log-death-save-failure'
    }
    if (entry.actionType === 'heal') {
      return entry.revivedFromUnconscious ? 'log-revive' : 'log-heal'
    }
    if (entry.actionType === 'conditionApplied') return 'log-condition-applied'
    if (entry.actionType === 'conditionExpired') return 'log-condition-expired'
    if (entry.actionType === 'incapacitated') return 'log-incapacitated'
    if (entry.targetDied) return 'log-death'
    if (entry.targetDowned) return 'log-death'
    if (entry.hit) return 'log-hit'
    return 'log-miss'
  }

  const renderRollModifier = (entry) => {
    if (entry.rollModifier === 'advantage') {
      return <span className="roll-advantage" title={`Rolls: ${entry.attackRolls.join(', ')}`}> ADV</span>
    }
    if (entry.rollModifier === 'disadvantage') {
      return <span className="roll-disadvantage" title={`Rolls: ${entry.attackRolls.join(', ')}`}> DIS</span>
    }
    return null
  }

  return (
    <div className="fight-log">
      <h3>Fight Results</h3>
      <div className="fight-list">
        {results.map((result) => (
          <div key={result.id} className="fight-item">
            <div
              className={`fight-header ${result.partyWon ? 'party-won' : 'party-lost'}`}
              onClick={() => toggleExpand(result.id)}
              role="button"
              tabIndex={0}
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
            </div>

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
                        className={getRowClass(entry)}
                      >
                        <td>{entry.round}</td>
                        <td>{entry.actorName}</td>
                        <td>{entry.targetName || '—'}</td>
                        {entry.actionType === 'deathSave' ? (
                          <>
                            <td colSpan="2" className="death-save-label">DEATH SAVE</td>
                            <td>{renderDeathSaveResult(entry)}</td>
                          </>
                        ) : entry.actionType === 'heal' ? (
                          <>
                            <td colSpan="2" className="heal-label">
                              {entry.revivedFromUnconscious ? 'REVIVE' : 'HEAL'}
                            </td>
                            <td>
                              <span className="healing">
                                +{entry.healRoll} HP
                              </span>
                              {' '}
                              ({entry.targetHpBefore} → {entry.targetHpAfter})
                              {entry.revivedFromUnconscious && <span className="revived"> (back up!)</span>}
                            </td>
                          </>
                        ) : entry.actionType === 'conditionApplied' ? (
                          <>
                            <td colSpan="2" className="condition-label">CONDITION</td>
                            <td>
                              <span className="condition-applied">
                                {entry.condition.toUpperCase()}
                              </span>
                              {' applied by '}{entry.sourceName}
                              {entry.duration && ` (${entry.duration} rounds)`}
                            </td>
                          </>
                        ) : entry.actionType === 'conditionExpired' ? (
                          <>
                            <td colSpan="2" className="condition-label">CONDITION</td>
                            <td>
                              <span className="condition-expired">
                                {entry.condition.toUpperCase()}
                              </span>
                              {' expired'}
                            </td>
                          </>
                        ) : entry.actionType === 'incapacitated' ? (
                          <>
                            <td colSpan="2" className="incapacitated-label">INCAPACITATED</td>
                            <td>
                              <span className="incapacitated">
                                Can't act ({entry.conditions.join(', ')})
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              {entry.attackRoll}
                              {renderRollModifier(entry)}
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
                                  {entry.conditionApplied && (
                                    <span className="condition-applied"> +{entry.conditionApplied.toUpperCase()}</span>
                                  )}
                                  {entry.targetDowned && <span className="downed"> DOWNED</span>}
                                  {entry.targetDied && <span className="died"> DIED</span>}
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
