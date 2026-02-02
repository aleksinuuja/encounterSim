import { describe, it, expect } from 'vitest'
import {
  parseDiceNotation,
  rollDie,
  rollDice,
  rollDamage,
  rollD20,
  rollD20WithAdvantage,
  rollD20WithDisadvantage,
  rollD20WithModifier
} from './dice.js'

describe('parseDiceNotation', () => {
  it('parses simple notation like 1d8', () => {
    const result = parseDiceNotation('1d8')
    expect(result).toEqual({ count: 1, sides: 8, modifier: 0 })
  })

  it('parses notation with positive modifier', () => {
    const result = parseDiceNotation('2d6+3')
    expect(result).toEqual({ count: 2, sides: 6, modifier: 3 })
  })

  it('parses notation with negative modifier', () => {
    const result = parseDiceNotation('1d12-2')
    expect(result).toEqual({ count: 1, sides: 12, modifier: -2 })
  })

  it('throws on invalid notation', () => {
    expect(() => parseDiceNotation('invalid')).toThrow('Invalid dice notation')
    expect(() => parseDiceNotation('d20')).toThrow('Invalid dice notation')
  })
})

describe('rollDie', () => {
  it('returns values within range', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDie(6)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(6)
    }
  })

  it('returns integers', () => {
    for (let i = 0; i < 20; i++) {
      const result = rollDie(20)
      expect(Number.isInteger(result)).toBe(true)
    }
  })
})

describe('rollDice', () => {
  it('returns total with correct number of rolls', () => {
    const result = rollDice('3d6')
    expect(result.rolls).toHaveLength(3)
    expect(result.modifier).toBe(0)
    expect(result.total).toBe(result.rolls.reduce((a, b) => a + b, 0))
  })

  it('includes modifier in total', () => {
    const result = rollDice('1d4+5')
    expect(result.modifier).toBe(5)
    expect(result.total).toBe(result.rolls[0] + 5)
  })
})

describe('rollDamage', () => {
  it('doubles dice on critical hit', () => {
    // Roll many times to verify crits produce higher average
    let normalTotal = 0
    let critTotal = 0
    const iterations = 1000

    for (let i = 0; i < iterations; i++) {
      normalTotal += rollDamage('1d6+2', false)
      critTotal += rollDamage('1d6+2', true)
    }

    // Crit should average ~7 (2d6+2), normal should average ~5.5 (1d6+2)
    expect(critTotal / iterations).toBeGreaterThan(normalTotal / iterations)
  })
})

describe('rollD20', () => {
  it('returns values 1-20', () => {
    const results = new Set()
    for (let i = 0; i < 1000; i++) {
      const result = rollD20()
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(20)
      results.add(result)
    }
    // Should hit most values in 1000 rolls
    expect(results.size).toBeGreaterThan(15)
  })
})

describe('rollD20WithAdvantage', () => {
  it('returns higher of two rolls', () => {
    for (let i = 0; i < 50; i++) {
      const { result, rolls } = rollD20WithAdvantage()
      expect(rolls).toHaveLength(2)
      expect(result).toBe(Math.max(rolls[0], rolls[1]))
    }
  })

  it('produces higher average than normal roll', () => {
    let advantageTotal = 0
    let normalTotal = 0
    const iterations = 1000

    for (let i = 0; i < iterations; i++) {
      advantageTotal += rollD20WithAdvantage().result
      normalTotal += rollD20()
    }

    // Advantage should average ~13.8, normal ~10.5
    expect(advantageTotal / iterations).toBeGreaterThan(normalTotal / iterations)
  })
})

describe('rollD20WithDisadvantage', () => {
  it('returns lower of two rolls', () => {
    for (let i = 0; i < 50; i++) {
      const { result, rolls } = rollD20WithDisadvantage()
      expect(rolls).toHaveLength(2)
      expect(result).toBe(Math.min(rolls[0], rolls[1]))
    }
  })

  it('produces lower average than normal roll', () => {
    let disadvantageTotal = 0
    let normalTotal = 0
    const iterations = 1000

    for (let i = 0; i < iterations; i++) {
      disadvantageTotal += rollD20WithDisadvantage().result
      normalTotal += rollD20()
    }

    // Disadvantage should average ~7.2, normal ~10.5
    expect(disadvantageTotal / iterations).toBeLessThan(normalTotal / iterations)
  })
})

describe('rollD20WithModifier', () => {
  it('uses advantage when specified', () => {
    const { result, rolls, modifier } = rollD20WithModifier('advantage')
    expect(modifier).toBe('advantage')
    expect(rolls).toHaveLength(2)
    expect(result).toBe(Math.max(rolls[0], rolls[1]))
  })

  it('uses disadvantage when specified', () => {
    const { result, rolls, modifier } = rollD20WithModifier('disadvantage')
    expect(modifier).toBe('disadvantage')
    expect(rolls).toHaveLength(2)
    expect(result).toBe(Math.min(rolls[0], rolls[1]))
  })

  it('uses normal roll when specified', () => {
    const { result, rolls, modifier } = rollD20WithModifier('normal')
    expect(modifier).toBe('normal')
    expect(rolls).toHaveLength(1)
    expect(result).toBe(rolls[0])
  })
})
