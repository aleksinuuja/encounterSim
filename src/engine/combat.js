/**
 * Main combat simulation engine
 */

import { rollD20, rollD20WithModifier, rollDamage, rollDice } from './dice.js'
import { selectTarget, selectHealTarget } from './targeting.js'
import {
  canAct,
  getCombinedModifier,
  tickConditions,
  applyCondition,
  hasCondition
} from './conditions.js'

/**
 * Roll initiative for all combatants and return sorted order
 * @param {Array} combatants - Array of combatant objects
 * @returns {Array} - Combatants with initiativeRoll, sorted by initiative
 */
function rollInitiative(combatants) {
  const withInitiative = combatants.map(c => ({
    ...c,
    currentHp: c.maxHp,
    initiativeRoll: rollD20() + c.initiativeBonus,
    isUnconscious: false,
    isStabilized: false,
    isDead: false,
    deathSaveSuccesses: 0,
    deathSaveFailures: 0,
    conditions: [] // v0.4: Track active conditions
  }))

  // Sort by initiative (descending)
  // Ties: players before monsters, then alphabetical
  withInitiative.sort((a, b) => {
    if (b.initiativeRoll !== a.initiativeRoll) {
      return b.initiativeRoll - a.initiativeRoll
    }
    // Tie-breaker: players first
    if (a.isPlayer !== b.isPlayer) {
      return a.isPlayer ? -1 : 1
    }
    // Tie-breaker: alphabetical
    return a.name.localeCompare(b.name)
  })

  return withInitiative
}

/**
 * Check if combat should continue
 * @param {Array} combatants - All combatants
 * @returns {{ shouldContinue: boolean, partyWon: boolean|null }}
 */
function checkCombatStatus(combatants) {
  const livingPlayers = combatants.filter(c => c.isPlayer && !c.isDead)
  const livingMonsters = combatants.filter(c => !c.isPlayer && !c.isDead)

  if (livingPlayers.length === 0) {
    return { shouldContinue: false, partyWon: false }
  }
  if (livingMonsters.length === 0) {
    return { shouldContinue: false, partyWon: true }
  }
  return { shouldContinue: true, partyWon: null }
}

/**
 * Roll a death saving throw for an unconscious combatant
 * @param {object} combatant - The unconscious combatant
 * @param {number} round - Current round number
 * @param {number} turn - Current turn number within the round
 * @returns {object} - Log entry for this death save
 */
function rollDeathSave(combatant, round, turn) {
  const roll = rollD20()

  const logEntry = {
    round,
    turn,
    actorName: combatant.name,
    actionType: 'deathSave',
    deathSaveRoll: roll,
    deathSaveSuccess: roll >= 10,
    deathSaveSuccesses: combatant.deathSaveSuccesses,
    deathSaveFailures: combatant.deathSaveFailures,
    stabilized: false,
    died: false,
    recoveredFromNat20: false
  }

  if (roll === 20) {
    // Natural 20: wake up with 1 HP
    combatant.currentHp = 1
    combatant.isUnconscious = false
    combatant.deathSaveSuccesses = 0
    combatant.deathSaveFailures = 0
    logEntry.recoveredFromNat20 = true
    logEntry.deathSaveSuccesses = 0
    logEntry.deathSaveFailures = 0
    return logEntry
  }

  if (roll === 1) {
    // Natural 1: 2 failures
    combatant.deathSaveFailures += 2
  } else if (roll >= 10) {
    combatant.deathSaveSuccesses += 1
  } else {
    combatant.deathSaveFailures += 1
  }

  logEntry.deathSaveSuccesses = combatant.deathSaveSuccesses
  logEntry.deathSaveFailures = combatant.deathSaveFailures

  // Check outcomes
  if (combatant.deathSaveSuccesses >= 3) {
    combatant.isStabilized = true
    logEntry.stabilized = true
  }
  if (combatant.deathSaveFailures >= 3) {
    combatant.isDead = true
    logEntry.died = true
  }

  return logEntry
}

