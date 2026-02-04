/**
 * Tests for the class resource management system
 */

import { describe, it, expect } from 'vitest'
import {
  initResources,
  resetTurnResources,
  resetRoundResources,
  hasResource,
  consumeResource,
  restoreResource,
  getResource,
  getMaxResource,
  startRage,
  endRage,
  tickRage,
  shortRest,
  longRest,
  getSneakAttackDice,
  getMartialArtsDie,
  getRageDamage,
  getBrutalCriticalDice,
  getLayOnHandsPool,
  getBardicInspirationDie,
  getAuraRadius,
  hasClassFeatureSync
} from './resources.js'

function createFighter(level = 5, overrides = {}) {
  return {
    name: 'Fighter',
    class: 'fighter',
    level,
    maxHp: 44,
    currentHp: 44,
    strMod: 4,
    dexMod: 2,
    conMod: 3,
    ...overrides
  }
}

function createRogue(level = 5, overrides = {}) {
  return {
    name: 'Rogue',
    class: 'rogue',
    level,
    maxHp: 33,
    currentHp: 33,
    dexMod: 4,
    ...overrides
  }
}

function createBarbarian(level = 5, overrides = {}) {
  return {
    name: 'Barbarian',
    class: 'barbarian',
    level,
    maxHp: 55,
    currentHp: 55,
    strMod: 4,
    conMod: 3,
    ...overrides
  }
}

function createPaladin(level = 5, overrides = {}) {
  return {
    name: 'Paladin',
    class: 'paladin',
    level,
    maxHp: 47,
    currentHp: 47,
    strMod: 4,
    chaMod: 3,
    ...overrides
  }
}

function createMonk(level = 5, overrides = {}) {
  return {
    name: 'Monk',
    class: 'monk',
    level,
    maxHp: 38,
    currentHp: 38,
    dexMod: 4,
    wisMod: 3,
    ...overrides
  }
}

function createBard(level = 5, overrides = {}) {
  return {
    name: 'Bard',
    class: 'bard',
    level,
    maxHp: 33,
    currentHp: 33,
    chaMod: 4,
    ...overrides
  }
}

describe('initResources', () => {
  it('initializes fighter resources', () => {
    const fighter = createFighter(5)
    const result = initResources(fighter)

    expect(result.classResources).toBeDefined()
    expect(result.classResources.secondWind.current).toBe(1)
    expect(result.classResources.secondWind.max).toBe(1)
    expect(result.classResources.actionSurge.current).toBe(1)
    expect(result.classResources.actionSurge.max).toBe(1)
  })

  it('initializes barbarian resources', () => {
    const barbarian = createBarbarian(5)
    const result = initResources(barbarian)

    expect(result.classResources.rage.current).toBe(3) // Level 5 = 3 rages
    expect(result.classResources.rage.max).toBe(3)
    expect(result.isRaging).toBe(false)
    expect(result.rageRoundsRemaining).toBe(0)
  })

  it('initializes monk resources', () => {
    const monk = createMonk(5)
    const result = initResources(monk)

    expect(result.classResources.ki.current).toBe(5) // Ki = level
    expect(result.classResources.ki.max).toBe(5)
  })

  it('initializes paladin resources', () => {
    const paladin = createPaladin(5)
    const result = initResources(paladin)

    expect(result.classResources.layOnHands.current).toBe(25) // 5 * level
    expect(result.classResources.layOnHands.max).toBe(25)
  })

  it('returns unchanged if no class', () => {
    const custom = { name: 'Custom', maxHp: 20 }
    const result = initResources(custom)

    expect(result.classResources).toBeUndefined()
  })

  it('sets tracking flags', () => {
    const rogue = createRogue(5)
    const result = initResources(rogue)

    expect(result.sneakAttackUsedThisTurn).toBe(false)
    expect(result.uncannyDodgeUsedThisRound).toBe(false)
  })
})

describe('resetTurnResources', () => {
  it('resets sneak attack flag', () => {
    const rogue = { ...createRogue(5), sneakAttackUsedThisTurn: true }
    const result = resetTurnResources(rogue)

    expect(result.sneakAttackUsedThisTurn).toBe(false)
  })
})

describe('resetRoundResources', () => {
  it('resets uncanny dodge flag', () => {
    const rogue = { ...createRogue(5), uncannyDodgeUsedThisRound: true }
    const result = resetRoundResources(rogue)

    expect(result.uncannyDodgeUsedThisRound).toBe(false)
  })
})

