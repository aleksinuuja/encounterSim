/**
 * Tests for the action economy system
 */

import { describe, it, expect } from 'vitest'
import {
  executeOffHandAttack,
  executeSecondWind,
  executeSpiritualWeaponAttack,
  executeOpportunityAttack,
  selectBonusAction,
  shouldUseShield,
  applyShieldReaction
} from './actions.js'

function createFighter(overrides = {}) {
  return {
    name: 'Fighter',
    maxHp: 44,
    currentHp: 44,
    armorClass: 18,
    attackBonus: 7,
    damage: '1d8+4',
    level: 5,
    hasSecondWind: true,
    secondWindUsed: false,
    hasTwoWeaponFighting: true,
    offHandDamage: '1d6',
    hasReaction: true,
    ...overrides
  }
}

function createWizard(overrides = {}) {
  return {
    name: 'Wizard',
    maxHp: 30,
    currentHp: 30,
    armorClass: 12,
    attackBonus: 3,
    damage: '1d4',
    level: 5,
    hasReaction: true,
    spells: ['shield', 'fireball'],
    currentSlots: { 1: 4, 2: 3, 3: 2 },
    shieldActive: false,
    ...overrides
  }
}

function createTarget(overrides = {}) {
  return {
    name: 'Target',
    maxHp: 50,
    currentHp: 50,
    armorClass: 15,
    isPlayer: false,
    isDead: false,
    isUnconscious: false,
    ...overrides
  }
}

describe('off-hand attack', () => {
  it('executes bonus action attack', () => {
    const fighter = createFighter()
    const target = createTarget()

    const result = executeOffHandAttack(fighter, target, 1, 1)

    expect(result.actionType).toBe('bonusAction')
    expect(result.bonusActionType).toBe('offHandAttack')
    expect(result.attackRoll).toBeGreaterThanOrEqual(1)
    expect(result.attackRoll).toBeLessThanOrEqual(20)
  })

  it('can hit and deal damage', () => {
    const fighter = createFighter()

    let hitCount = 0
    for (let i = 0; i < 50; i++) {
      const target = createTarget({ armorClass: 10 }) // Easy to hit
      const result = executeOffHandAttack(fighter, target, 1, 1)
      if (result.hit) {
        hitCount++
        expect(result.damageRoll).toBeGreaterThan(0)
        expect(result.targetHpAfter).toBeLessThan(50)
      }
    }

    expect(hitCount).toBeGreaterThan(0)
  })

  it('natural 1 always misses', () => {
    const fighter = createFighter()

    // Run many times, any nat 1 should miss
    let foundNat1 = false
    for (let i = 0; i < 100; i++) {
      const target = createTarget({ armorClass: 1 }) // Easy to hit normally
      const result = executeOffHandAttack(fighter, target, 1, 1)
      if (result.attackRoll === 1) {
        foundNat1 = true
        expect(result.hit).toBe(false)
      }
    }
    // Might not find nat 1 in 100 tries, so just check if we did find one
    if (foundNat1) {
      expect(foundNat1).toBe(true)
    }
  })
})

describe('second wind', () => {
  it('heals the fighter', () => {
    const fighter = createFighter({ currentHp: 20 })

    const result = executeSecondWind(fighter, 1, 1)

    expect(result.actionType).toBe('bonusAction')
    expect(result.bonusActionType).toBe('secondWind')
    expect(result.healRoll).toBeGreaterThan(0)
    expect(fighter.currentHp).toBeGreaterThan(20)
    expect(fighter.secondWindUsed).toBe(true)
  })

  it('does not exceed max HP', () => {
    const fighter = createFighter({ currentHp: 43, maxHp: 44 })

    executeSecondWind(fighter, 1, 1)

    expect(fighter.currentHp).toBeLessThanOrEqual(44)
  })

  it('scales with level', () => {
    const fighter = createFighter({ currentHp: 10, level: 10 })

    const result = executeSecondWind(fighter, 1, 1)

    // 1d10 + 10 = 11-20 healing
    expect(result.healRoll).toBeGreaterThanOrEqual(11)
    expect(result.healRoll).toBeLessThanOrEqual(20)
  })
})

