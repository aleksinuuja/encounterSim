/**
 * Main combat simulation engine
 */

import { rollD20, rollDamage } from './dice.js'
import { selectTarget } from './targeting.js'

/**
 * Roll initiative for all combatants and return sorted order
 * @param {Array} combatants - Array of combatant objects
 * @returns {Array} - Combatants with initiativeRoll, sorted by initiative
 */
function rollInitiative(combatants) {
  const withInitiative = combatants.map(c => ({
    ...c,
    currentHp: c.maxHp,
    initiativeRoll: rollD20() + c.initiativeBonus
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
  const livingPlayers = combatants.filter(c => c.isPlayer && c.currentHp > 0)
  const livingMonsters = combatants.filter(c => !c.isPlayer && c.currentHp > 0)

  if (livingPlayers.length === 0) {
    return { shouldContinue: false, partyWon: false }
  }
  if (livingMonsters.length === 0) {
    return { shouldContinue: false, partyWon: true }
  }
  return { shouldContinue: true, partyWon: null }
}

/**
 * Execute a single attack
 * @param {object} attacker - The attacking combatant
 * @param {object} target - The target combatant
 * @param {number} round - Current round number
 * @param {number} turn - Current turn number within the round
 * @returns {object} - Log entry for this attack
 */
function executeAttack(attacker, target, round, turn) {
  const attackRoll = rollD20()
  const totalAttack = attackRoll + attacker.attackBonus

  const logEntry = {
    round,
    turn,
    actorName: attacker.name,
    targetName: target.name,
    attackRoll,
    totalAttack,
    targetAC: target.armorClass,
    hit: false
  }

  // Natural 1 always misses
  if (attackRoll === 1) {
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
  }

  return logEntry
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
      if (combatant.currentHp <= 0) {
        continue
      }

      // Find a target
      const target = selectTarget(combatants, combatant.isPlayer)
      if (!target) {
        // Combat is over
        break
      }

      turnCounter++
      turnInRound++

      // Execute the attack
      const logEntry = executeAttack(combatant, target, round, turnInRound)
      log.push(logEntry)

      // Check if combat is over
      const status = checkCombatStatus(combatants)
      if (!status.shouldContinue) {
        return {
          id: simulationId,
          partyWon: status.partyWon,
          totalRounds: round,
          survivingParty: combatants
            .filter(c => c.isPlayer && c.currentHp > 0)
            .map(c => c.name),
          survivingMonsters: combatants
            .filter(c => !c.isPlayer && c.currentHp > 0)
            .map(c => c.name),
          log
        }
      }
    }

    round++
  }

  // If we hit max rounds, determine winner by remaining HP
  const partyHp = combatants
    .filter(c => c.isPlayer)
    .reduce((sum, c) => sum + Math.max(0, c.currentHp), 0)
  const monsterHp = combatants
    .filter(c => !c.isPlayer)
    .reduce((sum, c) => sum + Math.max(0, c.currentHp), 0)

  return {
    id: simulationId,
    partyWon: partyHp > monsterHp,
    totalRounds: MAX_ROUNDS,
    survivingParty: combatants
      .filter(c => c.isPlayer && c.currentHp > 0)
      .map(c => c.name),
    survivingMonsters: combatants
      .filter(c => !c.isPlayer && c.currentHp > 0)
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
