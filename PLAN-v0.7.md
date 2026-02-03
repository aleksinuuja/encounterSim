# v0.7 Implementation Plan - Action Economy

## Goal
Add proper action economy tracking to make combat more realistic: bonus actions, reactions, and common class features that use them.

## Scope

### 1. Action Types
- **Action**: Main action (attack, cast spell, etc.)
- **Bonus Action**: Secondary action (Healing Word, off-hand attack, etc.)
- **Reaction**: Once per round response (Shield, opportunity attack)

### 2. Features to Implement

**Bonus Actions:**
| Feature | Class | Effect |
|---------|-------|--------|
| Off-hand Attack | Two-weapon fighting | Extra attack with off-hand (no ability mod to damage) |
| Cunning Action | Rogue | Dash, Disengage, or Hide |
| Spiritual Weapon | Cleric | Bonus action attack each turn |
| Healing Word | Any caster | Already implemented, just needs BA tracking |

**Reactions:**
| Feature | Class | Effect |
|---------|-------|--------|
| Opportunity Attack | All | Attack when enemy leaves reach |
| Shield | Wizard/Sorcerer | +5 AC when hit |
| Counterspell | Wizard/Sorcerer | Negate enemy spell |

**Special Actions:**
| Feature | Class | Effect |
|---------|-------|--------|
| Action Surge | Fighter | Extra action once per rest |
| Second Wind | Fighter | Bonus action heal (1d10+level) |

---

## Data Model Changes

### Combatant (new fields)
```javascript
{
  // Action economy (reset each turn)
  hasAction: true,
  hasBonusAction: true,
  hasReaction: true,  // Resets at start of YOUR turn

  // Class features
  hasTwoWeaponFighting: false,
  offHandDamage: '1d6',  // Off-hand weapon

  hasCunningAction: false,

  hasActionSurge: false,
  actionSurgeUsed: false,  // Per combat

  hasSecondWind: false,
  secondWindUsed: false,   // Per combat
  secondWindDice: '1d10',

  // Active summons/effects
  spiritualWeapon: null,  // { damage: '1d8', attackBonus: 5, turnsRemaining: 10 }
}
```

### Combat State
```javascript
{
  // Track reactions for opportunity attacks
  movedThisTurn: [],  // Combatants who moved (simplified - everyone who isn't incapacitated)
}
```

---

## Implementation Steps

### Phase 1: Action Tracking
1. Add action economy fields to combatant state
2. Reset action/bonus action at start of turn
3. Reset reaction at start of combatant's next turn
4. Track action usage in spell casting and attacks

### Phase 2: Bonus Actions
1. Off-hand attack for two-weapon fighting
2. Second Wind for fighters
3. Proper bonus action tracking for Healing Word
4. Spiritual Weapon sustain (bonus action attack each turn)

### Phase 3: Reactions
1. Shield spell (reaction to being hit)
2. Opportunity attacks (simplified - chance when enemy attacks)
3. Counterspell (reaction to enemy casting)

### Phase 4: Special Actions
1. Action Surge for fighters
2. Update character/monster presets

---

## Simplified Opportunity Attacks

Full positioning is out of scope. Simplified approach:
- At end of turn, if combatant attacked a target, adjacent enemies MAY get opportunity attack
- Probability-based: 30% chance an enemy was "in reach" and gets an OA
- Only one OA per combatant per round (uses reaction)

---

## AI Decision Making

### Bonus Action Priority
1. If has Spiritual Weapon active → attack with it
2. If hurt and has Second Wind → use it
3. If has Healing Word and ally down → cast it (already done in v0.6)
4. If has two-weapon fighting → off-hand attack

### Reaction Priority
1. Shield: Use when hit by attack that would miss with +5 AC
2. Counterspell: Use on dangerous enemy spells (Fireball, Hold Person)
3. Opportunity Attack: Always take if available

---

## Testing

1. Action economy resets correctly each turn
2. Two-weapon fighting grants extra attack
3. Second Wind healing works as bonus action
4. Shield reaction prevents hits
5. Opportunity attacks trigger correctly
6. Action Surge grants extra action

---

## Files to Modify

1. `src/engine/combat.js` - Action economy tracking, turn flow
2. `src/engine/actions.js` (NEW) - Bonus actions, reactions
3. `src/engine/spellcasting.js` - Track spell action types
4. `src/data/monsterPresets.js` - Add features to presets
5. `src/data/examples.js` - Add features to example party
6. `src/components/FightLog.jsx` - Display new action types
7. `src/App.css` - Styles for new log entries
