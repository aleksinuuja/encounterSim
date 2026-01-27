/**
 * Target selection logic for combat
 */

/**
 * Select the best target using focus-fire strategy (lowest HP conscious enemy)
 * Skips unconscious and dead targets (monsters don't attack downed players by default)
 * @param {Array} combatants - All combatants with currentHp and isPlayer
 * @param {boolean} attackerIsPlayer - Whether the attacker is a player
 * @returns {object|null} - The target combatant or null if no valid targets
 */
export function selectTarget(combatants, attackerIsPlayer) {
  const enemies = combatants.filter(c =>
    c.isPlayer !== attackerIsPlayer &&
    !c.isDead &&
    !c.isUnconscious
  )

  if (enemies.length === 0) {
    return null
  }

  // Sort by current HP (ascending) to focus fire on lowest HP
  enemies.sort((a, b) => a.currentHp - b.currentHp)

  return enemies[0]
}

/**
 * Select the best heal target (unconscious ally who is not dead)
 * Yo-yo healing: only heal allies who are at 0 HP (unconscious)
 * @param {Array} combatants - All combatants with currentHp and isPlayer
 * @param {boolean} healerIsPlayer - Whether the healer is a player
 * @returns {object|null} - The target ally to heal or null if no valid targets
 */
export function selectHealTarget(combatants, healerIsPlayer) {
  const allies = combatants.filter(c =>
    c.isPlayer === healerIsPlayer &&
    c.isUnconscious &&
    !c.isDead
  )

  if (allies.length === 0) {
    return null
  }

  // Priority: heal the one with most death save failures first (most at risk)
  allies.sort((a, b) => b.deathSaveFailures - a.deathSaveFailures)

  return allies[0]
}
