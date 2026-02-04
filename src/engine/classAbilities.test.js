/**
 * Tests for class ability execution functions
 */

import { describe, it, expect } from 'vitest'
import {
  executeActionSurge,
  executeRage,
  executeRecklessAttack,
  getRageBonus,
  applyRageResistance,
  getBrutalCriticalBonus,
  calculateSneakAttack,
  applySneakAttack,
  executeCunningAction,
  executeUncannyDodge,
  applyEvasion,
  executeLayOnHands,
  executeDivineSmite,
  getImprovedSmiteDamage,
  getAuraOfProtectionBonus,
  executeFlurryOfBlows,
  executePatientDefense,
  executeStunningStrike,
  executeBardicInspiration,
  useBardicInspiration,
  getFightingStyleAttackBonus,
  getFightingStyleDamageBonus,
  getFightingStyleACBonus
} from './classAbilities.js'
import { initResources } from './resources.js'

function createFighter(level = 5, overrides = {}) {
  const base = {
    name: 'Fighter',
    class: 'fighter',
    level,
    maxHp: 44,
    currentHp: 44,
    attackBonus: 7,
    strMod: 4,
    dexMod: 2,
    conMod: 3,
    proficiencyBonus: 3,
    ...overrides
  }
  return initResources(base)
}

function createRogue(level = 5, overrides = {}) {
  const base = {
    name: 'Rogue',
    class: 'rogue',
    level,
    maxHp: 33,
    currentHp: 33,
    attackBonus: 7,
    dexMod: 4,
    hasReaction: true,
    ...overrides
  }
  return initResources(base)
}

function createBarbarian(level = 5, overrides = {}) {
  const base = {
    name: 'Barbarian',
    class: 'barbarian',
    level,
    maxHp: 55,
    currentHp: 55,
    attackBonus: 7,
    strMod: 4,
    conMod: 3,
    ...overrides
  }
  return initResources(base)
}

function createPaladin(level = 5, overrides = {}) {
  const base = {
    name: 'Paladin',
    class: 'paladin',
    level,
    maxHp: 47,
    currentHp: 47,
    attackBonus: 7,
    strMod: 4,
    chaMod: 3,
    currentSlots: { 1: 4, 2: 2 },
    ...overrides
  }
  return initResources(base)
}

function createMonk(level = 5, overrides = {}) {
  const base = {
    name: 'Monk',
    class: 'monk',
    level,
    maxHp: 38,
    currentHp: 38,
    attackBonus: 7,
    damage: '1d6+4',
    dexMod: 4,
    wisMod: 3,
    proficiencyBonus: 3,
    ...overrides
  }
  return initResources(base)
}

function createBard(level = 5, overrides = {}) {
  const base = {
    name: 'Bard',
    class: 'bard',
    level,
    maxHp: 33,
    currentHp: 33,
    chaMod: 4,
    ...overrides
  }
  return initResources(base)
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
    position: 'front',
    conMod: 2,
    ...overrides
  }
}

function createAlly(overrides = {}) {
  return {
    name: 'Ally',
    id: 'ally-1',
    maxHp: 30,
    currentHp: 30,
    isPlayer: true,
    isDead: false,
    isUnconscious: false,
    position: 'front',
    ...overrides
  }
}

describe('Fighter abilities', () => {
  describe('executeActionSurge', () => {
    it('consumes action surge resource', () => {
      const fighter = createFighter(5)
      const log = executeActionSurge(fighter, 1, 1)

      expect(log).not.toBe(null)
      expect(log.abilityType).toBe('actionSurge')
      expect(fighter.hasActionSurgeThisTurn).toBe(true)
      expect(fighter.classResources.actionSurge.current).toBe(0)
    })

    it('returns null when no action surge left', () => {
      const fighter = createFighter(5)
      fighter.classResources.actionSurge.current = 0

      const log = executeActionSurge(fighter, 1, 1)

      expect(log).toBe(null)
    })
  })
})

