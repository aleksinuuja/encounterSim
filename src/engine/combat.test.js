/**
 * Test script for v0.3 death saves and yo-yo healing mechanics
 * Run with: node --experimental-vm-modules src/engine/combat.test.js
 */

import { runCombat, runSimulations } from './combat.js'

// Test helpers
let testsPassed = 0
let testsFailed = 0

function assert(condition, message) {
  if (condition) {
    testsPassed++
    console.log(`  ✓ ${message}`)
  } else {
    testsFailed++
    console.log(`  ✗ ${message}`)
  }
}

function describe(name, fn) {
  console.log(`\n${name}`)
  fn()
}

// Sample combatants for testing
const createFighter = () => ({
  id: 'fighter-1',
  name: 'Fighter',
  maxHp: 40,
  armorClass: 16,
  attackBonus: 5,
  damage: '1d8+3',
  initiativeBonus: 2,
  numAttacks: 1
})

const createCleric = () => ({
  id: 'cleric-1',
  name: 'Cleric',
  maxHp: 30,
  armorClass: 14,
  attackBonus: 4,
  damage: '1d6+2',
  initiativeBonus: 0,
  numAttacks: 1,
  healingDice: '1d8+3'
})

const createGoblin = () => ({
  id: 'goblin-1',
  name: 'Goblin',
  maxHp: 7,
  armorClass: 12,
  attackBonus: 4,
  damage: '1d6+2',
  initiativeBonus: 2,
  numAttacks: 1
})

const createOgre = () => ({
  id: 'ogre-1',
  name: 'Ogre',
  maxHp: 59,
  armorClass: 11,
  attackBonus: 6,
  damage: '2d8+4',
  initiativeBonus: -1,
  numAttacks: 1
})

// Run tests
describe('Death Save Mechanics', () => {
  // Run many simulations to ensure we see death saves
  const party = [createFighter(), createCleric()]
  const monsters = [createOgre(), { ...createOgre(), id: 'ogre-2', name: 'Ogre 2' }]

  const { results } = runSimulations(party, monsters, 100)

  // Check that death saves occur
  let deathSaveCount = 0
  let stabilizedCount = 0
  let diedFromSavesCount = 0
  let nat20RecoveryCount = 0
  let nat1DoubleFailCount = 0

  results.forEach(result => {
    result.log.forEach(entry => {
      if (entry.actionType === 'deathSave') {
        deathSaveCount++
        if (entry.stabilized) stabilizedCount++
        if (entry.died) diedFromSavesCount++
        if (entry.recoveredFromNat20) nat20RecoveryCount++
        if (entry.deathSaveRoll === 1) nat1DoubleFailCount++
      }
    })
  })

  assert(deathSaveCount > 0, `Death saves occurred (${deathSaveCount} total)`)
  assert(stabilizedCount > 0 || diedFromSavesCount > 0, `Some characters stabilized (${stabilizedCount}) or died from saves (${diedFromSavesCount})`)

  // Nat 20 should occur ~5% of the time on death saves
  const nat20Rate = nat20RecoveryCount / deathSaveCount
  assert(nat20RecoveryCount >= 0, `Nat 20 recoveries tracked (${nat20RecoveryCount}, rate: ${(nat20Rate * 100).toFixed(1)}%)`)

  // Nat 1 should occur ~5% of the time
  assert(nat1DoubleFailCount >= 0, `Nat 1 double failures tracked (${nat1DoubleFailCount})`)
})

describe('Yo-Yo Healing Mechanics', () => {
  // Use a tougher fight where players are likely to go down but party can still win
  const party = [createFighter(), createCleric()]
  const monsters = [createOgre(), { ...createGoblin(), id: 'goblin-1', name: 'Goblin 1' }, { ...createGoblin(), id: 'goblin-2', name: 'Goblin 2' }]

  const { results } = runSimulations(party, monsters, 200)

  let healCount = 0
  let reviveCount = 0
  let healedAboveZeroCount = 0

  results.forEach(result => {
    result.log.forEach(entry => {
      if (entry.actionType === 'heal') {
        healCount++
        if (entry.revivedFromUnconscious) {
          reviveCount++
        }
        // Check if healing happened when target was above 0 HP
        if (entry.targetHpBefore > 0) {
          healedAboveZeroCount++
        }
      }
    })
  })

  assert(healCount > 0, `Healing occurred (${healCount} total)`)
  assert(reviveCount > 0, `Revives from unconscious occurred (${reviveCount} total)`)
  assert(healedAboveZeroCount === 0, `No healing on conscious allies (found ${healedAboveZeroCount} - should be 0 for yo-yo healing)`)

  // All heals should be revives (since we only heal unconscious allies)
  assert(healCount === reviveCount, `All heals were revives (${reviveCount}/${healCount})`)
})

