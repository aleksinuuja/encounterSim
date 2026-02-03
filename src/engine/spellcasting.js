/**
 * Spellcasting system for D&D 5e combat
 */

import { rollD20, rollDice } from './dice.js'
import {
  getSpell,
  getSpellDamage,
  getSpellHealing,
  getSpellProjectiles,
  getCantripDamage,
  hasSpellSlot,
  findAvailableSlot,
  getKnownSpells
} from './spells.js'
import { applyCondition } from './conditions.js'
import { selectAOETargets } from './positioning.js'

/**
 * Check if a caster can cast a specific spell
 * @param {object} caster - The caster
 * @param {string} spellKey - Spell to cast
 * @param {number} slotLevel - Slot level to use (0 for cantrip)
 * @returns {{ canCast: boolean, reason?: string }}
 */
export function canCastSpell(caster, spellKey, slotLevel = null) {
  const spell = getSpell(spellKey)
  if (!spell) {
    return { canCast: false, reason: 'Unknown spell' }
  }

  // Check if caster knows the spell
  const known = [...(caster.cantrips || []), ...(caster.spells || [])]
  if (!known.includes(spellKey)) {
    return { canCast: false, reason: 'Spell not known' }
  }

  // Cantrips don't need slots
  if (spell.level === 0) {
    return { canCast: true }
  }

  // Check slot availability
  const useLevel = slotLevel || spell.level
  if (useLevel < spell.level) {
    return { canCast: false, reason: 'Slot level too low' }
  }

  if (!hasSpellSlot(caster, useLevel)) {
    return { canCast: false, reason: 'No spell slots available' }
  }

  // Check concentration
  if (spell.concentration && caster.concentratingOn) {
    // Can cast, but will break current concentration
  }

  return { canCast: true }
}

/**
 * Cast a damage spell against a target
 * @param {object} caster - The caster
 * @param {object} spell - Spell definition
 * @param {object} target - Target combatant
 * @param {number} slotLevel - Slot level used
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @returns {object} - Log entry for this cast
 */
export function castDamageSpell(caster, spell, target, slotLevel, round, turn) {
  const logEntry = {
    round,
    turn,
    actorName: caster.name,
    targetName: target.name,
    actionType: 'spell',
    spellName: spell.name,
    spellLevel: spell.level,
    slotUsed: slotLevel,
    hit: false
  }

  // Get damage dice (with upcasting and cantrip scaling)
  let damageDice = spell.level === 0
    ? getCantripDamage(spell.damageDice, caster.level || 1)
    : getSpellDamage(spell, slotLevel)

  // Toll the Dead: use d12 if target is hurt
  if (spell.key === 'toll-the-dead' && target.currentHp < target.maxHp) {
    damageDice = spell.level === 0
      ? getCantripDamage(spell.damageDiceIfHurt, caster.level || 1)
      : spell.damageDiceIfHurt
  }

  logEntry.damageDice = damageDice

  // Spell attack roll
  if (spell.attackRoll) {
    const attackRoll = rollD20()
    const totalAttack = attackRoll + (caster.spellAttackBonus || 0)
    logEntry.attackRoll = attackRoll
    logEntry.totalAttack = totalAttack
    logEntry.targetAC = target.armorClass

    if (attackRoll === 1) {
      logEntry.hit = false
      return logEntry
    }

    const isCritical = attackRoll === 20
    const hit = isCritical || totalAttack >= target.armorClass

    if (!hit) {
      logEntry.hit = false
      return logEntry
    }

    logEntry.hit = true
    logEntry.isCritical = isCritical

    const { total: damage } = rollDice(damageDice)
    const finalDamage = isCritical ? damage * 2 : damage // Simplified crit

    logEntry.damageRoll = finalDamage
    logEntry.targetHpBefore = target.currentHp
    target.currentHp = Math.max(0, target.currentHp - finalDamage)
    logEntry.targetHpAfter = target.currentHp
  }
  // Saving throw spell
  else if (spell.saveAbility) {
    const saveRoll = rollD20()
    const saveBonus = target[spell.saveAbility + 'Save'] || 0
    const saveTotal = saveRoll + saveBonus
    const dc = caster.spellSaveDC || 13

    logEntry.saveRoll = saveRoll
    logEntry.saveTotal = saveTotal
    logEntry.saveDC = dc
    logEntry.saveAbility = spell.saveAbility

    const saved = saveTotal >= dc
    logEntry.savePassed = saved

    if (saved && spell.saveEffect === 'none') {
      // No damage on save
      logEntry.damageRoll = 0
      return logEntry
    }

    const { total: damage } = rollDice(damageDice)
    const finalDamage = saved && spell.saveEffect === 'half'
      ? Math.floor(damage / 2)
      : damage

    logEntry.damageRoll = finalDamage
    logEntry.targetHpBefore = target.currentHp
    target.currentHp = Math.max(0, target.currentHp - finalDamage)
    logEntry.targetHpAfter = target.currentHp
    logEntry.hit = true
  }
  // Auto-hit (Magic Missile)
  else if (spell.autoHit) {
    logEntry.hit = true
    const numProjectiles = getSpellProjectiles(spell, slotLevel)
    let totalDamage = 0

    for (let i = 0; i < numProjectiles; i++) {
      const { total } = rollDice(damageDice)
      totalDamage += total
    }

    logEntry.damageRoll = totalDamage
    logEntry.projectiles = numProjectiles
    logEntry.targetHpBefore = target.currentHp
    target.currentHp = Math.max(0, target.currentHp - totalDamage)
    logEntry.targetHpAfter = target.currentHp
  }

  // Check if target dropped
  if (target.currentHp <= 0) {
    if (target.isPlayer) {
      target.isUnconscious = true
      logEntry.targetDowned = true
    } else {
      target.isDead = true
      logEntry.targetDied = true
    }
  }

  return logEntry
}