describe('Rogue abilities', () => {
  describe('calculateSneakAttack', () => {
    it('returns dice when has advantage', () => {
      const rogue = createRogue(5)
      const target = createTarget()

      const dice = calculateSneakAttack(rogue, target, [], true)

      expect(dice).toBe('3d6') // Level 5 = 3d6
    })

    it('returns dice when ally adjacent', () => {
      const rogue = createRogue(5)
      const target = createTarget({ position: 'front' })
      const ally = createAlly({ position: 'front' })

      const dice = calculateSneakAttack(rogue, target, [ally], false)

      expect(dice).toBe('3d6')
    })

    it('returns null without advantage or ally', () => {
      const rogue = createRogue(5)
      const target = createTarget({ position: 'front' })
      const ally = createAlly({ position: 'back' }) // Different position

      const dice = calculateSneakAttack(rogue, target, [ally], false)

      expect(dice).toBe(null)
    })

    it('returns null if already used this turn', () => {
      const rogue = createRogue(5)
      rogue.sneakAttackUsedThisTurn = true
      const target = createTarget()

      const dice = calculateSneakAttack(rogue, target, [], true)

      expect(dice).toBe(null)
    })

    it('returns null for non-rogue', () => {
      const fighter = createFighter(5)
      const target = createTarget()

      const dice = calculateSneakAttack(fighter, target, [], true)

      expect(dice).toBe(null)
    })
  })

  describe('applySneakAttack', () => {
    it('adds sneak attack damage when conditions met', () => {
      const rogue = createRogue(5)
      const target = createTarget()

      const result = applySneakAttack(rogue, 10, target, [], true)

      expect(result.damage).toBeGreaterThan(10)
      expect(result.sneakAttackDamage).toBeGreaterThan(0)
      expect(result.sneakAttackDice).toBe('3d6')
      expect(rogue.sneakAttackUsedThisTurn).toBe(true)
    })

    it('returns base damage when conditions not met', () => {
      const rogue = createRogue(5)
      const target = createTarget({ position: 'back' })

      const result = applySneakAttack(rogue, 10, target, [], false)

      expect(result.damage).toBe(10)
      expect(result.sneakAttackDamage).toBe(0)
    })
  })

  describe('executeCunningAction', () => {
    it('executes hide action', () => {
      const rogue = createRogue(5)
      const log = executeCunningAction(rogue, 'hide', 1, 1)

      expect(log.bonusActionType).toBe('cunningAction')
      expect(log.cunningActionType).toBe('hide')
      expect(rogue.isHidden).toBe(true)
    })

    it('executes disengage action', () => {
      const rogue = createRogue(5)
      const log = executeCunningAction(rogue, 'disengage', 1, 1)

      expect(log.cunningActionType).toBe('disengage')
      expect(rogue.hasDisengaged).toBe(true)
    })

    it('returns null for non-rogue', () => {
      const fighter = createFighter(5)
      const log = executeCunningAction(fighter, 'hide', 1, 1)

      expect(log).toBe(null)
    })

    it('returns null for level 1 rogue', () => {
      const rogue = createRogue(1) // Cunning Action at level 2
      const log = executeCunningAction(rogue, 'hide', 1, 1)

      expect(log).toBe(null)
    })
  })

  describe('executeUncannyDodge', () => {
    it('halves incoming damage', () => {
      const rogue = createRogue(5)
      const log = executeUncannyDodge(rogue, 20, 'Orc', 1, 1)

      expect(log.originalDamage).toBe(20)
      expect(log.reducedDamage).toBe(10)
      expect(rogue.hasReaction).toBe(false)
      expect(rogue.uncannyDodgeUsedThisRound).toBe(true)
    })

    it('returns null without reaction', () => {
      const rogue = createRogue(5)
      rogue.hasReaction = false

      const log = executeUncannyDodge(rogue, 20, 'Orc', 1, 1)

      expect(log).toBe(null)
    })

    it('returns null if already used this round', () => {
      const rogue = createRogue(5)
      rogue.uncannyDodgeUsedThisRound = true

      const log = executeUncannyDodge(rogue, 20, 'Orc', 1, 1)

      expect(log).toBe(null)
    })

    it('returns null for low-level rogue', () => {
      const rogue = createRogue(4) // Uncanny Dodge at level 5
      const log = executeUncannyDodge(rogue, 20, 'Orc', 1, 1)

      expect(log).toBe(null)
    })
  })

  describe('applyEvasion', () => {
    it('takes 0 damage on successful save for rogue', () => {
      const rogue = createRogue(7)
      const result = applyEvasion(rogue, 20, true)

      expect(result).toBe(0)
    })

    it('takes half damage on failed save for rogue', () => {
      const rogue = createRogue(7)
      const result = applyEvasion(rogue, 20, false)

      expect(result).toBe(10)
    })

    it('works normally without evasion', () => {
      const rogue = createRogue(5) // Evasion at level 7
      const result = applyEvasion(rogue, 20, true)

      expect(result).toBe(10) // Normal half damage
    })

    it('works for monk with evasion', () => {
      const monk = createMonk(7)
      const result = applyEvasion(monk, 20, true)

      expect(result).toBe(0)
    })
  })
})

