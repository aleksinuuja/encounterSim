/**
 * Tests for abstract positioning system
 */

import { describe, it, expect } from 'vitest'
import {
  getDefaultPosition,
  getAllAtPosition,
  getEnemiesAtPosition,
  getEnemiesByPosition,
  selectSphereTargets,
  selectSphereTargetsWithFriendlyFire,
  selectConeTargets,
  selectLineTargets,
  selectAOETargets,
  countEnemiesByPosition
} from './positioning.js'

function createFighter(overrides = {}) {
  return {
    name: 'Fighter',
    isPlayer: true,
    isDead: false,
    isUnconscious: false,
    attackBonus: 7,
    position: 'front',
    ...overrides
  }
}

function createArcher(overrides = {}) {
  return {
    name: 'Archer',
    isPlayer: true,
    isDead: false,
    isUnconscious: false,
    attackBonus: 5,
    attackType: 'ranged',
    position: 'back',
    ...overrides
  }
}

function createOrc(overrides = {}) {
  return {
    name: 'Orc',
    isPlayer: false,
    isDead: false,
    isUnconscious: false,
    attackBonus: 5,
    position: 'front',
    ...overrides
  }
}

function createGoblinArcher(overrides = {}) {
  return {
    name: 'Goblin Archer',
    isPlayer: false,
    isDead: false,
    isUnconscious: false,
    attackBonus: 4,
    attackType: 'ranged',
    position: 'back',
    ...overrides
  }
}

describe('getDefaultPosition', () => {
  it('returns explicit position if set', () => {
    const combatant = { position: 'back' }
    expect(getDefaultPosition(combatant)).toBe('back')
  })

  it('returns back for ranged attackers', () => {
    const combatant = { attackType: 'ranged' }
    expect(getDefaultPosition(combatant)).toBe('back')
  })

  it('returns back for casters with low attack bonus', () => {
    const combatant = { spells: ['fireball'], attackBonus: 2 }
    expect(getDefaultPosition(combatant)).toBe('back')
  })

  it('returns front for melee combatants', () => {
    const combatant = { attackBonus: 7 }
    expect(getDefaultPosition(combatant)).toBe('front')
  })

  it('returns front for healers (clerics wade in)', () => {
    const combatant = { healingDice: '1d8+3', spells: ['cure-wounds'] }
    expect(getDefaultPosition(combatant)).toBe('front')
  })
})

describe('getEnemiesAtPosition', () => {
  it('returns enemies at specified position', () => {
    const combatants = [
      createFighter(),
      createOrc({ name: 'Orc 1' }),
      createOrc({ name: 'Orc 2' }),
      createGoblinArcher()
    ]

    const frontEnemies = getEnemiesAtPosition(combatants, true, 'front')
    expect(frontEnemies.length).toBe(2)
    expect(frontEnemies.every(e => e.name.startsWith('Orc'))).toBe(true)
  })

  it('excludes dead and unconscious enemies', () => {
    const combatants = [
      createFighter(),
      createOrc({ name: 'Orc 1' }),
      createOrc({ name: 'Orc 2', isDead: true }),
      createOrc({ name: 'Orc 3', isUnconscious: true })
    ]

    const frontEnemies = getEnemiesAtPosition(combatants, true, 'front')
    expect(frontEnemies.length).toBe(1)
    expect(frontEnemies[0].name).toBe('Orc 1')
  })
})

describe('getEnemiesByPosition', () => {
  it('groups enemies by position', () => {
    const combatants = [
      createFighter(),
      createArcher(),
      createOrc({ name: 'Orc 1' }),
      createOrc({ name: 'Orc 2' }),
      createGoblinArcher({ name: 'Goblin 1' }),
      createGoblinArcher({ name: 'Goblin 2' })
    ]

    const { front, back } = getEnemiesByPosition(combatants, true)

    expect(front.length).toBe(2)
    expect(back.length).toBe(2)
    expect(front.every(e => e.name.startsWith('Orc'))).toBe(true)
    expect(back.every(e => e.name.startsWith('Goblin'))).toBe(true)
  })
})

describe('selectSphereTargets', () => {
  it('selects position with more enemies', () => {
    const combatants = [
      createFighter(),
      createOrc({ name: 'Orc 1' }),
      createOrc({ name: 'Orc 2' }),
      createOrc({ name: 'Orc 3' }),
      createGoblinArcher()
    ]

    const { targets, position } = selectSphereTargets(combatants, true)

    expect(position).toBe('front')
    expect(targets.length).toBe(3)
  })

  it('prefers front on tie', () => {
    const combatants = [
      createFighter(),
      createOrc({ name: 'Orc 1' }),
      createGoblinArcher({ name: 'Goblin 1' })
    ]

    const { position } = selectSphereTargets(combatants, true)

    expect(position).toBe('front')
  })
})

