/**
 * Spell definitions and utilities for D&D 5e spellcasting
 */

/**
 * All spell definitions
 */
export const SPELLS = {
  // === CANTRIPS (Level 0) ===
  'fire-bolt': {
    key: 'fire-bolt',
    name: 'Fire Bolt',
    level: 0,
    school: 'evocation',
    castingTime: 'action',
    concentration: false,
    targetType: 'single',
    range: 120,
    effectType: 'damage',
    damageType: 'fire',
    damageDice: '1d10',
    attackRoll: true,
    description: 'Ranged spell attack, 1d10 fire damage'
  },

  'sacred-flame': {
    key: 'sacred-flame',
    name: 'Sacred Flame',
    level: 0,
    school: 'evocation',
    castingTime: 'action',
    concentration: false,
    targetType: 'single',
    range: 60,
    effectType: 'damage',
    damageType: 'radiant',
    damageDice: '1d8',
    saveAbility: 'dexterity',
    saveEffect: 'none',
    description: 'DEX save or 1d8 radiant damage'
  },

  'toll-the-dead': {
    key: 'toll-the-dead',
    name: 'Toll the Dead',
    level: 0,
    school: 'necromancy',
    castingTime: 'action',
    concentration: false,
    targetType: 'single',
    range: 60,
    effectType: 'damage',
    damageType: 'necrotic',
    damageDice: '1d8',
    damageDiceIfHurt: '1d12', // 1d12 if target is missing HP
    saveAbility: 'wisdom',
    saveEffect: 'none',
    description: 'WIS save or 1d8 necrotic (1d12 if hurt)'
  },

  // === 1ST LEVEL ===
  'magic-missile': {
    key: 'magic-missile',
    name: 'Magic Missile',
    level: 1,
    school: 'evocation',
    castingTime: 'action',
    concentration: false,
    targetType: 'multi', // Can split between targets
    range: 120,
    effectType: 'damage',
    damageType: 'force',
    damageDice: '1d4+1',
    darts: 3, // Number of darts
    autoHit: true, // No attack roll needed
    upcastDarts: 1, // +1 dart per slot level above 1st
    description: '3 darts of 1d4+1 force, auto-hit'
  },

  'shield': {
    key: 'shield',
    name: 'Shield',
    level: 1,
    school: 'abjuration',
    castingTime: 'reaction',
    concentration: false,
    targetType: 'self',
    effectType: 'buff',
    acBonus: 5,
    duration: 1, // Until start of next turn
    trigger: 'hit', // Reaction trigger
    description: 'Reaction: +5 AC until next turn'
  },

  'healing-word': {
    key: 'healing-word',
    name: 'Healing Word',
    level: 1,
    school: 'evocation',
    castingTime: 'bonus',
    concentration: false,
    targetType: 'ally',
    range: 60,
    effectType: 'heal',
    healingDice: '1d4',
    upcastHealing: '1d4', // +1d4 per slot level above 1st
    description: 'Bonus action: heal 1d4+mod'
  },

  'bless': {
    key: 'bless',
    name: 'Bless',
    level: 1,
    school: 'enchantment',
    castingTime: 'action',
    concentration: true,
    targetType: 'allies',
    maxTargets: 3,
    range: 30,
    effectType: 'buff',
    bonusDice: '1d4', // Add to attacks and saves
    duration: 10, // 10 rounds (1 minute)
    upcastTargets: 1, // +1 target per slot level above 1st
    description: 'Concentration: 3 allies +1d4 to attacks/saves'
  },

  'cure-wounds': {
    key: 'cure-wounds',
    name: 'Cure Wounds',
    level: 1,
    school: 'evocation',
    castingTime: 'action',
    concentration: false,
    targetType: 'ally',
    range: 'touch',
    effectType: 'heal',
    healingDice: '1d8',
    upcastHealing: '1d8',
    description: 'Touch: heal 1d8+mod'
  },

  // === 2ND LEVEL ===
  'scorching-ray': {
    key: 'scorching-ray',
    name: 'Scorching Ray',
    level: 2,
    school: 'evocation',
    castingTime: 'action',
    concentration: false,
    targetType: 'multi',
    range: 120,
    effectType: 'damage',
    damageType: 'fire',
    damageDice: '2d6',
    rays: 3,
    attackRoll: true,
    upcastRays: 1, // +1 ray per slot level above 2nd
    description: '3 rays, each 2d6 fire (ranged spell attack)'
  },

  'hold-person': {
    key: 'hold-person',
    name: 'Hold Person',
    level: 2,
    school: 'enchantment',
    castingTime: 'action',
    concentration: true,
    targetType: 'single',
    targetRestriction: 'humanoid',
    range: 60,
    effectType: 'control',
    condition: 'paralyzed',
    saveAbility: 'wisdom',
    saveEndOfTurn: true,
    duration: 10,
    upcastTargets: 1,
    description: 'Concentration: paralyze humanoid (WIS save)'
  },

  'spiritual-weapon': {
    key: 'spiritual-weapon',
    name: 'Spiritual Weapon',
    level: 2,
    school: 'evocation',
    castingTime: 'bonus',
    concentration: false,
    targetType: 'single',
    range: 60,
    effectType: 'summon',
    damageDice: '1d8',
    attackRoll: true,
    duration: 10,
    upcastDamage: '1d8', // +1d8 per 2 slot levels above 2nd
    description: 'Bonus action: 1d8+mod force attack each turn'
  },

  // === 3RD LEVEL ===
  'fireball': {
    key: 'fireball',
    name: 'Fireball',
    level: 3,
    school: 'evocation',
    castingTime: 'action',
    concentration: false,
    targetType: 'area',
    range: 150,
    areaRadius: 20,
    aoeShape: 'sphere', // Hits chosen position group (front or back)
    friendlyFire: true, // Hits allies at same position!
    effectType: 'damage',
    damageType: 'fire',
    damageDice: '8d6',
    saveAbility: 'dexterity',
    saveEffect: 'half',
    upcastDamage: '1d6',
    description: '8d6 fire in 20ft radius, DEX save for half (friendly fire!)'
  },

  'counterspell': {
    key: 'counterspell',
    name: 'Counterspell',
    level: 3,
    school: 'abjuration',
    castingTime: 'reaction',
    concentration: false,
    targetType: 'spell',
    range: 60,
    effectType: 'counter',
    trigger: 'spell',
    autoSuccessLevel: 3, // Auto-counters spells of this level or lower
    description: 'Reaction: counter spell level 3 or lower'
  },

  'haste': {
    key: 'haste',
    name: 'Haste',
    level: 3,
    school: 'transmutation',
    castingTime: 'action',
    concentration: true,
    targetType: 'ally',
    range: 30,
    effectType: 'buff',
    acBonus: 2,
    extraAttack: true,
    duration: 10,
    description: 'Concentration: +2 AC, extra attack'
  }
}