/**
 * Execute a single attack
 * @param {object} attacker - The attacking combatant
 * @param {object} target - The target combatant
 * @param {number} round - Current round number
 * @param {number} turn - Current turn number within the round
 * @param {Array} combatants - All combatants for condition logging
 * @param {Array} conditionLog - Array to push condition log entries
 * @returns {object} - Log entry for this attack
 */
function executeAttack(attacker, target, round, turn, combatants, conditionLog) {
  // Determine attack type (melee by default, could be extended later)
  const attackType = attacker.attackType || 'melee'

  // Get advantage/disadvantage from conditions
  const rollModifier = getCombinedModifier(attacker, target, attackType)
  const { result: attackRoll, rolls: attackRolls } = rollD20WithModifier(rollModifier)
  const totalAttack = attackRoll + attacker.attackBonus

  const logEntry = {
    round,
    turn,
    actorName: attacker.name,
    targetName: target.name,
    actionType: 'attack',
    attackRoll,
    attackRolls, // Array of all d20 rolls (for advantage/disadvantage display)
    rollModifier, // 'advantage', 'disadvantage', or 'normal'
    totalAttack,
    targetAC: target.armorClass,
    hit: false
  }

  // Handle attacking an unconscious target (auto-hit, causes death save failures)
  if (target.isUnconscious && !target.isDead) {
    logEntry.hit = true
    logEntry.targetHpBefore = target.currentHp

    // Attacks against unconscious targets are auto-crits if within 5 feet
    const isCritical = attackType === 'melee' || attackRoll === 20
    const damage = rollDamage(attacker.damage, isCritical)
    logEntry.damageRoll = damage
    logEntry.isCritical = isCritical
    logEntry.targetHpAfter = 0

    // Damage at 0 HP causes death save failures (melee = 2, ranged = 1)
    target.deathSaveFailures += attackType === 'melee' ? 2 : 1
    logEntry.deathSaveFailures = target.deathSaveFailures

    if (target.deathSaveFailures >= 3) {
      target.isDead = true
      logEntry.targetDied = true
    }

    return logEntry
  }

  // Natural 1 always misses (check raw roll, not modified)
  const rawRoll = attackRolls[0] // First roll is what we check for nat 1
  if (attackRolls.length === 1 && rawRoll === 1) {
    logEntry.hit = false
    return logEntry
  }
  // With advantage/disadvantage, only miss on nat 1 if BOTH rolls are 1
  if (attackRolls.length === 2 && attackRolls[0] === 1 && attackRolls[1] === 1) {
    logEntry.hit = false
    return logEntry
  }

  // Natural 20 always hits and crits
  const isCritical = attackRoll === 20
  const hit = isCritical || totalAttack >= target.armorClass

  if (hit) {
    logEntry.hit = true
    logEntry.targetHpBefore = target.currentHp

    const damage = rollDamage(attacker.damage, isCritical)
    logEntry.damageRoll = damage
    logEntry.isCritical = isCritical

    target.currentHp = Math.max(0, target.currentHp - damage)
    logEntry.targetHpAfter = target.currentHp
    logEntry.targetDowned = target.currentHp <= 0

    // Apply on-hit effects (e.g., poison from giant spider)
    if (attacker.onHitEffect && conditionLog) {
      const effect = attacker.onHitEffect
      // Roll save if applicable
      let savePassed = false
      if (effect.saveDC && effect.saveAbility) {
        const saveRoll = rollD20()
        const saveBonus = target[effect.saveAbility + 'Save'] || 0
        savePassed = (saveRoll + saveBonus) >= effect.saveDC
        logEntry.conditionSaveRoll = saveRoll
        logEntry.conditionSavePassed = savePassed
      }

      if (!savePassed) {
        const applied = applyCondition(target, {
          type: effect.condition,
          duration: effect.duration,
          source: attacker.name,
          saveEndOfTurn: effect.saveEndOfTurn || null
        })

        if (applied) {
          conditionLog.push({
            round,
            turn,
            actionType: 'conditionApplied',
            condition: effect.condition,
            targetName: target.name,
            sourceName: attacker.name,
            duration: effect.duration
          })
          logEntry.conditionApplied = effect.condition
        }
      }
    }

    // If target drops to 0 HP
    if (target.currentHp <= 0) {
      if (target.isPlayer) {
        // Players go unconscious and can make death saves
        target.isUnconscious = true
      } else {
        // Monsters die immediately at 0 HP
        target.isDead = true
        logEntry.targetDied = true
      }
    }
  }

  return logEntry
}

