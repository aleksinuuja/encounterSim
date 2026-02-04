/**
 * Damage calculation utilities including immunity and resistance
 */

/**
 * Apply damage to a target, accounting for immunities and resistances
 * @param {object} target - The target taking damage
 * @param {number} damage - Raw damage amount
 * @param {string} damageType - Type of damage (fire, cold, etc.)
 * @returns {{ finalDamage: number, immune: boolean, resistant: boolean, rageResisted: boolean }}
 */
export function applyDamage(target, damage, damageType) {
  // Check immunity first
  if (target.damageImmunities?.includes(damageType)) {
    return { finalDamage: 0, immune: true, resistant: false, rageResisted: false }
  }

  // Check resistance
  if (target.damageResistances?.includes(damageType)) {
    return { finalDamage: Math.floor(damage / 2), immune: false, resistant: true, rageResisted: false }
  }

  // v0.11: Barbarian rage resistance (B/P/S only)
  if (target.isRaging && target.class === 'barbarian') {
    const physicalTypes = ['bludgeoning', 'piercing', 'slashing']
    if (physicalTypes.includes(damageType?.toLowerCase())) {
      return { finalDamage: Math.floor(damage / 2), immune: false, resistant: false, rageResisted: true }
    }
  }

  return { finalDamage: damage, immune: false, resistant: false, rageResisted: false }
}

/**
 * Check if a target should use Legendary Resistance to auto-succeed a failed save
 * AI decision: use on dangerous conditions (paralyzed, stunned, frightened, etc.)
 * @param {object} target - The target who failed a save
 * @param {string} conditionType - The condition that would be applied (null for damage-only)
 * @param {number} damage - Damage that would be taken if save failed
 * @returns {boolean} - Whether to use legendary resistance
 */
export function shouldUseLegendaryResistance(target, conditionType, damage = 0) {
  // Must have legendary resistance available
  if (!target.currentLegendaryResistances || target.currentLegendaryResistances <= 0) {
    return false
  }

  // Priority conditions - always use resistance
  const dangerousConditions = ['paralyzed', 'stunned', 'petrified', 'incapacitated']
  if (dangerousConditions.includes(conditionType)) {
    return true
  }

  // Secondary conditions - use if plenty of resistances left
  const annoyingConditions = ['frightened', 'charmed', 'restrained', 'blinded']
  if (annoyingConditions.includes(conditionType) && target.currentLegendaryResistances >= 2) {
    return true
  }

  // High damage saves - use if damage would be significant
  if (!conditionType && damage >= target.maxHp * 0.25 && target.currentLegendaryResistances >= 2) {
    return true
  }

  return false
}

/**
 * Use a legendary resistance to auto-succeed a save
 * @param {object} target - The target using legendary resistance
 * @returns {boolean} - Whether resistance was used
 */
export function useLegendaryResistance(target) {
  if (!target.currentLegendaryResistances || target.currentLegendaryResistances <= 0) {
    return false
  }

  target.currentLegendaryResistances--
  return true
}
