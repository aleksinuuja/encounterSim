# Party Builder UI

This document describes the UI for creating and managing the player party.

## Overview `[IMPLEMENTED]`

The party builder allows users to:
- Add new party members
- Edit existing party members
- Remove party members
- See party composition at a glance

## Layout

```
┌─────────────────────────────────────┐
│ Party                    [+ Add]    │
├─────────────────────────────────────┤
│ Name     HP    AC   Atk  Dmg   Acts │
│ ─────────────────────────────────── │
│ Fighter  40    16   +5   1d8+3  [✎][✕]│
│ Cleric   30    14   +4   1d6+2  [✎][✕]│
│ Rogue    28    15   +6   1d6+4  [✎][✕]│
├─────────────────────────────────────┤
│ [Add New Party Member Form]         │
│ ...when expanded...                 │
└─────────────────────────────────────┘
```

## Party Table `[IMPLEMENTED]`

### Columns
| Column | Description |
|--------|-------------|
| Name | Character name |
| HP | Maximum hit points |
| AC | Armor class |
| Atk | Attack bonus (with + prefix) |
| Dmg | Damage dice notation |
| Actions | Edit and Delete buttons |

### Row Actions
- **Edit (✎)**: Opens edit form with current values
- **Delete (✕)**: Removes character (with confirmation?)

## Add/Edit Form `[IMPLEMENTED]`

### Fields

| Field | Type | Validation | Default |
|-------|------|------------|---------|
| Name | Text | Required, 1-50 chars | "" |
| Max HP | Number | Required, 1-999 | 10 |
| Armor Class | Number | Required, 1-30 | 10 |
| Initiative Bonus | Number | -10 to +20 | 0 |
| Attack Bonus | Number | -10 to +20 | 0 |
| Damage | Text | Valid dice notation | "1d6" |
| Number of Attacks | Number | 1-10 | 1 |
| Healing Dice | Text | Valid dice notation or empty | "" |

### Form Actions
- **Save**: Validates and saves character
- **Cancel**: Discards changes, closes form

### Validation Messages
- "Name is required"
- "HP must be between 1 and 999"
- "Invalid dice notation"

## Persistence `[IMPLEMENTED]`

Party is automatically saved to localStorage:
- Key: `dnd-sim-party`
- Format: JSON array of combatant objects
- Persists across page refreshes

---

## Planned Enhancements `[PLANNED]`

### Character Templates
Pre-built characters for quick setup:
- Fighter (Level 5)
- Cleric (Level 5)
- Rogue (Level 5)
- Wizard (Level 5)

### Import from External Sources
- D&D Beyond character link
- JSON file upload
- SRD monster as ally

### Duplicate Character
Copy existing character as starting point.

### Drag-and-Drop Reorder
Change party order (for display purposes).

### Character Notes
Optional description/notes field.

---

## Related Specs
- [Combatant Data](../data/combatant.md)
- [Encounter Builder](encounter-builder.md)
- [Persistence](../architecture/persistence.md)
