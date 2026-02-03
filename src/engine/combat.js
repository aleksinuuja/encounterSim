/**
 * Main combat simulation engine
 */

import { rollD20, rollD20WithModifier, rollDamage, rollDice } from './dice.js'
import { selectTarget, selectHealTarget } from './targeting.js'
import {
  canAct,
  getCombinedModifier,
  tickConditions,
  processEndOfTurnSaves,
  applyCondition,
  CONDITIONS
} from './conditions.js'
import {
  canCastSpell,
  castDamageSpell,
  castHealingSpell,
  castControlSpell,
  castAreaSpell,
  checkConcentration,
  selectSpellToCast
} from './spellcasting.js'
import { consumeSpellSlot } from './spells.js'
import {
  executeOffHandAttack,
  executeSecondWind,
  executeSpiritualWeaponAttack,
  selectBonusAction,
  tickSpiritualWeapon,
  shouldUseShield,
  applyShieldReaction
} from './actions.js'
import {
  executeMultiattack,
  executeBreathWeapon,
  executeLegendaryAction,
  selectLegendaryAction,
  shouldUseBreathWeapon,
  processRecharges,
  executeFrightfulPresence,
  shouldUseFrightfulPresence
} from './monsters.js'
import {
  getDefaultPosition,
  selectConeTargets
} from './positioning.js'
import {
  applyDamage,
  shouldUseLegendaryResistance,
  useLegendaryResistance
} from './damage.js'

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
    conditions: [], // v0.4: Track active conditions
    // v0.6: Spellcasting state
    currentSlots: c.spellSlots ? { ...c.spellSlots } : null,
    concentratingOn: null,
    // v0.7: Action economy
    hasAction: true,
    hasBonusAction: true,
    hasReaction: true,
    actionSurgeUsed: false,
    secondWindUsed: false,
    shieldActive: false,
    spiritualWeapon: null,
    // v0.8: Advanced monster abilities
    currentLegendaryActions: c.legendaryActions || 0,
    // v0.10: Legendary resistance (auto-succeed failed saves)
    currentLegendaryResistances: c.legendaryResistances || 0,
    // Deep copy recharge abilities to track availability per combat
    rechargeAbilities: c.rechargeAbilities
      ? c.rechargeAbilities.map(a => ({ ...a, available: true }))
      : null,
    // v0.10: Frightful Presence (deep copy for availability tracking)
    frightfulPresence: c.frightfulPresence
      ? { ...c.frightfulPresence, available: true }
      : null,
    // v0.9: Position for AOE targeting (front/back)
    position: c.position || getDefaultPosition(c)
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

  // All players dead = party lost
  if (livingPlayers.length === 0) {
    return { shouldContinue: false, partyWon: false }
  }
  // All monsters dead = party won
  if (livingMonsters.length === 0) {
    return { shouldContinue: false, partyWon: true }
  }
  // All players are unconscious (none can fight) = party lost
  // Monsters won't finish off unconscious players in default AI, so end combat
  const consciousPlayers = livingPlayers.filter(c => !c.isUnconscious)
  if (consciousPlayers.length === 0) {
    return { shouldContinue: false, partyWon: false }
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
 * @param {Array} log - Array to push log entries (for condition and concentration)
 * @returns {object} - Log entry for this attack
 */
function executeAttack(attacker, target, round, turn, combatants, log) {
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

  // Check for auto-crit conditions (paralyzed, stunned) on melee attacks
  const hasAutoCritCondition = target.conditions?.some(c => {
    const def = CONDITIONS[c.type]
    return def?.autoCrit && attackType === 'melee'
  })

  // Natural 20 always hits and crits, also auto-crit against paralyzed/stunned
  const isCritical = attackRoll === 20 || hasAutoCritCondition
  let hit = isCritical || totalAttack >= target.armorClass

  // v0.7: Check for Shield reaction (can't block crits)
  if (hit && !isCritical && shouldUseShield(target, totalAttack)) {
    const shieldResult = applyShieldReaction(target, totalAttack, logEntry.round, logEntry.turn)
    if (log) log.push(shieldResult.log)
    if (shieldResult.blocked) {
      hit = false
      logEntry.shieldBlocked = true
    }
    // Consume spell slot for Shield
    if (target.currentSlots) {
      target.currentSlots[1]--
    }
  }

  if (hit) {
    logEntry.hit = true
    logEntry.targetHpBefore = target.currentHp
    if (hasAutoCritCondition) {
      logEntry.autoCrit = true
    }

    const damage = rollDamage(attacker.damage, isCritical)
    logEntry.damageRoll = damage
    logEntry.isCritical = isCritical

    target.currentHp = Math.max(0, target.currentHp - damage)
    logEntry.targetHpAfter = target.currentHp
    logEntry.targetDowned = target.currentHp <= 0

    // v0.6: Check concentration when taking damage
    if (target.concentratingOn && damage > 0 && target.currentHp > 0) {
      const concLog = checkConcentration(target, damage, round, turn)
      if (concLog && log) {
        log.push(concLog)
      }
    }

    // Apply on-hit effects (e.g., poison from giant spider)
    if (attacker.onHitEffect && log) {
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
        const result = applyCondition(target, {
          type: effect.condition,
          duration: effect.duration,
          source: attacker.name,
          saveEndOfTurn: effect.saveEndOfTurn || null
        })

        if (result === 'applied') {
          log.push({
            round,
            turn,
            actionType: 'conditionApplied',
            condition: effect.condition,
            targetName: target.name,
            sourceName: attacker.name,
            duration: effect.duration
          })
          logEntry.conditionApplied = effect.condition
        } else if (result === 'immune') {
          logEntry.conditionImmune = effect.condition
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
 * Process end-of-turn effects: saving throws and duration ticks
 * @param {object} combatant - The combatant to process
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @param {Array} log - Combat log to append to
 */
function processEndOfTurn(combatant, round, turn, log) {
  // First, process saving throws to break conditions
  const saveResults = processEndOfTurnSaves(combatant, rollD20)
  saveResults.forEach(result => {
    log.push({
      round,
      turn,
      actorName: combatant.name,
      actionType: 'conditionSave',
      condition: result.type,
      saveRoll: result.roll,
      saveTotal: result.total,
      saveDC: result.dc,
      saveAbility: result.ability,
      savePassed: result.saved
    })
  })

  // Then tick remaining conditions (decrement duration)
  const expired = tickConditions(combatant)
  expired.forEach(conditionType => {
    log.push({
      round,
      turn,
      actionType: 'conditionExpired',
      condition: conditionType,
      targetName: combatant.name
    })
  })
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
  const MAX_ROUNDS = 100 // Safety limit

  while (round <= MAX_ROUNDS) {
    let turnInRound = 0

    for (const combatant of combatants) {
      // Skip dead combatants
      if (combatant.isDead) {
        continue
      }

      turnInRound++

      // v0.7: Reset action economy at start of turn
      combatant.hasAction = true
      combatant.hasBonusAction = true
      combatant.hasReaction = true // Reaction resets at start of YOUR turn
      combatant.shieldActive = false // Shield expires at start of your turn

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

        // Process end-of-turn saves and tick conditions
        processEndOfTurn(combatant, round, turnInRound, log)

        continue
      }

      // v0.6: Check if combatant should cast a spell
      let usedAction = false
      let _usedBonusAction = false // Reserved for v0.7 action economy
      const allies = combatants.filter(c => c.isPlayer === combatant.isPlayer && !c.isDead)
      const enemies = combatants.filter(c => c.isPlayer !== combatant.isPlayer && !c.isDead)

      if (combatant.spells || combatant.cantrips) {
        const spellChoice = selectSpellToCast(combatant, allies, enemies)
        if (spellChoice) {
          const { spell, slotLevel, target: spellTarget, isBonusAction, targetPosition } = spellChoice
          const canCast = canCastSpell(combatant, spell.key, slotLevel)

          if (canCast.canCast) {
            // Consume spell slot (if not cantrip)
            if (spell.level > 0) {
              consumeSpellSlot(combatant, slotLevel)
            }

            // Cast the spell based on effect type
            if (spell.effectType === 'damage') {
              if (spell.targetType === 'area') {
                const areaLogs = castAreaSpell(combatant, spell, Array.isArray(spellTarget) ? spellTarget : [spellTarget], slotLevel, round, turnInRound, targetPosition)
                areaLogs.forEach(entry => {
                  log.push(entry)
                  // Check concentration for each damaged target
                  if (entry.damageRoll > 0) {
                    const damaged = combatants.find(c => c.name === entry.targetName)
                    if (damaged?.concentratingOn && damaged.currentHp > 0) {
                      const concLog = checkConcentration(damaged, entry.damageRoll, round, turnInRound)
                      if (concLog) log.push(concLog)
                    }
                  }
                })
              } else {
                const dmgLog = castDamageSpell(combatant, spell, spellTarget, slotLevel, round, turnInRound)
                log.push(dmgLog)
                // Check concentration
                if (dmgLog.damageRoll > 0 && spellTarget.concentratingOn && spellTarget.currentHp > 0) {
                  const concLog = checkConcentration(spellTarget, dmgLog.damageRoll, round, turnInRound)
                  if (concLog) log.push(concLog)
                }
              }
            } else if (spell.effectType === 'heal') {
              const healLog = castHealingSpell(combatant, spell, spellTarget, slotLevel, round, turnInRound)
              log.push(healLog)
            } else if (spell.effectType === 'control') {
              const ctrlLog = castControlSpell(combatant, spell, spellTarget, slotLevel, round, turnInRound)
              log.push(ctrlLog)
            }

            // Mark action/bonus action as used
            if (isBonusAction) {
              _usedBonusAction = true
            } else {
              usedAction = true
            }

            // Check if combat ended
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
        }
      }

      // If action already used, skip to end of turn
      if (usedAction) {
        processEndOfTurn(combatant, round, turnInRound, log)
        continue
      }

      // v0.8: Process recharge abilities at start of monster turn
      if (combatant.rechargeAbilities) {
        const rechargeLogs = processRecharges(combatant, round, turnInRound)
        rechargeLogs.forEach(entry => log.push(entry))
      }

      // v0.10: Use Frightful Presence at start of combat
      if (shouldUseFrightfulPresence(combatant, enemies)) {
        const fpLogs = executeFrightfulPresence(combatant, enemies, round, turnInRound)
        fpLogs.forEach(entry => log.push(entry))
        // Frightful Presence takes an action, so end turn
        processEndOfTurn(combatant, round, turnInRound, log)
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

          // Process end-of-turn saves and tick conditions
          processEndOfTurn(combatant, round, turnInRound, log)

          continue
        }
      }

      // v0.8: Check for breath weapon or other recharge abilities
      // Breath weapons are cones - they hit the front line only
      const breathWeapon = shouldUseBreathWeapon(combatant, enemies)
      if (breathWeapon) {
        // Use cone targeting for breath weapons
        const { targets: breathTargets, position: breathPosition } = selectConeTargets(combatants, combatant.isPlayer)
        const breathLogs = executeBreathWeapon(combatant, breathWeapon, breathTargets, round, turnInRound, breathPosition)
        breathLogs.forEach(entry => log.push(entry))

        // Check if combat ended
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

      // v0.8: Use multiattack if available, otherwise standard attacks
      if (combatant.multiattack) {
        const multiLogs = executeMultiattack(combatant, enemies, round, turnInRound)
        multiLogs.forEach(entry => log.push(entry))

        // Check if combat ended
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
      } else {
        // Execute standard attacks (multi-attack support)
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
      }

      // v0.7: Process bonus action (if not already used by spell)
      if (combatant.hasBonusAction) {
        const bonusAction = selectBonusAction(combatant, allies, enemies)
        if (bonusAction) {
          let baLog = null
          const baTarget = bonusAction.target || selectTarget(combatants, combatant.isPlayer)

          if (bonusAction.type === 'spiritualWeapon' && baTarget) {
            baLog = executeSpiritualWeaponAttack(combatant, baTarget, round, turnInRound)
          } else if (bonusAction.type === 'secondWind') {
            baLog = executeSecondWind(combatant, round, turnInRound)
          } else if (bonusAction.type === 'offHandAttack' && baTarget) {
            baLog = executeOffHandAttack(combatant, baTarget, round, turnInRound)
          }

          if (baLog) {
            log.push(baLog)
            combatant.hasBonusAction = false

            // Check if combat ended
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
        }
      }

      // v0.7: Tick spiritual weapon duration
      tickSpiritualWeapon(combatant)

      // Process end-of-turn saves and tick conditions
      processEndOfTurn(combatant, round, turnInRound, log)

      // v0.8: Legendary actions - legendary monsters can act after each other creature's turn
      const legendaryMonsters = combatants.filter(c =>
        !c.isDead &&
        !c.isUnconscious &&
        c.legendaryActions > 0 &&
        c !== combatant && // Not their own turn
        c.currentLegendaryActions > 0
      )

      for (const legendary of legendaryMonsters) {
        const legendaryAbility = selectLegendaryAction(legendary, allies)
        if (legendaryAbility) {
          const legLogs = executeLegendaryAction(legendary, legendaryAbility, allies, round, turnInRound)
          legLogs.forEach(entry => log.push(entry))

          // Check if combat ended
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
      }
    }

    // v0.8: Reset legendary actions at end of round
    combatants.forEach(c => {
      if (c.legendaryActions > 0) {
        c.currentLegendaryActions = c.legendaryActions
      }
    })

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
