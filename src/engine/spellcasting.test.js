/**
 * Tests for the spellcasting system
 */

import { describe, it, expect } from 'vitest'
import {
  canCastSpell,
  castDamageSpell,
  castHealingSpell,
  checkConcentration,
  selectSpellToCast
} from './spellcasting.js'
import {
  getSpell,
  getCantripDamage,
  getSpellDamage,
  getSpellProjectiles,
  hasSpellSlot,
  consumeSpellSlot
} from './spells.js'

// Helper to create a basic caster
function createWizard(overrides = {}) {
  return {
    name: 'Wizard',
    maxHp: 30,
    currentHp: 30,
    armorClass: 12,
    level: 5,
    spellcastingAbility: 'intelligence',
    spellcastingMod: 4,
    spellSaveDC: 14,
    spellAttackBonus: 6,
    constitutionSave: 2,
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    currentSlots: { 1: 4, 2: 3, 3: 2 },
    cantrips: ['fire-bolt', 'toll-the-dead'],
    spells: ['magic-missile', 'fireball', 'hold-person'],
    concentratingOn: null,
    ...overrides
  }
}

function createCleric(overrides = {}) {
  return {
    name: 'Cleric',
    maxHp: 38,
    currentHp: 38,
    armorClass: 18,
    level: 5,
    spellcastingAbility: 'wisdom',
    spellcastingMod: 4,
    spellSaveDC: 14,
    spellAttackBonus: 6,
    constitutionSave: 3,
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    currentSlots: { 1: 4, 2: 3, 3: 2 },
    cantrips: ['sacred-flame'],
    spells: ['healing-word', 'cure-wounds', 'hold-person'],
    concentratingOn: null,
    ...overrides
  }
}

function createTarget(overrides = {}) {
  return {
    name: 'Target',
    maxHp: 50,
    currentHp: 50,
    armorClass: 15,
    wisdomSave: 2,
    dexteritySave: 3,
    constitutionSave: 2,
    isPlayer: false,
    isDead: false,
    isUnconscious: false,
    ...overrides
  }
}

describe('spell utilities', () => {
  it('getSpell returns correct spell data', () => {
    const fireBolt = getSpell('fire-bolt')
    expect(fireBolt).toBeTruthy()
    expect(fireBolt.name).toBe('Fire Bolt')
    expect(fireBolt.level).toBe(0)
    expect(fireBolt.damageDice).toBe('1d10')
  })

  it('getCantripDamage scales with level', () => {
    expect(getCantripDamage('1d10', 1)).toBe('1d10')
    expect(getCantripDamage('1d10', 4)).toBe('1d10')
    expect(getCantripDamage('1d10', 5)).toBe('2d10')
    expect(getCantripDamage('1d10', 10)).toBe('2d10')
    expect(getCantripDamage('1d10', 11)).toBe('3d10')
    expect(getCantripDamage('1d10', 17)).toBe('4d10')
  })

  it('getSpellDamage handles upcasting', () => {
    const fireball = getSpell('fireball')
    expect(getSpellDamage(fireball, 3)).toBe('8d6')
    expect(getSpellDamage(fireball, 4)).toBe('9d6')
    expect(getSpellDamage(fireball, 5)).toBe('10d6')
  })

  it('getSpellProjectiles handles magic missile upcasting', () => {
    const magicMissile = getSpell('magic-missile')
    expect(getSpellProjectiles(magicMissile, 1)).toBe(3)
    expect(getSpellProjectiles(magicMissile, 2)).toBe(4)
    expect(getSpellProjectiles(magicMissile, 3)).toBe(5)
  })

  it('hasSpellSlot and consumeSpellSlot work correctly', () => {
    const wizard = createWizard()
    expect(hasSpellSlot(wizard, 1)).toBe(true)
    expect(hasSpellSlot(wizard, 3)).toBe(true)
    expect(hasSpellSlot(wizard, 4)).toBe(false)

    consumeSpellSlot(wizard, 1)
    expect(wizard.currentSlots[1]).toBe(3)

    // Consume all 1st level slots
    consumeSpellSlot(wizard, 1)
    consumeSpellSlot(wizard, 1)
    consumeSpellSlot(wizard, 1)
    expect(hasSpellSlot(wizard, 1)).toBe(false)
  })
})

describe('canCastSpell', () => {
  it('returns true for known cantrips', () => {
    const wizard = createWizard()
    const result = canCastSpell(wizard, 'fire-bolt', 0)
    expect(result.canCast).toBe(true)
  })

  it('returns false for unknown spells', () => {
    const wizard = createWizard()
    const result = canCastSpell(wizard, 'healing-word', 1)
    expect(result.canCast).toBe(false)
    expect(result.reason).toBe('Spell not known')
  })

  it('returns true when spell slot is available', () => {
    const wizard = createWizard()
    const result = canCastSpell(wizard, 'fireball', 3)
    expect(result.canCast).toBe(true)
  })

  it('returns false when no spell slots available', () => {
    const wizard = createWizard({ currentSlots: { 1: 0, 2: 0, 3: 0 } })
    const result = canCastSpell(wizard, 'fireball', 3)
    expect(result.canCast).toBe(false)
    expect(result.reason).toBe('No spell slots available')
  })

  it('returns false when slot level too low', () => {
    const wizard = createWizard()
    const result = canCastSpell(wizard, 'fireball', 2)
    expect(result.canCast).toBe(false)
    expect(result.reason).toBe('Slot level too low')
  })
})

