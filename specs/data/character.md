# Character Data Model

`[PLANNED]` - Extended character data is not yet implemented.

A character extends the base combatant with player-specific information.

## Schema

```typescript
interface Character extends Combatant {
  // Character Info
  level: number           // 1-20
  class: CharacterClass   // Fighter, Wizard, etc.
  subclass?: string       // Champion, Evocation, etc.
  race: Race              // Human, Elf, etc.
  background?: string     // Soldier, Sage, etc.

  // Ability Scores
  abilities: AbilityScores

  // Defenses
  savingThrows: SavingThrows
  proficiencies: Proficiency[]

  // Resources
  spellSlots?: SpellSlots
  classResources?: ClassResource[]  // Ki, rage, etc.

  // Equipment
  weapons: Weapon[]
  armor?: Armor
  shield?: boolean
  items: Item[]
}
```

## Character Classes

### Martial Classes
| Class | Hit Die | Primary Ability | Key Features |
|-------|---------|-----------------|--------------|
| Fighter | d10 | STR/DEX | Extra Attack, Action Surge |
| Barbarian | d12 | STR | Rage, Reckless Attack |
| Rogue | d8 | DEX | Sneak Attack, Cunning Action |
| Monk | d8 | DEX/WIS | Martial Arts, Ki |
| Ranger | d10 | DEX/WIS | Favored Enemy, Spellcasting |
| Paladin | d10 | STR/CHA | Divine Smite, Lay on Hands |

### Spellcasting Classes
| Class | Hit Die | Primary Ability | Key Features |
|-------|---------|-----------------|--------------|
| Wizard | d6 | INT | Full caster, Arcane Recovery |
| Sorcerer | d6 | CHA | Full caster, Metamagic |
| Warlock | d8 | CHA | Pact Magic, Eldritch Blast |
| Cleric | d8 | WIS | Full caster, Channel Divinity |
| Druid | d8 | WIS | Full caster, Wild Shape |
| Bard | d8 | CHA | Full caster, Inspiration |

## Derived Stats

Many stats are derived from class, level, and abilities:

```typescript
// Proficiency bonus by level
const proficiencyBonus = Math.ceil(level / 4) + 1

// Ability modifier
const modifier = Math.floor((score - 10) / 2)

// Attack bonus (melee)
const meleeAttackBonus = proficiencyBonus + strModifier

// Attack bonus (ranged/finesse)
const rangedAttackBonus = proficiencyBonus + dexModifier

// Spell attack bonus
const spellAttackBonus = proficiencyBonus + castingModifier

// Spell save DC
const spellSaveDC = 8 + proficiencyBonus + castingModifier

// AC (unarmored)
const baseAC = 10 + dexModifier
```

## Simplified Mode

For basic simulations, characters can be created with just:
- Level
- Class
- Point buy or standard array for abilities

Everything else can be derived or use class defaults.

---

## Related Specs
- [Combatant](combatant.md) - Base schema
- [Spellcasting](../rules/spellcasting.md)
- [D&D Beyond Import](../integrations/dnd-beyond.md)