describe('Barbarian abilities', () => {
  describe('executeRage', () => {
    it('enters rage state', () => {
      const barbarian = createBarbarian(5)
      const log = executeRage(barbarian, 1, 1)

      expect(log.bonusActionType).toBe('rage')
      expect(barbarian.isRaging).toBe(true)
      expect(barbarian.rageRoundsRemaining).toBe(10)
      expect(barbarian.classResources.rage.current).toBe(2)
    })

    it('returns null when already raging', () => {
      const barbarian = createBarbarian(5)
      barbarian.isRaging = true

      const log = executeRage(barbarian, 1, 1)

      expect(log).toBe(null)
    })

    it('returns null for non-barbarian', () => {
      const fighter = createFighter(5)
      const log = executeRage(fighter, 1, 1)

      expect(log).toBe(null)
    })
  })

  describe('executeRecklessAttack', () => {
    it('enables reckless attack', () => {
      const barbarian = createBarbarian(5)
      const log = executeRecklessAttack(barbarian, 1, 1)

      expect(log.abilityType).toBe('recklessAttack')
      expect(barbarian.isReckless).toBe(true)
      expect(barbarian.recklessUntilNextTurn).toBe(true)
    })

    it('returns null for level 1', () => {
      const barbarian = createBarbarian(1) // Reckless at level 2
      const log = executeRecklessAttack(barbarian, 1, 1)

      expect(log).toBe(null)
    })
  })

  describe('getRageBonus', () => {
    it('returns bonus when raging', () => {
      const barbarian = createBarbarian(5)
      barbarian.isRaging = true

      expect(getRageBonus(barbarian)).toBe(2)
    })

    it('returns 0 when not raging', () => {
      const barbarian = createBarbarian(5)

      expect(getRageBonus(barbarian)).toBe(0)
    })

    it('returns 0 for non-barbarian', () => {
      const fighter = createFighter(5)
      fighter.isRaging = true

      expect(getRageBonus(fighter)).toBe(0)
    })
  })

  describe('applyRageResistance', () => {
    it('halves physical damage when raging', () => {
      const barbarian = createBarbarian(5)
      barbarian.isRaging = true

      expect(applyRageResistance(barbarian, 20, 'slashing')).toBe(10)
      expect(applyRageResistance(barbarian, 20, 'bludgeoning')).toBe(10)
      expect(applyRageResistance(barbarian, 20, 'piercing')).toBe(10)
    })

    it('does not resist non-physical damage', () => {
      const barbarian = createBarbarian(5)
      barbarian.isRaging = true

      expect(applyRageResistance(barbarian, 20, 'fire')).toBe(20)
      expect(applyRageResistance(barbarian, 20, 'psychic')).toBe(20)
    })

    it('returns full damage when not raging', () => {
      const barbarian = createBarbarian(5)

      expect(applyRageResistance(barbarian, 20, 'slashing')).toBe(20)
    })
  })

  describe('getBrutalCriticalBonus', () => {
    it('returns extra dice at high levels', () => {
      expect(getBrutalCriticalBonus(createBarbarian(9))).toBe(1)
      expect(getBrutalCriticalBonus(createBarbarian(13))).toBe(2)
      expect(getBrutalCriticalBonus(createBarbarian(17))).toBe(3)
    })

    it('returns 0 before level 9', () => {
      expect(getBrutalCriticalBonus(createBarbarian(8))).toBe(0)
    })
  })
})