describe('castDamageSpell', () => {
  it('casts spell attack cantrips', () => {
    const wizard = createWizard()
    const target = createTarget()
    const spell = getSpell('fire-bolt')

    // Run multiple times to get a hit
    let hitCount = 0
    for (let i = 0; i < 50; i++) {
      const result = castDamageSpell(wizard, spell, { ...target }, 0, 1, 1)
      if (result.hit) hitCount++
    }

    // Should hit at least sometimes (high attack bonus vs AC 15)
    expect(hitCount).toBeGreaterThan(0)
  })

  it('casts saving throw cantrips', () => {
    const wizard = createWizard()
    const target = createTarget({ wisdomSave: -5 }) // Easy to fail
    const spell = getSpell('toll-the-dead')

    // Run multiple times to get damage
    let damageDealt = 0
    for (let i = 0; i < 20; i++) {
      const result = castDamageSpell(wizard, spell, { ...target, currentHp: 50 }, 0, 1, 1)
      if (result.damageRoll) damageDealt += result.damageRoll
    }

    expect(damageDealt).toBeGreaterThan(0)
  })

  it('magic missile auto-hits', () => {
    const wizard = createWizard()
    const target = createTarget()
    const spell = getSpell('magic-missile')

    const result = castDamageSpell(wizard, spell, target, 1, 1, 1)
    expect(result.hit).toBe(true)
    expect(result.projectiles).toBe(3) // 3 darts at 1st level
    expect(result.damageRoll).toBeGreaterThan(0)
  })
})

describe('castHealingSpell', () => {
  it('heals a target', () => {
    const cleric = createCleric()
    const target = createTarget({ currentHp: 20, maxHp: 50, isPlayer: true })
    const spell = getSpell('healing-word')

    const result = castHealingSpell(cleric, spell, target, 1, 1, 1)

    expect(result.effectType).toBe('heal')
    expect(result.healRoll).toBeGreaterThan(0)
    expect(result.targetHpAfter).toBeGreaterThan(20)
  })

  it('wakes up unconscious targets', () => {
    const cleric = createCleric()
    const target = createTarget({
      currentHp: 0,
      maxHp: 50,
      isPlayer: true,
      isUnconscious: true,
      deathSaveSuccesses: 2,
      deathSaveFailures: 1
    })
    const spell = getSpell('healing-word')

    const result = castHealingSpell(cleric, spell, target, 1, 1, 1)

    expect(result.revivedFromUnconscious).toBe(true)
    expect(target.isUnconscious).toBe(false)
    expect(target.deathSaveSuccesses).toBe(0)
    expect(target.deathSaveFailures).toBe(0)
  })
})

describe('concentration', () => {
  it('checkConcentration succeeds with low damage', () => {
    const wizard = createWizard({
      concentratingOn: 'hold-person',
      constitutionSave: 10 // Very high save
    })

    // With DC 10 and +10 save, should always maintain
    let maintainedCount = 0
    for (let i = 0; i < 20; i++) {
      const caster = { ...wizard }
      const result = checkConcentration(caster, 5, 1, 1)
      if (result.maintained) maintainedCount++
    }

    expect(maintainedCount).toBe(20) // Should always maintain
  })

  it('checkConcentration can fail with high damage', () => {
    const wizard = createWizard({
      concentratingOn: 'hold-person',
      constitutionSave: -5 // Very low save
    })

    // With 40 damage, DC is 20. With -5 save, needs nat 25 (impossible)
    // So should always fail
    let lostCount = 0
    for (let i = 0; i < 10; i++) {
      const caster = { ...wizard }
      const result = checkConcentration(caster, 40, 1, 1)
      if (!result.maintained) {
        lostCount++
        expect(caster.concentratingOn).toBe(null)
      }
    }

    expect(lostCount).toBe(10)
  })

  it('checkConcentration returns null if not concentrating', () => {
    const wizard = createWizard({ concentratingOn: null })
    const result = checkConcentration(wizard, 10, 1, 1)
    expect(result).toBe(null)
  })
})

describe('selectSpellToCast', () => {
  it('prioritizes healing unconscious allies', () => {
    const cleric = createCleric()
    const ally = createTarget({ isPlayer: true, isUnconscious: true, isDead: false })
    const enemy = createTarget({ isPlayer: false, isDead: false })

    const result = selectSpellToCast(cleric, [cleric, ally], [enemy])

    expect(result).toBeTruthy()
    expect(result.spell.key).toBe('healing-word')
    expect(result.isBonusAction).toBe(true)
  })

  it('casts Fireball against multiple enemies', () => {
    const wizard = createWizard()
    const enemies = [
      createTarget({ name: 'Enemy 1', isPlayer: false, isDead: false }),
      createTarget({ name: 'Enemy 2', isPlayer: false, isDead: false })
    ]

    const result = selectSpellToCast(wizard, [wizard], enemies)

    expect(result).toBeTruthy()
    expect(result.spell.key).toBe('fireball')
  })

  it('falls back to cantrip when out of slots', () => {
    const wizard = createWizard({ currentSlots: { 1: 0, 2: 0, 3: 0 } })
    const enemies = [createTarget({ isPlayer: false, isDead: false })]

    const result = selectSpellToCast(wizard, [wizard], enemies)

    expect(result).toBeTruthy()
    expect(result.spell.level).toBe(0)
    expect(result.slotLevel).toBe(0)
  })

  it('returns null for non-casters', () => {
    const fighter = { name: 'Fighter' } // No spells or cantrips
    const enemies = [createTarget({ isPlayer: false, isDead: false })]

    const result = selectSpellToCast(fighter, [fighter], enemies)

    expect(result).toBe(null)
  })
})