/**
 * Execute a heal action
 * @param {object} healer - The healing combatant
 * @param {object} target - The target ally to heal
 * @param {number} round - Current round number
 * @param {number} turn - Current turn number within the round
 * @returns {object} - Log entry for this heal
 */
function executeHeal(healer, target, round, turn) {
  const { total: healAmount } = rollDice(healer.healingDice)
  const targetHpBefore = target.currentHp
  const wasUnconscious = target.isUnconscious

  // Cannot exceed maxHp
  target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount)

  // If target was unconscious, wake them up and reset death saves
  if (wasUnconscious) {
    target.isUnconscious = false
    target.isStabilized = false
    target.deathSaveSuccesses = 0
    target.deathSaveFailures = 0
  }

  return {
    round,
    turn,
    actorName: healer.name,
    targetName: target.name,
    actionType: 'heal',
    healRoll: healAmount,
    targetHpBefore,
    targetHpAfter: target.currentHp,
    revivedFromUnconscious: wasUnconscious
  }
}

/**
 * Run a single combat simulation
 * @param {Array} party - Array of player combatants
 * @param {Array} monsters - Array of monster combatants
 * @param {number} simulationId - ID for this simulation
 * @returns {object} - SimulationResult
 */
export function runCombat(party, monsters, simulationId) {
  // Combine and roll initiative
  const allCombatants = [
    ...party.map(c => ({ ...c, isPlayer: true })),
    ...monsters.map(c => ({ ...c, isPlayer: false }))
  ]

  const combatants = rollInitiative(allCombatants)
  const log = []

  let round = 1
  let turnCounter = 0
  const MAX_ROUNDS = 100 // Safety limit

  while (round <= MAX_ROUNDS) {
    let turnInRound = 0

    for (const combatant of combatants) {
      // Skip dead combatants
      if (combatant.isDead) {
        continue
      }

      turnCounter++
      turnInRound++

      // Handle unconscious combatants
      if (combatant.isUnconscious) {
        // Stabilized combatants don't roll death saves
        if (combatant.isStabilized) {
          continue
        }

        // Roll death save at start of turn
        const deathSaveEntry = rollDeathSave(combatant, round, turnInRound)
        log.push(deathSaveEntry)

        // If they rolled a nat 20, they wake up and can act this turn
        // Otherwise, their turn ends (can't act while unconscious)
        if (!deathSaveEntry.recoveredFromNat20) {
          // Check if they died
          if (combatant.isDead) {
            const status = checkCombatStatus(combatants)
            if (!status.shouldContinue) {
              return {
                id: simulationId,
                partyWon: status.partyWon,
                totalRounds: round,
                survivingParty: combatants
                  .filter(c => c.isPlayer && !c.isDead)
                  .map(c => c.name),
                survivingMonsters: combatants
                  .filter(c => !c.isPlayer && !c.isDead)
                  .map(c => c.name),
                log
              }
            }
          }
          continue
        }
        // If recovered from nat 20, continue to take normal turn
      }

      // Check if conditions prevent acting (e.g., stunned)
      if (!canAct(combatant)) {
        // Log that the combatant couldn't act due to condition
        log.push({
          round,
          turn: turnInRound,
          actorName: combatant.name,
          actionType: 'incapacitated',
          conditions: combatant.conditions.map(c => c.type)
        })

        // Still tick conditions at end of turn
        const expired = tickConditions(combatant)
        expired.forEach(conditionType => {
          log.push({
            round,
            turn: turnInRound,
            actionType: 'conditionExpired',
            condition: conditionType,
            targetName: combatant.name
          })
        })

        continue
      }

      // Check if combatant should heal instead of attack
      // Yo-yo healing: only heal unconscious allies
      const healingDice = combatant.healingDice
      if (healingDice) {
        const healTarget = selectHealTarget(combatants, combatant.isPlayer)
        if (healTarget) {
          // Heal instead of attacking
          const logEntry = executeHeal(combatant, healTarget, round, turnInRound)
          log.push(logEntry)

          // Tick conditions at end of turn
          const expired = tickConditions(combatant)
          expired.forEach(conditionType => {
            log.push({
              round,
              turn: turnInRound,
              actionType: 'conditionExpired',
              condition: conditionType,
              targetName: combatant.name
            })
          })

          continue
        }
      }

      // Execute attacks (multi-attack support)
      const numAttacks = combatant.numAttacks || 1
      for (let attackNum = 0; attackNum < numAttacks; attackNum++) {
        // Find a target for this attack
        const target = selectTarget(combatants, combatant.isPlayer)
        if (!target) {
          // Combat is over
          break
        }

        // Execute the attack (pass combatants and log for condition effects)
        const logEntry = executeAttack(combatant, target, round, turnInRound, combatants, log)
        log.push(logEntry)

        // Check if combat is over
        const status = checkCombatStatus(combatants)
        if (!status.shouldContinue) {
          return {
            id: simulationId,
            partyWon: status.partyWon,
            totalRounds: round,
            survivingParty: combatants
              .filter(c => c.isPlayer && !c.isDead)
              .map(c => c.name),
            survivingMonsters: combatants
              .filter(c => !c.isPlayer && !c.isDead)
              .map(c => c.name),
            log
          }
        }
      }

      // Tick conditions at end of turn
      const expired = tickConditions(combatant)
      expired.forEach(conditionType => {
        log.push({
          round,
          turn: turnInRound,
          actionType: 'conditionExpired',
          condition: conditionType,
          targetName: combatant.name
        })
      })
    }

    round++
  }

  // If we hit max rounds, determine winner by remaining HP (excluding dead)
  const partyHp = combatants
    .filter(c => c.isPlayer && !c.isDead)
    .reduce((sum, c) => sum + Math.max(0, c.currentHp), 0)
  const monsterHp = combatants
    .filter(c => !c.isPlayer && !c.isDead)
    .reduce((sum, c) => sum + Math.max(0, c.currentHp), 0)

  return {
    id: simulationId,
    partyWon: partyHp > monsterHp,
    totalRounds: MAX_ROUNDS,
    survivingParty: combatants
      .filter(c => c.isPlayer && !c.isDead)
      .map(c => c.name),
    survivingMonsters: combatants
      .filter(c => !c.isPlayer && !c.isDead)
      .map(c => c.name),
    log
  }
}

/**
 * Run multiple simulations and aggregate results
 * @param {Array} party - Array of player combatants
 * @param {Array} monsters - Array of monster combatants
 * @param {number} numSimulations - Number of simulations to run
 * @returns {{ results: Array, summary: object }}
 */
export function runSimulations(party, monsters, numSimulations) {
  const results = []

  for (let i = 0; i < numSimulations; i++) {
    const result = runCombat(party, monsters, i + 1)
    results.push(result)
  }

  // Calculate summary statistics
  const wins = results.filter(r => r.partyWon).length
  const totalRounds = results.reduce((sum, r) => sum + r.totalRounds, 0)

  // Count survivor frequency
  const survivorCounts = {}
  results.forEach(r => {
    r.survivingParty.forEach(name => {
      survivorCounts[name] = (survivorCounts[name] || 0) + 1
    })
  })

  const summary = {
    totalSimulations: numSimulations,
    partyWins: wins,
    partyWinPercentage: (wins / numSimulations) * 100,
    averageRounds: totalRounds / numSimulations,
    survivorCounts
  }

  return { results, summary }
}
