# v0.6 Implementation Plan - Spellcasting

## Goal
Add spell slots, cantrips, and common spells to make caster combat realistic.

## Scope

### 1. Spell Slot System
- Spell slots by level (1st through 5th for now)
- Slots consumed when casting leveled spells
- Cantrips: unlimited use, scale with level
- Upcasting: use higher slot for more damage

### 2. Concentration
- Only one concentration spell at a time
- CON save when taking damage (DC 10 or half damage, whichever higher)
- Lose concentration on failed save
- Track which spell is being concentrated on

### 3. Spells to Implement

**Cantrips (at-will):**
| Spell | Effect |
|-------|--------|
| Fire Bolt | 1d10 fire, ranged attack |
| Sacred Flame | 1d8 radiant, DEX save |
| Toll the Dead | 1d8/1d12 necrotic, WIS save |

**1st Level:**
| Spell | Effect |
|-------|--------|
| Magic Missile | 3x 1d4+1 force, auto-hit |
| Shield | Reaction, +5 AC until next turn |
| Healing Word | Bonus action, 1d4+mod heal |
| Bless | Concentration, +1d4 to attacks/saves |

**2nd Level:**
| Spell | Effect |
|-------|--------|
| Scorching Ray | 3x 2d6 fire, ranged attacks |
| Hold Person | Concentration, paralyzed (WIS save) |
| Spiritual Weapon | Bonus action attack, 1d8+mod |

**3rd Level:**
| Spell | Effect |
|-------|--------|
| Fireball | 8d6 fire, 20ft radius, DEX save half |
| Counterspell | Reaction, negate spell |
| Haste | Concentration, extra action/AC/speed |

---

## Data Model

### Combatant (caster fields)
```javascript
{
  // Existing fields...

  // Spellcasting
  spellcastingAbility: 'intelligence', // int/wis/cha
  spellcastingMod: 5,      // ability mod
  spellSaveDC: 15,         // 8 + prof + mod
  spellAttackBonus: 7,     // prof + mod

  // Spell slots (max per long rest)
  spellSlots: {
    1: 4,  // 4 first-level slots
    2: 3,
    3: 2
  },

  // Known/prepared spells
  spells: ['fireball', 'shield', 'magic-missile'],
  cantrips: ['fire-bolt', 'toll-the-dead'],

  // Runtime state
  currentSlots: { 1: 4, 2: 3, 3: 2 },
  concentratingOn: null,  // spell key or null
}
```

### Spell Definition
```javascript
{
  key: 'fireball',
  name: 'Fireball',
  level: 3,           // 0 = cantrip
  school: 'evocation',
  castingTime: 'action',
  concentration: false,

  // Targeting
  targetType: 'area',  // 'single', 'area', 'self'
  range: 150,
  areaRadius: 20,

  // Effect
  effectType: 'damage', // 'damage', 'heal', 'buff', 'debuff', 'control'
  damageType: 'fire',
  damageDice: '8d6',
  saveAbility: 'dexterity',
  saveEffect: 'half',  // 'half', 'none', 'condition'

  // Upcast
  upcastPerLevel: '1d6', // extra damage per slot level above base
}
```

---

## Implementation Steps

### 1. Create spells.js module
- Spell definitions for all planned spells
- Spell lookup and validation functions

### 2. Update combatant data model
- Add spellcasting fields to rollInitiative
- Initialize currentSlots from spellSlots

### 3. Create spellcasting.js module
- canCastSpell(caster, spellKey, slotLevel)
- castSpell(caster, spell, targets, slotLevel)
- checkConcentration(caster, damage)
- breakConcentration(caster)

### 4. Integrate into combat.js
- Caster AI: decide when to cast vs attack
- Process spell effects
- Concentration saves on damage

### 5. Add caster presets
- Wizard, Cleric, Sorcerer examples
- Enemy casters (Mage, Priest)

### 6. Update UI
- Show spell slots remaining
- Show concentration status
- Spell casting in fight log

---

## AI Spell Selection (Simple)

Priority for damage casters:
1. If can cast Fireball and 2+ enemies clustered: Fireball
2. If enemy low HP: cantrip to finish
3. If high-value target: best damage spell
4. Fallback: cantrip

Priority for support casters:
1. If ally unconscious: Healing Word (bonus action)
2. If no Bless active and 3+ allies: Bless
3. If enemy dangerous: debuff spell
4. Fallback: cantrip or attack

---

## Testing

1. Spell slot consumption
2. Cantrip damage scaling
3. Concentration saves
4. Fireball hitting multiple targets
5. Healing Word as bonus action
6. Shield reaction mechanics

