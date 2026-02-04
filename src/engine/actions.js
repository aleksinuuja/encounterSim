/**
 * Action economy system for D&D 5e combat
 * Handles bonus actions, reactions, and special abilities
 */

import { rollD20, rollDice } from './dice.js'
import { hasResource } from './resources.js'

/**
 * Execute an off-hand attack (two-weapon fighting)
 * @param {object} attacker - The attacking combatant
 * @param {object} target - The target combatant
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @returns {object} - Log entry
 */
export function executeOffHandAttack(attacker, target, round, turn) {
  const attackRoll = rollD20()
  const totalAttack = attackRoll + attacker.attackBonus

  const logEntry = {
    round,
    turn,
    actorName: attacker.name,
    targetName: target.name,
    actionType: 'bonusAction',
    bonusActionType: 'offHandAttack',
    attackRoll,
    totalAttack,
    targetAC: target.armorClass,
    hit: false
  }

  // Natural 1 always misses
  if (attackRoll === 1) {
    return logEntry
  }

  const isCritical = attackRoll === 20
  const hit = isCritical || totalAttack >= target.armorClass

  if (hit) {
    logEntry.hit = true
    logEntry.isCritical = isCritical
    logEntry.targetHpBefore = target.currentHp

    // Off-hand doesn't add ability modifier (unless has fighting style)
    const offHandDamage = attacker.offHandDamage || '1d6'
    const { total: baseDamage } = rollDice(offHandDamage)
    const damage = isCritical ? baseDamage * 2 : baseDamage

    logEntry.damageRoll = damage
    target.currentHp = Math.max(0, target.currentHp - damage)
    logEntry.targetHpAfter = target.currentHp

    if (target.currentHp <= 0) {
      if (target.isPlayer) {
        target.isUnconscious = true
        logEntry.targetDowned = true
      } else {
        target.isDead = true
        logEntry.targetDied = true
      }
    }
  }

  return logEntry
}

/**
 * Execute Second Wind (Fighter feature)
 * @param {object} fighter - The fighter using Second Wind
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @returns {object} - Log entry
 */
export function executeSecondWind(fighter, round, turn) {
  const level = fighter.level || 1
  const healDice = `1d10+${level}`
  const { total: healAmount } = rollDice(healDice)

  const hpBefore = fighter.currentHp
  fighter.currentHp = Math.min(fighter.maxHp, fighter.currentHp + healAmount)
  fighter.secondWindUsed = true

  return {
    round,
    turn,
    actorName: fighter.name,
    targetName: fighter.name,
    actionType: 'bonusAction',
    bonusActionType: 'secondWind',
    healRoll: healAmount,
    targetHpBefore: hpBefore,
    targetHpAfter: fighter.currentHp
  }
}

/**
 * Execute Spiritual Weapon attack
 * @param {object} caster - The caster with spiritual weapon
 * @param {object} target - The target
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @returns {object} - Log entry
 */
export function executeSpiritualWeaponAttack(caster, target, round, turn) {
  const sw = caster.spiritualWeapon
  if (!sw) return null

  const attackRoll = rollD20()
  const totalAttack = attackRoll + sw.attackBonus

  const logEntry = {
    round,
    turn,
    actorName: caster.name,
    targetName: target.name,
    actionType: 'bonusAction',
    bonusActionType: 'spiritualWeapon',
    attackRoll,
    totalAttack,
    targetAC: target.armorClass,
    hit: false
  }

  if (attackRoll === 1) {
    return logEntry
  }

  const isCritical = attackRoll === 20
  const hit = isCritical || totalAttack >= target.armorClass

  if (hit) {
    logEntry.hit = true
    logEntry.isCritical = isCritical
    logEntry.targetHpBefore = target.currentHp

    const { total: baseDamage } = rollDice(sw.damage)
    // Add spellcasting mod to damage
    const damage = isCritical
      ? baseDamage * 2 + (caster.spellcastingMod || 0)
      : baseDamage + (caster.spellcastingMod || 0)

    logEntry.damageRoll = damage
    target.currentHp = Math.max(0, target.currentHp - damage)
    logEntry.targetHpAfter = target.currentHp

    if (target.currentHp <= 0) {
      if (target.isPlayer) {
        target.isUnconscious = true
        logEntry.targetDowned = true
      } else {
        target.isDead = true
        logEntry.targetDied = true
      }
    }
  }

  return logEntry
}

/**
 * Execute opportunity attack
 * @param {object} attacker - The combatant making the OA
 * @param {object} target - The target leaving reach
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @returns {object} - Log entry
 */