/**
 * Cast a healing spell on a target
 * @param {object} caster - The caster
 * @param {object} spell - Spell definition
 * @param {object} target - Target ally
 * @param {number} slotLevel - Slot level used
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @returns {object} - Log entry
 */
export function castHealingSpell(caster, spell, target, slotLevel, round, turn) {
  const spellMod = caster.spellcastingMod || 0
  const healingDice = getSpellHealing(spell, slotLevel, spellMod)

  const { total: healAmount } = rollDice(healingDice)
  const wasUnconscious = target.isUnconscious

  const hpBefore = target.currentHp
  target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount)

  // Wake up if unconscious
  if (wasUnconscious) {
    target.isUnconscious = false
    target.isStabilized = false
    target.deathSaveSuccesses = 0
    target.deathSaveFailures = 0
  }

  return {
    round,
    turn,
    actorName: caster.name,
    targetName: target.name,
    actionType: 'spell',
    spellName: spell.name,
    spellLevel: spell.level,
    slotUsed: slotLevel,
    effectType: 'heal',
    healRoll: healAmount,
    targetHpBefore: hpBefore,
    targetHpAfter: target.currentHp,
    revivedFromUnconscious: wasUnconscious
  }
}

/**
 * Cast a control/debuff spell
 * @param {object} caster - The caster
 * @param {object} spell - Spell definition
 * @param {object} target - Target combatant
 * @param {number} slotLevel - Slot level used
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @returns {object} - Log entry
 */
