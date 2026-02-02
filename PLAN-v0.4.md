# v0.4 Implementation Plan - Conditions and Effects

## Goal
Add conditions system with advantage/disadvantage mechanics to make combat more tactically realistic.

## Scope for v0.4

### Core Mechanics
1. **Advantage/Disadvantage** - Roll 2d20, take higher/lower
2. **Conditions tracking** - Active conditions on each combatant
3. **Duration tracking** - Conditions expire after X rounds or on save

### Conditions to Implement (Start Simple)
| Condition | Effect on Combat |
|-----------|------------------|
| Prone | Disadvantage on attacks, melee advantage against, ranged disadvantage against |
| Stunned | Can't act, advantage against |
| Poisoned | Disadvantage on attacks |
| Restrained | Disadvantage on attacks, advantage against |
| Blinded | Disadvantage on attacks, advantage against |

### How Conditions Get Applied
- **Monster special abilities** - e.g., "Poison Bite: On hit, target is poisoned for 2 rounds"
- **Being reduced to 0 HP and healed** - Already wake up, could also be prone

---

## Data Model Changes

### Combatant State
```javascript
{
  // Existing...

  // NEW: Conditions
  conditions: [
    {
      type: 'poisoned',        // Condition name
      duration: 2,              // Rounds remaining (null = until cured)
      source: 'Giant Spider',   // Who applied it
      saveEndOfTurn: {          // Optional: save to end early
        ability: 'constitution',
        dc: 13
      }
    }
  ]
}
```

### Monster Special Abilities
```javascript
{
  // Existing combatant fields...

  // NEW: Special ability on attack
  onHitEffect: {
    condition: 'poisoned',
    duration: 3,
    saveDC: 13,
    saveAbility: 'constitution'  // If save succeeds, condition not applied
  }
}
```

---

## Implementation Steps

### 1. Dice System - Advantage/Disadvantage
Update `src/engine/dice.js`:
```javascript
function rollD20WithAdvantage() {
  const roll1 = rollD20()
  const roll2 = rollD20()
  return { result: Math.max(roll1, roll2), rolls: [roll1, roll2] }
}

function rollD20WithDisadvantage() {
  const roll1 = rollD20()
  const roll2 = rollD20()
  return { result: Math.min(roll1, roll2), rolls: [roll1, roll2] }
}
```

### 2. Conditions Module
Create `src/engine/conditions.js`:
```javascript
// Condition definitions
const CONDITIONS = {
  prone: {
    attackModifier: 'disadvantage',
    defendModifier: (attackType) => attackType === 'melee' ? 'advantage' : 'disadvantage',
    canAct: true
  },
  stunned: {
    attackModifier: null,  // Can't attack
    defendModifier: 'advantage',
    canAct: false
  },
  // etc.
}

// Check if combatant has condition
function hasCondition(combatant, conditionType)

// Apply condition to combatant
function applyCondition(combatant, condition)

// Remove condition from combatant
function removeCondition(combatant, conditionType)

// Process end-of-turn duration ticks
function tickConditions(combatant)

// Get attack modifier based on conditions
function getAttackModifier(attacker, target)

// Get defense modifier based on conditions
function getDefenseModifier(attacker, target)
```

### 3. Combat Integration
Update `src/engine/combat.js`:
- Initialize empty `conditions: []` on combatants
- Check conditions before allowing actions
- Apply advantage/disadvantage to attack rolls
- Process condition durations at end of turn
- Apply onHitEffects from attacker

### 4. Log Entries
Add condition-related log entries:
```javascript
{
  actionType: 'conditionApplied',
  condition: 'poisoned',
  targetName: 'Fighter',
  sourceName: 'Giant Spider',
  duration: 3
}

{
  actionType: 'conditionExpired',
  condition: 'poisoned',
  targetName: 'Fighter'
}
```

### 5. UI Updates
- Show conditions on combatant rows (small badges/icons)
- Show advantage/disadvantage in fight log
- Color code condition effects

### 6. Test Monsters
Add example monsters with conditions:
- **Giant Spider**: Poison bite (poisoned on hit, CON save)
- **Wolf**: Pack tactics + prone on hit

---

## File Changes

| File | Changes |
|------|---------|
| `src/engine/dice.js` | Add advantage/disadvantage rolls |
| `src/engine/conditions.js` | NEW - Condition definitions and utilities |
| `src/engine/combat.js` | Integrate conditions into combat loop |
| `src/engine/targeting.js` | Maybe skip incapacitated enemies? |
| `src/components/FightLog.jsx` | Display condition events |
| `src/App.css` | Condition badge styles |

---

## Testing

1. Create test with poisoned attacker - should have disadvantage
2. Create test with prone target - melee should have advantage
3. Create test with stunned combatant - should skip turn
4. Test condition duration expiring
5. Test save to remove condition early

---

## Future (not v0.4)
- More conditions (paralyzed, frightened, charmed, etc.)
- Condition immunity for certain creatures
- Concentration for spell-based conditions
- Saving throws at end of turn to break free
