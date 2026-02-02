# Monster Data Model

`[PLANNED]` - Extended monster data is not yet implemented.

A monster extends the base combatant with monster-specific information.

## Schema

```typescript
interface Monster extends Combatant {
  // Monster Info
  size: Size              // Tiny, Small, Medium, Large, Huge, Gargantuan
  type: MonsterType       // Beast, Humanoid, Undead, etc.
  alignment?: string      // Lawful Good, Chaotic Evil, etc.
  challengeRating: number // 0, 0.125, 0.25, 0.5, 1-30

  // Abilities
  abilities: AbilityScores
  savingThrows: SavingThrows

  // Defenses
  resistances: Resistances

  // Speed
  speed: {
    walk: number
    fly?: number
    swim?: number
    climb?: number
    burrow?: number
  }

  // Senses
  senses: {
    darkvision?: number
    blindsight?: number
    tremorsense?: number
    truesight?: number
    passivePerception: number
  }

  // Actions
  actions: MonsterAction[]
  legendaryActions?: LegendaryAction[]
  reactions?: Reaction[]

  // Special
  traits?: Trait[]        // Passive abilities
  spellcasting?: MonsterSpellcasting
}
```

## Monster Actions

```typescript
interface MonsterAction {
  name: string
  description: string
  actionType: 'melee' | 'ranged' | 'spell' | 'special'

  // For attacks
  attackBonus?: number
  reach?: number          // Melee reach in feet
  range?: number          // Ranged distance in feet
  damage?: DamageRoll[]

  // For saves
  saveDC?: number
  saveType?: Ability

  // Usage limits
  recharge?: number       // Recharge on X-6
  usesPerDay?: number
}

interface DamageRoll {
  dice: string            // e.g., "2d6+4"
  type: DamageType
}
```

## Challenge Rating

CR determines encounter difficulty and XP value.

| CR | Prof | AC | HP | Attack | Damage/Rnd | Save DC |
|----|------|----|----|--------|------------|---------|
| 0 | +2 | 13 | 1-6 | +3 | 0-1 | 13 |
| 1/4 | +2 | 13 | 36-49 | +3 | 2-3 | 13 |
| 1/2 | +2 | 13 | 50-70 | +3 | 4-5 | 13 |
| 1 | +2 | 13 | 71-85 | +3 | 6-8 | 13 |
| 2 | +2 | 13 | 86-100 | +3 | 9-14 | 13 |
| 5 | +3 | 15 | 131-145 | +6 | 27-32 | 15 |
| 10 | +4 | 17 | 206-220 | +7 | 63-68 | 16 |
| 15 | +5 | 18 | 281-295 | +8 | 99-104 | 18 |
| 20 | +6 | 19 | 356-400 | +9 | 120-140 | 19 |

## Legendary Creatures

High-CR monsters often have legendary actions:

```typescript
interface LegendaryAction {
  name: string
  description: string
  cost: number            // Usually 1-3
}

// Monster gets 3 legendary actions per round
// Can use at end of another creature's turn
// Regain all at start of own turn
```

## Example: Goblin

```typescript
const goblin: Monster = {
  id: "goblin-1",
  name: "Goblin",
  size: "Small",
  type: "Humanoid",
  alignment: "Neutral Evil",
  challengeRating: 0.25,

  maxHp: 7,               // 2d6
  armorClass: 15,         // Leather + shield
  initiativeBonus: 2,     // DEX modifier

  abilities: {
    strength: 8,
    dexterity: 14,
    constitution: 10,
    intelligence: 10,
    wisdom: 8,
    charisma: 8
  },

  speed: { walk: 30 },
  senses: { darkvision: 60, passivePerception: 9 },

  actions: [
    {
      name: "Scimitar",
      actionType: "melee",
      attackBonus: 4,
      reach: 5,
      damage: [{ dice: "1d6+2", type: "slashing" }]
    },
    {
      name: "Shortbow",
      actionType: "ranged",
      attackBonus: 4,
      range: 80,
      damage: [{ dice: "1d6+2", type: "piercing" }]
    }
  ],

  traits: [
    {
      name: "Nimble Escape",
      description: "Can Disengage or Hide as bonus action"
    }
  ]
}
```

---

## Related Specs
- [Combatant](combatant.md) - Base schema
- [SRD JSON Import](../integrations/srd-json.md)
- [AI Tactics](../simulation/ai-tactics.md)
