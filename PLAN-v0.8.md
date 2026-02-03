# v0.8 Implementation Plan - Advanced Monster Abilities

## Goal
Add signature monster abilities to make boss fights more interesting and accurate: legendary actions, multiattack variants, and breath weapons.

## Scope

### 1. Legendary Actions
- Powerful monsters get extra actions at end of other creatures' turns
- Limited uses per round (typically 3)
- Different costs for different abilities
- Examples: Dragon tail attack (1 action), Dragon wing attack (2 actions)

### 2. Multiattack Variants
- Different attack types in a single multiattack (bite + 2 claws)
- Each attack can have different damage/effects

### 3. Recharge Abilities
- Abilities that recharge on certain dice rolls (e.g., "Recharge 5-6")
- Roll at start of turn to see if ability is available
- Examples: Dragon breath weapon, Mind Flayer mind blast

### 4. Area Abilities
- Breath weapons (cone/line damage)
- Aura effects (damage or debuffs to nearby enemies)

---

## Data Model

### Monster (new fields)
```javascript
{
  // Existing fields...

  // Legendary Actions
  legendaryActions: 3,           // Actions available per round
  legendaryAbilities: [
    {
      name: 'Tail Attack',
      cost: 1,
      type: 'attack',
      attackBonus: 15,
      damage: '2d8+8',
      damageType: 'bludgeoning'
    },
    {
      name: 'Wing Attack',
      cost: 2,
      type: 'area',
      saveDC: 22,
      saveAbility: 'dexterity',
      damage: '2d6+8',
      damageType: 'bludgeoning',
      onFail: 'prone'
    }
  ],

  // Multiattack
  multiattack: [
    { type: 'bite', attackBonus: 14, damage: '2d10+8', damageType: 'piercing' },
    { type: 'claw', attackBonus: 14, damage: '2d6+8', damageType: 'slashing' },
    { type: 'claw', attackBonus: 14, damage: '2d6+8', damageType: 'slashing' }
  ],

  // Recharge Abilities
  rechargeAbilities: [
    {
      name: 'Fire Breath',
      rechargeMin: 5,     // Recharges on 5-6
      available: true,    // Runtime state
      type: 'area',
      shape: 'cone',
      size: 60,
      saveDC: 21,
      saveAbility: 'dexterity',
      damage: '16d6',
      damageType: 'fire',
      saveEffect: 'half'
    }
  ]
}
```

---

## Implementation Steps

### Phase 1: Multiattack Variants
1. Support array of attacks in multiattack field
2. Execute each attack with its own stats
3. Update monster presets with multiattack

### Phase 2: Recharge Abilities
1. Add recharge roll at start of monster turn
2. AI chooses to use breath weapon when advantageous
3. Track availability state

### Phase 3: Legendary Actions
1. After each non-legendary creature's turn, legendary monsters can act
2. Track remaining legendary actions
3. Reset at start of legendary creature's turn
4. AI for choosing legendary abilities

### Phase 4: Monster Presets
1. Young Dragon (breath weapon, multiattack)
2. Adult Dragon (legendary actions, breath weapon)
3. Mind Flayer (mind blast)
4. Beholder (eye rays)

---

## AI Decision Making

### Breath Weapon
- Use if 2+ enemies in area
- Use if enemy has low DEX save
- Save for groups, don't waste on single targets

### Legendary Actions
- Prioritize high-value actions
- Spread across round for maximum disruption
- Save some for reactions/emergencies

---

## Monster Presets to Add

| Monster | CR | Key Features |
|---------|----|-|
| Young Red Dragon | 10 | Fire breath (12d6), multiattack |
| Adult Red Dragon | 17 | Fire breath (18d6), legendary actions |
| Mind Flayer | 7 | Mind blast (3d8+stun), multiattack |
| Hill Giant | 5 | Multiattack (2 greatclub) |

---

## Files to Modify

1. `src/engine/monsters.js` (NEW) - Monster abilities
2. `src/engine/combat.js` - Legendary action processing
3. `src/data/monsterPresets.js` - New monsters
4. `src/components/FightLog.jsx` - Display new abilities
5. `src/App.css` - Styles