describe('selectConeTargets', () => {
  it('only hits front line', () => {
    const combatants = [
      createFighter(),
      createOrc({ name: 'Orc 1' }),
      createOrc({ name: 'Orc 2' }),
      createGoblinArcher({ name: 'Goblin 1' }),
      createGoblinArcher({ name: 'Goblin 2' })
    ]

    const { targets, position } = selectConeTargets(combatants, true)

    expect(position).toBe('front')
    expect(targets.length).toBe(2)
    expect(targets.every(e => e.name.startsWith('Orc'))).toBe(true)
  })

  it('clips one back target when no front targets', () => {
    const combatants = [
      createFighter(),
      createGoblinArcher({ name: 'Goblin 1' }),
      createGoblinArcher({ name: 'Goblin 2' })
    ]

    const { targets, position } = selectConeTargets(combatants, true)

    expect(position).toBe('back')
    expect(targets.length).toBe(1)
  })
})

describe('selectLineTargets', () => {
  it('hits one target from each position', () => {
    const combatants = [
      createFighter(),
      createOrc({ name: 'Orc 1' }),
      createOrc({ name: 'Orc 2' }),
      createGoblinArcher({ name: 'Goblin 1' }),
      createGoblinArcher({ name: 'Goblin 2' })
    ]

    const { targets, positions } = selectLineTargets(combatants, true)

    expect(targets.length).toBe(2)
    expect(positions).toContain('front')
    expect(positions).toContain('back')
  })
})

describe('selectAOETargets', () => {
  it('uses sphere targeting for fireball', () => {
    const spell = { aoeShape: 'sphere' }
    const combatants = [
      createFighter(),
      createOrc({ name: 'Orc 1' }),
      createOrc({ name: 'Orc 2' }),
      createGoblinArcher()
    ]

    const result = selectAOETargets(spell, combatants, true)

    expect(result.shouldCast).toBe(true)
    expect(result.targets.length).toBe(2)
    expect(result.position).toBe('front')
  })

  it('uses cone targeting for cone spells', () => {
    const spell = { aoeShape: 'cone' }
    const combatants = [
      createFighter(),
      createOrc({ name: 'Orc 1' }),
      createGoblinArcher({ name: 'Goblin 1' }),
      createGoblinArcher({ name: 'Goblin 2' })
    ]

    const result = selectAOETargets(spell, combatants, true)

    expect(result.shouldCast).toBe(true)
    expect(result.targets.length).toBe(1)
    expect(result.position).toBe('front')
  })

  it('returns shouldCast false when not worth it', () => {
    const spell = { aoeShape: 'sphere' }
    const combatants = [
      createFighter(),
      createOrc()
    ]

    const result = selectAOETargets(spell, combatants, true)

    expect(result.shouldCast).toBe(false)
    expect(result.targets.length).toBe(1)
  })
})

describe('countEnemiesByPosition', () => {
  it('returns correct counts', () => {
    const combatants = [
      createFighter(),
      createOrc({ name: 'Orc 1' }),
      createOrc({ name: 'Orc 2' }),
      createGoblinArcher()
    ]

    const counts = countEnemiesByPosition(combatants, true)

    expect(counts.frontCount).toBe(2)
    expect(counts.backCount).toBe(1)
    expect(counts.total).toBe(3)
  })
})

describe('getAllAtPosition', () => {
  it('returns all combatants at position regardless of side', () => {
    const combatants = [
      createFighter({ name: 'Fighter' }),
      createArcher({ name: 'Archer' }),
      createOrc({ name: 'Orc 1' }),
      createOrc({ name: 'Orc 2' }),
      createGoblinArcher({ name: 'Goblin' })
    ]

    const allFront = getAllAtPosition(combatants, 'front')

    expect(allFront.length).toBe(3) // Fighter + 2 Orcs
    expect(allFront.some(c => c.name === 'Fighter')).toBe(true)
    expect(allFront.some(c => c.name === 'Orc 1')).toBe(true)
  })
})

