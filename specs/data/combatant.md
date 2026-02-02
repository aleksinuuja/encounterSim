# Combatant Data Model

A combatant is any creature participating in combat.

## Base Schema `[IMPLEMENTED]`

```typescript
interface Combatant {
  // Identity
  id: string              // Unique identifier
  name: string            // Display name

  // Combat Stats
  maxHp: number           // Maximum hit points
  armorClass: number      // AC - target number for attacks
  initiativeBonus: number // Added to d20 for turn order

  // Offense
  attackBonus: number     // Added to d20 for attack rolls
  damage: string          // Dice notation, e.g., "1d8+3"
  numAttacks: number      // Attacks per turn (default: 1)

  // Support (optional)
  healingDice?: string    // Dice notation for healing, e.g., "1d8+3"
}
```

## Runtime State `[IMPLEMENTED]`

During combat, combatants gain additional state:

```typescript
interface CombatantState extends Combatant {
  // Combat state
  currentHp: number       // Current hit points (starts at maxHp)
  initiativeRoll: number  // Result of initiative roll
  isPlayer: boolean       // true for party, false for monsters

  // Death save state (players only)
  isUnconscious: boolean  // true when at 0 HP
  isStabilized: boolean   // true when 3 successes
  isDead: boolean         // true when 3 failures
  deathSaveSuccesses: number  // 0-3
  deathSaveFailures: number   // 0-3 (can temporarily be 4 from nat 1)
}
```

## Validation Rules

| Field | Constraint | Rationale |
|-------|------------|-----------|
| name | 1-50 characters | Display in UI |
| maxHp | 1-999 | Must be positive, reasonable max |
| armorClass | 1-30 | D&D bounded range |
| initiativeBonus | -10 to +20 | Reasonable modifier range |
| attackBonus | -10 to +20 | Reasonable modifier range |
| damage | Valid dice notation | Must be parseable |
| numAttacks | 1-10 | Reasonable for any creature |
| healingDice | Valid dice notation or empty | Must be parseable if present |

## Dice Notation `[IMPLEMENTED]`

Damage and healing use dice notation:

```
<count>d<sides>[+|-<modifier>]

Examples:
  1d8       → roll 1 eight-sided die
  2d6+3     → roll 2 six-sided dice, add 3
  1d4-1     → roll 1 four-sided die, subtract 1 (minimum 1)
  3d10+5    → roll 3 ten-sided dice, add 5
```

## Default Values

When creating a new combatant, use these defaults:

```javascript
{
  id: generateUniqueId(),
  name: "",
  maxHp: 10,
  armorClass: 10,
  initiativeBonus: 0,
  attackBonus: 0,
  damage: "1d6",
  numAttacks: 1,
  healingDice: ""  // empty = no healing
}
```

---

## Future Extensions `[PLANNED]`

### Ability Scores
```typescript
interface AbilityScores {
  strength: number      // 1-30, typically 8-20
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}
```

### Saving Throws
```typescript
interface SavingThrows {
  strengthSave: number    // Modifier for STR saves
  dexteritySave: number
  constitutionSave: number
  intelligenceSave: number
  wisdomSave: number
  charismaSave: number
}
```

### Resistances
```typescript
interface Resistances {
  damageResistances: DamageType[]    // Half damage
  damageImmunities: DamageType[]     // No damage
  damageVulnerabilities: DamageType[] // Double damage
  conditionImmunities: Condition[]    // Cannot be affected
}
```

---

## Related Specs
- [Character](character.md) - Player character extension
- [Monster](monster.md) - Monster stat block extension
- [Combat Rules](../rules/combat.md)
