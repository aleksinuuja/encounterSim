# Randomness

This document describes how random number generation works in the simulator.

## Current Implementation `[IMPLEMENTED]`

### Dice Rolling

All randomness comes from simulated dice rolls:

```typescript
// Roll a single die
function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

// Roll d20
function rollD20(): number {
  return rollDie(20)
}

// Roll multiple dice with modifier
function rollDice(notation: string): { rolls: number[], total: number } {
  // Parse "2d6+3" into count=2, sides=6, modifier=3
  const { count, sides, modifier } = parseDiceNotation(notation)

  const rolls = []
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides))
  }

  const total = rolls.reduce((a, b) => a + b, 0) + modifier
  return { rolls, total: Math.max(1, total) }  // Minimum 1 damage
}
```

### Dice Notation Parser

```typescript
// Supports: "1d6", "2d8+3", "1d4-1", "3d10"
function parseDiceNotation(notation: string) {
  const match = notation.match(/(\d+)d(\d+)([+-]\d+)?/)
  if (!match) throw new Error(`Invalid dice notation: ${notation}`)

  return {
    count: parseInt(match[1]),
    sides: parseInt(match[2]),
    modifier: parseInt(match[3] || '0')
  }
}
```

### Critical Hits

```typescript
function rollDamage(notation: string, isCritical: boolean): number {
  const { count, sides, modifier } = parseDiceNotation(notation)

  // Critical hits double the dice count, not the modifier
  const diceCount = isCritical ? count * 2 : count

  let total = modifier
  for (let i = 0; i < diceCount; i++) {
    total += rollDie(sides)
  }

  return Math.max(1, total)
}
```

---

## Statistical Properties

### D20 Distribution
- Each number 1-20 has 5% probability
- Expected value: 10.5
- Attack success rate depends on target AC and attack bonus

### Attack Success Probability

```
P(hit) = (21 - AC + attackBonus) / 20

Example: +5 attack vs AC 15
P(hit) = (21 - 15 + 5) / 20 = 11/20 = 55%

Note: Natural 1 always misses, Natural 20 always hits
Adjusted: P(hit) = 0.05 + 0.95 * min(max((20 - AC + attackBonus) / 20, 0), 1)
```

### Death Save Probability

Without intervention:
- P(success) = 11/20 = 55% (rolls 10-20, except 20 is special)
- P(failure) = 8/20 = 40% (rolls 2-9)
- P(nat 20) = 1/20 = 5% (instant recovery)
- P(nat 1) = 1/20 = 5% (2 failures)

Survival probability without healing (rough):
- ~59% chance to stabilize before dying

---

## Planned Features `[PLANNED]`

### Seeded Random

Allow reproducible simulations:

```typescript
// Seeded random number generator
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    // Linear congruential generator
    this.seed = (this.seed * 1664525 + 1013904223) % 2**32
    return this.seed / 2**32
  }

  rollDie(sides: number): number {
    return Math.floor(this.next() * sides) + 1
  }
}

// Usage
const rng = new SeededRandom(12345)
const result = runCombat(party, monsters, { rng })
// Same seed = same result every time
```

### Advantage/Disadvantage

```typescript
function rollD20WithAdvantage(): number {
  const roll1 = rollD20()
  const roll2 = rollD20()
  return Math.max(roll1, roll2)
}

function rollD20WithDisadvantage(): number {
  const roll1 = rollD20()
  const roll2 = rollD20()
  return Math.min(roll1, roll2)
}
```

### Roll History

Track all rolls for analysis:

```typescript
interface RollRecord {
  type: 'attack' | 'damage' | 'save' | 'heal' | 'initiative'
  notation: string
  rolls: number[]
  total: number
  timestamp: number
}

// Allows statistical analysis of roll distribution
// Detect if random is working correctly
```

---

## Testing Randomness

### Distribution Test

Run 100,000 d20 rolls, verify each number appears ~5,000 times (within tolerance).

### Independence Test

Verify sequential rolls are independent (no correlation).

### Current Implementation

```typescript
// In combat.test.js
describe('Death Save Roll Distribution', () => {
  // Run many simulations, verify rolls have variety
  // Check success rate is ~55%
})
```

---

## Related Specs
- [Combat Loop](combat-loop.md)
- [Statistics](statistics.md)
