# Statistics

This document describes what statistics the simulator calculates and displays.

## Current Implementation `[IMPLEMENTED]`

### Summary Statistics

After running N simulations:

```typescript
interface SimulationSummary {
  totalSimulations: number       // N
  partyWins: number              // Count of party victories
  partyWinPercentage: number     // (partyWins / N) * 100
  averageRounds: number          // Mean combat duration
  survivorCounts: {              // Per-character survival count
    [characterName: string]: number
  }
}
```

### Per-Simulation Results

```typescript
interface SimulationResult {
  id: number
  partyWon: boolean
  totalRounds: number
  survivingParty: string[]
  survivingMonsters: string[]
  log: LogEntry[]
}
```

---

## Displayed Metrics `[IMPLEMENTED]`

### Win Percentage
- Primary metric shown prominently
- Color coded: Green (>66%), Yellow (33-66%), Red (<33%)

### Average Rounds
- Indicates expected combat duration
- Useful for session planning

### Survivor Rates
- Bar chart showing each party member's survival percentage
- Identifies who is most at risk

---

## Planned Statistics `[PLANNED]`

### Combat Metrics

```typescript
interface ExtendedSummary {
  // Existing
  ...SimulationSummary

  // Duration
  minRounds: number
  maxRounds: number
  medianRounds: number
  roundsStdDev: number

  // Damage
  averagePartyDamageDealt: number
  averagePartyDamageTaken: number
  averageMonsterDamageDealt: number

  // Actions
  totalAttacks: number
  totalHits: number
  hitRate: number
  criticalHits: number
  critRate: number

  // Death Saves
  deathSavesMade: number
  deathSaveSuccesses: number
  deathSaveFailures: number
  nat20Recoveries: number
  deathsFromFailedSaves: number
  stabilizations: number

  // Healing
  totalHealing: number
  revivesFromUnconscious: number
  healingEfficiency: number  // HP healed / HP that could have been healed
}
```

### Per-Character Metrics

```typescript
interface CharacterStats {
  name: string

  // Survival
  survivalRate: number
  averageEndingHp: number
  timesKnockedDown: number
  timesRevived: number
  deaths: number

  // Offense
  attacksMade: number
  attacksHit: number
  hitRate: number
  damageDealt: number
  averageDamagePerHit: number
  killsSecured: number

  // Defense
  timesTargeted: number
  timesHit: number
  damageTaken: number

  // Support (if healer)
  healsPerformed: number
  totalHpHealed: number
  alliesRevived: number
}
```

### Encounter Difficulty Correlation

Compare calculated CR difficulty with actual win rate:

```typescript
interface DifficultyAnalysis {
  calculatedDifficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly'
  actualWinRate: number
  recommendation: string  // "As expected" / "Easier than expected" / etc.
}
```

---

## Statistical Confidence `[PLANNED]`

### Confidence Intervals

Report win percentage with confidence interval:

```typescript
function calculateConfidenceInterval(wins: number, total: number, confidence = 0.95) {
  const p = wins / total
  const z = 1.96  // 95% confidence
  const margin = z * Math.sqrt((p * (1 - p)) / total)

  return {
    estimate: p * 100,
    lower: (p - margin) * 100,
    upper: (p + margin) * 100,
    confidence
  }
}

// Example: 65 wins out of 100
// Result: 65% ± 9.3% (95% CI: 55.7% - 74.3%)
```

### Recommended Sample Sizes

| Desired Precision | Sample Size |
|-------------------|-------------|
| ±10% | ~100 |
| ±5% | ~400 |
| ±3% | ~1,000 |
| ±1% | ~10,000 |

---

## Visualization `[PLANNED]`

### Win Rate Distribution
Histogram of outcomes across simulations.

### Round Duration Distribution
Show spread of combat lengths.

### HP Over Time
Line chart of party HP through combat.

### Action Breakdown
Pie chart of action types (attack, heal, death save).

### Kill Timeline
When in combat do enemies typically die?

---

## Export `[FUTURE]`

### CSV Export
```csv
simulation_id,party_won,rounds,surviving_party,surviving_monsters
1,true,5,"Fighter,Cleric",""
2,false,8,"","Ogre"
...
```

### JSON Export
Full results including combat logs.

### Summary Report
Formatted text/markdown summary for sharing.

---

## Related Specs
- [Combat Loop](combat-loop.md)
- [Results View UI](../ui/results-view.md)
