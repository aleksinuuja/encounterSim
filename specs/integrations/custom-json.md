# Custom JSON Format

`[PLANNED]` - This format is designed but import/export not yet implemented.

## Overview

The native JSON format for saving and sharing encounters, characters, and monsters.

---

## Combatant Schema

```json
{
  "$schema": "https://encounter-sim.example.com/schemas/combatant.json",
  "version": "1.0",
  "combatant": {
    "id": "fighter-1",
    "name": "Thorin Ironforge",
    "maxHp": 44,
    "armorClass": 18,
    "initiativeBonus": 1,
    "attackBonus": 7,
    "damage": "1d8+5",
    "numAttacks": 2,
    "healingDice": null
  }
}
```

---

## Party Schema

```json
{
  "$schema": "https://encounter-sim.example.com/schemas/party.json",
  "version": "1.0",
  "party": {
    "name": "The Silver Company",
    "members": [
      {
        "id": "fighter-1",
        "name": "Thorin Ironforge",
        "maxHp": 44,
        "armorClass": 18,
        "initiativeBonus": 1,
        "attackBonus": 7,
        "damage": "1d8+5",
        "numAttacks": 2
      },
      {
        "id": "cleric-1",
        "name": "Sister Mercy",
        "maxHp": 32,
        "armorClass": 16,
        "initiativeBonus": 0,
        "attackBonus": 5,
        "damage": "1d6+2",
        "numAttacks": 1,
        "healingDice": "1d8+3"
      }
    ]
  }
}
```

---

## Encounter Schema

```json
{
  "$schema": "https://encounter-sim.example.com/schemas/encounter.json",
  "version": "1.0",
  "encounter": {
    "name": "Goblin Ambush",
    "description": "A group of goblins attacks the party on the road.",
    "party": [
      { "id": "fighter-1", "name": "Thorin", "maxHp": 44, "..." : "..." }
    ],
    "monsters": [
      { "id": "goblin-1", "name": "Goblin", "maxHp": 7, "..." : "..." },
      { "id": "goblin-2", "name": "Goblin", "maxHp": 7, "..." : "..." },
      { "id": "goblin-3", "name": "Goblin", "maxHp": 7, "..." : "..." },
      { "id": "hobgoblin-1", "name": "Hobgoblin Captain", "maxHp": 22, "..." : "..." }
    ]
  }
}
```

---

## Simulation Results Schema

```json
{
  "$schema": "https://encounter-sim.example.com/schemas/results.json",
  "version": "1.0",
  "results": {
    "encounter": { "..." : "..." },
    "summary": {
      "totalSimulations": 1000,
      "partyWins": 650,
      "partyWinPercentage": 65.0,
      "averageRounds": 4.2,
      "survivorCounts": {
        "Thorin": 780,
        "Sister Mercy": 650
      }
    },
    "simulations": [
      {
        "id": 1,
        "partyWon": true,
        "totalRounds": 3,
        "survivingParty": ["Thorin", "Sister Mercy"],
        "survivingMonsters": [],
        "log": [ "..." ]
      }
    ]
  }
}
```

---

## Import/Export UI

### Export
```
[Export Party] [Export Encounter] [Export Results]

Options:
[ ] Include full simulation logs (larger file)
[x] Pretty print JSON
```

### Import
```
[Import from File] [Paste JSON]

Drag and drop a .json file here
or click to browse
```

### Validation
On import, validate:
1. JSON is well-formed
2. Required fields present
3. Values in valid ranges
4. Dice notation is parseable

Show helpful error messages:
- "Missing required field: maxHp for combatant 'Thorin'"
- "Invalid dice notation: '1d8++3' for damage"

---

## URL Sharing

Encode small encounters in URL for easy sharing:

```
https://encounter-sim.example.com/?e=eyJwYXJ0eSI6W3...
```

- Base64 encoded JSON
- Compressed for shorter URLs
- Max URL length: ~2000 chars
- For larger encounters, use file sharing

---

## Related Specs
- [Combatant Data](../data/combatant.md)
- [Encounter Data](../data/encounter.md)
- [Persistence](../architecture/persistence.md)