export function castControlSpell(caster, spell, target, slotLevel, round, turn) {
  const logEntry = {
    round,
    turn,
    actorName: caster.name,
    targetName: target.name,
    actionType: 'spell',
    spellName: spell.name,
    spellLevel: spell.level,
    slotUsed: slotLevel,
    effectType: 'control'
  }

  // Saving throw
  if (spell.saveAbility) {
    const saveRoll = rollD20()
    const saveBonus = target[spell.saveAbility + 'Save'] || 0
    const saveTotal = saveRoll + saveBonus
    const dc = caster.spellSaveDC || 13

    logEntry.saveRoll = saveRoll
    logEntry.saveTotal = saveTotal
    logEntry.saveDC = dc
    logEntry.saveAbility = spell.saveAbility
    logEntry.savePassed = saveTotal >= dc

    if (saveTotal >= dc) {
      logEntry.resisted = true
      return logEntry
    }
  }

  // Apply condition
  if (spell.condition) {
    const result = applyCondition(target, {
      type: spell.condition,
      duration: spell.duration,
      source: caster.name,
      saveEndOfTurn: spell.saveEndOfTurn ? {
        ability: spell.saveAbility,
        dc: caster.spellSaveDC || 13
      } : null
    })

    logEntry.conditionApplied = result === 'applied' ? spell.condition : null
    logEntry.conditionImmune = result === 'immune' ? spell.condition : null

    // Set up concentration
    if (spell.concentration) {
      if (caster.concentratingOn) {
        logEntry.brokeConcentration = caster.concentratingOn
      }
      caster.concentratingOn = spell.key
      logEntry.concentrating = spell.name
    }
  }

  return logEntry
}

/**
 * Cast an area damage spell
 * @param {object} caster - The caster
 * @param {object} spell - Spell definition
 * @param {object[]} targets - All targets in area
 * @param {number} slotLevel - Slot level used
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @param {string} targetPosition - Position group targeted ('front' or 'back')
 * @returns {object[]} - Array of log entries
 */
export function castAreaSpell(caster, spell, targets, slotLevel, round, turn, targetPosition = null) {
  const logs = []
  const damageDice = getSpellDamage(spell, slotLevel)
  const { total: baseDamage } = rollDice(damageDice)
  const dc = caster.spellSaveDC || 13

  // Count allies and enemies for main log
  const enemies = targets.filter(t => t.isPlayer !== caster.isPlayer)
  const allies = targets.filter(t => t.isPlayer === caster.isPlayer)

  // Main log entry for the spell cast
  const mainLog = {
    round,
    turn,
    actorName: caster.name,
    actionType: 'spell',
    spellName: spell.name,
    spellLevel: spell.level,
    slotUsed: slotLevel,
    effectType: 'area',
    targetsHit: targets.length,
    enemiesHit: enemies.length,
    alliesHit: allies.length,
    baseDamage
  }

  // Add position info if available
  if (targetPosition) {
    mainLog.targetPosition = targetPosition
  }

  // Mark if this involved friendly fire
  if (allies.length > 0) {
    mainLog.friendlyFire = true
  }

  logs.push(mainLog)

  // Individual target effects
  for (const target of targets) {
    const saveRoll = rollD20()
    const saveBonus = target[spell.saveAbility + 'Save'] || 0
    const saveTotal = saveRoll + saveBonus
    const saved = saveTotal >= dc

    const damage = saved && spell.saveEffect === 'half'
      ? Math.floor(baseDamage / 2)
      : saved && spell.saveEffect === 'none'
        ? 0
        : baseDamage

    const hpBefore = target.currentHp
    target.currentHp = Math.max(0, target.currentHp - damage)

    // Check if this is an ally (friendly fire)
    const isAlly = target.isPlayer === caster.isPlayer

    const targetLog = {
      round,
      turn,
      actorName: caster.name,
      targetName: target.name,
      actionType: 'spellEffect',
      spellName: spell.name,
      saveRoll,
      saveTotal,
      saveDC: dc,
      saveAbility: spell.saveAbility,
      savePassed: saved,
      damageRoll: damage,
      targetHpBefore: hpBefore,
      targetHpAfter: target.currentHp,
      isAlly // Mark friendly fire victims
    }

    if (target.currentHp <= 0) {
      if (target.isPlayer) {
        target.isUnconscious = true
        targetLog.targetDowned = true
      } else {
        target.isDead = true
        targetLog.targetDied = true
      }
    }

    logs.push(targetLog)
  }

  return logs
}

/**
 * Check concentration when taking damage
 * @param {object} caster - The caster with concentratingOn
 * @param {number} damage - Damage taken
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @returns {object|null} - Log entry if concentration check happened
 */
