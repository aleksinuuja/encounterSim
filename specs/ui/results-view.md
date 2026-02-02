# Results View UI

This document describes the UI for displaying simulation results.

## Overview `[IMPLEMENTED]`

The results view shows:
- Win percentage (prominent)
- Summary statistics
- Per-character survival rates
- Expandable fight log

## Layout

```
┌─────────────────────────────────────────────┐
│                  Results                    │
├─────────────────────────────────────────────┤
│                                             │
│                   65%                       │
│              Party Win Rate                 │
│            65 of 100 simulations            │
│                                             │
├─────────────────────────────────────────────┤
│   ┌─────────┐      ┌─────────┐              │
│   │  3.2    │      │   65    │              │
│   │ Avg Rnd │      │  Wins   │              │
│   └─────────┘      └─────────┘              │
├─────────────────────────────────────────────┤
│  Survival Rates                             │
│  Fighter  [████████████░░░░] 78%            │
│  Cleric   [██████████░░░░░░] 65%            │
│  Rogue    [████████░░░░░░░░] 52%            │
├─────────────────────────────────────────────┤
│  Fight Results                              │
│  #1  Victory  3 rounds  2 survived    ▶     │
│  #2  Defeat   5 rounds  1 monster     ▶     │
│  #3  Victory  4 rounds  3 survived    ▶     │
│  ...                                        │
└─────────────────────────────────────────────┘
```

## Win Percentage Display `[IMPLEMENTED]`

### Styling by Result
| Win Rate | Color | Interpretation |
|----------|-------|----------------|
| 67%+ | Green | Favorable odds |
| 34-66% | Yellow/Orange | Uncertain |
| 0-33% | Red | Unfavorable odds |

### Details Shown
- Percentage (large, prominent)
- Label "Party Win Rate"
- Fraction "X of Y simulations"

## Summary Statistics `[IMPLEMENTED]`

### Current Stats
- Average rounds per combat
- Total party wins

### Planned Stats `[PLANNED]`
- Median rounds
- Average damage dealt/taken
- Critical hit rate
- Death save statistics

## Survival Rates `[IMPLEMENTED]`

### Per-Character Display
- Character name
- Horizontal bar showing percentage
- Percentage number

### Sorting
Currently: Order as defined in party
Planned: Sort by survival rate (highest first)

---

## Fight Log `[IMPLEMENTED - WITH ISSUES]`

### List View
Scrollable list of individual fight results.

### Row Display
```
#ID  Outcome  Duration  Survivors  [Expand]
#1   Victory  3 rounds  2 survived    ▶
```

### Expanded View
Shows full combat log table:

```
┌─────────────────────────────────────────────┐
│ Survivors: Fighter, Cleric                  │
├─────┬─────────┬─────────┬──────┬────┬──────┤
│ Rnd │ Actor   │ Target  │ Roll │ AC │Result│
├─────┼─────────┼─────────┼──────┼────┼──────┤
│ 1   │ Fighter │ Goblin  │ 15→20│ 15 │ 7 dmg│
│ 1   │ Cleric  │ Goblin  │ 8→12 │ 15 │ Miss │
│ 1   │ Goblin  │ Fighter │ 18→22│ 16 │ 5 dmg│
│ ...                                         │
└─────────────────────────────────────────────┘
```

### Row Color Coding
| Action Type | Background Color |
|-------------|------------------|
| Hit | Light green |
| Miss | Light gray |
| Target Downed | Light red |
| Heal | Light blue |
| Revive | Brighter blue |
| Death Save (success) | Light purple |
| Death Save (failure) | Pink |
| Stabilized | Light green |
| Died | Dark red |
| Nat 20 Recovery | Gold |

---

## Planned Enhancements `[PLANNED]`

### Charts and Graphs

#### Win Rate Pie Chart
Visual representation of wins vs losses.

#### Round Distribution Histogram
Show spread of combat durations.

#### HP Timeline
Line chart of party HP over rounds (for single fight).

### Filtering

Filter fight log by:
- Outcome (wins only, losses only)
- Duration (short/long fights)
- Specific character died/survived

### Search

Find specific events in logs:
- "Critical hit"
- "Death save"
- Character name

### Export

- Download results as CSV
- Download results as JSON
- Copy summary to clipboard
- Share link (encoded in URL)

---

## Related Specs
- [Statistics](../simulation/statistics.md)
- [Fight Log](fight-log.md)
- [Combat Loop](../simulation/combat-loop.md)
