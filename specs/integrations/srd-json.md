# SRD JSON Integration

`[PLANNED]` - This integration is not yet implemented.

## Overview

Import monsters from the D&D 5e Systems Reference Document (SRD) using open JSON data sources.

## Data Sources

### Open5e API
- URL: `https://api.open5e.com/`
- License: Open Gaming License (OGL)
- Content: SRD monsters, spells, classes, etc.

### 5e-database
- URL: `https://www.dnd5eapi.co/`
- GitHub: `https://github.com/5e-bits/5e-database`
- License: MIT
- Content: SRD content in REST API

### Static JSON Files
Bundle commonly-used monsters in the application:
- All SRD monsters (~300)
- Organized by CR
- No network request needed

---

## Monster Schema (Open5e)

```json
{
  "slug": "goblin",
  "name": "Goblin",
  "size": "Small",
  "type": "humanoid",
  "subtype": "goblinoid",
  "alignment": "neutral evil",
  "armor_class": 15,
  "armor_desc": "leather armor, shield",
  "hit_points": 7,
  "hit_dice": "2d6",
  "speed": {
    "walk": 30
  },
  "strength": 8,
  "dexterity": 14,
  "constitution": 10,
  "intelligence": 10,
  "wisdom": 8,
  "charisma": 8,
  "strength_save": null,
  "dexterity_save": null,
  "constitution_save": null,
  "intelligence_save": null,
  "wisdom_save": null,
  "charisma_save": null,
  "perception": null,
  "skills": {
    "stealth": 6
  },
  "damage_vulnerabilities": "",
  "damage_resistances": "",
  "damage_immunities": "",
  "condition_immunities": "",
  "senses": "darkvision 60 ft., passive Perception 9",
  "languages": "Common, Goblin",
  "challenge_rating": "1/4",
  "actions": [
    {
      "name": "Scimitar",
      "desc": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.",
      "attack_bonus": 4,
      "damage_dice": "1d6+2"
    },
    {
      "name": "Shortbow",
      "desc": "Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.",
      "attack_bonus": 4,
      "damage_dice": "1d6+2"
    }
  ],
  "special_abilities": [
    {
      "name": "Nimble Escape",
      "desc": "The goblin can take the Disengage or Hide action as a bonus action on each of its turns."
    }
  ]
}
```

---

## Mapping to Combatant

```typescript
function mapSrdMonster(srdMonster): Combatant {
  // Find best melee attack
  const primaryAttack = srdMonster.actions?.find(a => a.attack_bonus)
    || { attack_bonus: 0, damage_dice: '1d4' }

  return {
    id: `srd-${srdMonster.slug}`,
    name: srdMonster.name,
    maxHp: srdMonster.hit_points,
    armorClass: srdMonster.armor_class,
    initiativeBonus: Math.floor((srdMonster.dexterity - 10) / 2),
    attackBonus: primaryAttack.attack_bonus,
    damage: primaryAttack.damage_dice,
    numAttacks: countMultiattack(srdMonster)
  }
}

function countMultiattack(monster): number {
  // Parse multiattack description to count attacks
  const multiattack = monster.actions?.find(a =>
    a.name.toLowerCase() === 'multiattack'
  )

  if (!multiattack) return 1

  // Simple heuristic: count "attack" mentions
  const matches = multiattack.desc.match(/\b(two|three|four|2|3|4)\b/i)
  if (matches) {
    const num = matches[1].toLowerCase()
    return { two: 2, three: 3, four: 4, '2': 2, '3': 3, '4': 4 }[num] || 1
  }

  return 1
}
```

---

## Monster Library UI

```
┌─────────────────────────────────────────────┐
│ Monster Library                [Search: go] │
├─────────────────────────────────────────────┤
│ Filter: [All CRs ▼] [All Types ▼]          │
├─────────────────────────────────────────────┤
│ Goblin          CR 1/4   Humanoid   [+ Add] │
│ Goblin Boss     CR 1     Humanoid   [+ Add] │
│ Golem, Clay     CR 9     Construct  [+ Add] │
│ Golem, Iron     CR 16    Construct  [+ Add] │
│ Golem, Stone    CR 10    Construct  [+ Add] │
├─────────────────────────────────────────────┤
│ Showing 5 of 322 monsters                   │
└─────────────────────────────────────────────┘
```

### Features
- Search by name
- Filter by CR range
- Filter by creature type
- Sort by name/CR
- Click to see full stat block
- Add button adds to encounter

---

## Caching

- Cache API responses in localStorage
- Cache expiration: 7 days
- Fallback to bundled JSON if API unavailable

---

## Related Specs
- [Monster Data](../data/monster.md)
- [Encounter Builder](../ui/encounter-builder.md)
- [Custom JSON](custom-json.md)
