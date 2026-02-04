/**
 * Tests for class AI decision logic
 */

import { describe, it, expect } from 'vitest'
import {
  shouldUseActionSurge,
  shouldUseSecondWind,
  shouldUseIndomitable,
  selectCunningAction,
  shouldUseUncannyDodge,
  shouldRage,
  shouldUseRecklessAttack,
  shouldUseLayOnHands,
  shouldDivineSmite,
  selectMonkBonusAction,
  shouldUseStunningStrike,
  shouldUseBardicInspiration,
  selectClassBonusAction
} from './classAI.js'
import { initResources } from './resources.js'

function createFighter(level = 5, overrides = {}) {
  const base = {
    name: 'Fighter',
    class: 'fighter',
    level,
    maxHp: 44,
    currentHp: 44,
    attackBonus: 7,
    damage: '1d8+4',
    numAttacks: 2,
    strMod: 4,
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
    hasReaction: true,
    position: 'back',
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
    damage: '2d6+4',
    numAttacks: 2,
    strMod: 4,
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
    dexMod: 4,
    wisMod: 3,
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
    position: 'back',
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
    damage: '1d8+3',
    isPlayer: false,
    isDead: false,
    isUnconscious: false,
    conMod: 2,
    ...overrides
  }
}

function createAlly(overrides = {}) {
  return {
    id: 'ally-1',
    name: 'Ally',
    maxHp: 30,
    currentHp: 30,
    attackBonus: 5,
    isPlayer: true,
    isDead: false,
    isUnconscious: false,
    position: 'front',
    ...overrides
  }
}

describe('Fighter AI', () => {
  describe('shouldUseActionSurge', () => {
    it('returns true when extra attacks would kill target', () => {
      const fighter = createFighter(5)
      const target = createTarget({ currentHp: 15 }) // Low HP
      const allies = [fighter]
      const enemies = [target]

      expect(shouldUseActionSurge(fighter, target, allies, enemies)).toBe(true)
    })

    it('returns true when outnumbered', () => {
      const fighter = createFighter(5)
      const target = createTarget()
      const allies = [fighter]
      const enemies = [createTarget(), createTarget(), createTarget()] // 3 enemies

      expect(shouldUseActionSurge(fighter, target, allies, enemies)).toBe(true)
    })

    it('returns true when critically wounded', () => {
      const fighter = createFighter(5, { currentHp: 10 }) // Below 25%
      const target = createTarget()

      expect(shouldUseActionSurge(fighter, target, [fighter], [target])).toBe(true)
    })

    it('returns false when no action surge available', () => {
      const fighter = createFighter(5)
      fighter.classResources.actionSurge.current = 0
      const target = createTarget({ currentHp: 15 })

      expect(shouldUseActionSurge(fighter, target, [fighter], [target])).toBe(false)
    })

    it('returns false when already used this turn', () => {
      const fighter = createFighter(5)
      fighter.hasActionSurgeThisTurn = true
      const target = createTarget({ currentHp: 15 })

      expect(shouldUseActionSurge(fighter, target, [fighter], [target])).toBe(false)
    })
  })

  describe('shouldUseSecondWind', () => {
    it('returns true when below 50% HP', () => {
      const fighter = createFighter(5, { currentHp: 20 })

      expect(shouldUseSecondWind(fighter)).toBe(true)
    })

    it('returns false when above 50% HP', () => {
      const fighter = createFighter(5, { currentHp: 30 })

      expect(shouldUseSecondWind(fighter)).toBe(false)
    })

    it('returns false when no resource', () => {
      const fighter = createFighter(5, { currentHp: 20 })
      fighter.classResources.secondWind.current = 0

      expect(shouldUseSecondWind(fighter)).toBe(false)
    })
  })

  describe('shouldUseIndomitable', () => {
    it('returns true for dangerous conditions', () => {
      const fighter = createFighter(9) // Indomitable at level 9

      expect(shouldUseIndomitable(fighter, 'constitution', 'paralyzed')).toBe(true)
      expect(shouldUseIndomitable(fighter, 'wisdom', 'stunned')).toBe(true)
    })

    it('returns true when critically wounded against damage', () => {
      const fighter = createFighter(9, { currentHp: 10 })

      expect(shouldUseIndomitable(fighter, 'dexterity', 'damage')).toBe(true)
    })

    it('returns false when no indomitable', () => {
      const fighter = createFighter(9)
      fighter.classResources.indomitable.current = 0

      expect(shouldUseIndomitable(fighter, 'wisdom', 'paralyzed')).toBe(false)
    })
  })
})

