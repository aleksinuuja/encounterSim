# Death and Healing Rules

This document describes how characters are knocked out, die, and are healed.

## Dropping to 0 HP `[IMPLEMENTED]`

### Players
When a player drops to 0 HP:
- They fall **unconscious**
- They are NOT dead yet
- They begin making death saving throws
- Any healing will restore them to consciousness

### Monsters
When a monster drops to 0 HP:
- They **die immediately**
- No death saves for monsters
- They are removed from combat

---

## Death Saving Throws `[IMPLEMENTED]`

Unconscious players roll death saves at the **start** of each of their turns.

### The Roll
- Roll: `d20` (no modifiers)
- DC: 10

### Results

| Roll | Result |
|------|--------|
| 20 (Natural) | Regain 1 HP, wake up, can act this turn |
| 10-19 | One success |
| 2-9 | One failure |
| 1 (Natural) | Two failures |

### Tracking
- Track successes (0-3) and failures (0-3) separately
- Counts persist until:
  - Character dies (3 failures)
  - Character stabilizes (3 successes)
  - Character is healed

### Outcomes

**3 Failures = Death**
- Character dies permanently
- Removed from combat
- Cannot be healed (in current implementation)

**3 Successes = Stabilized**
- Character stops rolling death saves
- Remains unconscious at 0 HP
- Cannot act, but won't die
- Still benefits from healing

---

## Taking Damage at 0 HP `[IMPLEMENTED]`

When an unconscious character takes damage:
- They automatically fail death saves
- Melee attacks cause **2 failures**
- *(Ranged attacks would cause 1 failure, but currently all attacks are treated as melee)*

This can cause instant death if it pushes failures to 3+.

---

## Healing `[IMPLEMENTED]`

### Who Can Heal
Combatants with the `healingDice` stat can heal allies.

### Heal Targeting (Yo-yo Healing)
Healers **only** heal unconscious allies.

This is optimal D&D strategy because:
- Any amount of healing restores consciousness
- A conscious ally at 1 HP can act normally
- More efficient than keeping HP topped off

### Healing Effects
When an unconscious character receives healing:
1. HP increases by heal amount
2. `isUnconscious` → false
3. Death save counts reset to 0
4. Character can act on their next turn

### Heal Amount
- Roll: healingDice (e.g., "1d8+3")
- HP cannot exceed maxHp

---

## Stabilization `[IMPLEMENTED]`

A stabilized character:
- Has 3 death save successes
- Is still unconscious (0 HP)
- Does NOT roll more death saves
- Can still receive healing to wake up

### Future Consideration `[PLANNED]`
- Stabilized characters regain 1 HP after 1d4 hours
- Medicine check to stabilize without magic
- Spare the Dying cantrip

---

## Massive Damage `[FUTURE]`

Not yet implemented. Official rule:
- If remaining damage after hitting 0 HP >= maxHp, instant death
- Example: 10 HP character takes 25 damage → instant death

---

## Related Specs
- [Combat](combat.md)
- [Data: Combatant](../data/combatant.md)
