# AI Tactics

This document describes how combatants make decisions during combat.

## Current Implementation `[IMPLEMENTED]`

The AI is currently simple and deterministic:

### Attack Targeting: Focus Fire
Always attack the conscious enemy with the lowest current HP.

```typescript
function selectTarget(combatants, attackerIsPlayer) {
  const enemies = combatants.filter(c =>
    c.isPlayer !== attackerIsPlayer &&
    !c.isDead &&
    !c.isUnconscious
  )

  // Sort by HP ascending, return lowest
  enemies.sort((a, b) => a.currentHp - b.currentHp)
  return enemies[0] || null
}
```

**Rationale**: Eliminating enemies faster reduces total incoming damage.

### Heal Targeting: Save the Dying
Only heal unconscious allies, prioritizing those closest to death.

```typescript
function selectHealTarget(combatants, healerIsPlayer) {
  const allies = combatants.filter(c =>
    c.isPlayer === healerIsPlayer &&
    c.isUnconscious &&
    !c.isDead
  )

  // Sort by death save failures descending
  allies.sort((a, b) => b.deathSaveFailures - a.deathSaveFailures)
  return allies[0] || null
}
```

**Rationale**: Yo-yo healing is action-efficient; save most endangered first.

### Monster Behavior: Ignore Downed
Monsters do not attack unconscious players.

**Rationale**: Matches typical table play; keeps yo-yo healing viable.

---

## Planned Improvements `[PLANNED]`

### Configurable Monster Aggression

```typescript
type AggressionLevel = 'casual' | 'tactical' | 'brutal'

// casual: Never attack downed players (current default)
// tactical: Attack downed players if no other threats
// brutal: Always finish off downed players
```

### Threat Assessment

Instead of just lowest HP, consider:
- Damage output potential
- Healing capability
- Remaining resources (spell slots)
- Conditions affecting threat

```typescript
function calculateThreat(combatant) {
  let threat = 0

  // Base threat from damage potential
  threat += expectedDamagePerRound(combatant)

  // Healers are high priority
  if (combatant.healingDice) {
    threat += 50
  }

  // Spellcasters with slots remaining
  if (combatant.spellSlots?.remaining > 0) {
    threat += 30
  }

  // Low HP enemies are easier to eliminate
  const hpFactor = combatant.currentHp / combatant.maxHp
  threat *= (2 - hpFactor)  // 1x at full HP, 2x at 1 HP

  return threat
}
```

### Self-Preservation

Low-HP combatants might:
- Prioritize healing themselves
- Use defensive actions (Dodge)
- Attempt to flee

```typescript
function shouldFlee(combatant) {
  const hpPercent = combatant.currentHp / combatant.maxHp
  const alliesDead = countDeadAllies(combatant)

  // Flee if below 25% HP and losing badly
  return hpPercent < 0.25 && alliesDead >= 2
}
```

### Intelligent Healing

Consider heal efficiency:
- Don't overheal (wasted healing)
- Heal Word vs Cure Wounds (action economy)
- Mass healing when multiple allies down

```typescript
function selectHealSpell(healer, target) {
  const damage = target.maxHp - target.currentHp

  // Use smaller heal if it's sufficient
  if (damage <= 10 && healer.hasSpell('healing-word')) {
    return 'healing-word'  // Bonus action
  }

  // Use bigger heal for more damage
  if (damage > 20 && healer.hasSpell('cure-wounds')) {
    return 'cure-wounds'  // More healing, but action
  }

  return healer.defaultHeal
}
```

---

## AI Profiles `[FUTURE]`

Different combatants could have different tactical profiles:

### Berserker
- Always attacks nearest enemy
- Never retreats
- Ignores own HP

### Tactician
- Focus fires
- Protects healers
- Retreats when outmatched

### Coward
- Attacks weakest enemy
- Flees at 50% HP
- Avoids strong enemies

### Pack Hunter
- Coordinates with allies
- All attack same target
- Flanking bonuses

### Guardian
- Protects designated ally
- Intercepts attacks
- Uses defensive abilities

---

## Related Specs
- [Combat Loop](combat-loop.md)
- [Combat Rules](../rules/combat.md)
- [Monster Data](../data/monster.md)
