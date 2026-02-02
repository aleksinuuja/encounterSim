# Combat Loop

This document describes how the combat simulation engine processes turns.

## Overview `[IMPLEMENTED]`

```
1. Initialize combat (roll initiative, set up state)
2. Loop through rounds until combat ends:
   a. For each combatant in initiative order:
      - Skip if dead
      - If unconscious: roll death save (or skip if stabilized)
      - If conscious: take turn (heal or attack)
   b. Check if combat should end
3. Return results
```

## Initialization

### Input
- `party`: Array of player combatants
- `monsters`: Array of monster combatants

### Process
1. Tag each combatant with `isPlayer` (true/false)
2. Roll initiative for each: `d20 + initiativeBonus`
3. Sort by initiative (descending)
4. Initialize combat state for each combatant

### Initial State
```typescript
{
  ...combatant,
  currentHp: maxHp,
  initiativeRoll: <rolled>,
  isPlayer: <tagged>,
  isUnconscious: false,
  isStabilized: false,
  isDead: false,
  deathSaveSuccesses: 0,
  deathSaveFailures: 0
}
```

---

## Round Loop

### Maximum Rounds
Combat ends after 100 rounds to prevent infinite loops.
If max rounds reached, winner is determined by total remaining HP.

### Turn Processing

```
for each combatant in initiative order:

  // Skip dead combatants
  if isDead: continue

  // Handle unconscious players
  if isUnconscious:
    if isStabilized:
      continue  // No action, but alive

    roll death save
    log the result

    if rolled natural 20:
      // Wake up and continue turn normally
    else:
      // Turn ends (can't act while unconscious)
      if died from failed saves:
        check if combat should end
      continue

  // Conscious combatant takes turn
  if has healingDice AND any ally is unconscious:
    heal the most endangered unconscious ally
    log the heal
  else:
    for each attack (up to numAttacks):
      select target (lowest HP conscious enemy)
      if no valid target:
        break  // Combat essentially over

      execute attack
      log the result

      check if combat should end
```

---

## Combat End Conditions `[IMPLEMENTED]`

Combat ends when one side has no living members:

```typescript
function checkCombatStatus(combatants) {
  const livingPlayers = combatants.filter(c => c.isPlayer && !c.isDead)
  const livingMonsters = combatants.filter(c => !c.isPlayer && !c.isDead)

  if (livingPlayers.length === 0) {
    return { shouldContinue: false, partyWon: false }
  }
  if (livingMonsters.length === 0) {
    return { shouldContinue: false, partyWon: true }
  }
  return { shouldContinue: true, partyWon: null }
}
```

Note: Unconscious but not dead players count as "living" for this check.

---

## Combat Log

Every action generates a log entry:

### Attack Log Entry
```typescript
{
  round: number,
  turn: number,
  actorName: string,
  targetName: string,
  actionType: 'attack',
  attackRoll: number,       // The d20 result
  totalAttack: number,      // d20 + attackBonus
  targetAC: number,
  hit: boolean,
  damageRoll?: number,      // If hit
  isCritical?: boolean,
  targetHpBefore?: number,
  targetHpAfter?: number,
  targetDowned?: boolean,   // Dropped to 0 HP
  targetDied?: boolean      // Monster killed or player died from damage
}
```

### Heal Log Entry
```typescript
{
  round: number,
  turn: number,
  actorName: string,
  targetName: string,
  actionType: 'heal',
  healRoll: number,
  targetHpBefore: number,
  targetHpAfter: number,
  revivedFromUnconscious: boolean
}
```

### Death Save Log Entry
```typescript
{
  round: number,
  turn: number,
  actorName: string,
  actionType: 'deathSave',
  deathSaveRoll: number,
  deathSaveSuccess: boolean,
  deathSaveSuccesses: number,
  deathSaveFailures: number,
  stabilized: boolean,
  died: boolean,
  recoveredFromNat20: boolean
}
```

---

## Simulation Result

Each combat simulation returns:

```typescript
{
  id: number,                    // Simulation number
  partyWon: boolean,
  totalRounds: number,
  survivingParty: string[],      // Names of surviving players
  survivingMonsters: string[],   // Names of surviving monsters
  log: LogEntry[]                // Full combat log
}
```

---

## Batch Simulation

Running multiple simulations:

```typescript
function runSimulations(party, monsters, numSimulations) {
  const results = []

  for (let i = 0; i < numSimulations; i++) {
    results.push(runCombat(party, monsters, i + 1))
  }

  const summary = {
    totalSimulations: numSimulations,
    partyWins: results.filter(r => r.partyWon).length,
    partyWinPercentage: (wins / numSimulations) * 100,
    averageRounds: average of totalRounds,
    survivorCounts: { [name]: count }
  }

  return { results, summary }
}
```

---

## Related Specs
- [Combat Rules](../rules/combat.md)
- [AI Tactics](ai-tactics.md)
- [Statistics](statistics.md)