describe('Paladin abilities', () => {
  describe('executeLayOnHands', () => {
    it('heals target', () => {
      const paladin = createPaladin(5)
      const target = { ...createTarget(), currentHp: 30, maxHp: 50, isPlayer: true }

      const log = executeLayOnHands(paladin, target, 15, 1, 1)

      expect(log.healAmount).toBe(15)
      expect(target.currentHp).toBe(45)
      expect(paladin.classResources.layOnHands.current).toBe(10)
    })

    it('wakes unconscious target', () => {
      const paladin = createPaladin(5)
      const target = {
        ...createTarget(),
        currentHp: 0,
        maxHp: 50,
        isPlayer: true,
        isUnconscious: true,
        deathSaveSuccesses: 2,
        deathSaveFailures: 1
      }

      executeLayOnHands(paladin, target, 5, 1, 1)

      expect(target.currentHp).toBe(5)
      expect(target.isUnconscious).toBe(false)
      expect(target.deathSaveSuccesses).toBe(0)
      expect(target.deathSaveFailures).toBe(0)
    })

    it('returns null when insufficient pool', () => {
      const paladin = createPaladin(5)
      paladin.classResources.layOnHands.current = 4

      const log = executeLayOnHands(paladin, createTarget(), 5, 1, 1)

      expect(log).toBe(null)
    })
  })

  describe('executeDivineSmite', () => {
    it('consumes spell slot and deals damage', () => {
      const paladin = createPaladin(5)
      const log = executeDivineSmite(paladin, 1, false, false, 1, 1)

      expect(log.smiteDamage).toBeGreaterThan(0)
      expect(log.slotLevel).toBe(1)
      expect(paladin.currentSlots[1]).toBe(3)
    })

    it('adds extra die vs undead', () => {
      const paladin = createPaladin(5)

      // Run multiple times to verify average is higher
      let normalTotal = 0
      let undeadTotal = 0
      for (let i = 0; i < 50; i++) {
        const normalPaladin = createPaladin(5)
        const undeadPaladin = createPaladin(5)

        const normalLog = executeDivineSmite(normalPaladin, 1, false, false, 1, 1)
        const undeadLog = executeDivineSmite(undeadPaladin, 1, false, true, 1, 1)

        normalTotal += normalLog.smiteDamage
        undeadTotal += undeadLog.smiteDamage
      }

      // Undead should average higher (3d8 vs 2d8)
      expect(undeadTotal / 50).toBeGreaterThan(normalTotal / 50)
    })

    it('returns null without spell slots', () => {
      const paladin = createPaladin(5)
      paladin.currentSlots = { 1: 0, 2: 0 }

      const log = executeDivineSmite(paladin, 1, false, false, 1, 1)

      expect(log).toBe(null)
    })
  })

  describe('getAuraOfProtectionBonus', () => {
    it('returns CHA mod for level 6+ paladin', () => {
      const paladin = createPaladin(6)
      const ally = createAlly()

      expect(getAuraOfProtectionBonus(ally, paladin)).toBe(3)
    })

    it('returns 0 for low-level paladin', () => {
      const paladin = createPaladin(5)
      const ally = createAlly()

      expect(getAuraOfProtectionBonus(ally, paladin)).toBe(0)
    })

    it('returns 0 if paladin is unconscious', () => {
      const paladin = createPaladin(6)
      paladin.isUnconscious = true
      const ally = createAlly()

      expect(getAuraOfProtectionBonus(ally, paladin)).toBe(0)
    })
  })
})