describe('spiritual weapon', () => {
  it('attacks with spiritual weapon', () => {
    const cleric = {
      name: 'Cleric',
      spellcastingMod: 4,
      spiritualWeapon: {
        damage: '1d8',
        attackBonus: 6,
        turnsRemaining: 10
      }
    }
    const target = createTarget()

    const result = executeSpiritualWeaponAttack(cleric, target, 1, 1)

    expect(result.actionType).toBe('bonusAction')
    expect(result.bonusActionType).toBe('spiritualWeapon')
    expect(result.attackRoll).toBeGreaterThanOrEqual(1)
  })

  it('returns null if no spiritual weapon', () => {
    const cleric = { name: 'Cleric', spiritualWeapon: null }
    const target = createTarget()

    const result = executeSpiritualWeaponAttack(cleric, target, 1, 1)

    expect(result).toBe(null)
  })
})

describe('opportunity attack', () => {
  it('executes reaction attack', () => {
    const fighter = createFighter()
    const target = createTarget()

    const result = executeOpportunityAttack(fighter, target, 1, 1)

    expect(result.actionType).toBe('reaction')
    expect(result.reactionType).toBe('opportunityAttack')
    expect(fighter.hasReaction).toBe(false)
  })
})

describe('shield reaction', () => {
  it('shouldUseShield returns true when shield would help', () => {
    const wizard = createWizard({ armorClass: 12 })

    // Attack of 14 would hit AC 12, but miss AC 17 (with shield)
    expect(shouldUseShield(wizard, 14)).toBe(true)

    // Attack of 18 would hit even with shield
    expect(shouldUseShield(wizard, 18)).toBe(false)

    // Attack of 11 misses anyway
    expect(shouldUseShield(wizard, 11)).toBe(false)
  })

  it('shouldUseShield returns false without reaction', () => {
    const wizard = createWizard({ hasReaction: false })

    expect(shouldUseShield(wizard, 14)).toBe(false)
  })

  it('shouldUseShield returns false without spell slots', () => {
    const wizard = createWizard({ currentSlots: { 1: 0, 2: 3, 3: 2 } })

    expect(shouldUseShield(wizard, 14)).toBe(false)
  })

  it('applyShieldReaction blocks attack when AC boost helps', () => {
    const wizard = createWizard({ armorClass: 12 })

    const result = applyShieldReaction(wizard, 14, 1, 1)

    expect(result.blocked).toBe(true)
    expect(result.log.reactionType).toBe('shield')
    expect(result.log.newAC).toBe(17)
    expect(wizard.hasReaction).toBe(false)
    expect(wizard.shieldActive).toBe(true)
  })
})

describe('selectBonusAction', () => {
  it('prioritizes spiritual weapon', () => {
    const cleric = {
      name: 'Cleric',
      spiritualWeapon: { damage: '1d8', attackBonus: 6 },
      hasTwoWeaponFighting: true
    }
    const enemies = [createTarget({ isDead: false, isUnconscious: false })]

    const result = selectBonusAction(cleric, [cleric], enemies)

    expect(result.type).toBe('spiritualWeapon')
  })

  it('uses second wind when hurt', () => {
    const fighter = createFighter({
      currentHp: 20,
      maxHp: 44,
      hasSecondWind: true,
      secondWindUsed: false
    })

    const result = selectBonusAction(fighter, [fighter], [])

    expect(result.type).toBe('secondWind')
  })

  it('uses off-hand attack as fallback', () => {
    const fighter = createFighter({
      hasTwoWeaponFighting: true,
      hasSecondWind: false
    })
    const enemies = [createTarget({ isDead: false, isUnconscious: false })]

    const result = selectBonusAction(fighter, [fighter], enemies)

    expect(result.type).toBe('offHandAttack')
  })

  it('returns null when no bonus action available', () => {
    const fighter = {
      name: 'Fighter',
      hasTwoWeaponFighting: false,
      hasSecondWind: false
    }

    const result = selectBonusAction(fighter, [fighter], [])

    expect(result).toBe(null)
  })
})
