import { describe, it, expect } from 'vitest'
import { runCombat, runSimulations } from './combat.js'

// Test fixtures
const createFighter = (overrides = {}) => ({
  name: 'Fighter',
  maxHp: 44,
  armorClass: 18,
  attackBonus: 7,
  damage: '1d8+4',
  initiativeBonus: 2,
  isPlayer: true,
  numAttacks: 2,
  constitutionSave: 4,
  ...overrides
})

const createOrc = (overrides = {}) => ({
  name: 'Orc',
  maxHp: 15,
  armorClass: 13,
  attackBonus: 5,
  damage: '1d12+3',
  initiativeBonus: 1,
  isPlayer: false,
  numAttacks: 1,
  ...overrides
})

const createSpider = (overrides = {}) => ({
  name: 'Giant Spider',
  maxHp: 26,
  armorClass: 14,
  attackBonus: 5,
  damage: '1d8+3',
  initiativeBonus: 3,
  isPlayer: false,
  numAttacks: 1,
  onHitEffect: {
    condition: 'poisoned',
    duration: 3,
    saveDC: 11,
    saveAbility: 'constitution',
    saveEndOfTurn: { ability: 'constitution', dc: 11 }
  },
  ...overrides
})

const createGhoul = (overrides = {}) => ({
  name: 'Ghoul',
  maxHp: 22,
  armorClass: 12,
  attackBonus: 4,
  damage: '2d6+2',
  initiativeBonus: 2,
  isPlayer: false,
  numAttacks: 1,
  onHitEffect: {
    condition: 'paralyzed',
    duration: 2,
    saveDC: 10,
    saveAbility: 'constitution',
    saveEndOfTurn: { ability: 'constitution', dc: 10 }
  },
  ...overrides
})

const createSkeleton = (overrides = {}) => ({
  name: 'Skeleton',
  maxHp: 13,
  armorClass: 13,
  attackBonus: 4,
  damage: '1d6+2',
  initiativeBonus: 2,
  isPlayer: false,
  numAttacks: 1,
  conditionImmunities: ['poisoned', 'frightened', 'charmed'],
  ...overrides
})

describe('runCombat', () => {
  it('returns a valid result object', () => {
    const result = runCombat([createFighter()], [createOrc()], 1)

    expect(result).toHaveProperty('id', 1)
    expect(result).toHaveProperty('partyWon')
    expect(result).toHaveProperty('totalRounds')
    expect(result).toHaveProperty('survivingParty')
    expect(result).toHaveProperty('survivingMonsters')
    expect(result).toHaveProperty('log')
    expect(Array.isArray(result.log)).toBe(true)
  })

  it('ends combat when one side is eliminated', () => {
    const result = runCombat([createFighter()], [createOrc()], 1)

    if (result.partyWon) {
      expect(result.survivingMonsters).toHaveLength(0)
      expect(result.survivingParty.length).toBeGreaterThan(0)
    } else {
      expect(result.survivingParty).toHaveLength(0)
      expect(result.survivingMonsters.length).toBeGreaterThan(0)
    }
  })

  it('completes within MAX_ROUNDS', () => {
    const result = runCombat([createFighter()], [createOrc()], 1)
    expect(result.totalRounds).toBeLessThanOrEqual(100)
  })
})

describe('death saves', () => {
  it('player goes unconscious at 0 HP instead of dying', () => {
    // Use a weak player against a strong enemy
    const weakPlayer = createFighter({ maxHp: 10, armorClass: 10 })
    const strongOrc = createOrc({ damage: '2d12+5' })

    let foundUnconscious = false
    for (let i = 0; i < 20; i++) {
      const result = runCombat([weakPlayer], [strongOrc], i)
      const downedEvents = result.log.filter(e => e.targetDowned && !e.targetDied)
      if (downedEvents.length > 0) {
        foundUnconscious = true
        break
      }
    }
    expect(foundUnconscious).toBe(true)
  })

  it('monsters die immediately at 0 HP', () => {
    const result = runCombat([createFighter()], [createOrc()], 1)

    // Find any orc death - should have targetDied
    const orcDeaths = result.log.filter(
      e => e.targetName === 'Orc' && e.targetDowned
    )

    if (orcDeaths.length > 0) {
      expect(orcDeaths.every(e => e.targetDied)).toBe(true)
    }
  })

  it('death saves are rolled for unconscious players', () => {
    const weakPlayer = createFighter({ maxHp: 10, armorClass: 8 })
    const orc = createOrc()

    let foundDeathSave = false
    for (let i = 0; i < 30; i++) {
      const result = runCombat([weakPlayer], [orc], i)
      const deathSaves = result.log.filter(e => e.actionType === 'deathSave')
      if (deathSaves.length > 0) {
        foundDeathSave = true
        break
      }
    }
    expect(foundDeathSave).toBe(true)
  })
})

