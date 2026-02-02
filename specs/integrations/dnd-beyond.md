# D&D Beyond Integration

`[FUTURE]` - This integration is not yet implemented.

## Overview

Import character and monster data from D&D Beyond.

## Character Import

### Input Methods
1. **Character URL**: `https://www.dndbeyond.com/characters/12345678`
2. **Character ID**: `12345678`
3. **Campaign sharing**: Import all characters from a campaign

### Data Extraction

D&D Beyond characters include:
- Name, race, class, level
- Ability scores (all 6)
- HP (current and max)
- AC (calculated with equipment)
- Proficiency bonus
- Saving throw modifiers
- Attack options with bonuses and damage
- Spell slots and prepared spells
- Equipment and magic items

### Mapping to Combatant

```typescript
function mapDnDBeyondCharacter(ddbChar): Combatant {
  return {
    id: `ddb-${ddbChar.id}`,
    name: ddbChar.name,
    maxHp: ddbChar.hitPointsMax,
    armorClass: calculateAC(ddbChar),
    initiativeBonus: getModifier(ddbChar.dexterity),
    attackBonus: getPrimaryAttackBonus(ddbChar),
    damage: getPrimaryDamage(ddbChar),
    numAttacks: getExtraAttacks(ddbChar) + 1,
    healingDice: getHealingAbility(ddbChar)
  }
}
```

### Challenges
- D&D Beyond doesn't have a public API
- May need to use character sheet JSON export
- Data format changes over time
- Some data is behind paywall

---

## Monster Import

### Input Methods
1. **Monster URL**: `https://www.dndbeyond.com/monsters/goblin`
2. **Monster name search**: Search D&D Beyond database
3. **Encounter builder export**: Import from D&D Beyond encounter

### Data Available
- Full stat block
- All actions and abilities
- Legendary/lair actions
- Lore and description

### Mapping to Combatant

```typescript
function mapDnDBeyondMonster(ddbMonster): Combatant {
  const primaryAttack = ddbMonster.actions[0]

  return {
    id: `ddb-${ddbMonster.id}`,
    name: ddbMonster.name,
    maxHp: ddbMonster.hitPointsAverage,
    armorClass: ddbMonster.armorClass,
    initiativeBonus: getModifier(ddbMonster.dexterity),
    attackBonus: primaryAttack.attackBonus,
    damage: primaryAttack.damage,
    numAttacks: countAttacks(ddbMonster)
  }
}
```

---

## Authentication

D&D Beyond requires authentication for:
- Accessing owned content
- Character details beyond basic info
- Homebrew content

### Options
1. **Public data only**: Limited to SRD/basic content
2. **User provides export**: User exports JSON, uploads to simulator
3. **Browser extension**: Extension extracts data while user is logged in
4. **OAuth integration**: If D&D Beyond ever provides API access

---

## Alternative Approaches

### Character Sheet PDF Parser
Parse exported character sheet PDFs.

### Manual JSON Export
1. User opens character in D&D Beyond
2. User runs bookmarklet/extension to export JSON
3. User uploads JSON to simulator

### Community Tools
Integrate with existing tools that extract D&D Beyond data:
- Beyond20
- VTTES
- Foundry VTT importers

---

## Related Specs
- [Character Data](../data/character.md)
- [Monster Data](../data/monster.md)
- [Custom JSON](custom-json.md)
