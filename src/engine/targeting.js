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

/**
 * Select the best heal target (lowest HP ally below 50% threshold)
 * @param {Array} combatants - All combatants with currentHp and isPlayer
 * @param {boolean} healerIsPlayer - Whether the healer is a player
 * @returns {object|null} - The target ally to heal or null if no valid targets
 */
export function selectHealTarget(combatants, healerIsPlayer) {
  const allies = combatants.filter(c =>
    c.currentHp > 0 &&
    c.isPlayer === healerIsPlayer &&
    c.currentHp < c.maxHp * 0.5
  )

  if (allies.length === 0) {
    return null
  }

  // Sort by current HP (ascending) to heal lowest HP ally first
  allies.sort((a, b) => a.currentHp - b.currentHp)

  return allies[0]
}
