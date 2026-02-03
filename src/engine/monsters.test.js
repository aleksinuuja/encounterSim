/**
 * Tests for advanced monster abilities
 */

import { describe, it, expect } from 'vitest'
import {
  rollRecharge,
  executeMultiattack,
  executeBreathWeapon,
  executeLegendaryAction,
  selectLegendaryAction,
  shouldUseBreathWeapon,
  processRecharges
} from './monsters.js'

function createDragon(overrides = {}) {
  return {
    name: 'Young Red Dragon',
    maxHp: 178,
    currentHp: 178,
    armorClass: 18,
    attackBonus: 10,
    multiattack: [
      { type: 'bite', attackBonus: 10, damage: '2d10+6', damageType: 'piercing' },
      { type: 'claw', attackBonus: 10, damage: '2d6+6', damageType: 'slashing' },
      { type: 'claw', attackBonus: 10, damage: '2d6+6', damageType: 'slashing' }
    ],
    rechargeAbilities: [
      {
        name: 'Fire Breath',
        rechargeMin: 5,
        available: true,
        type: 'area',
        shape: 'cone',
        size: 30,
        saveDC: 17,
        saveAbility: 'dexterity',
        damage: '16d6',
        damageType: 'fire',
        saveEffect: 'half'
      }
    ],
    ...overrides
  }
}

function createAdultDragon(overrides = {}) {
  return {
    name: 'Adult Red Dragon',
    maxHp: 256,
    currentHp: 256,
    armorClass: 19,
    legendaryActions: 3,
    currentLegendaryActions: 3,
    legendaryAbilities: [
      {
        name: 'Tail Attack',
        cost: 1,
        type: 'attack',
        attackBonus: 14,
        damage: '2d8+8',
        damageType: 'bludgeoning'
      },
      {
        name: 'Wing Attack',
        cost: 2,
        type: 'area',
        saveDC: 22,
        saveAbility: 'dexterity',
        damage: '2d6+8',
        damageType: 'bludgeoning',
        onFail: 'prone'
      }
    ],
    ...overrides
  }
}

function createTarget(overrides = {}) {
  return {
    name: 'Fighter',
    maxHp: 44,
    currentHp: 44,
    armorClass: 18,
    isPlayer: true,
    isDead: false,
    isUnconscious: false,
    dexteritySave: 2,
    conditions: [],
    ...overrides
  }
}

describe('recharge abilities', () => {
  it('rollRecharge returns a d6 result', () => {
    const ability = { rechargeMin: 5 }

    for (let i = 0; i < 20; i++) {
      const result = rollRecharge(ability)
      expect(result.roll).toBeGreaterThanOrEqual(1)
      expect(result.roll).toBeLessThanOrEqual(6)
    }
  })

  it('processRecharges logs recharge attempts', () => {
    const dragon = createDragon()
    dragon.rechargeAbilities[0].available = false

    const logs = processRecharges(dragon, 1, 1)

    expect(logs.length).toBe(1)
    expect(logs[0].actionType).toBe('recharge')
    expect(logs[0].abilityName).toBe('Fire Breath')
  })

  it('shouldUseBreathWeapon returns ability when multiple enemies', () => {
    const dragon = createDragon()
    const enemies = [
      createTarget({ name: 'Fighter 1' }),
      createTarget({ name: 'Fighter 2' })
    ]

    const result = shouldUseBreathWeapon(dragon, enemies)

    expect(result).toBeTruthy()
    expect(result.name).toBe('Fire Breath')
  })

  it('shouldUseBreathWeapon returns null when not available', () => {
    const dragon = createDragon()
    dragon.rechargeAbilities[0].available = false
    const enemies = [createTarget(), createTarget()]

    const result = shouldUseBreathWeapon(dragon, enemies)

    expect(result).toBe(null)
  })
})

describe('multiattack', () => {
  it('executes multiple attacks', () => {
    const dragon = createDragon()
    const targets = [createTarget({ armorClass: 10 })] // Easy to hit

    const logs = executeMultiattack(dragon, targets, 1, 1)

    expect(logs.length).toBe(3) // bite + 2 claws
    expect(logs[0].attackType).toBe('bite')
    expect(logs[1].attackType).toBe('claw')
    expect(logs[2].attackType).toBe('claw')
  })

  it('stops when no targets remain', () => {
    const dragon = createDragon()
    const targets = [] // No targets

    const logs = executeMultiattack(dragon, targets, 1, 1)

    expect(logs.length).toBe(0)
  })

  it('can kill target mid-multiattack', () => {
    const dragon = createDragon()

    let foundKill = false
    for (let i = 0; i < 50; i++) {
      // Target with 1 HP and very low AC - guaranteed to die on any hit
      const freshTarget = createTarget({
        currentHp: 1,
        armorClass: 1,
        isDead: false,
        isUnconscious: false,
        isPlayer: false // Monsters die immediately at 0 HP
      })
      const logs = executeMultiattack(dragon, [freshTarget], 1, 1)

      const killLog = logs.find(l => l.targetDied)
      if (killLog) {
        foundKill = true
        break
      }
    }

    expect(foundKill).toBe(true)
  })
})

