/**
 * Tests for damage calculation utilities
 */

import { describe, it, expect } from 'vitest'
import {
  applyDamage,
  shouldUseLegendaryResistance,
  useLegendaryResistance
} from './damage.js'

describe('applyDamage', () => {
  it('returns full damage when no immunities or resistances', () => {
    const target = {}
    const result = applyDamage(target, 20, 'fire')

    expect(result.finalDamage).toBe(20)
    expect(result.immune).toBe(false)
    expect(result.resistant).toBe(false)
  })

  it('returns 0 damage when immune', () => {
    const target = { damageImmunities: ['fire', 'cold'] }
    const result = applyDamage(target, 50, 'fire')

    expect(result.finalDamage).toBe(0)
    expect(result.immune).toBe(true)
    expect(result.resistant).toBe(false)
  })

  it('returns half damage when resistant', () => {
    const target = { damageResistances: ['fire'] }
    const result = applyDamage(target, 20, 'fire')

    expect(result.finalDamage).toBe(10)
    expect(result.immune).toBe(false)
    expect(result.resistant).toBe(true)
  })

  it('immunity takes precedence over resistance', () => {
    const target = {
      damageImmunities: ['fire'],
      damageResistances: ['fire']
    }
    const result = applyDamage(target, 20, 'fire')

    expect(result.finalDamage).toBe(0)
    expect(result.immune).toBe(true)
  })

  it('does not affect other damage types', () => {
    const target = { damageImmunities: ['fire'] }

    const fireResult = applyDamage(target, 20, 'fire')
    expect(fireResult.finalDamage).toBe(0)
    expect(fireResult.immune).toBe(true)

    const coldResult = applyDamage(target, 20, 'cold')
    expect(coldResult.finalDamage).toBe(20)
    expect(coldResult.immune).toBe(false)
  })
})

describe('shouldUseLegendaryResistance', () => {
  it('returns false if no legendary resistances', () => {
    const target = {}
    expect(shouldUseLegendaryResistance(target, 'paralyzed')).toBe(false)
  })

  it('returns false if legendary resistances depleted', () => {
    const target = { currentLegendaryResistances: 0 }
    expect(shouldUseLegendaryResistance(target, 'paralyzed')).toBe(false)
  })

  it('returns true for dangerous conditions', () => {
    const target = { currentLegendaryResistances: 1 }

    expect(shouldUseLegendaryResistance(target, 'paralyzed')).toBe(true)
    expect(shouldUseLegendaryResistance(target, 'stunned')).toBe(true)
    expect(shouldUseLegendaryResistance(target, 'petrified')).toBe(true)
  })

  it('returns true for annoying conditions when plenty left', () => {
    const target = { currentLegendaryResistances: 3 }

    expect(shouldUseLegendaryResistance(target, 'frightened')).toBe(true)
    expect(shouldUseLegendaryResistance(target, 'charmed')).toBe(true)
  })

  it('returns false for annoying conditions when low on resistances', () => {
    const target = { currentLegendaryResistances: 1 }

    expect(shouldUseLegendaryResistance(target, 'frightened')).toBe(false)
    expect(shouldUseLegendaryResistance(target, 'charmed')).toBe(false)
  })

  it('returns true for high damage saves when plenty left', () => {
    const target = { currentLegendaryResistances: 3, maxHp: 100 }

    // 30 damage is >= 25% of 100 HP
    expect(shouldUseLegendaryResistance(target, null, 30)).toBe(true)
  })

  it('returns false for low damage saves', () => {
    const target = { currentLegendaryResistances: 3, maxHp: 100 }

    // 10 damage is < 25% of 100 HP
    expect(shouldUseLegendaryResistance(target, null, 10)).toBe(false)
  })
})

describe('useLegendaryResistance', () => {
  it('decrements legendary resistances and returns true', () => {
    const target = { currentLegendaryResistances: 3 }

    const result = useLegendaryResistance(target)

    expect(result).toBe(true)
    expect(target.currentLegendaryResistances).toBe(2)
  })

  it('returns false if no resistances left', () => {
    const target = { currentLegendaryResistances: 0 }

    const result = useLegendaryResistance(target)

    expect(result).toBe(false)
    expect(target.currentLegendaryResistances).toBe(0)
  })

  it('returns false if no legendary resistances defined', () => {
    const target = {}

    const result = useLegendaryResistance(target)

    expect(result).toBe(false)
  })
})
