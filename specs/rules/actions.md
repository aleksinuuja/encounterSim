# Actions

`[PLANNED]` - Full action economy is not yet implemented.

## Current Implementation `[IMPLEMENTED]`

Currently, each turn is simplified:
1. If healer with unconscious ally → Heal
2. Otherwise → Attack (all attacks)

No distinction between action types.

---

## Planned Action Economy

### Action
One action per turn. Options include:
- **Attack** - Make weapon attack(s) based on numAttacks
- **Cast a Spell** - Cast a spell with casting time of 1 action
- **Dash** - Double movement this turn
- **Disengage** - Movement doesn't provoke opportunity attacks
- **Dodge** - Attacks against you have disadvantage
- **Help** - Give ally advantage on next check/attack
- **Hide** - Attempt to become hidden
- **Ready** - Prepare action for a trigger
- **Use an Object** - Interact with something

### Bonus Action
One bonus action per turn, only if you have an ability that uses it:
- **Healing Word** - Heal at range as bonus action
- **Cunning Action** (Rogue) - Dash, Disengage, or Hide
- **Two-Weapon Fighting** - Attack with off-hand weapon
- **Martial Arts** (Monk) - Unarmed strike
- Various spell bonus actions

### Reaction
One reaction between your turns:
- **Opportunity Attack** - When enemy leaves your reach
- **Shield** (spell) - +5 AC until start of next turn
- **Counterspell** - Negate enemy spell
- **Uncanny Dodge** (Rogue) - Halve attack damage

### Free Actions
Unlimited, minor things:
- Speaking (brief)
- Dropping an item
- Interacting with one object (as part of action/movement)

---

## Class-Specific Actions `[FUTURE]`

### Fighter
- **Action Surge** - Take an additional action (1/rest)
- **Second Wind** - Heal 1d10+level as bonus action

### Rogue
- **Sneak Attack** - Extra damage when advantaged
- **Cunning Action** - Bonus action mobility

### Barbarian
- **Rage** - Bonus action to gain resistance and damage bonus
- **Reckless Attack** - Advantage on attacks, enemies have advantage on you

### Paladin
- **Divine Smite** - Expend spell slot for extra radiant damage
- **Lay on Hands** - Heal from pool of HP

### Cleric
- Various healing and buff spells

### Wizard/Sorcerer
- Spell-focused combat

---

## AI Decision Making `[PLANNED]`

When full action economy is implemented, AI needs to decide:
1. What action to take
2. Whether to use bonus action
3. When to use reaction

See [AI Tactics](../simulation/ai-tactics.md) for decision logic.

---

## Related Specs
- [Combat](combat.md)
- [Spellcasting](spellcasting.md) `[PLANNED]`
- [AI Tactics](../simulation/ai-tactics.md)
