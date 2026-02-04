/**
 * Target selection logic for combat
 */

import { getDefaultPosition } from './positioning.js'

/**
 * Calculate threat score for a combatant (for tactical AI targeting)
 * Higher score = higher priority target
 * @param {object} combatant - The potential target
 * @returns {number} - Threat score
 */
export function calculateThreatScore(combatant) {
  let score = 0

  // Concentrating on a spell - high priority to break it
  if (combatant.concentratingOn) {
    score += 100
  }

  // Has spell slots remaining - they're a caster threat
  if (combatant.currentSlots) {
    const totalSlots = Object.values(combatant.currentSlots).reduce((sum, n) => sum + n, 0)
    score += totalSlots * 10
  }

  // Has cantrips - at least some magical threat
  if (combatant.cantrips?.length > 0) {
    score += 20
  }

  // Has healing - stop the yo-yo
  if (combatant.healingDice) {
    score += 50
  }

  // Low HP targets are easier to eliminate (tie-breaker)
  // Invert HP so lower HP = higher score (max 50 points for 1 HP)
  score += Math.max(0, 50 - combatant.currentHp)

  // Back line targets are often squishier high-value targets
  const position = combatant.position || getDefaultPosition(combatant)
  if (position === 'back') {
    score += 15
  }

  return score
}

/**
 * Select the best target using tactical AI (prioritize threats)
 * Used by intelligent monsters like dragons
 * @param {Array} combatants - All combatants
 * @param {boolean} attackerIsPlayer - Whether the attacker is a player
 * @param {object} options - Targeting options
 * @param {boolean} options.canReachBackline - Whether attacker can reach backline
 * @returns {object|null} - The target combatant or null
 */
export function selectTacticalTarget(combatants, attackerIsPlayer, options = {}) {
  const { canReachBackline = false } = options

  let enemies = combatants.filter(c =>
    c.isPlayer !== attackerIsPlayer &&
    !c.isDead &&
    !c.isUnconscious
  )

  if (enemies.length === 0) {
    return null
  }

  // If can't reach backline, filter to front only
  if (!canReachBackline) {
    const frontEnemies = enemies.filter(c =>
      (c.position || getDefaultPosition(c)) === 'front'
    )
    // Only filter if there ARE front enemies; otherwise take what we can get
    if (frontEnemies.length > 0) {
      enemies = frontEnemies
    }
  }

  // Sort by threat score (descending)
  enemies.sort((a, b) => calculateThreatScore(b) - calculateThreatScore(a))

  return enemies[0]
}

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
