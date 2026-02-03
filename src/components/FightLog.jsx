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
    if (entry.actionType === 'conditionSave') return entry.savePassed ? 'log-condition-save-passed' : 'log-condition-save-failed'
    if (entry.actionType === 'incapacitated') return 'log-incapacitated'
    // v0.6: Spellcasting
    if (entry.actionType === 'spell') {
      if (entry.effectType === 'heal') return 'log-heal'
      if (entry.effectType === 'area') return 'log-spell-area'
      if (entry.targetDied) return 'log-death'
      if (entry.hit) return 'log-spell-hit'
      return 'log-spell-miss'
    }
    if (entry.actionType === 'spellEffect') {
      if (entry.targetDied) return 'log-death'
      if (entry.isAlly) return entry.savePassed ? 'log-friendly-fire-saved' : 'log-friendly-fire'
      return entry.savePassed ? 'log-spell-saved' : 'log-spell-hit'
    }
    if (entry.actionType === 'concentrationCheck') {
      return entry.maintained ? 'log-concentration-kept' : 'log-concentration-lost'
    }
    // v0.7: Action economy
    if (entry.actionType === 'bonusAction') {
      if (entry.bonusActionType === 'secondWind') return 'log-heal'
      if (entry.targetDied) return 'log-death'
      if (entry.hit) return 'log-bonus-hit'
      return 'log-bonus-miss'
    }
    if (entry.actionType === 'reaction') {
      if (entry.reactionType === 'shield') return entry.blocked ? 'log-shield-blocked' : 'log-shield-failed'
      if (entry.targetDied) return 'log-death'
      if (entry.hit) return 'log-reaction-hit'
      return 'log-reaction-miss'
    }
    // v0.8: Advanced monster abilities
    if (entry.actionType === 'multiattack') {
      if (entry.targetDied) return 'log-death'
      if (entry.hit) return 'log-hit'
      return 'log-miss'
    }
    if (entry.actionType === 'breathWeapon') return 'log-breath-weapon'
    if (entry.actionType === 'breathEffect') {
      if (entry.targetDied) return 'log-death'
      return entry.savePassed ? 'log-spell-saved' : 'log-breath-hit'
    }
    if (entry.actionType === 'legendaryAction') {
      if (entry.effectType === 'area') return 'log-legendary-area'
      if (entry.targetDied) return 'log-death'
      if (entry.hit) return 'log-legendary-hit'
      return 'log-legendary-miss'
    }
    if (entry.actionType === 'legendaryEffect') {
      if (entry.targetDied) return 'log-death'
      return entry.savePassed ? 'log-spell-saved' : 'log-legendary-hit'
    }
    if (entry.actionType === 'recharge') {
      return entry.recharged ? 'log-recharge-success' : 'log-recharge-fail'
    }
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
                        ) : entry.actionType === 'conditionSave' ? (
                          <>
                            <td colSpan="2" className="condition-save-label">
                              {entry.saveAbility?.toUpperCase()} SAVE
                            </td>
                            <td>
                              <span className={entry.savePassed ? 'save-passed' : 'save-failed'}>
                                {entry.saveRoll} → {entry.saveTotal} vs DC {entry.saveDC}
                              </span>
                              {' '}
                              {entry.savePassed ? (
                                <span className="condition-cured">
                                  {entry.condition} cured!
                                </span>
                              ) : (
                                <span className="condition-remains">
                                  {entry.condition} remains
                                </span>
                              )}
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
                        ) : entry.actionType === 'spell' ? (
                          <>
                            <td colSpan="2" className="spell-label">
                              <span className="spell-name">{entry.spellName}</span>
                              {entry.slotUsed > 0 && <span className="spell-slot"> (Lvl {entry.slotUsed})</span>}
                            </td>
                            <td>
                              {entry.effectType === 'heal' ? (
                                <>
                                  <span className="healing">+{entry.healRoll} HP</span>
                                  {' '}({entry.targetHpBefore} → {entry.targetHpAfter})
                                  {entry.revivedFromUnconscious && <span className="revived"> (back up!)</span>}
                                </>
                              ) : entry.effectType === 'area' ? (
                                <>
                                  <span className="spell-damage">{entry.baseDamage} base dmg</span>
                                  {' → '}
                                  {entry.friendlyFire ? (
                                    <>
                                      <span className="enemies-hit">{entry.enemiesHit} enemies</span>
                                      {', '}
                                      <span className="allies-hit">{entry.alliesHit} allies</span>
                                    </>
                                  ) : (
                                    <>{entry.targetsHit} targets</>
                                  )}
                                  {entry.targetPosition && (
                                    <span className={`position-indicator position-${entry.targetPosition}`}>
                                      {' '}({entry.targetPosition} line)
                                    </span>
                                  )}
                                </>
                              ) : entry.effectType === 'control' ? (
                                <>
                                  {entry.saveDC && (
                                    <span className={entry.savePassed ? 'save-passed' : 'save-failed'}>
                                      {entry.saveAbility?.toUpperCase()} {entry.saveTotal} vs DC {entry.saveDC}
                                    </span>
                                  )}
                                  {entry.resisted ? (
                                    <span className="resisted"> Resisted</span>
                                  ) : entry.conditionApplied ? (
                                    <span className="condition-applied"> +{entry.conditionApplied.toUpperCase()}</span>
                                  ) : null}
                                  {entry.concentrating && <span className="concentrating"> (concentrating)</span>}
                                </>
                              ) : entry.attackRoll !== undefined ? (
                                <>
                                  <span className={entry.hit ? 'hit' : 'miss'}>
                                    {entry.attackRoll}{entry.isCritical && ' CRIT!'} → {entry.totalAttack} vs {entry.targetAC}
                                  </span>
                                  {entry.hit && (
                                    <>
                                      {' '}<span className="spell-damage">{entry.damageRoll} dmg</span>
                                      {' '}({entry.targetHpBefore} → {entry.targetHpAfter})
                                    </>
                                  )}
                                  {entry.targetDied && <span className="died"> DIED</span>}
                                </>
                              ) : entry.saveDC !== undefined ? (
                                <>
                                  <span className={entry.savePassed ? 'save-passed' : 'save-failed'}>
                                    {entry.saveAbility?.toUpperCase()} {entry.saveTotal} vs DC {entry.saveDC}
                                  </span>
                                  {entry.damageRoll !== undefined && (
                                    <>
                                      {' '}<span className="spell-damage">{entry.damageRoll} dmg</span>
                                      {' '}({entry.targetHpBefore} → {entry.targetHpAfter})
                                    </>
                                  )}
                                  {entry.targetDied && <span className="died"> DIED</span>}
                                </>
                              ) : entry.projectiles ? (
                                <>
                                  <span className="spell-damage">{entry.damageRoll} dmg</span>
                                  {' '}({entry.projectiles} darts)
                                  {' '}({entry.targetHpBefore} → {entry.targetHpAfter})
                                  {entry.targetDied && <span className="died"> DIED</span>}
                                </>
                              ) : (
                                <span className="miss">No effect</span>
                              )}
                            </td>
                          </>
                        ) : entry.actionType === 'spellEffect' ? (
                          <>
                            <td colSpan="2" className="spell-effect-label">
                              ↳ {entry.spellName}
                              {entry.isAlly && <span className="friendly-fire-indicator"> [ALLY]</span>}
                            </td>
                            <td>
                              <span className={entry.savePassed ? 'save-passed' : 'save-failed'}>
                                {entry.saveAbility?.toUpperCase()} {entry.saveTotal} vs DC {entry.saveDC}
                              </span>
                              {' '}<span className={entry.isAlly ? 'friendly-fire-damage' : 'spell-damage'}>{entry.damageRoll} dmg</span>
                              {' '}({entry.targetHpBefore} → {entry.targetHpAfter})
                              {entry.targetDowned && <span className="downed"> DOWNED</span>}
                              {entry.targetDied && <span className="died"> DIED</span>}
                            </td>
                          </>
                        ) : entry.actionType === 'concentrationCheck' ? (
                          <>
                            <td colSpan="2" className="concentration-label">CONCENTRATION</td>
                            <td>
                              <span className={entry.maintained ? 'concentration-kept' : 'concentration-lost'}>
                                CON {entry.saveTotal} vs DC {entry.saveDC}
                              </span>
                              {' '}
                              {entry.maintained ? (
                                <span className="maintained">{entry.spellName} maintained</span>
                              ) : (
                                <span className="lost">{entry.lostConcentration} lost!</span>
                              )}
                            </td>
                          </>
                        ) : entry.actionType === 'bonusAction' ? (
                          <>
                            <td colSpan="2" className="bonus-action-label">
                              BONUS: {entry.bonusActionType === 'offHandAttack' ? 'Off-hand' :
                                      entry.bonusActionType === 'secondWind' ? 'Second Wind' :
                                      entry.bonusActionType === 'spiritualWeapon' ? 'Spiritual Weapon' :
                                      entry.bonusActionType}
                            </td>
                            <td>
                              {entry.bonusActionType === 'secondWind' ? (
                                <>
                                  <span className="healing">+{entry.healRoll} HP</span>
                                  {' '}({entry.targetHpBefore} → {entry.targetHpAfter})
                                </>
                              ) : (
                                <>
                                  <span className={entry.hit ? 'hit' : 'miss'}>
                                    {entry.attackRoll}{entry.isCritical && ' CRIT!'} → {entry.totalAttack} vs {entry.targetAC}
                                  </span>
                                  {entry.hit && (
                                    <>
                                      {' '}<span className="damage">{entry.damageRoll} dmg</span>
                                      {' '}({entry.targetHpBefore} → {entry.targetHpAfter})
                                    </>
                                  )}
                                  {entry.targetDied && <span className="died"> DIED</span>}
                                </>
                              )}
                            </td>
                          </>
                        ) : entry.actionType === 'reaction' ? (
                          <>
                            <td colSpan="2" className="reaction-label">
                              REACTION: {entry.reactionType === 'shield' ? 'Shield' :
                                         entry.reactionType === 'opportunityAttack' ? 'Opportunity Attack' :
                                         entry.reactionType}
                            </td>
                            <td>
                              {entry.reactionType === 'shield' ? (
                                <>
                                  <span className={entry.blocked ? 'shield-blocked' : 'shield-failed'}>
                                    AC {entry.originalAC} → {entry.newAC}
                                  </span>
                                  {' '}vs {entry.incomingAttack}
                                  {entry.blocked ? (
                                    <span className="blocked"> BLOCKED!</span>
                                  ) : (
                                    <span className="not-blocked"> (still hit)</span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <span className={entry.hit ? 'hit' : 'miss'}>
                                    {entry.attackRoll}{entry.isCritical && ' CRIT!'} → {entry.totalAttack} vs {entry.targetAC}
                                  </span>
                                  {entry.hit && (
                                    <>
                                      {' '}<span className="damage">{entry.damageRoll} dmg</span>
                                      {' '}({entry.targetHpBefore} → {entry.targetHpAfter})
                                    </>
                                  )}
                                  {entry.targetDied && <span className="died"> DIED</span>}
                                </>
                              )}
                            </td>
                          </>
                        ) : entry.actionType === 'multiattack' ? (
                          <>
                            <td>
                              {entry.attackRoll}
                              {entry.attackRoll === 20 && ' (CRIT)'}
                              {entry.attackRoll === 1 && ' (FUMBLE)'}
                              {' → '}{entry.totalAttack}
                            </td>
                            <td>{entry.targetAC}</td>
                            <td>
                              <span className="attack-type">{entry.attackType}</span>
                              {entry.hit ? (
                                <>
                                  {' '}<span className="damage">{entry.damageRoll} {entry.damageType}</span>
                                  {' '}({entry.targetHpBefore} → {entry.targetHpAfter})
                                  {entry.targetDied && <span className="died"> DIED</span>}
                                </>
                              ) : (
                                <span className="miss"> Miss</span>
                              )}
                            </td>
                          </>
                        ) : entry.actionType === 'breathWeapon' ? (
                          <>
                            <td colSpan="2" className="breath-weapon-label">
                              {entry.abilityName} ({entry.shape} {entry.size}ft)
                            </td>
                            <td>
                              <span className="breath-damage">{entry.baseDamage} {entry.damageType}</span>
                              {' → '}{entry.targetsHit} targets
                              {entry.targetPosition && (
                                <span className={`position-indicator position-${entry.targetPosition}`}>
                                  {' '}({entry.targetPosition} line)
                                </span>
                              )}
                            </td>
                          </>
                        ) : entry.actionType === 'breathEffect' ? (
                          <>
                            <td colSpan="2" className="breath-effect-label">
                              ↳ {entry.abilityName}
                            </td>
                            <td>
                              <span className={entry.savePassed ? 'save-passed' : 'save-failed'}>
                                {entry.saveAbility?.toUpperCase()} {entry.saveTotal} vs DC {entry.saveDC}
                              </span>
                              {' '}<span className="breath-damage">{entry.damageRoll} dmg</span>
                              {' '}({entry.targetHpBefore} → {entry.targetHpAfter})
                              {entry.targetDied && <span className="died"> DIED</span>}
                            </td>
                          </>
                        ) : entry.actionType === 'legendaryAction' ? (
                          <>
                            <td colSpan="2" className="legendary-label">
                              LEGENDARY: {entry.abilityName} ({entry.cost} action{entry.cost > 1 ? 's' : ''})
                            </td>
                            <td>
                              {entry.effectType === 'area' ? (
                                <span className="legendary-damage">{entry.baseDamage} dmg (area)</span>
                              ) : entry.hit ? (
                                <>
                                  <span className="hit">{entry.attackRoll} → {entry.totalAttack}</span>
                                  {' '}<span className="damage">{entry.damageRoll} dmg</span>
                                  {' '}({entry.targetHpBefore} → {entry.targetHpAfter})
                                  {entry.targetDied && <span className="died"> DIED</span>}
                                </>
                              ) : (
                                <span className="miss">Miss ({entry.attackRoll} → {entry.totalAttack} vs {entry.targetAC})</span>
                              )}
                            </td>
                          </>
                        ) : entry.actionType === 'legendaryEffect' ? (
                          <>
                            <td colSpan="2" className="legendary-effect-label">
                              ↳ {entry.abilityName}
                            </td>
                            <td>
                              <span className={entry.savePassed ? 'save-passed' : 'save-failed'}>
                                {entry.saveTotal} vs DC {entry.saveDC}
                              </span>
                              {!entry.savePassed && (
                                <>
                                  {' '}<span className="damage">{entry.damageRoll} dmg</span>
                                  {entry.conditionApplied && <span className="condition-applied"> +{entry.conditionApplied.toUpperCase()}</span>}
                                </>
                              )}
                              {' '}({entry.targetHpBefore} → {entry.targetHpAfter})
                              {entry.targetDied && <span className="died"> DIED</span>}
                            </td>
                          </>
                        ) : entry.actionType === 'recharge' ? (
                          <>
                            <td colSpan="2" className="recharge-label">RECHARGE</td>
                            <td>
                              <span className={entry.recharged ? 'recharge-success' : 'recharge-fail'}>
                                {entry.abilityName}: {entry.roll}
                              </span>
                              {entry.recharged ? ' Recharged!' : ' Not yet'}
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
                                  {entry.conditionImmune && (
                                    <span className="condition-immune"> (immune to {entry.conditionImmune})</span>
                                  )}
                                  {entry.autoCrit && (
                                    <span className="auto-crit"> AUTO-CRIT</span>
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