describe('Monk abilities', () => {
  describe('executeFlurryOfBlows', () => {
    it('consumes ki and makes two attacks', () => {
      const monk = createMonk(5)
      const target = createTarget()

      const log = executeFlurryOfBlows(monk, target, 1, 1)

      expect(log.bonusActionType).toBe('flurryOfBlows')
      expect(log.strikes.length).toBe(2)
      expect(monk.classResources.ki.current).toBe(4)
    })

    it('returns null without ki', () => {
      const monk = createMonk(5)
      monk.classResources.ki.current = 0
      const target = createTarget()

      const log = executeFlurryOfBlows(monk, target, 1, 1)

      expect(log).toBe(null)
    })
  })

  describe('executePatientDefense', () => {
    it('consumes ki and sets dodge', () => {
      const monk = createMonk(5)
      const log = executePatientDefense(monk, 1, 1)

      expect(log.bonusActionType).toBe('patientDefense')
      expect(monk.isDodging).toBe(true)
      expect(monk.classResources.ki.current).toBe(4)
    })
  })

  describe('executeStunningStrike', () => {
    it('consumes ki and attempts stun', () => {
      const monk = createMonk(5)
      const target = createTarget()

      const log = executeStunningStrike(monk, target, 1, 1)

      expect(log.abilityType).toBe('stunningStrike')
      expect(monk.classResources.ki.current).toBe(4)
      expect(log.saveDC).toBe(14) // 8 + 3 prof + 3 WIS
    })

    it('applies stunned condition on failed save', () => {
      const monk = createMonk(5)

      // Run until we get a failed save
      let stunApplied = false
      for (let i = 0; i < 50; i++) {
        const target = createTarget({ conMod: -5, conditions: [] }) // Very low CON
        const log = executeStunningStrike(monk, target, 1, 1)
        if (!log.saved) {
          stunApplied = target.conditions.some(c => c.type === 'stunned')
          break
        }
        // Reset ki for next attempt
        monk.classResources.ki.current = 5
      }

      expect(stunApplied).toBe(true)
    })
  })
})

describe('Bard abilities', () => {
  describe('executeBardicInspiration', () => {
    it('gives inspiration die to target', () => {
      const bard = createBard(5)
      const target = createAlly()

      const log = executeBardicInspiration(bard, target, 1, 1)

      expect(log.bonusActionType).toBe('bardicInspiration')
      expect(log.inspirationDie).toBe('1d8') // Level 5
      expect(target.bardicInspirationDie).toBe('1d8')
      expect(bard.classResources.bardicInspiration.current).toBe(3) // 4 - 1
    })

    it('scales die with level', () => {
      const lowBard = createBard(1)
      const highBard = createBard(15)
      const target1 = createAlly()
      const target2 = createAlly()

      executeBardicInspiration(lowBard, target1, 1, 1)
      executeBardicInspiration(highBard, target2, 1, 1)

      expect(target1.bardicInspirationDie).toBe('1d6')
      expect(target2.bardicInspirationDie).toBe('1d12')
    })
  })

  describe('useBardicInspiration', () => {
    it('rolls die and consumes it', () => {
      const target = createAlly({ bardicInspirationDie: '1d8' })

      const bonus = useBardicInspiration(target)

      expect(bonus).toBeGreaterThanOrEqual(1)
      expect(bonus).toBeLessThanOrEqual(8)
      expect(target.bardicInspirationDie).toBe(null)
    })

    it('returns 0 without inspiration', () => {
      const target = createAlly()

      const bonus = useBardicInspiration(target)

      expect(bonus).toBe(0)
    })
  })
})

describe('Fighting style helpers', () => {
  describe('getFightingStyleAttackBonus', () => {
    it('returns +2 for archery with ranged', () => {
      const ranger = { fightingStyle: 'archery' }

      expect(getFightingStyleAttackBonus(ranger, true)).toBe(2)
      expect(getFightingStyleAttackBonus(ranger, false)).toBe(0)
    })

    it('returns 0 without fighting style', () => {
      const fighter = {}

      expect(getFightingStyleAttackBonus(fighter, true)).toBe(0)
    })
  })

  describe('getFightingStyleDamageBonus', () => {
    it('returns +2 for dueling with one-handed', () => {
      const fighter = { fightingStyle: 'dueling' }

      expect(getFightingStyleDamageBonus(fighter, true)).toBe(2)
      expect(getFightingStyleDamageBonus(fighter, false)).toBe(0)
    })
  })

  describe('getFightingStyleACBonus', () => {
    it('returns +1 for defense', () => {
      const paladin = { fightingStyle: 'defense' }

      expect(getFightingStyleACBonus(paladin)).toBe(1)
    })

    it('returns 0 for other styles', () => {
      const fighter = { fightingStyle: 'dueling' }

      expect(getFightingStyleACBonus(fighter)).toBe(0)
    })
  })
})