describe('hasResource', () => {
  it('returns true when resource available', () => {
    const fighter = initResources(createFighter(5))

    expect(hasResource(fighter, 'secondWind', 1)).toBe(true)
  })

  it('returns false when resource depleted', () => {
    const fighter = initResources(createFighter(5))
    fighter.classResources.secondWind.current = 0

    expect(hasResource(fighter, 'secondWind', 1)).toBe(false)
  })

  it('returns false for unknown resource', () => {
    const fighter = initResources(createFighter(5))

    expect(hasResource(fighter, 'unknownResource', 1)).toBe(false)
  })

  it('returns false when no classResources', () => {
    const custom = { name: 'Custom' }

    expect(hasResource(custom, 'secondWind', 1)).toBe(false)
  })
})

describe('consumeResource', () => {
  it('decrements resource', () => {
    const fighter = initResources(createFighter(5))
    const result = consumeResource(fighter, 'secondWind', 1)

    expect(result.classResources.secondWind.current).toBe(0)
  })

  it('returns null when insufficient resource', () => {
    const fighter = initResources(createFighter(5))
    fighter.classResources.secondWind.current = 0

    const result = consumeResource(fighter, 'secondWind', 1)

    expect(result).toBe(null)
  })

  it('can consume multiple units', () => {
    const monk = initResources(createMonk(5))
    const result = consumeResource(monk, 'ki', 2)

    expect(result.classResources.ki.current).toBe(3)
  })
})

describe('restoreResource', () => {
  it('restores resource up to max', () => {
    const monk = initResources(createMonk(5))
    monk.classResources.ki.current = 2

    const result = restoreResource(monk, 'ki', 10)

    expect(result.classResources.ki.current).toBe(5) // Capped at max
  })
})

describe('getResource / getMaxResource', () => {
  it('returns current value', () => {
    const monk = initResources(createMonk(5))
    monk.classResources.ki.current = 3

    expect(getResource(monk, 'ki')).toBe(3)
  })

  it('returns max value', () => {
    const monk = initResources(createMonk(5))

    expect(getMaxResource(monk, 'ki')).toBe(5)
  })

  it('returns 0 for missing resource', () => {
    const custom = { name: 'Custom' }

    expect(getResource(custom, 'ki')).toBe(0)
    expect(getMaxResource(custom, 'ki')).toBe(0)
  })
})

describe('rage state machine', () => {
  it('startRage consumes rage and sets state', () => {
    const barbarian = initResources(createBarbarian(5))
    const result = startRage(barbarian)

    expect(result.isRaging).toBe(true)
    expect(result.rageRoundsRemaining).toBe(10)
    expect(result.classResources.rage.current).toBe(2) // 3 - 1
  })

  it('startRage returns null when no rages left', () => {
    const barbarian = initResources(createBarbarian(5))
    barbarian.classResources.rage.current = 0

    const result = startRage(barbarian)

    expect(result).toBe(null)
  })

  it('endRage clears state', () => {
    const barbarian = { ...createBarbarian(5), isRaging: true, rageRoundsRemaining: 5 }
    const result = endRage(barbarian)

    expect(result.isRaging).toBe(false)
    expect(result.rageRoundsRemaining).toBe(0)
  })

  it('tickRage decrements duration', () => {
    const barbarian = { ...createBarbarian(5), isRaging: true, rageRoundsRemaining: 5 }
    const result = tickRage(barbarian)

    expect(result.rageRoundsRemaining).toBe(4)
    expect(result.isRaging).toBe(true)
  })

  it('tickRage ends rage at 0', () => {
    const barbarian = { ...createBarbarian(5), isRaging: true, rageRoundsRemaining: 1 }
    const result = tickRage(barbarian)

    expect(result.rageRoundsRemaining).toBe(0)
    expect(result.isRaging).toBe(false)
  })

  it('tickRage does nothing when not raging', () => {
    const barbarian = { ...createBarbarian(5), isRaging: false }
    const result = tickRage(barbarian)

    expect(result.isRaging).toBe(false)
  })
})

describe('shortRest', () => {
  it('restores short rest resources', () => {
    const fighter = initResources(createFighter(5))
    fighter.classResources.secondWind.current = 0
    fighter.classResources.actionSurge.current = 0

    const result = shortRest(fighter)

    expect(result.classResources.secondWind.current).toBe(1)
    expect(result.classResources.actionSurge.current).toBe(1)
  })

  it('ends rage on rest', () => {
    const barbarian = initResources(createBarbarian(5))
    barbarian.isRaging = true
    barbarian.rageRoundsRemaining = 5

    const result = shortRest(barbarian)

    expect(result.isRaging).toBe(false)
    expect(result.rageRoundsRemaining).toBe(0)
  })
})

describe('longRest', () => {
  it('restores all resources', () => {
    const barbarian = initResources(createBarbarian(5))
    barbarian.classResources.rage.current = 0

    const result = longRest(barbarian)

    expect(result.classResources.rage.current).toBe(3)
  })
})

