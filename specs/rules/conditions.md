# Conditions

`[PLANNED]` - This feature is not yet implemented.

## Overview

Conditions are status effects that modify a creature's capabilities. They have specific rules for how they affect combat.

---

## Planned Conditions

### Unconscious `[PARTIALLY IMPLEMENTED]`
Currently tracked as `isUnconscious` flag.

Full rules:
- Can't take actions or reactions
- Can't move or speak
- Automatically fails Strength and Dexterity saves
- Attack rolls against have advantage
- Attacks from within 5 feet are automatic critical hits
- Drops whatever it's holding
- Falls prone

### Prone `[PLANNED]`
- Disadvantage on attack rolls
- Melee attacks against have advantage
- Ranged attacks against have disadvantage
- Can crawl (half speed) or use half movement to stand

### Stunned `[PLANNED]`
- Can't take actions or reactions
- Can't move
- Automatically fails Strength and Dexterity saves
- Attack rolls against have advantage

### Restrained `[PLANNED]`
- Speed becomes 0
- Disadvantage on attack rolls
- Disadvantage on Dexterity saves
- Attack rolls against have advantage

### Paralyzed `[PLANNED]`
- Can't take actions or reactions
- Can't move or speak
- Automatically fails Strength and Dexterity saves
- Attack rolls against have advantage
- Attacks from within 5 feet are automatic critical hits

### Frightened `[PLANNED]`
- Disadvantage on ability checks and attacks while source is visible
- Can't willingly move closer to source

### Charmed `[PLANNED]`
- Can't attack the charmer
- Charmer has advantage on social checks

### Blinded `[PLANNED]`
- Can't see (auto-fail sight-based checks)
- Disadvantage on attack rolls
- Attack rolls against have advantage

### Poisoned `[PLANNED]`
- Disadvantage on attack rolls and ability checks

### Incapacitated `[PLANNED]`
- Can't take actions or reactions

### Grappled `[PLANNED]`
- Speed becomes 0
- Ends if grappler is incapacitated or moved apart

---

## Condition Duration `[PLANNED]`

Conditions can last:
- Until end of current turn
- Until end of next turn
- Until start of next turn
- For X rounds
- Until a save is made (end of each turn)
- Until specific trigger (taking damage, etc.)

---

## Advantage and Disadvantage `[PLANNED]`

When you have advantage:
- Roll 2d20, take the higher

When you have disadvantage:
- Roll 2d20, take the lower

If you have both, they cancel out (roll normally).

---

## Related Specs
- [Combat](combat.md)
- [Saving Throws](saving-throws.md) `[PLANNED]`
