# Encounter Data Model

An encounter represents a combat setup that can be simulated.

## Schema `[IMPLEMENTED]`

```typescript
interface Encounter {
  // Combatants
  party: Combatant[]      // Player characters
  monsters: Combatant[]   // Enemy creatures
}
```

## Extended Schema `[PLANNED]`

```typescript
interface Encounter {
  // Identity
  id: string
  name: string
  description?: string

  // Combatants
  party: Character[]
  monsters: Monster[]

  // Environment (future)
  terrain?: TerrainType
  lighting?: LightingCondition

  // Difficulty
  calculatedDifficulty?: EncounterDifficulty
  adjustedXP?: number
}
```

## Encounter Difficulty `[PLANNED]`

D&D 5e uses XP thresholds to determine encounter difficulty.

### XP Thresholds by Level

| Level | Easy | Medium | Hard | Deadly |
|-------|------|--------|------|--------|
| 1 | 25 | 50 | 75 | 100 |
| 2 | 50 | 100 | 150 | 200 |
| 3 | 75 | 150 | 225 | 400 |
| 4 | 125 | 250 | 375 | 500 |
| 5 | 250 | 500 | 750 | 1,100 |
| 10 | 600 | 1,200 | 1,900 | 2,800 |
| 15 | 1,100 | 2,100 | 3,400 | 5,100 |
| 20 | 2,800 | 5,700 | 8,500 | 12,700 |

### Monster XP by CR

| CR | XP |
|----|----|
| 0 | 10 |
| 1/8 | 25 |
| 1/4 | 50 |
| 1/2 | 100 |
| 1 | 200 |
| 2 | 450 |
| 3 | 700 |
| 4 | 1,100 |
| 5 | 1,800 |
| 10 | 5,900 |
| 15 | 13,000 |
| 20 | 25,000 |

### Encounter Multiplier

Multiple monsters make encounters harder:

| Monsters | Multiplier |
|----------|------------|
| 1 | x1 |
| 2 | x1.5 |
| 3-6 | x2 |
| 7-10 | x2.5 |
| 11-14 | x3 |
| 15+ | x4 |

### Calculation

```typescript
function calculateDifficulty(party: Character[], monsters: Monster[]) {
  // Sum party thresholds
  const partyThresholds = party.reduce((sum, char) => ({
    easy: sum.easy + thresholds[char.level].easy,
    medium: sum.medium + thresholds[char.level].medium,
    hard: sum.hard + thresholds[char.level].hard,
    deadly: sum.deadly + thresholds[char.level].deadly,
  }), { easy: 0, medium: 0, hard: 0, deadly: 0 })

  // Calculate adjusted monster XP
  const baseXP = monsters.reduce((sum, m) => sum + xpByCR[m.challengeRating], 0)
  const multiplier = getMultiplier(monsters.length)
  const adjustedXP = baseXP * multiplier

  // Determine difficulty
  if (adjustedXP >= partyThresholds.deadly) return 'Deadly'
  if (adjustedXP >= partyThresholds.hard) return 'Hard'
  if (adjustedXP >= partyThresholds.medium) return 'Medium'
  if (adjustedXP >= partyThresholds.easy) return 'Easy'
  return 'Trivial'
}
```

---

## Encounter Presets `[FUTURE]`

Common encounter templates:

```typescript
const presets = {
  "goblin-ambush": {
    name: "Goblin Ambush",
    monsters: [
      { template: "goblin", count: 4 },
      { template: "goblin-boss", count: 1 }
    ],
    recommendedPartyLevel: 1,
    difficulty: "Medium"
  },

  "dragon-lair": {
    name: "Dragon's Lair",
    monsters: [
      { template: "adult-red-dragon", count: 1 }
    ],
    recommendedPartyLevel: 15,
    difficulty: "Deadly"
  }
}
```

---

## Related Specs
- [Combatant](combatant.md)
- [Character](character.md)
- [Monster](monster.md)
- [Simulation Engine](../simulation/combat-loop.md)