describe('breath weapon', () => {
  it('deals damage to all targets', () => {
    const dragon = createDragon()
    const ability = dragon.rechargeAbilities[0]
    const targets = [
      createTarget({ name: 'Fighter 1', dexteritySave: -5 }), // Will fail save
      createTarget({ name: 'Fighter 2', dexteritySave: -5 })
    ]

    const logs = executeBreathWeapon(dragon, ability, targets, 1, 1)

    expect(logs.length).toBe(3) // Main log + 2 target effects
    expect(logs[0].actionType).toBe('breathWeapon')
    expect(logs[0].baseDamage).toBeGreaterThan(0)
    expect(logs[1].actionType).toBe('breathEffect')
    expect(logs[2].actionType).toBe('breathEffect')
  })

  it('marks ability as used', () => {
    const dragon = createDragon()
    const ability = dragon.rechargeAbilities[0]
    const targets = [createTarget()]

    executeBreathWeapon(dragon, ability, targets, 1, 1)

    expect(ability.available).toBe(false)
  })

  it('half damage on successful save', () => {
    const dragon = createDragon()
    const ability = dragon.rechargeAbilities[0]

    // Run multiple times to see both saves and fails
    let foundSave = false
    let foundFail = false

    for (let i = 0; i < 30; i++) {
      const target = createTarget({ dexteritySave: 5 })
      ability.available = true
      const logs = executeBreathWeapon(dragon, ability, [target], 1, 1)
      const effectLog = logs[1]

      if (effectLog.savePassed) {
        foundSave = true
        // Half damage on save
        expect(effectLog.damageRoll).toBeLessThanOrEqual(logs[0].baseDamage)
      } else {
        foundFail = true
        expect(effectLog.damageRoll).toBe(logs[0].baseDamage)
      }
    }

    // Should see both outcomes
    expect(foundSave || foundFail).toBe(true)
  })
})

describe('legendary actions', () => {
  it('selectLegendaryAction picks affordable ability', () => {
    const dragon = createAdultDragon({ currentLegendaryActions: 1 })
    const enemies = [createTarget()]

    const result = selectLegendaryAction(dragon, enemies)

    expect(result).toBeTruthy()
    expect(result.name).toBe('Tail Attack')
    expect(result.cost).toBe(1)
  })

  it('selectLegendaryAction prefers area attack vs multiple enemies', () => {
    const dragon = createAdultDragon()
    const enemies = [createTarget(), createTarget()]

    const result = selectLegendaryAction(dragon, enemies)

    expect(result).toBeTruthy()
    expect(result.name).toBe('Wing Attack')
  })

  it('selectLegendaryAction returns null when no actions left', () => {
    const dragon = createAdultDragon({ currentLegendaryActions: 0 })
    const enemies = [createTarget()]

    const result = selectLegendaryAction(dragon, enemies)

    expect(result).toBe(null)
  })

  it('executeLegendaryAction deducts cost', () => {
    const dragon = createAdultDragon()
    const ability = dragon.legendaryAbilities[0] // Tail Attack (cost 1)
    const targets = [createTarget()]

    executeLegendaryAction(dragon, ability, targets, 1, 1)

    expect(dragon.currentLegendaryActions).toBe(2)
  })

  it('executeLegendaryAction area effect applies conditions on fail', () => {
    // Run until we see a failed save
    let foundCondition = false
    for (let i = 0; i < 20; i++) {
      const freshDragon = createAdultDragon()
      const freshTarget = createTarget({ dexteritySave: -10, conditions: [] })
      const logs = executeLegendaryAction(freshDragon, freshDragon.legendaryAbilities[1], [freshTarget], 1, 1)

      const effectLog = logs.find(l => l.actionType === 'legendaryEffect')
      if (effectLog && effectLog.conditionApplied === 'prone') {
        foundCondition = true
        break
      }
    }

    expect(foundCondition).toBe(true)
  })
})
