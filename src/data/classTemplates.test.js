/**
 * Tests for class template definitions
 */

import { describe, it, expect } from 'vitest'
import {
  CLASS_TEMPLATES,
  FIGHTING_STYLES,
  MARTIAL_ARTS_DIE,
  RAGE_DAMAGE,
  RAGES_PER_DAY,
  SNEAK_ATTACK_DICE,
  EXTRA_ATTACKS,
  PROFICIENCY_BONUS,
  KI_POINTS,
  LAY_ON_HANDS_POOL,
  METAMAGIC,
  getClassFeaturesAtLevel,
  hasFeature,
  getNumAttacks,
  initializeClassResources
} from './classTemplates.js'

describe('CLASS_TEMPLATES', () => {
  it('contains all 12 classes', () => {
    const classes = Object.keys(CLASS_TEMPLATES)

    expect(classes).toContain('fighter')
    expect(classes).toContain('rogue')
    expect(classes).toContain('barbarian')
    expect(classes).toContain('paladin')
    expect(classes).toContain('ranger')
    expect(classes).toContain('monk')
    expect(classes).toContain('wizard')
    expect(classes).toContain('sorcerer')
    expect(classes).toContain('warlock')
    expect(classes).toContain('cleric')
    expect(classes).toContain('bard')
    expect(classes).toContain('druid')
    expect(classes.length).toBe(12)
  })

  it('each class has required properties', () => {
    for (const [className, template] of Object.entries(CLASS_TEMPLATES)) {
      expect(template.name).toBeDefined()
      expect(template.hitDie).toBeGreaterThanOrEqual(6)
      expect(template.hitDie).toBeLessThanOrEqual(12)
      expect(template.primaryAbility).toBeDefined()
      expect(template.savingThrows).toHaveLength(2)
      expect(template.features).toBeDefined()
      expect(template.resources).toBeTypeOf('function')
      expect(template.numAttacks).toBeTypeOf('function')
    }
  })
})

describe('FIGHTING_STYLES', () => {
  it('contains all fighting styles', () => {
    expect(FIGHTING_STYLES.archery.attackBonus).toBe(2)
    expect(FIGHTING_STYLES.defense.acBonus).toBe(1)
    expect(FIGHTING_STYLES.dueling.damageBonus).toBe(2)
    expect(FIGHTING_STYLES.greatWeaponFighting.rerollDamage).toEqual([1, 2])
    expect(FIGHTING_STYLES.twoWeaponFighting.offHandDamageBonus).toBe(true)
  })
})

