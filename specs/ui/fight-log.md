# Fight Log UI

This document describes the detailed fight log display.

## Overview `[IMPLEMENTED]`

The fight log allows users to drill down into individual combat simulations to see exactly what happened each round.

## Entry Types

### Attack Entry

```
| Rnd | Actor   | Target | Roll      | AC | Result                    |
| 1   | Fighter | Goblin | 15 → 20   | 15 | 7 dmg (18 → 11)          |
| 1   | Rogue   | Goblin | 1 (FUMBLE)| 15 | Miss                      |
| 2   | Fighter | Goblin | 20 (CRIT) | 15 | 14 dmg! (11 → 0) DOWNED  |
```

#### Fields
- **Rnd**: Round number
- **Actor**: Who is acting
- **Target**: Who is being targeted
- **Roll**: d20 result → total (with modifiers)
- **AC**: Target's armor class
- **Result**: Damage dealt, HP change, status

#### Special Cases
- Natural 1: Shows "(FUMBLE)"
- Natural 20: Shows "(CRIT)", damage has "!"
- Target reaches 0 HP: Shows "DOWNED"
- Monster dies: Shows "DIED"

### Heal Entry

```
| Rnd | Actor  | Target  | Roll   | AC     | Result                    |
| 3   | Cleric | Fighter | REVIVE |        | +8 HP (0 → 8) (back up!)  |
| 5   | Cleric | Rogue   | HEAL   |        | +6 HP (12 → 18)           |
```

#### Fields
- **Roll/AC columns**: Merged, shows "HEAL" or "REVIVE"
- **Result**: HP restored and before/after

#### Special Cases
- Healing unconscious ally: Shows "REVIVE" and "(back up!)"
- Regular healing: Shows "HEAL" (note: currently not possible with yo-yo healing)

### Death Save Entry

```
| Rnd | Actor   | Target | Roll       | AC | Result                        |
| 2   | Fighter | —      | DEATH SAVE |    | 14 ●●○ / ○○○                  |
| 3   | Fighter | —      | DEATH SAVE |    | 3 ●●○ / ●○○                   |
| 4   | Fighter | —      | DEATH SAVE |    | 15 ●●● / ●○○ STABILIZED       |
```

```
| 2   | Rogue   | —      | DEATH SAVE |    | 1 (2 fails) ○○○ / ●●○         |
| 3   | Rogue   | —      | DEATH SAVE |    | 7 ○○○ / ●●● DIED              |
```

```
| 2   | Cleric  | —      | DEATH SAVE |    | NAT 20! Recovers with 1 HP    |
```

#### Fields
- **Target**: Shows "—" (no target)
- **Roll/AC columns**: Merged, shows "DEATH SAVE"
- **Result**: Roll value, success/failure tally, outcome

#### Tally Display
- `●●○ / ●○○` = 2 successes / 1 failure
- Filled circles = accumulated, empty = remaining

#### Special Cases
- Natural 1: Shows "(2 fails)"
- Natural 20: Shows special recovery message
- 3 successes: Shows "STABILIZED"
- 3 failures: Shows "DIED"

---

## Color Coding `[IMPLEMENTED]`

| Row Type | Background | Text Accent |
|----------|------------|-------------|
| Hit | #f0fff0 (light green) | — |
| Miss | #f5f5f5 (light gray) | Gray text |
| Target Downed | #fff0f0 (light red) | — |
| Heal | #e6f3ff (light blue) | Blue numbers |
| Revive | #e3f2fd (brighter blue) | Blue text |
| Death Save Success | #f0f0f5 (light purple) | Green roll |
| Death Save Failure | #f5f0f0 (light pink) | Red roll |
| Stabilized | #e8f5e9 (muted green) | Green text |
| Died | #3d0000 (dark red) | Red text |
| Nat 20 Recovery | #fff8e1 (gold) | Gold text |

---

## Interaction

### Expand/Collapse
- Click fight header to toggle expansion
- Only one fight expanded at a time (current behavior)
- Planned: Allow multiple expanded

### Scrolling
- Fight list has max-height with scroll
- Log table scrolls independently when long

---

## Planned Enhancements `[PLANNED]`

### Round Separators
Visual dividers between rounds:

```
──────────── Round 1 ────────────
| 1 | Fighter | Goblin | ...
| 1 | Cleric  | Goblin | ...
──────────── Round 2 ────────────
| 2 | Goblin  | Fighter | ...
```

### HP Tracker
Show running HP totals for all combatants:

```
Round 1: Fighter 40/40, Cleric 30/30, Goblin 7/7
Round 2: Fighter 35/40, Cleric 30/30, Goblin 0/7 ☠
```

### Replay Controls
Step through combat turn by turn:
- [|◀] [◀] [▶] [▶|]
- Play/pause animation
- Speed control

### Highlight Character
Click character name to highlight all their actions.

### Filter Log
Show only specific action types:
- [ ] Attacks
- [ ] Heals
- [ ] Death Saves
- [ ] Misses

---

## Known Issues

### Current Bug
Fight log rows render but text is not visible. Under investigation.
- Boxes/borders appear correctly
- Text content not displaying
- May be CSS inheritance issue

---

## Related Specs
- [Results View](results-view.md)
- [Combat Loop](../simulation/combat-loop.md)
- [Death and Healing](../rules/death-and-healing.md)
