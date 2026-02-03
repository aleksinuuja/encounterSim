/**
 * Abstract positioning system for AOE targeting
 *
 * Positions:
 * - 'front': Melee combatants, close to enemy
 * - 'back': Ranged combatants, casters, support
 *
 * AOE shapes:
 * - 'sphere': Caster chooses which position group to hit (Fireball)
 * - 'cone': Hits front position only (breath weapons)
 * - 'line': Hits 1 random target from each position group
 */

/**
 * Get default position based on combatant type
 * @param {object} combatant - The combatant
 * @returns {'front' | 'back'}
 */
export function getDefaultPosition(combatant) {
  // Explicit position takes precedence
  if (combatant.position) {
    return combatant.position
  }

  // Ranged attackers stay in back
  if (combatant.attackType === 'ranged') {
    return 'back'
  }

  // Casters with no melee attacks stay in back
  if ((combatant.spells?.length > 0 || combatant.cantrips?.length > 0) &&
      !combatant.healingDice &&
      combatant.attackBonus <= 3) {
    return 'back'
  }

  // Everyone else in front (melee fighters, clerics who wade in, etc.)
  return 'front'
}

/**
 * Get living enemies at a specific position
 * @param {object[]} combatants - All combatants
 * @param {boolean} attackerIsPlayer - Is the attacker a player?
 * @param {'front' | 'back'} position - Position to filter by
 * @returns {object[]}
 */
export function getEnemiesAtPosition(combatants, attackerIsPlayer, position) {
  return combatants.filter(c =>
    c.isPlayer !== attackerIsPlayer &&
    !c.isDead &&
    !c.isUnconscious &&
    (c.position || getDefaultPosition(c)) === position
  )
}

/**
 * Get all living enemies grouped by position
 * @param {object[]} combatants - All combatants
 * @param {boolean} attackerIsPlayer - Is the attacker a player?
 * @returns {{ front: object[], back: object[] }}
 */
export function getEnemiesByPosition(combatants, attackerIsPlayer) {
  const front = []
  const back = []

  for (const c of combatants) {
    if (c.isPlayer === attackerIsPlayer || c.isDead || c.isUnconscious) {
      continue
    }
    const pos = c.position || getDefaultPosition(c)
    if (pos === 'front') {
      front.push(c)
    } else {
      back.push(c)
    }
  }

  return { front, back }
}

/**
 * Select targets for a sphere/radius AOE (like Fireball)
 * AI picks the position with more enemies
 * @param {object[]} combatants - All combatants
 * @param {boolean} casterIsPlayer - Is the caster a player?
 * @returns {{ targets: object[], position: 'front' | 'back' }}
 */
export function selectSphereTargets(combatants, casterIsPlayer) {
  const { front, back } = getEnemiesByPosition(combatants, casterIsPlayer)

  // Pick position with more enemies
  if (front.length >= back.length) {
    return { targets: front, position: 'front' }
  }
  return { targets: back, position: 'back' }
}

/**
 * Select targets for a cone AOE (like breath weapons)
 * Cones only hit the front line
 * @param {object[]} combatants - All combatants
 * @param {boolean} attackerIsPlayer - Is the attacker a player?
 * @returns {{ targets: object[], position: 'front' }}
 */
export function selectConeTargets(combatants, attackerIsPlayer) {
  const front = getEnemiesAtPosition(combatants, attackerIsPlayer, 'front')

  // If no front targets, cone can still clip back line (just fewer)
  if (front.length === 0) {
    const back = getEnemiesAtPosition(combatants, attackerIsPlayer, 'back')
    // Cone clips 1 back target at most
    return { targets: back.slice(0, 1), position: 'back' }
  }

  return { targets: front, position: 'front' }
}

/**
 * Select targets for a line AOE (like Lightning Bolt)
 * Lines hit 1 random target from each position group
 * @param {object[]} combatants - All combatants
 * @param {boolean} attackerIsPlayer - Is the attacker a player?
 * @returns {{ targets: object[], positions: string[] }}
 */
export function selectLineTargets(combatants, attackerIsPlayer) {
  const { front, back } = getEnemiesByPosition(combatants, attackerIsPlayer)
  const targets = []
  const positions = []

  if (front.length > 0) {
    // Pick random front target
    const idx = Math.floor(Math.random() * front.length)
    targets.push(front[idx])
    positions.push('front')
  }

  if (back.length > 0) {
    // Pick random back target
    const idx = Math.floor(Math.random() * back.length)
    targets.push(back[idx])
    positions.push('back')
  }

  return { targets, positions }
}

/**
 * Determine the best AOE shape decision
 * @param {object} spell - The spell definition
 * @param {object[]} combatants - All combatants
 * @param {boolean} casterIsPlayer - Is the caster a player?
 * @returns {{ shouldCast: boolean, targets: object[], position?: string }}
 */
export function selectAOETargets(spell, combatants, casterIsPlayer) {
  const aoeShape = spell.aoeShape || 'sphere' // Default to sphere

  if (aoeShape === 'cone') {
    const { targets, position } = selectConeTargets(combatants, casterIsPlayer)
    return {
      shouldCast: targets.length >= 1,
      targets,
      position
    }
  }

  if (aoeShape === 'line') {
    const { targets, positions } = selectLineTargets(combatants, casterIsPlayer)
    return {
      shouldCast: targets.length >= 2, // Line is worth it with 2+ targets
      targets,
      position: positions.join('-')
    }
  }

  // Sphere (default) - hit the position with more enemies
  const { targets, position } = selectSphereTargets(combatants, casterIsPlayer)
  return {
    shouldCast: targets.length >= 2, // Fireball is worth it with 2+ targets
    targets,
    position
  }
}

/**
 * Count enemies by position for AOE decision making
 * @param {object[]} combatants - All combatants
 * @param {boolean} attackerIsPlayer - Is the attacker a player?
 * @returns {{ frontCount: number, backCount: number, total: number }}
 */
export function countEnemiesByPosition(combatants, attackerIsPlayer) {
  const { front, back } = getEnemiesByPosition(combatants, attackerIsPlayer)
  return {
    frontCount: front.length,
    backCount: back.length,
    total: front.length + back.length
  }
}
