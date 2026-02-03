import { describe, it, expect, beforeEach } from 'vitest'
import {
  CONDITIONS,
  hasCondition,
  applyCondition,
  removeCondition,
  tickConditions,
  canAct,
  getAttackModifier,
  getDefenseModifier,
  getCombinedModifier,
  isImmuneToCondition
} from './conditions.js'

describe('CONDITIONS', () => {
  it('defines all expected conditions', () => {
    expect(CONDITIONS.prone).toBeDefined()
    expect(CONDITIONS.stunned).toBeDefined()
    expect(CONDITIONS.poisoned).toBeDefined()
    expect(CONDITIONS.restrained).toBeDefined()
    expect(CONDITIONS.blinded).toBeDefined()
    expect(CONDITIONS.paralyzed).toBeDefined()
    expect(CONDITIONS.frightened).toBeDefined()
    expect(CONDITIONS.charmed).toBeDefined()
    expect(CONDITIONS.incapacitated).toBeDefined()
  })

  it('stunned and paralyzed have autoCrit', () => {
    expect(CONDITIONS.stunned.autoCrit).toBe(true)
    expect(CONDITIONS.paralyzed.autoCrit).toBe(true)
    expect(CONDITIONS.poisoned.autoCrit).toBeUndefined()
  })
})

describe('hasCondition', () => {
  it('returns true if combatant has condition', () => {
    const combatant = {
      conditions: [{ type: 'poisoned', duration: 2, source: 'Spider' }]
    }
    expect(hasCondition(combatant, 'poisoned')).toBe(true)
  })

  it('returns false if combatant lacks condition', () => {
    const combatant = {
      conditions: [{ type: 'poisoned', duration: 2, source: 'Spider' }]
    }
    expect(hasCondition(combatant, 'stunned')).toBe(false)
  })

  it('returns false if combatant has no conditions array', () => {
    const combatant = {}
    expect(hasCondition(combatant, 'poisoned')).toBe(false)
  })
})

describe('isImmuneToCondition', () => {
  it('returns true if combatant is immune', () => {
    const combatant = {
      conditionImmunities: ['poisoned', 'frightened']
    }
    expect(isImmuneToCondition(combatant, 'poisoned')).toBe(true)
    expect(isImmuneToCondition(combatant, 'frightened')).toBe(true)
  })

  it('returns false if combatant is not immune', () => {
    const combatant = {
      conditionImmunities: ['poisoned']
    }
    expect(isImmuneToCondition(combatant, 'stunned')).toBe(false)
  })

  it('returns false if no immunities defined', () => {
    const combatant = {}
    expect(isImmuneToCondition(combatant, 'poisoned')).toBe(false)
  })
})

describe('applyCondition', () => {
  let combatant

  beforeEach(() => {
    combatant = { conditions: [] }
  })

  it('applies new condition and returns applied', () => {
    const result = applyCondition(combatant, {
      type: 'poisoned',
      duration: 3,
      source: 'Spider'
    })
    expect(result).toBe('applied')
    expect(combatant.conditions).toHaveLength(1)
    expect(combatant.conditions[0].type).toBe('poisoned')
  })

  it('returns immune if combatant is immune', () => {
    combatant.conditionImmunities = ['poisoned']
    const result = applyCondition(combatant, {
      type: 'poisoned',
      duration: 3,
      source: 'Spider'
    })
    expect(result).toBe('immune')
    expect(combatant.conditions).toHaveLength(0)
  })

  it('returns refreshed if condition already exists', () => {
    applyCondition(combatant, { type: 'poisoned', duration: 2, source: 'Spider' })
    const result = applyCondition(combatant, {
      type: 'poisoned',
      duration: 5,
      source: 'Other'
    })
    expect(result).toBe('refreshed')
    expect(combatant.conditions).toHaveLength(1)
    expect(combatant.conditions[0].duration).toBe(5) // Updated to longer
  })

  it('creates conditions array if not present', () => {
    const c = {}
    applyCondition(c, { type: 'stunned', duration: 1, source: 'Ghoul' })
    expect(c.conditions).toHaveLength(1)
  })
})

describe('removeCondition', () => {
  it('removes existing condition', () => {
    const combatant = {
      conditions: [
        { type: 'poisoned', duration: 2 },
        { type: 'stunned', duration: 1 }
      ]
    }
    const result = removeCondition(combatant, 'poisoned')
    expect(result).toBe(true)
    expect(combatant.conditions).toHaveLength(1)
    expect(combatant.conditions[0].type).toBe('stunned')
  })

  it('returns false if condition not found', () => {
    const combatant = { conditions: [] }
    const result = removeCondition(combatant, 'poisoned')
    expect(result).toBe(false)
  })
})