describe('Rogue AI', () => {
  describe('selectCunningAction', () => {
    it('returns hide when in back position', () => {
      const rogue = createRogue(5, { position: 'back', isHidden: false })
      const enemies = [createTarget()]

      expect(selectCunningAction(rogue, [], enemies)).toBe('hide')
    })

    it('returns disengage when low HP in front', () => {
      const rogue = createRogue(5, { position: 'front', currentHp: 8 }) // Below 30%

      expect(selectCunningAction(rogue, [], [])).toBe('disengage')
    })

    it('returns null when already hidden', () => {
      const rogue = createRogue(5, { position: 'back', isHidden: true })

      expect(selectCunningAction(rogue, [], [])).toBe(null)
    })
  })

  describe('shouldUseUncannyDodge', () => {
    it('returns true for lethal damage', () => {
      const rogue = createRogue(5, { currentHp: 15 })

      expect(shouldUseUncannyDodge(rogue, 20)).toBe(true) // Would kill
    })

    it('returns true for significant damage', () => {
      const rogue = createRogue(5) // 33 HP

      expect(shouldUseUncannyDodge(rogue, 10)).toBe(true) // >25% of max
    })

    it('returns false without reaction', () => {
      const rogue = createRogue(5, { hasReaction: false })

      expect(shouldUseUncannyDodge(rogue, 20)).toBe(false)
    })

    it('returns false if already used this round', () => {
      const rogue = createRogue(5)
      rogue.uncannyDodgeUsedThisRound = true

      expect(shouldUseUncannyDodge(rogue, 20)).toBe(false)
    })
  })
})

describe('Barbarian AI', () => {
  describe('shouldRage', () => {
    it('returns true on round 1 with enemies', () => {
      const barbarian = createBarbarian(5)
      const enemies = [createTarget()]

      expect(shouldRage(barbarian, 1, enemies)).toBe(true)
    })

    it('returns true when below 50% HP', () => {
      const barbarian = createBarbarian(5, { currentHp: 25 })
      const enemies = [createTarget()]

      expect(shouldRage(barbarian, 3, enemies)).toBe(true)
    })

    it('returns true when facing 3+ enemies', () => {
      const barbarian = createBarbarian(5)
      const enemies = [createTarget(), createTarget(), createTarget()]

      expect(shouldRage(barbarian, 3, enemies)).toBe(true)
    })

    it('returns false when already raging', () => {
      const barbarian = createBarbarian(5)
      barbarian.isRaging = true

      expect(shouldRage(barbarian, 1, [createTarget()])).toBe(false)
    })

    it('returns false when no rages left', () => {
      const barbarian = createBarbarian(5)
      barbarian.classResources.rage.current = 0

      expect(shouldRage(barbarian, 1, [createTarget()])).toBe(false)
    })
  })

  describe('shouldUseRecklessAttack', () => {
    it('returns true when raging', () => {
      const barbarian = createBarbarian(5)
      barbarian.isRaging = true
      const target = createTarget()

      expect(shouldUseRecklessAttack(barbarian, target, [barbarian], [target])).toBe(true)
    })

    it('returns true against high AC target', () => {
      const barbarian = createBarbarian(5)
      const target = createTarget({ armorClass: 18 })

      expect(shouldUseRecklessAttack(barbarian, target, [barbarian], [target])).toBe(true)
    })

    it('returns true when outnumbering enemies', () => {
      const barbarian = createBarbarian(5)
      const allies = [barbarian, createAlly(), createAlly(), createAlly()]
      const enemies = [createTarget()]

      expect(shouldUseRecklessAttack(barbarian, enemies[0], allies, enemies)).toBe(true)
    })

    it('returns false when low HP and not raging', () => {
      const barbarian = createBarbarian(5, { currentHp: 15 })
      const target = createTarget({ armorClass: 14 })

      expect(shouldUseRecklessAttack(barbarian, target, [barbarian], [target])).toBe(false)
    })
  })
})