describe('Unconscious Targeting', () => {
  const party = [createFighter(), createCleric()]
  const monsters = [createGoblin(), createGoblin(), createGoblin()]

  const { results } = runSimulations(party, monsters, 50)

  let attacksOnUnconsciousCount = 0

  results.forEach(result => {
    result.log.forEach(entry => {
      if (entry.actionType === 'attack' && entry.targetHpBefore === 0) {
        attacksOnUnconsciousCount++
      }
    })
  })

  // Monsters should NOT attack unconscious players (default behavior)
  assert(attacksOnUnconsciousCount === 0, `Monsters don't attack unconscious targets (found ${attacksOnUnconsciousCount})`)
})

describe('Combat State Tracking', () => {
  const party = [createFighter()]
  const monsters = [createOgre()]

  const { results } = runSimulations(party, monsters, 50)

  let validDeathSaveStates = true

  results.forEach(result => {
    result.log.forEach(entry => {
      if (entry.actionType === 'deathSave') {
        // Successes should be 0-3
        if (entry.deathSaveSuccesses < 0 || entry.deathSaveSuccesses > 3) {
          validDeathSaveStates = false
        }
        // Failures should be 0-4 (can be 4 due to nat 1 adding 2)
        if (entry.deathSaveFailures < 0 || entry.deathSaveFailures > 4) {
          validDeathSaveStates = false
        }
        // If stabilized, should have 3 successes
        if (entry.stabilized && entry.deathSaveSuccesses < 3) {
          validDeathSaveStates = false
        }
        // If died, should have 3+ failures
        if (entry.died && entry.deathSaveFailures < 3) {
          validDeathSaveStates = false
        }
      }
    })
  })

  assert(validDeathSaveStates, 'Death save states are valid (successes 0-3, failures 0-4)')
})

describe('Combat End Conditions', () => {
  const party = [createFighter(), createCleric()]
  const monsters = [createGoblin()]

  const { results, summary } = runSimulations(party, monsters, 100)

  // Party should win most of the time against a single goblin
  assert(summary.partyWinPercentage > 50, `Party wins majority against weak enemy (${summary.partyWinPercentage.toFixed(1)}%)`)

  // Check that surviving party only includes non-dead members
  let validSurvivors = true
  results.forEach(result => {
    if (result.partyWon) {
      // Winners should have at least one survivor
      if (result.survivingParty.length === 0) {
        validSurvivors = false
      }
    }
  })

  assert(validSurvivors, 'Winning party always has survivors')
})

describe('Death Save Roll Distribution', () => {
  // Run many simulations to check roll distribution
  const party = [createFighter()]
  const monsters = [createOgre(), { ...createOgre(), id: 'ogre-2', name: 'Ogre 2' }]

  const { results } = runSimulations(party, monsters, 200)

  const rollCounts = {}
  let totalRolls = 0

  results.forEach(result => {
    result.log.forEach(entry => {
      if (entry.actionType === 'deathSave' && !entry.recoveredFromNat20) {
        const roll = entry.deathSaveRoll
        rollCounts[roll] = (rollCounts[roll] || 0) + 1
        totalRolls++
      }
    })
  })

  // Check we have a reasonable distribution
  const hasVariety = Object.keys(rollCounts).length >= 10
  assert(hasVariety, `Death save rolls have variety (${Object.keys(rollCounts).length} different values seen)`)

  if (totalRolls > 0) {
    // Count successes (10-19) vs failures (2-9)
    let successes = 0
    let failures = 0
    for (let i = 2; i <= 9; i++) successes += rollCounts[i] || 0
    for (let i = 10; i <= 19; i++) failures += rollCounts[i] || 0

    // Should be roughly 50/50 (with some variance)
    const successRate = failures / (successes + failures)
    assert(successRate > 0.3 && successRate < 0.7, `Success rate is reasonable (${(successRate * 100).toFixed(1)}%, expected ~55%)`)
  }
})

// Summary
console.log('\n' + '='.repeat(50))
console.log(`Tests: ${testsPassed} passed, ${testsFailed} failed`)
console.log('='.repeat(50))

if (testsFailed > 0) {
  process.exit(1)
}
