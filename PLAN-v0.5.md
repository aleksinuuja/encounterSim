# v0.5 Implementation Plan - More Conditions & Immunities

## Goal
Expand the conditions system with more D&D 5e conditions and add creature immunities.

## Scope

### 1. New Conditions
| Condition | Effect |
|-----------|--------|
| Paralyzed | Can't act, auto-crit if hit within 5ft, advantage against |
| Frightened | Disadvantage on attacks while source visible |
| Charmed | Can't attack the charmer |
| Incapacitated | Can't take actions (base for paralyzed/stunned) |

### 2. Condition Immunities
- Undead: immune to poison, frightened
- Constructs: immune to poison, charmed, frightened
- Add `conditionImmunities: []` to combatant data

### 3. Attack Types
- Add `attackType: 'melee' | 'ranged'` to combatants
- Affects prone targeting (melee advantage, ranged disadvantage)
- Affects damage to unconscious (melee = 2 fails, ranged = 1)

---

## Implementation Steps

### 1. Add new conditions to conditions.js
### 2. Add immunity checking to applyCondition
### 3. Add attackType to combatant data model
### 4. Update combat.js to use attackType
### 5. Add monster presets with immunities
### 6. Update UI to show immunities