/**
 * Get a spell by key
 * @param {string} key - Spell key
 * @returns {object|null}
 */
export function getSpell(key) {
  return SPELLS[key] || null
}

/**
 * Get cantrip damage dice based on character level
 * Cantrips scale at levels 5, 11, 17
 * @param {string} baseDice - Base damage dice (e.g., '1d10')
 * @param {number} level - Character level
 * @returns {string}
 */
export function getCantripDamage(baseDice, level = 1) {
  const match = baseDice.match(/^(\d+)d(\d+)(.*)$/)
  if (!match) return baseDice

  const sides = match[2]
  const modifier = match[3] || ''

  let diceCount = 1
  if (level >= 17) diceCount = 4
  else if (level >= 11) diceCount = 3
  else if (level >= 5) diceCount = 2

  return `${diceCount}d${sides}${modifier}`
}

/**
 * Calculate spell damage with upcasting
 * @param {object} spell - Spell definition
 * @param {number} slotLevel - Slot level used
 * @returns {string} - Damage dice string
 */
export function getSpellDamage(spell, slotLevel) {
  if (spell.level === 0) return spell.damageDice // Cantrips don't upcast

  let baseDice = spell.damageDice
  if (!spell.upcastDamage || slotLevel <= spell.level) {
    return baseDice
  }

  // Parse upcast bonus
  const levelsAbove = slotLevel - spell.level
  const upcastMatch = spell.upcastDamage.match(/^(\d+)d(\d+)$/)
  if (!upcastMatch) return baseDice

  const upcastCount = parseInt(upcastMatch[1]) * levelsAbove
  const upcastSides = upcastMatch[2]

  // Parse base dice
  const baseMatch = baseDice.match(/^(\d+)d(\d+)(.*)$/)
  if (!baseMatch) return baseDice

  const baseCount = parseInt(baseMatch[1])
  const baseSides = baseMatch[2]
  const modifier = baseMatch[3] || ''

  // Combine (assuming same die size for simplicity)
  if (baseSides === upcastSides) {
    return `${baseCount + upcastCount}d${baseSides}${modifier}`
  }

  // Different die sizes - return as separate
  return `${baseDice} + ${upcastCount}d${upcastSides}`
}

