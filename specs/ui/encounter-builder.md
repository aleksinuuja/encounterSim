# Encounter Builder UI

This document describes the UI for creating and managing monster encounters.

## Overview `[IMPLEMENTED]`

The encounter builder allows users to:
- Add monsters to the encounter
- Edit monster stats
- Remove monsters
- See encounter composition

## Layout

```
┌─────────────────────────────────────┐
│ Monsters                 [+ Add]    │
├─────────────────────────────────────┤
│ Name     HP    AC   Atk  Dmg   Acts │
│ ─────────────────────────────────── │
│ Goblin   7     15   +4   1d6+2  [✎][✕]│
│ Goblin   7     15   +4   1d6+2  [✎][✕]│
│ Hobgob   11    18   +3   1d8+1  [✎][✕]│
├─────────────────────────────────────┤
│ [Add New Monster Form]              │
│ ...when expanded...                 │
└─────────────────────────────────────┘
```

## Monster Table `[IMPLEMENTED]`

Same structure as Party Table.
See [Party Builder](party-builder.md) for details.

## Add/Edit Form `[IMPLEMENTED]`

Same fields as Party Builder, except:
- Healing Dice is typically not used for monsters
- Name often repeats (multiple goblins)

---

## Planned Enhancements `[PLANNED]`

### Monster Library
Searchable database of SRD monsters:

```
┌─────────────────────────────────────┐
│ Monster Library          [Search: ] │
├─────────────────────────────────────┤
│ Goblin (CR 1/4)           [+ Add]   │
│ Hobgoblin (CR 1/2)        [+ Add]   │
│ Bugbear (CR 1)            [+ Add]   │
│ Ogre (CR 2)               [+ Add]   │
│ ...                                 │
└─────────────────────────────────────┘
```

### Quick Add Multiples
Add X copies of a monster at once:
- "Add 4 Goblins"
- Each gets unique ID but same stats

### Encounter Difficulty Display
Show calculated difficulty based on party level and monster CR:

```
┌─────────────────────────────────────┐
│ Encounter Difficulty: HARD          │
│ Adjusted XP: 450 (vs threshold 375) │
└─────────────────────────────────────┘
```

### Monster Groups
Group monsters for easier management:
- "Goblin Squad (4)"
- Collapse/expand groups

### Random Encounter Generator
Generate encounters based on:
- Party level
- Desired difficulty
- Environment/theme

---

## Related Specs
- [Monster Data](../data/monster.md)
- [Encounter Data](../data/encounter.md)
- [Party Builder](party-builder.md)