describe('scaling calculations', () => {
  describe('getSneakAttackDice', () => {
    it('returns 0 for non-rogue', () => {
      expect(getSneakAttackDice(createFighter(5))).toBe(0)
    })

    it('scales with level', () => {
      expect(getSneakAttackDice(createRogue(1))).toBe(1)
      expect(getSneakAttackDice(createRogue(3))).toBe(2)
      expect(getSneakAttackDice(createRogue(5))).toBe(3)
      expect(getSneakAttackDice(createRogue(10))).toBe(5)
      expect(getSneakAttackDice(createRogue(20))).toBe(10)
    })
  })

  describe('getMartialArtsDie', () => {
    it('returns null for non-monk', () => {
      expect(getMartialArtsDie(createFighter(5))).toBe(null)
    })

    it('scales with level', () => {
      expect(getMartialArtsDie(createMonk(1))).toBe('1d4')
      expect(getMartialArtsDie(createMonk(5))).toBe('1d6')
      expect(getMartialArtsDie(createMonk(11))).toBe('1d8')
      expect(getMartialArtsDie(createMonk(17))).toBe('1d10')
    })
  })

  describe('getRageDamage', () => {
    it('returns 0 for non-barbarian', () => {
      expect(getRageDamage(createFighter(5))).toBe(0)
    })

    it('scales with level', () => {
      expect(getRageDamage(createBarbarian(1))).toBe(2)
      expect(getRageDamage(createBarbarian(9))).toBe(3)
      expect(getRageDamage(createBarbarian(16))).toBe(4)
    })
  })

  describe('getBrutalCriticalDice', () => {
    it('returns 0 for non-barbarian', () => {
      expect(getBrutalCriticalDice(createFighter(5))).toBe(0)
    })

    it('scales with level', () => {
      expect(getBrutalCriticalDice(createBarbarian(5))).toBe(0)
      expect(getBrutalCriticalDice(createBarbarian(9))).toBe(1)
      expect(getBrutalCriticalDice(createBarbarian(13))).toBe(2)
      expect(getBrutalCriticalDice(createBarbarian(17))).toBe(3)
    })
  })

  describe('getLayOnHandsPool', () => {
    it('returns 0 for non-paladin', () => {
      expect(getLayOnHandsPool(createFighter(5))).toBe(0)
    })

    it('equals 5 * level', () => {
      expect(getLayOnHandsPool(createPaladin(1))).toBe(5)
      expect(getLayOnHandsPool(createPaladin(5))).toBe(25)
      expect(getLayOnHandsPool(createPaladin(20))).toBe(100)
    })
  })

  describe('getBardicInspirationDie', () => {
    it('returns null for non-bard', () => {
      expect(getBardicInspirationDie(createFighter(5))).toBe(null)
    })

    it('scales with level', () => {
      expect(getBardicInspirationDie(createBard(1))).toBe('1d6')
      expect(getBardicInspirationDie(createBard(5))).toBe('1d8')
      expect(getBardicInspirationDie(createBard(10))).toBe('1d10')
      expect(getBardicInspirationDie(createBard(15))).toBe('1d12')
    })
  })

  describe('getAuraRadius', () => {
    it('returns 0 for non-paladin', () => {
      expect(getAuraRadius(createFighter(5))).toBe(0)
    })

    it('scales with level', () => {
      expect(getAuraRadius(createPaladin(5))).toBe(0)
      expect(getAuraRadius(createPaladin(6))).toBe(10)
      expect(getAuraRadius(createPaladin(18))).toBe(30)
    })
  })
})

describe('hasClassFeatureSync', () => {
  it('returns true when class has feature at level', () => {
    expect(hasClassFeatureSync(createRogue(5), 'uncannyDodge')).toBe(true)
    expect(hasClassFeatureSync(createRogue(7), 'evasion')).toBe(true)
    expect(hasClassFeatureSync(createBarbarian(2), 'recklessAttack')).toBe(true)
    expect(hasClassFeatureSync(createPaladin(6), 'auraOfProtection')).toBe(true)
  })

  it('returns false when below required level', () => {
    expect(hasClassFeatureSync(createRogue(4), 'uncannyDodge')).toBe(false)
    expect(hasClassFeatureSync(createRogue(6), 'evasion')).toBe(false)
    expect(hasClassFeatureSync(createBarbarian(1), 'recklessAttack')).toBe(false)
  })

  it('returns false for wrong class', () => {
    expect(hasClassFeatureSync(createFighter(7), 'evasion')).toBe(false)
    expect(hasClassFeatureSync(createRogue(9), 'brutalCritical')).toBe(false)
  })

  it('returns false for missing class/level', () => {
    expect(hasClassFeatureSync({}, 'evasion')).toBe(false)
    expect(hasClassFeatureSync({ class: 'rogue' }, 'evasion')).toBe(false)
  })
})
