# Spellcasting

`[PLANNED]` - This feature is not yet implemented.

## Overview

Spellcasting allows characters to produce magical effects in combat. This is one of the most complex systems in D&D 5e.

---

## Spell Slots `[PLANNED]`

### Slot Levels
- Spell slots come in levels 1-9
- Higher level slots can cast lower level spells
- Some spells gain bonuses when cast at higher levels ("upcasting")

### Slot Recovery
- Long rest: Recover all spell slots
- Short rest: Some classes recover limited slots (Warlock, Wizard Arcane Recovery)

### Example Slot Progression (Wizard)
| Level | 1st | 2nd | 3rd | 4th | 5th |
|-------|-----|-----|-----|-----|-----|
| 1 | 2 | - | - | - | - |
| 3 | 4 | 2 | - | - | - |
| 5 | 4 | 3 | 2 | - | - |

---

## Cantrips `[PLANNED]`

Cantrips are level-0 spells:
- Can be cast unlimited times
- No spell slot required
- Scale with character level (not class level)

### Common Damage Cantrips
| Cantrip | Damage | Save/Attack | Notes |
|---------|--------|-------------|-------|
| Fire Bolt | 1d10 | Attack roll | Range 120ft |
| Eldritch Blast | 1d10 | Attack roll | Multiple beams at higher levels |
| Sacred Flame | 1d8 | DEX save | No cover bonus |
| Toll the Dead | 1d8/1d12 | WIS save | d12 if target damaged |

---

## Spell Attacks `[PLANNED]`

Some spells require attack rolls:
- Roll: `d20 + spellcasting modifier + proficiency`
- Compare to target AC
- Critical hits double damage dice (like weapon attacks)

---

## Saving Throw Spells `[PLANNED]`

Many spells require the target to make a saving throw:
- DC = 8 + spellcasting modifier + proficiency
- Target rolls ability + save modifier
- Success often means half damage or no effect

---

## Concentration `[PLANNED]`

Some spells require concentration to maintain:
- Only one concentration spell at a time
- Casting another concentration spell ends the first
- Taking damage requires CON save (DC 10 or half damage, whichever higher)
- Failing save ends the spell
- Being incapacitated ends concentration

### Common Concentration Spells
- Bless, Bane
- Hold Person
- Hypnotic Pattern
- Haste
- Spirit Guardians

---

## Area of Effect `[FUTURE]`

Many spells affect areas:
- **Sphere** - Point of origin, radius
- **Cone** - Origin point, spreads outward
- **Line** - Origin, length, width
- **Cube** - Point of origin, size

Currently not simulated (no positioning system).

---

## Common Combat Spells to Implement

### Damage Spells
| Spell | Level | Damage | Type | Notes |
|-------|-------|--------|------|-------|
| Magic Missile | 1 | 3d4+3 | Force | Auto-hit |
| Burning Hands | 1 | 3d6 | Fire | 15ft cone, DEX save |
| Scorching Ray | 2 | 6d6 | Fire | 3 rays, attack rolls |
| Fireball | 3 | 8d6 | Fire | 20ft sphere, DEX save |
| Lightning Bolt | 3 | 8d6 | Lightning | 100ft line, DEX save |

### Healing Spells
| Spell | Level | Healing | Action | Notes |
|-------|-------|---------|--------|-------|
| Healing Word | 1 | 1d4+mod | Bonus | 60ft range |
| Cure Wounds | 1 | 1d8+mod | Action | Touch |
| Mass Healing Word | 3 | 1d4+mod | Bonus | 6 creatures |
| Mass Cure Wounds | 5 | 3d8+mod | Action | 6 creatures |

### Control Spells
| Spell | Level | Effect | Save | Duration |
|-------|-------|--------|------|----------|
| Sleep | 1 | Unconscious | None | 1 minute |
| Hold Person | 2 | Paralyzed | WIS | Concentration |
| Hypnotic Pattern | 3 | Incapacitated | WIS | Concentration |
| Banishment | 4 | Removed | CHA | Concentration |

---

## AI Spellcasting Decisions `[FUTURE]`

AI needs to decide:
1. Cast spell or attack?
2. Which spell to cast?
3. What level slot to use?
4. Who to target?
5. Maintain concentration or cast new spell?

---

## Related Specs
- [Actions](actions.md)
- [Saving Throws](saving-throws.md) `[PLANNED]`
- [AI Tactics](../simulation/ai-tactics.md)