describe('Scaling tables', () => {
  describe('MARTIAL_ARTS_DIE', () => {
    it('scales correctly', () => {
      expect(MARTIAL_ARTS_DIE[1]).toBe('1d4')
      expect(MARTIAL_ARTS_DIE[5]).toBe('1d6')
      expect(MARTIAL_ARTS_DIE[11]).toBe('1d8')
      expect(MARTIAL_ARTS_DIE[17]).toBe('1d10')
    })
  })

  describe('RAGE_DAMAGE', () => {
    it('scales correctly', () => {
      expect(RAGE_DAMAGE[1]).toBe(2)
      expect(RAGE_DAMAGE[9]).toBe(3)
      expect(RAGE_DAMAGE[16]).toBe(4)
    })
  })

  describe('RAGES_PER_DAY', () => {
    it('scales correctly', () => {
      expect(RAGES_PER_DAY[1]).toBe(2)
      expect(RAGES_PER_DAY[3]).toBe(3)
      expect(RAGES_PER_DAY[6]).toBe(4)
      expect(RAGES_PER_DAY[12]).toBe(5)
      expect(RAGES_PER_DAY[17]).toBe(6)
      expect(RAGES_PER_DAY[20]).toBe(Infinity)
    })
  })

  describe('SNEAK_ATTACK_DICE', () => {
    it('equals ceil(level/2)', () => {
      expect(SNEAK_ATTACK_DICE(1)).toBe(1)
      expect(SNEAK_ATTACK_DICE(2)).toBe(1)
      expect(SNEAK_ATTACK_DICE(3)).toBe(2)
      expect(SNEAK_ATTACK_DICE(5)).toBe(3)
      expect(SNEAK_ATTACK_DICE(10)).toBe(5)
      expect(SNEAK_ATTACK_DICE(20)).toBe(10)
    })
  })

  describe('EXTRA_ATTACKS', () => {
    it('fighter gets most attacks', () => {
      expect(EXTRA_ATTACKS.fighter[5]).toBe(2)
      expect(EXTRA_ATTACKS.fighter[11]).toBe(3)
      expect(EXTRA_ATTACKS.fighter[20]).toBe(4)
    })

    it('other martials cap at 2', () => {
      expect(EXTRA_ATTACKS.barbarian[5]).toBe(2)
      expect(EXTRA_ATTACKS.paladin[5]).toBe(2)
      expect(EXTRA_ATTACKS.ranger[5]).toBe(2)
      expect(EXTRA_ATTACKS.monk[5]).toBe(2)
    })
  })

  describe('PROFICIENCY_BONUS', () => {
    it('scales with level', () => {
      expect(PROFICIENCY_BONUS(1)).toBe(2)
      expect(PROFICIENCY_BONUS(5)).toBe(3)
      expect(PROFICIENCY_BONUS(9)).toBe(4)
      expect(PROFICIENCY_BONUS(13)).toBe(5)
      expect(PROFICIENCY_BONUS(17)).toBe(6)
    })
  })

  describe('KI_POINTS', () => {
    it('equals monk level', () => {
      expect(KI_POINTS(1)).toBe(1)
      expect(KI_POINTS(5)).toBe(5)
      expect(KI_POINTS(20)).toBe(20)
    })
  })

  describe('LAY_ON_HANDS_POOL', () => {
    it('equals 5 * paladin level', () => {
      expect(LAY_ON_HANDS_POOL(1)).toBe(5)
      expect(LAY_ON_HANDS_POOL(5)).toBe(25)
      expect(LAY_ON_HANDS_POOL(20)).toBe(100)
    })
  })
})

describe('METAMAGIC', () => {
  it('has correct costs', () => {
    expect(METAMAGIC.quickened.cost).toBe(2)
    expect(METAMAGIC.twinned.cost).toBe('spellLevel')
    expect(METAMAGIC.heightened.cost).toBe(3)
    expect(METAMAGIC.empowered.cost).toBe(1)
  })
})

describe('getClassFeaturesAtLevel', () => {
  it('returns all features up to level', () => {
    const features = getClassFeaturesAtLevel('fighter', 5)

    expect(features).toContain('fightingStyle')
    expect(features).toContain('secondWind')
    expect(features).toContain('actionSurge')
    expect(features).toContain('extraAttack')
  })

  it('does not include higher level features', () => {
    const features = getClassFeaturesAtLevel('fighter', 5)

    expect(features).not.toContain('indomitable') // Level 9
  })

  it('returns empty array for invalid class', () => {
    const features = getClassFeaturesAtLevel('invalid', 5)

    expect(features).toEqual([])
  })

  it('works for all classes', () => {
    for (const className of Object.keys(CLASS_TEMPLATES)) {
      const features = getClassFeaturesAtLevel(className, 20)
      expect(features.length).toBeGreaterThan(0)
    }
  })
})

describe('hasFeature', () => {
  it('returns true when class has feature at level', () => {
    expect(hasFeature('fighter', 1, 'secondWind')).toBe(true)
    expect(hasFeature('fighter', 2, 'actionSurge')).toBe(true)
    expect(hasFeature('rogue', 1, 'sneakAttack')).toBe(true)
    expect(hasFeature('rogue', 5, 'uncannyDodge')).toBe(true)
    expect(hasFeature('barbarian', 1, 'rage')).toBe(true)
  })

  it('returns false when below required level', () => {
    expect(hasFeature('fighter', 1, 'actionSurge')).toBe(false)
    expect(hasFeature('rogue', 4, 'uncannyDodge')).toBe(false)
    expect(hasFeature('fighter', 8, 'indomitable')).toBe(false)
  })

  it('returns false for invalid class', () => {
    expect(hasFeature('invalid', 5, 'secondWind')).toBe(false)
  })
})