export function executeOpportunityAttack(attacker, target, round, turn) {
  const attackRoll = rollD20()
  const totalAttack = attackRoll + attacker.attackBonus

  const logEntry = {
    round,
    turn,
    actorName: attacker.name,
    targetName: target.name,
    actionType: 'reaction',
    reactionType: 'opportunityAttack',
    attackRoll,
    totalAttack,
    targetAC: target.armorClass,
    hit: false
  }

  if (attackRoll === 1) {
    // Nat 1 auto-miss, but reaction is still consumed
    attacker.hasReaction = false
    return logEntry
  }

  const isCritical = attackRoll === 20
  const hit = isCritical || totalAttack >= target.armorClass

  if (hit) {
    logEntry.hit = true
    logEntry.isCritical = isCritical
    logEntry.targetHpBefore = target.currentHp

    const { total: baseDamage } = rollDice(attacker.damage)
    const damage = isCritical ? baseDamage * 2 : baseDamage

    logEntry.damageRoll = damage
    target.currentHp = Math.max(0, target.currentHp - damage)
    logEntry.targetHpAfter = target.currentHp

    if (target.currentHp <= 0) {
      if (target.isPlayer) {
        target.isUnconscious = true
        logEntry.targetDowned = true
      } else {
        target.isDead = true
        logEntry.targetDied = true
      }
    }
  }

  // Mark reaction as used
  attacker.hasReaction = false

  return logEntry
}

/**
 * Use Shield spell as a reaction
 * @param {object} caster - The caster using Shield
 * @param {number} incomingAttack - The attack total that hit
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @returns {object} - Log entry and whether the attack now misses
 */
export function applyShieldReaction(caster, incomingAttack, round, turn) {
  // Shield grants +5 AC until start of next turn
  const newAC = caster.armorClass + 5
  const nowMisses = incomingAttack < newAC

  caster.hasReaction = false
  caster.shieldActive = true // Track for AC calculation

  return {
    log: {
      round,
      turn,
      actorName: caster.name,
      actionType: 'reaction',
      reactionType: 'shield',
      originalAC: caster.armorClass,
      newAC,
      incomingAttack,
      blocked: nowMisses
    },
    blocked: nowMisses
  }
}

/**
 * Check if combatant should use Shield reaction
 * @param {object} target - The target being attacked
 * @param {number} attackTotal - The attack roll total
 * @returns {boolean}
 */
export function shouldUseShield(target, attackTotal) {
  // Must have Shield spell known and reaction available
  if (!target.hasReaction) return false
  if (!target.spells?.includes('shield')) return false
  if (!target.currentSlots || target.currentSlots[1] <= 0) return false

  // Only use if +5 AC would cause the attack to miss
  const currentAC = target.shieldActive ? target.armorClass + 5 : target.armorClass
  const shieldAC = target.armorClass + 5

  return attackTotal >= currentAC && attackTotal < shieldAC
}

/**
 * Select bonus action to use
 * @param {object} combatant - The combatant
 * @param {object[]} allies - Allied combatants
 * @param {object[]} enemies - Enemy combatants
 * @returns {{ type: string, target?: object }|null}
 */
export function selectBonusAction(combatant, allies, enemies) {
  const livingEnemies = enemies.filter(e => !e.isDead && !e.isUnconscious)

  // Priority 1: Spiritual Weapon attack
  if (combatant.spiritualWeapon && livingEnemies.length > 0) {
    return {
      type: 'spiritualWeapon',
      target: livingEnemies[0]
    }
  }

  // Priority 2: Second Wind if hurt (below 50% HP)
  // v0.11: Check resource instead of secondWindUsed flag
  const hasSecondWindResource = hasResource(combatant, 'secondWind', 1)
  if ((combatant.hasSecondWind || hasSecondWindResource) && !combatant.secondWindUsed) {
    if (combatant.currentHp < combatant.maxHp * 0.5) {
      return { type: 'secondWind' }
    }
  }

  // Priority 3: Off-hand attack
  if (combatant.hasTwoWeaponFighting && livingEnemies.length > 0) {
    return {
      type: 'offHandAttack',
      target: livingEnemies[0]
    }
  }

  return null
}

/**
 * Tick down spiritual weapon duration
 * @param {object} combatant - The combatant with spiritual weapon
 */
export function tickSpiritualWeapon(combatant) {
  if (combatant.spiritualWeapon) {
    combatant.spiritualWeapon.turnsRemaining--
    if (combatant.spiritualWeapon.turnsRemaining <= 0) {
      combatant.spiritualWeapon = null
    }
  }
}