describe('Paladin AI', () => {
  describe('shouldUseLayOnHands', () => {
    it('returns target and amount for unconscious ally', () => {
      const paladin = createPaladin(5)
      const unconscious = createAlly({ isUnconscious: true, currentHp: 0 })

      const result = shouldUseLayOnHands(paladin, [paladin, unconscious])

      expect(result).not.toBe(null)
      expect(result.target).toBe(unconscious)
      expect(result.amount).toBe(5) // Just enough to wake them
    })

    it('returns target for critically injured ally', () => {
      const paladin = createPaladin(5)
      const injured = createAlly({ currentHp: 5, maxHp: 30 }) // Critical

      const result = shouldUseLayOnHands(paladin, [paladin, injured])

      expect(result).not.toBe(null)
      expect(result.target).toBe(injured)
    })

    it('returns null when no one needs healing', () => {
      const paladin = createPaladin(5)
      const healthy = createAlly({ currentHp: 28, maxHp: 30 })

      const result = shouldUseLayOnHands(paladin, [paladin, healthy])

      expect(result).toBe(null)
    })

    it('returns falsy when pool empty', () => {
      const paladin = createPaladin(5)
      paladin.classResources.layOnHands.current = 0
      const unconscious = createAlly({ isUnconscious: true })

      const result = shouldUseLayOnHands(paladin, [paladin, unconscious])

      expect(result).toBeFalsy()
    })
  })

  describe('shouldDivineSmite', () => {
    it('returns slot level on critical', () => {
      const paladin = createPaladin(5)
      const target = createTarget()

      const result = shouldDivineSmite(paladin, true, false, target)

      expect(result).toBeGreaterThanOrEqual(1)
    })

    it('returns slot level vs undead', () => {
      const paladin = createPaladin(5)
      const target = createTarget({ creatureType: 'undead' })

      const result = shouldDivineSmite(paladin, false, true, target)

      expect(result).toBeGreaterThanOrEqual(1)
    })

    it('returns slot when would kill target', () => {
      const paladin = createPaladin(5)
      const target = createTarget({ currentHp: 8 }) // Low HP

      const result = shouldDivineSmite(paladin, false, false, target)

      expect(result).toBeGreaterThanOrEqual(1)
    })

    it('returns null without slots', () => {
      const paladin = createPaladin(5)
      paladin.currentSlots = { 1: 0, 2: 0 }

      const result = shouldDivineSmite(paladin, true, false, createTarget())

      expect(result).toBe(null)
    })
  })
})