/**
 * Get number of projectiles (darts, rays) with upcasting
 * @param {object} spell - Spell definition
 * @param {number} slotLevel - Slot level used
 * @returns {number}
 */
export function getSpellProjectiles(spell, slotLevel) {
  const base = spell.darts || spell.rays || 1
  if (spell.level === 0 || slotLevel <= spell.level) {
    return base
  }

  const levelsAbove = slotLevel - spell.level
  const extraPerLevel = spell.upcastDarts || spell.upcastRays || 0

  return base + (extraPerLevel * levelsAbove)
}

/**
 * Get healing with upcasting
 * @param {object} spell - Spell definition
 * @param {number} slotLevel - Slot level used
 * @param {number} spellMod - Spellcasting modifier
 * @returns {string}
 */
export function getSpellHealing(spell, slotLevel, spellMod = 0) {
  let baseDice = spell.healingDice

  if (spell.upcastHealing && slotLevel > spell.level) {
    const levelsAbove = slotLevel - spell.level
    const upcastMatch = spell.upcastHealing.match(/^(\d+)d(\d+)$/)
    const baseMatch = baseDice.match(/^(\d+)d(\d+)$/)

    if (upcastMatch && baseMatch) {
      const totalDice = parseInt(baseMatch[1]) + (parseInt(upcastMatch[1]) * levelsAbove)
      baseDice = `${totalDice}d${baseMatch[2]}`
    }
  }

  return spellMod > 0 ? `${baseDice}+${spellMod}` : baseDice
}

/**
 * Check if caster has a spell slot available
 * @param {object} caster - Combatant with currentSlots
 * @param {number} level - Slot level needed
 * @returns {boolean}
 */
export function hasSpellSlot(caster, level) {
  if (!caster.currentSlots) return false
  return (caster.currentSlots[level] || 0) > 0
}

/**
 * Find the lowest available slot at or above a level
 * @param {object} caster - Combatant with currentSlots
 * @param {number} minLevel - Minimum slot level
 * @returns {number|null} - Slot level or null if none available
 */
export function findAvailableSlot(caster, minLevel) {
  if (!caster.currentSlots) return null

  for (let level = minLevel; level <= 9; level++) {
    if ((caster.currentSlots[level] || 0) > 0) {
      return level
    }
  }
  return null
}

/**
 * Consume a spell slot
 * @param {object} caster - Combatant with currentSlots
 * @param {number} level - Slot level to consume
 * @returns {boolean} - Whether slot was consumed
 */
export function consumeSpellSlot(caster, level) {
  if (!hasSpellSlot(caster, level)) return false
  caster.currentSlots[level]--
  return true
}

/**
 * Get all spells a caster knows
 * @param {object} caster - Combatant
 * @returns {object[]} - Array of spell definitions
 */
export function getKnownSpells(caster) {
  const spells = []

  if (caster.cantrips) {
    caster.cantrips.forEach(key => {
      const spell = getSpell(key)
      if (spell) spells.push(spell)
    })
  }

  if (caster.spells) {
    caster.spells.forEach(key => {
      const spell = getSpell(key)
      if (spell) spells.push(spell)
    })
  }

  return spells
}
