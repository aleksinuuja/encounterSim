/**
 * Conditions system for D&D 5e combat
 * Handles condition definitions, tracking, and combat modifiers
 */

/**
 * Condition definitions with their combat effects
 */
export const CONDITIONS = {
  prone: {
    name: 'Prone',
    attackModifier: 'disadvantage',
    // Melee attacks have advantage, ranged have disadvantage
    defendModifier: (attackType) => attackType === 'melee' ? 'advantage' : 'disadvantage',
    canAct: true,
    description: 'Disadvantage on attacks. Melee advantage against, ranged disadvantage against.'
  },
  stunned: {
    name: 'Stunned',
    attackModifier: null, // Can't attack
    defendModifier: () => 'advantage',
    canAct: false,
    description: "Can't take actions. Attacks against have advantage."
  },
  poisoned: {
    name: 'Poisoned',
    attackModifier: 'disadvantage',
    defendModifier: () => 'normal',
    canAct: true,
    description: 'Disadvantage on attack rolls.'
  },
  restrained: {
    name: 'Restrained',
    attackModifier: 'disadvantage',
    defendModifier: () => 'advantage',
    canAct: true,
    description: 'Disadvantage on attacks. Attacks against have advantage.'
  },
  blinded: {
    name: 'Blinded',
    attackModifier: 'disadvantage',
    defendModifier: () => 'advantage',
    canAct: true,
    description: 'Disadvantage on attacks. Attacks against have advantage.'
  }
}

/**
 * Check if a combatant has a specific condition
 * @param {object} combatant - The combatant to check
 * @param {string} conditionType - The condition type to check for
 * @returns {boolean}
 */
export function hasCondition(combatant, conditionType) {
  if (!combatant.conditions) return false
  return combatant.conditions.some(c => c.type === conditionType)
}

/**
 * Get a specific condition from a combatant
 * @param {object} combatant - The combatant to check
 * @param {string} conditionType - The condition type to get
 * @returns {object|null}
 */
export function getCondition(combatant, conditionType) {
  if (!combatant.conditions) return null
  return combatant.conditions.find(c => c.type === conditionType) || null
}

/**
 * Apply a condition to a combatant
 * @param {object} combatant - The combatant to apply condition to
 * @param {object} condition - The condition to apply
 * @param {string} condition.type - Condition type (e.g., 'poisoned')
 * @param {number|null} condition.duration - Rounds remaining (null = until cured)
 * @param {string} condition.source - Who applied the condition
 * @param {object} [condition.saveEndOfTurn] - Optional save to end early
 * @returns {boolean} - Whether condition was applied (false if already has it)
 */
export function applyCondition(combatant, condition) {
  if (!combatant.conditions) {
    combatant.conditions = []
  }

  // Don't stack same condition type - refresh duration instead
  const existing = combatant.conditions.find(c => c.type === condition.type)
  if (existing) {
    // Refresh duration if new one is longer
    if (condition.duration === null ||
        (existing.duration !== null && condition.duration > existing.duration)) {
      existing.duration = condition.duration
      existing.source = condition.source
      existing.saveEndOfTurn = condition.saveEndOfTurn
    }
    return false
  }

  combatant.conditions.push({
    type: condition.type,
    duration: condition.duration,
    source: condition.source,
    saveEndOfTurn: condition.saveEndOfTurn || null
  })

  return true
}

/**
 * Remove a condition from a combatant
 * @param {object} combatant - The combatant to remove condition from
 * @param {string} conditionType - The condition type to remove
 * @returns {boolean} - Whether condition was removed
 */
export function removeCondition(combatant, conditionType) {
  if (!combatant.conditions) return false

  const index = combatant.conditions.findIndex(c => c.type === conditionType)
  if (index === -1) return false

  combatant.conditions.splice(index, 1)
  return true
}

/**
 * Process end-of-turn saving throws for conditions
 * @param {object} combatant - The combatant to process
 * @param {function} rollD20 - D20 roll function
 * @returns {Array<{type: string, roll: number, dc: number, saved: boolean}>}
 */
export function processEndOfTurnSaves(combatant, rollD20) {
  if (!combatant.conditions || combatant.conditions.length === 0) {
    return []
  }

  const saveResults = []

  combatant.conditions = combatant.conditions.filter(condition => {
    if (!condition.saveEndOfTurn) {
      return true // No save available for this condition
    }

    const { ability, dc } = condition.saveEndOfTurn
    const roll = rollD20()
    const saveBonus = combatant[ability + 'Save'] || 0
    const total = roll + saveBonus
    const saved = total >= dc

    saveResults.push({
      type: condition.type,
      roll,
      total,
      dc,
      ability,
      saved
    })

    return !saved // Keep condition if save failed
  })

  return saveResults
}