describe('Monk AI', () => {
  describe('selectMonkBonusAction', () => {
    it('returns flurry when target is wounded', () => {
      const monk = createMonk(5)
      const target = createTarget({ currentHp: 20, maxHp: 50 })

      const result = selectMonkBonusAction(monk, target, [], [target])

      expect(result.type).toBe('flurryOfBlows')
    })

    it('returns patient defense when critical HP', () => {
      const monk = createMonk(5, { currentHp: 8 })
      const target = createTarget()

      const result = selectMonkBonusAction(monk, target, [], [target])

      expect(result.type).toBe('patientDefense')
    })

    it('returns patient defense when outnumbered', () => {
      const monk = createMonk(5)
      const enemies = [createTarget(), createTarget(), createTarget()]

      const result = selectMonkBonusAction(monk, enemies[0], [], enemies)

      expect(result.type).toBe('patientDefense')
    })

    it('returns null when no ki available', () => {
      const monk = createMonk(5)
      monk.classResources.ki.current = 0
      const target = createTarget()

      const result = selectMonkBonusAction(monk, target, [], [target])

      // With no ki, returns null (martial arts bonus is free and handled elsewhere)
      expect(result).toBe(null)
    })
  })

  describe('shouldUseStunningStrike', () => {
    it('returns true against spellcasters', () => {
      const monk = createMonk(5)
      const caster = createTarget({ spells: ['fireball'] })

      expect(shouldUseStunningStrike(monk, caster)).toBe(true)
    })

    it('returns true against low CON targets', () => {
      const monk = createMonk(5)
      const target = createTarget({ conMod: -1 })

      expect(shouldUseStunningStrike(monk, target)).toBe(true)
    })

    it('returns true when ki is plentiful', () => {
      const monk = createMonk(5)
      monk.classResources.ki.current = 5
      const target = createTarget()

      expect(shouldUseStunningStrike(monk, target)).toBe(true)
    })

    it('returns false without ki', () => {
      const monk = createMonk(5)
      monk.classResources.ki.current = 0

      expect(shouldUseStunningStrike(monk, createTarget())).toBe(false)
    })
  })
})

describe('Bard AI', () => {
  describe('shouldUseBardicInspiration', () => {
    it('returns frontline ally', () => {
      const bard = createBard(5)
      const frontliner = createAlly({ position: 'front', attackBonus: 7 })

      const result = shouldUseBardicInspiration(bard, [bard, frontliner])

      expect(result).toBe(frontliner)
    })

    it('prefers ally with highest attack bonus', () => {
      const bard = createBard(5)
      const weak = createAlly({ id: 'weak', position: 'front', attackBonus: 3 })
      const strong = createAlly({ id: 'strong', position: 'front', attackBonus: 8 })

      const result = shouldUseBardicInspiration(bard, [bard, weak, strong])

      expect(result.id).toBe('strong')
    })

    it('returns null when no frontliners', () => {
      const bard = createBard(5)
      const backliner = createAlly({ position: 'back' })

      const result = shouldUseBardicInspiration(bard, [bard, backliner])

      expect(result).toBe(null)
    })

    it('returns falsy when no inspiration left', () => {
      const bard = createBard(5)
      bard.classResources.bardicInspiration.current = 0

      const result = shouldUseBardicInspiration(bard, [bard, createAlly({ position: 'front' })])

      expect(result).toBeFalsy()
    })

    it('skips allies who already have inspiration', () => {
      const bard = createBard(5)
      const inspired = createAlly({ position: 'front', bardicInspirationDie: '1d8' })

      const result = shouldUseBardicInspiration(bard, [bard, inspired])

      expect(result).toBe(null)
    })
  })
})

describe('selectClassBonusAction', () => {
  it('returns rage for barbarian at combat start', () => {
    const barbarian = createBarbarian(5)
    const enemies = [createTarget()]

    const result = selectClassBonusAction(barbarian, [barbarian], enemies)

    expect(result.type).toBe('rage')
  })

  it('returns flurry for monk with target', () => {
    const monk = createMonk(5)
    const target = createTarget({ currentHp: 20 })

    const result = selectClassBonusAction(monk, [monk], [target])

    expect(result.type).toBe('flurryOfBlows')
  })

  it('returns bardic inspiration for bard with frontliner', () => {
    const bard = createBard(5)
    const frontliner = createAlly({ position: 'front' })

    const result = selectClassBonusAction(bard, [bard, frontliner], [createTarget()])

    expect(result.type).toBe('bardicInspiration')
  })

  it('returns null for class without special bonus action', () => {
    const fighter = createFighter(5)

    const result = selectClassBonusAction(fighter, [fighter], [createTarget()])

    expect(result).toBe(null)
  })
})
