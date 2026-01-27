/**
 * Target selection logic for combat
 */

/**
 * Select the best target using focus-fire strategy (lowest HP enemy)
 * @param {Array} combatants - All combatants with currentHp and isPlayer
 * @param {boolean} attackerIsPlayer - Whether the attacker is a player
 * @returns {object|null} - The target combatant or null if no valid targets
 */
export function selectTarget(combatants, attackerIsPlayer) {
  const enemies = combatants.filter(c =>
    c.currentHp > 0 && c.isPlayer !== attackerIsPlayer
  )

  if (enemies.length === 0) {
    return null
  }

  // Sort by current HP (ascending) to focus fire on lowest HP
  enemies.sort((a, b) => a.currentHp - b.currentHp)

  return enemies[0]
}