describe('conditions', () => {
  it('spider can poison targets', () => {
    const fighter = createFighter()
    const spider = createSpider()

    let foundPoison = false
    for (let i = 0; i < 20; i++) {
      const result = runCombat([fighter], [spider], i)
      const poisonEvents = result.log.filter(e => e.conditionApplied === 'poisoned')
      if (poisonEvents.length > 0) {
        foundPoison = true
        break
      }
    }
    expect(foundPoison).toBe(true)
  })

  it('skeleton is immune to poison', () => {
    const skeleton = createSkeleton({ isPlayer: true })
    const spider = createSpider()

    let foundImmunity = false
    for (let i = 0; i < 30; i++) {
      const result = runCombat([skeleton], [spider], i)
      const immuneEvents = result.log.filter(e => e.conditionImmune === 'poisoned')
      if (immuneEvents.length > 0) {
        foundImmunity = true
        break
      }
    }
    expect(foundImmunity).toBe(true)
  })

  it('ghoul can paralyze targets', () => {
    const fighter = createFighter()
    const ghoul = createGhoul()

    let foundParalysis = false
    for (let i = 0; i < 20; i++) {
      const result = runCombat([fighter], [ghoul], i)
      const paralyzeEvents = result.log.filter(e => e.conditionApplied === 'paralyzed')
      if (paralyzeEvents.length > 0) {
        foundParalysis = true
        break
      }
    }
    expect(foundParalysis).toBe(true)
  })

  it('attacks against paralyzed targets auto-crit', () => {
    const fighter = createFighter({ constitutionSave: -5 }) // Easy to paralyze
    const ghoul = createGhoul()

    let foundAutoCrit = false
    for (let i = 0; i < 30; i++) {
      const result = runCombat([fighter], [ghoul], i)
      const autoCritEvents = result.log.filter(e => e.autoCrit)
      if (autoCritEvents.length > 0) {
        foundAutoCrit = true
        break
      }
    }
    expect(foundAutoCrit).toBe(true)
  })

  it('end-of-turn saves can cure conditions', () => {
    // Make fighter easy to poison (low save), spider tough (so combat lasts)
    const fighter = createFighter({ constitutionSave: -5 })
    const spider = createSpider({ maxHp: 100, armorClass: 20 }) // Tough spider

    let foundSaveCure = false
    for (let i = 0; i < 100; i++) {
      const result = runCombat([fighter], [spider], i)
      // Look for any condition save (passed or failed means the system is working)
      const saveEvents = result.log.filter(e => e.actionType === 'conditionSave')
      const passedSaves = saveEvents.filter(e => e.savePassed)
      if (passedSaves.length > 0) {
        foundSaveCure = true
        break
      }
    }
    expect(foundSaveCure).toBe(true)
  })

  it('poisoned combatants have disadvantage shown in log', () => {
    const fighter = createFighter({ constitutionSave: -10 }) // Easy to poison
    const spider = createSpider()

    let foundDisadvantage = false
    for (let i = 0; i < 30; i++) {
      const result = runCombat([fighter], [spider], i)
      const disadvantageEvents = result.log.filter(
        e => e.actorName === 'Fighter' && e.rollModifier === 'disadvantage'
      )
      if (disadvantageEvents.length > 0) {
        foundDisadvantage = true
        break
      }
    }
    expect(foundDisadvantage).toBe(true)
  })
})

describe('healing', () => {
  it('healer only heals unconscious allies (yo-yo healing)', () => {
    const cleric = createFighter({
      name: 'Cleric',
      healingDice: '1d8+3'
    })
    const fighter = createFighter({ maxHp: 15, armorClass: 10 })
    const orc = createOrc()

    let foundYoyoHeal = false
    for (let i = 0; i < 50; i++) {
      const result = runCombat([cleric, fighter], [orc], i)
      const heals = result.log.filter(e => e.actionType === 'heal')
      const yoyoHeals = heals.filter(e => e.revivedFromUnconscious)

      if (yoyoHeals.length > 0) {
        foundYoyoHeal = true
        break
      }
    }
    expect(foundYoyoHeal).toBe(true)
  })
})

describe('runSimulations', () => {
  it('runs multiple simulations and aggregates results', () => {
    const { results, summary } = runSimulations(
      [createFighter()],
      [createOrc()],
      10
    )

    expect(results).toHaveLength(10)
    expect(summary.totalSimulations).toBe(10)
    expect(summary.partyWins).toBeGreaterThanOrEqual(0)
    expect(summary.partyWins).toBeLessThanOrEqual(10)
    expect(summary.partyWinPercentage).toBeGreaterThanOrEqual(0)
    expect(summary.partyWinPercentage).toBeLessThanOrEqual(100)
    expect(summary.averageRounds).toBeGreaterThan(0)
  })

  it('tracks survivor counts', () => {
    const { summary } = runSimulations(
      [createFighter()],
      [createOrc()],
      10
    )

    expect(summary.survivorCounts).toBeDefined()
    // If there are any party wins, Fighter should be in survivor counts
    if (summary.partyWins > 0) {
      expect(summary.survivorCounts['Fighter']).toBeGreaterThan(0)
    }
  })
})