/**
 * Process end-of-turn duration ticks for a combatant
 * Decrements duration and removes expired conditions
 * @param {object} combatant - The combatant to process
 * @returns {string[]} - Array of condition types that expired
 */
export function tickConditions(combatant) {
  if (!combatant.conditions || combatant.conditions.length === 0) {
    return []
  }

  const expired = []

  combatant.conditions = combatant.conditions.filter(condition => {
    if (condition.duration === null) {
      return true // Permanent until cured
    }

    condition.duration -= 1
    if (condition.duration <= 0) {
      expired.push(condition.type)
      return false
    }
    return true
  })

  return expired
}

/**
 * Check if combatant can take actions this turn
 * @param {object} combatant - The combatant to check
 * @returns {boolean}
 */
export function canAct(combatant) {
  if (!combatant.conditions) return true

  for (const condition of combatant.conditions) {
    const definition = CONDITIONS[condition.type]
    if (definition && !definition.canAct) {
      return false
    }
  }
  return true
}

/**
 * Get attack roll modifier based on attacker's conditions
 * @param {object} attacker - The attacking combatant
 * @returns {'advantage' | 'disadvantage' | 'normal'}
 */
export function getAttackModifier(attacker) {
  if (!attacker.conditions || attacker.conditions.length === 0) {
    return 'normal'
  }

  let hasAdvantage = false
  let hasDisadvantage = false

  for (const condition of attacker.conditions) {
    const definition = CONDITIONS[condition.type]
    if (!definition) continue

    if (definition.attackModifier === 'advantage') {
      hasAdvantage = true
    } else if (definition.attackModifier === 'disadvantage') {
      hasDisadvantage = true
    }
  }

  // Advantage and disadvantage cancel out
  if (hasAdvantage && hasDisadvantage) return 'normal'
  if (hasAdvantage) return 'advantage'
  if (hasDisadvantage) return 'disadvantage'
  return 'normal'
}

/**
 * Get defense modifier (what attacker rolls against this target)
 * @param {object} target - The target combatant
 * @param {string} attackType - 'melee' or 'ranged'
 * @returns {'advantage' | 'disadvantage' | 'normal'}
 */
export function getDefenseModifier(target, attackType = 'melee') {
  if (!target.conditions || target.conditions.length === 0) {
    return 'normal'
  }

  let hasAdvantage = false
  let hasDisadvantage = false

  for (const condition of target.conditions) {
    const definition = CONDITIONS[condition.type]
    if (!definition) continue

    const modifier = typeof definition.defendModifier === 'function'
      ? definition.defendModifier(attackType)
      : definition.defendModifier

    if (modifier === 'advantage') {
      hasAdvantage = true
    } else if (modifier === 'disadvantage') {
      hasDisadvantage = true
    }
  }

  // Advantage and disadvantage cancel out
  if (hasAdvantage && hasDisadvantage) return 'normal'
  if (hasAdvantage) return 'advantage'
  if (hasDisadvantage) return 'disadvantage'
  return 'normal'
}

/**
 * Combine attack and defense modifiers to get final roll modifier
 * @param {object} attacker - The attacking combatant
 * @param {object} target - The target combatant
 * @param {string} attackType - 'melee' or 'ranged'
 * @returns {'advantage' | 'disadvantage' | 'normal'}
 */
export function getCombinedModifier(attacker, target, attackType = 'melee') {
  const attackMod = getAttackModifier(attacker)
  const defenseMod = getDefenseModifier(target, attackType)

  let advantageCount = 0
  let disadvantageCount = 0

  if (attackMod === 'advantage') advantageCount++
  if (attackMod === 'disadvantage') disadvantageCount++
  if (defenseMod === 'advantage') advantageCount++
  if (defenseMod === 'disadvantage') disadvantageCount++

  // Any advantage + any disadvantage = normal
  if (advantageCount > 0 && disadvantageCount > 0) return 'normal'
  if (advantageCount > 0) return 'advantage'
  if (disadvantageCount > 0) return 'disadvantage'
  return 'normal'
}

/**
 * Get all active conditions on a combatant
 * @param {object} combatant - The combatant to check
 * @returns {object[]} - Array of active conditions
 */
export function getActiveConditions(combatant) {
  return combatant.conditions || []
}

/**
 * Clear all conditions from a combatant
 * @param {object} combatant - The combatant to clear
 */
export function clearConditions(combatant) {
  combatant.conditions = []
}
