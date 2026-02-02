# Combat Rules

This document describes the D&D 5e combat rules implemented in the simulator.

## Initiative `[IMPLEMENTED]`

At the start of combat, all combatants roll for initiative to determine turn order.

### Rolling Initiative
- Roll: `d20 + initiativeBonus`
- Higher totals act first

### Tie-breaking
When two combatants have the same initiative total:
1. Players go before monsters
2. Alphabetical by name

### Turn Order
- Initiative order is set once at combat start
- Order remains fixed for the entire combat (no re-rolling)

---

## Turn Structure `[IMPLEMENTED]`

Each combatant takes one turn per round, in initiative order.

### Current Implementation
On their turn, a combatant can:
1. **Heal** (if they have healing dice AND an ally is unconscious)
2. **OR Attack** (using all available attacks)

### Future Implementation `[PLANNED]`
Full action economy:
- 1 Action (attack, cast spell, dash, etc.)
- 1 Bonus Action (if available)
- 1 Reaction (between turns, if triggered)
- Movement (not currently simulated)

---

## Attack Resolution `[IMPLEMENTED]`

### Making an Attack
1. Roll `d20 + attackBonus`
2. Compare to target's `armorClass`
3. If roll >= AC, the attack hits

### Natural 1 (Fumble)
- Always misses, regardless of bonuses

### Natural 20 (Critical Hit)
- Always hits, regardless of AC
- Damage dice are doubled (not bonus)

### Damage
- On hit, roll damage dice and apply to target
- Target's HP cannot go below 0

### Example
```
Attacker: +5 attack bonus, 1d8+3 damage
Target: AC 15

Roll: 14 + 5 = 19 vs AC 15 → Hit!
Damage: 1d8+3 → rolls 6 + 3 = 9 damage

If roll was Natural 20:
Damage: 2d8+3 → rolls 6+4 + 3 = 13 damage
```

---

## Multi-attack `[IMPLEMENTED]`

Some combatants can make multiple attacks per turn.

- Defined by `numAttacks` stat (default: 1)
- Each attack is resolved separately
- Can target different enemies
- Combat can end mid-multiattack if all enemies are defeated

---

## Targeting `[IMPLEMENTED]`

### Attack Targeting (Focus Fire)
Combatants target the conscious enemy with the lowest current HP.

Rationale: Eliminating enemies faster reduces incoming damage.

### Heal Targeting (Yo-yo Priority)
Healers target the unconscious ally with the most death save failures.

Rationale: Save allies closest to death first.

### Unconscious Targets
- Monsters **do not** attack unconscious players (default behavior)
- This may become configurable in the future

---

## Damage Types `[FUTURE]`

Currently, all damage is untyped. Future versions may include:
- Damage types (slashing, fire, etc.)
- Resistance (half damage)
- Vulnerability (double damage)
- Immunity (no damage)

---

## Related Specs
- [Death and Healing](death-and-healing.md)
- [Conditions](conditions.md) `[PLANNED]`
- [Actions](actions.md) `[PLANNED]`