describe('getNumAttacks', () => {
  it('returns correct attacks for fighter', () => {
    expect(getNumAttacks('fighter', 1)).toBe(1)
    expect(getNumAttacks('fighter', 5)).toBe(2)
    expect(getNumAttacks('fighter', 11)).toBe(3)
    expect(getNumAttacks('fighter', 20)).toBe(4)
  })

  it('returns correct attacks for other martials', () => {
    expect(getNumAttacks('barbarian', 4)).toBe(1)
    expect(getNumAttacks('barbarian', 5)).toBe(2)
    expect(getNumAttacks('paladin', 5)).toBe(2)
    expect(getNumAttacks('ranger', 5)).toBe(2)
    expect(getNumAttacks('monk', 5)).toBe(2)
  })

  it('returns 1 for casters', () => {
    expect(getNumAttacks('wizard', 20)).toBe(1)
    expect(getNumAttacks('sorcerer', 20)).toBe(1)
    expect(getNumAttacks('cleric', 20)).toBe(1)
    expect(getNumAttacks('bard', 20)).toBe(1)
  })

  it('returns 1 for invalid class', () => {
    expect(getNumAttacks('invalid', 5)).toBe(1)
  })
})

describe('initializeClassResources', () => {
  it('initializes fighter resources', () => {
    const resources = initializeClassResources('fighter', 5)

    expect(resources.secondWind.max).toBe(1)
    expect(resources.secondWind.current).toBe(1)
    expect(resources.secondWind.restType).toBe('short')
    expect(resources.actionSurge.max).toBe(1)
    expect(resources.actionSurge.current).toBe(1)
  })

  it('initializes barbarian rage', () => {
    const resources = initializeClassResources('barbarian', 5)

    expect(resources.rage.max).toBe(3)
    expect(resources.rage.current).toBe(3)
    expect(resources.rage.restType).toBe('long')
  })

  it('initializes monk ki', () => {
    const resources = initializeClassResources('monk', 10)

    expect(resources.ki.max).toBe(10)
    expect(resources.ki.current).toBe(10)
    expect(resources.ki.restType).toBe('short')
  })

  it('initializes paladin lay on hands', () => {
    const resources = initializeClassResources('paladin', 5)

    expect(resources.layOnHands.max).toBe(25)
    expect(resources.layOnHands.current).toBe(25)
  })

  it('initializes sorcery points', () => {
    const resources = initializeClassResources('sorcerer', 8)

    expect(resources.sorceryPoints.max).toBe(8)
    expect(resources.sorceryPoints.current).toBe(8)
  })

  it('scales fighter indomitable', () => {
    expect(initializeClassResources('fighter', 8).indomitable.max).toBe(0)
    expect(initializeClassResources('fighter', 9).indomitable.max).toBe(1)
    expect(initializeClassResources('fighter', 13).indomitable.max).toBe(2)
    expect(initializeClassResources('fighter', 17).indomitable.max).toBe(3)
  })

  it('scales fighter action surge', () => {
    expect(initializeClassResources('fighter', 16).actionSurge.max).toBe(1)
    expect(initializeClassResources('fighter', 17).actionSurge.max).toBe(2)
  })

  it('returns empty object for invalid class', () => {
    const resources = initializeClassResources('invalid', 5)

    expect(resources).toEqual({})
  })

  it('uses CHA mod for bard inspiration', () => {
    const resources = initializeClassResources('bard', 5, { charisma: 4 })

    expect(resources.bardicInspiration.max).toBe(4) // CHA mod
  })
})