describe('selectSphereTargetsWithFriendlyFire', () => {
  it('includes allies and enemies at chosen position', () => {
    const combatants = [
      createFighter({ name: 'Fighter', currentHp: 20 }), // Low HP so enemy value > ally penalty
      createArcher({ name: 'Archer', currentHp: 30 }),
      createOrc({ name: 'Orc 1', currentHp: 15 }),
      createOrc({ name: 'Orc 2', currentHp: 15 }),
      createOrc({ name: 'Orc 3', currentHp: 15 }),
      createGoblinArcher({ name: 'Goblin', currentHp: 7 })
    ]
    // Enemy value: min(15,28)*3 = 45
    // Ally penalty: min(20,28)*2 = 40
    // Net: 45 - 40 = 5 > 0, so shouldCast = true

    const result = selectSphereTargetsWithFriendlyFire(combatants, true, 28)

    expect(result.shouldCast).toBe(true)
    expect(result.position).toBe('front')
    expect(result.enemies.length).toBe(3) // 3 orcs
    expect(result.allies.length).toBe(1) // Fighter
    expect(result.targets.length).toBe(4) // All front combatants
  })

  it('rejects when ally damage outweighs enemy damage', () => {
    const combatants = [
      createFighter({ name: 'Fighter 1', currentHp: 44 }),
      createFighter({ name: 'Fighter 2', currentHp: 44, position: 'front' }),
      createOrc({ name: 'Orc', currentHp: 15 })
    ]

    const result = selectSphereTargetsWithFriendlyFire(combatants, true, 28)

    // 1 orc (15 HP) vs 2 fighters (44 HP each * 2 penalty)
    // Enemy value: 15, Ally penalty: 88*2 = 176
    expect(result.shouldCast).toBe(false)
  })

  it('approves when enemy damage clearly outweighs allies', () => {
    const combatants = [
      createFighter({ name: 'Fighter', currentHp: 20 }),
      createOrc({ name: 'Orc 1', currentHp: 30 }),
      createOrc({ name: 'Orc 2', currentHp: 30 }),
      createOrc({ name: 'Orc 3', currentHp: 30 })
    ]

    const result = selectSphereTargetsWithFriendlyFire(combatants, true, 28)

    // 3 orcs (28*3 = 84 value) vs 1 fighter (20*2 = 40 penalty)
    // Net: 84 - 40 = 44 > 0
    expect(result.shouldCast).toBe(true)
    expect(result.allies.length).toBe(1)
    expect(result.enemies.length).toBe(3)
  })

  it('chooses back if front has too many allies', () => {
    const combatants = [
      createFighter({ name: 'Fighter 1', currentHp: 44 }),
      createFighter({ name: 'Fighter 2', currentHp: 44, position: 'front' }),
      createOrc({ name: 'Orc', currentHp: 15 }),
      createGoblinArcher({ name: 'Goblin 1', currentHp: 15 }),
      createGoblinArcher({ name: 'Goblin 2', currentHp: 15 })
    ]

    const result = selectSphereTargetsWithFriendlyFire(combatants, true, 28)

    // Front: 1 orc vs 2 fighters = bad
    // Back: 2 goblins vs 0 allies = good
    expect(result.shouldCast).toBe(true)
    expect(result.position).toBe('back')
    expect(result.allies.length).toBe(0)
    expect(result.enemies.length).toBe(2)
  })
})

describe('selectAOETargets with friendlyFire', () => {
  it('uses friendly fire targeting for spells with friendlyFire flag', () => {
    const spell = { aoeShape: 'sphere', friendlyFire: true }
    const combatants = [
      createFighter({ name: 'Fighter', currentHp: 20 }),
      createOrc({ name: 'Orc 1', currentHp: 30 }),
      createOrc({ name: 'Orc 2', currentHp: 30 })
    ]

    const result = selectAOETargets(spell, combatants, true)

    expect(result.shouldCast).toBe(true)
    expect(result.allies.length).toBe(1)
    expect(result.enemies.length).toBe(2)
  })

  it('uses enemy-only targeting for spells without friendlyFire', () => {
    const spell = { aoeShape: 'sphere' }
    const combatants = [
      createFighter({ name: 'Fighter', currentHp: 20 }),
      createOrc({ name: 'Orc 1', currentHp: 30 }),
      createOrc({ name: 'Orc 2', currentHp: 30 })
    ]

    const result = selectAOETargets(spell, combatants, true)

    expect(result.shouldCast).toBe(true)
    // No allies/enemies breakdown for non-friendly-fire spells
    expect(result.targets.length).toBe(2) // Only enemies
  })
})