export function checkConcentration(caster, damage, round, turn) {
  if (!caster.concentratingOn) return null

  const dc = Math.max(10, Math.floor(damage / 2))
  const saveRoll = rollD20()
  const saveBonus = caster.constitutionSave || 0
  const saveTotal = saveRoll + saveBonus
  const maintained = saveTotal >= dc

  const logEntry = {
    round,
    turn,
    actorName: caster.name,
    actionType: 'concentrationCheck',
    spellName: caster.concentratingOn,
    damage,
    saveDC: dc,
    saveRoll,
    saveTotal,
    maintained
  }

  if (!maintained) {
    logEntry.lostConcentration = caster.concentratingOn
    caster.concentratingOn = null
  }

  return logEntry
}

/**
 * Break concentration (e.g., when casting another concentration spell)
 * @param {object} caster - The caster
 */
export function breakConcentration(caster) {
  if (caster.concentratingOn) {
    const broken = caster.concentratingOn
    caster.concentratingOn = null
    return broken
  }
  return null
}

/**
 * Simple AI to select a spell to cast
 * @param {object} caster - The caster
 * @param {object[]} allies - Allied combatants
 * @param {object[]} enemies - Enemy combatants
 * @returns {{ spell: object, slotLevel: number, target: object|object[] }|null}
 */
export function selectSpellToCast(caster, allies, enemies) {
  const knownSpells = getKnownSpells(caster)
  if (knownSpells.length === 0) return null

  const livingEnemies = enemies.filter(e => !e.isDead && !e.isUnconscious)
  const unconsciousAllies = allies.filter(a => a.isUnconscious && !a.isDead)

  // Priority 1: Heal unconscious ally with bonus action spell
  if (unconsciousAllies.length > 0) {
    const healingWord = knownSpells.find(s => s.key === 'healing-word')
    if (healingWord) {
      const slot = findAvailableSlot(caster, 1)
      if (slot) {
        return {
          spell: healingWord,
          slotLevel: slot,
          target: unconsciousAllies[0],
          isBonusAction: true
        }
      }
    }
  }

  // Priority 2: Fireball if 2+ enemies in same position
  const fireball = knownSpells.find(s => s.key === 'fireball')
  if (fireball) {
    const slot = findAvailableSlot(caster, 3)
    if (slot) {
      // Use position-aware targeting - combine allies and enemies for full combatants list
      const allCombatants = [...allies, ...enemies]
      const aoeResult = selectAOETargets(fireball, allCombatants, caster.isPlayer)
      if (aoeResult.shouldCast && aoeResult.targets.length >= 2) {
        return {
          spell: fireball,
          slotLevel: slot,
          target: aoeResult.targets,
          targetPosition: aoeResult.position
        }
      }
    }
  }

  // Priority 3: Hold Person on a tough enemy
  if (!caster.concentratingOn) {
    const holdPerson = knownSpells.find(s => s.key === 'hold-person')
    if (holdPerson && livingEnemies.length > 0) {
      const slot = findAvailableSlot(caster, 2)
      // Target highest HP enemy
      const target = [...livingEnemies].sort((a, b) => b.currentHp - a.currentHp)[0]
      if (slot && target) {
        return {
          spell: holdPerson,
          slotLevel: slot,
          target
        }
      }
    }
  }

  // Priority 4: Magic Missile for guaranteed damage
  const magicMissile = knownSpells.find(s => s.key === 'magic-missile')
  if (magicMissile && livingEnemies.length > 0) {
    const slot = findAvailableSlot(caster, 1)
    if (slot) {
      return {
        spell: magicMissile,
        slotLevel: slot,
        target: livingEnemies[0] // Lowest HP enemy
      }
    }
  }

  // Priority 5: Cantrip
  const cantrips = knownSpells.filter(s => s.level === 0 && s.effectType === 'damage')
  if (cantrips.length > 0 && livingEnemies.length > 0) {
    return {
      spell: cantrips[0],
      slotLevel: 0,
      target: livingEnemies[0]
    }
  }

  return null
}
