# Simulation Runner UI

This document describes the UI for running combat simulations.

## Overview `[IMPLEMENTED]`

The simulation runner allows users to:
- Specify number of simulations
- Start simulation batch
- See progress (currently just loading state)
- View results when complete

## Layout

```
┌─────────────────────────────────────────────┐
│  Number of Simulations: [100    ]           │
│                                             │
│           [Run Simulation]                  │
│                                             │
│  ⚠ Warning: Large numbers may take time     │
└─────────────────────────────────────────────┘
```

## Controls `[IMPLEMENTED]`

### Number of Simulations
- Input type: Number
- Default: 100
- Range: 1 - 10,000 (soft limit)
- Warning shown for values > 1000

### Run Button
- Disabled when:
  - Party is empty
  - Monsters are empty
  - Simulation already running
- Text: "Run Simulation" / "Running..."

### Loading State
While running:
- Button shows "Running..."
- Results area shows "Running simulations..."

---

## Planned Enhancements `[PLANNED]`

### Progress Indicator

```
┌─────────────────────────────────────────────┐
│  Running simulation 347 of 1000...          │
│  [████████████░░░░░░░░░░░░░░░░░░░] 35%      │
│                                             │
│  Party wins so far: 58%                     │
│                                             │
│           [Cancel]                          │
└─────────────────────────────────────────────┘
```

### Cancel Button
Stop simulation batch early, show partial results.

### Auto-Stop on Convergence
Stop early if win rate has stabilized:
- After 100 sims, if rate stable within ±1% for 50 sims
- Option to enable/disable

### Batch Presets
Quick buttons for common batch sizes:
- [10] [100] [1000] [Custom]

### Web Worker Processing
Run simulations in background thread:
- UI remains responsive
- Real progress updates
- No browser freeze

### Simulation Settings `[FUTURE]`

Additional configuration:
- Monster aggression level
- Random seed (for reproducibility)
- Enable/disable specific rules
- Maximum rounds limit

---

## Validation

### Pre-run Checks
1. Party has at least 1 member
2. Monsters has at least 1 member
3. All combatants have valid stats

### Error Messages
- "Add at least one party member"
- "Add at least one monster"
- "Invalid combatant: [name] - [issue]"

---

## Related Specs
- [Combat Loop](../simulation/combat-loop.md)
- [Results View](results-view.md)
- [Performance](../architecture/performance.md)