describe('tickConditions', () => {
  it('decrements duration and removes expired conditions', () => {
    const combatant = {
      conditions: [
        { type: 'poisoned', duration: 2 },
        { type: 'stunned', duration: 1 }
      ]
    }
    const expired = tickConditions(combatant)
    expect(expired).toEqual(['stunned'])
    expect(combatant.conditions).toHaveLength(1)
    expect(combatant.conditions[0].type).toBe('poisoned')
    expect(combatant.conditions[0].duration).toBe(1)
  })

  it('keeps permanent conditions (null duration)', () => {
    const combatant = {
      conditions: [{ type: 'charmed', duration: null }]
    }
    const expired = tickConditions(combatant)
    expect(expired).toEqual([])
    expect(combatant.conditions).toHaveLength(1)
  })
})

describe('canAct', () => {
  it('returns true for combatant with no conditions', () => {
    expect(canAct({ conditions: [] })).toBe(true)
    expect(canAct({})).toBe(true)
  })

  it('returns true for conditions that allow acting', () => {
    const combatant = {
      conditions: [{ type: 'poisoned' }, { type: 'frightened' }]
    }
    expect(canAct(combatant)).toBe(true)
  })

  it('returns false for stunned', () => {
    const combatant = { conditions: [{ type: 'stunned' }] }
    expect(canAct(combatant)).toBe(false)
  })

  it('returns false for paralyzed', () => {
    const combatant = { conditions: [{ type: 'paralyzed' }] }
    expect(canAct(combatant)).toBe(false)
  })

  it('returns false for incapacitated', () => {
    const combatant = { conditions: [{ type: 'incapacitated' }] }
    expect(canAct(combatant)).toBe(false)
  })
})

describe('getAttackModifier', () => {
  it('returns normal for no conditions', () => {
    expect(getAttackModifier({ conditions: [] })).toBe('normal')
    expect(getAttackModifier({})).toBe('normal')
  })

  it('returns disadvantage for poisoned', () => {
    const combatant = { conditions: [{ type: 'poisoned' }] }
    expect(getAttackModifier(combatant)).toBe('disadvantage')
  })

  it('returns disadvantage for blinded', () => {
    const combatant = { conditions: [{ type: 'blinded' }] }
    expect(getAttackModifier(combatant)).toBe('disadvantage')
  })

  it('returns disadvantage for frightened', () => {
    const combatant = { conditions: [{ type: 'frightened' }] }
    expect(getAttackModifier(combatant)).toBe('disadvantage')
  })
})

describe('getDefenseModifier', () => {
  it('returns normal for no conditions', () => {
    expect(getDefenseModifier({ conditions: [] })).toBe('normal')
  })

  it('returns advantage against stunned', () => {
    const target = { conditions: [{ type: 'stunned' }] }
    expect(getDefenseModifier(target)).toBe('advantage')
  })

  it('returns advantage against paralyzed', () => {
    const target = { conditions: [{ type: 'paralyzed' }] }
    expect(getDefenseModifier(target)).toBe('advantage')
  })

  it('handles prone differently for melee vs ranged', () => {
    const target = { conditions: [{ type: 'prone' }] }
    expect(getDefenseModifier(target, 'melee')).toBe('advantage')
    expect(getDefenseModifier(target, 'ranged')).toBe('disadvantage')
  })
})

describe('getCombinedModifier', () => {
  it('cancels advantage and disadvantage', () => {
    const attacker = { conditions: [{ type: 'poisoned' }] } // disadvantage
    const target = { conditions: [{ type: 'stunned' }] } // gives attacker advantage
    expect(getCombinedModifier(attacker, target)).toBe('normal')
  })

  it('returns advantage when target is stunned and attacker has no debuffs', () => {
    const attacker = { conditions: [] }
    const target = { conditions: [{ type: 'stunned' }] }
    expect(getCombinedModifier(attacker, target)).toBe('advantage')
  })

  it('returns disadvantage when attacker is poisoned and target is normal', () => {
    const attacker = { conditions: [{ type: 'poisoned' }] }
    const target = { conditions: [] }
    expect(getCombinedModifier(attacker, target)).toBe('disadvantage')
  })
})
