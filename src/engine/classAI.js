/**
 * Class AI Decision Logic
 * Heuristics for when to use class abilities
 */

import { hasResource, getResource, getMaxResource } from './resources.js';
import { hasFeature } from '../data/classTemplates.js';

// ============================================
// GENERAL HELPERS
// ============================================

/**
 * Check if target would be killed by extra damage
 */
function wouldKillTarget(target, extraDamage, averageBaseDamage = 0) {
  return target.currentHp <= (extraDamage + averageBaseDamage);
}

/**
 * Get average damage from dice notation
 */
function getAverageDamage(notation) {
  if (!notation) return 0;
  const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) return 0;

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  return count * ((sides + 1) / 2) + modifier;
}

/**
 * Check if combatant is low on HP
 */
function isLowHp(combatant, threshold = 0.5) {
  return combatant.currentHp < combatant.maxHp * threshold;
}

/**
 * Check if combatant is critical HP
 */
function isCriticalHp(combatant, threshold = 0.25) {
  return combatant.currentHp < combatant.maxHp * threshold;
}

/**
 * Count living allies
 */
function countLivingAllies(allies) {
  return allies.filter(a => !a.isDead && !a.isUnconscious).length;
}

/**
 * Count living enemies
 */
function countLivingEnemies(enemies) {
  return enemies.filter(e => !e.isDead && !e.isUnconscious).length;
}

/**
 * Find unconscious ally
 */
function findUnconsciousAlly(allies) {
  return allies.find(a => a.isUnconscious && !a.isDead);
}

/**
 * Find lowest HP ally
 */
function findLowestHpAlly(allies) {
  const living = allies.filter(a => !a.isDead && !a.isUnconscious);
  if (living.length === 0) return null;

  return living.reduce((lowest, current) =>
    (current.currentHp / current.maxHp) < (lowest.currentHp / lowest.maxHp)
      ? current : lowest
  );
}

/**
 * Find lowest HP enemy
 */
function findLowestHpEnemy(enemies) {
  const living = enemies.filter(e => !e.isDead && !e.isUnconscious);
  if (living.length === 0) return null;

  return living.reduce((lowest, current) =>
    current.currentHp < lowest.currentHp ? current : lowest
  );
}

/**
 * Check if target is a spellcaster
 */
function isSpellcaster(combatant) {
  return !!(combatant.spells?.length > 0 || combatant.cantrips?.length > 0 || combatant.spellSlots);
}

// ============================================
// FIGHTER AI
// ============================================

/**
 * Decide if Fighter should use Action Surge
 */
export function shouldUseActionSurge(fighter, target, allies, enemies) {
  if (!hasResource(fighter, 'actionSurge', 1)) return false;
  if (fighter.hasActionSurgeThisTurn) return false;

  const livingEnemies = countLivingEnemies(enemies);

  // Use if extra attacks would likely kill the target
  const avgDamage = getAverageDamage(fighter.damage) * (fighter.numAttacks || 1);
  if (wouldKillTarget(target, avgDamage * 2)) return true;

  // Use if we're outnumbered and need burst
  const livingAllies = countLivingAllies(allies);
  if (livingEnemies > livingAllies + 1) return true;

  // Use if this is the last enemy
  if (livingEnemies === 1 && target.currentHp < target.maxHp * 0.5) return true;

  // Use if fighter is low on HP (go down swinging)
  if (isCriticalHp(fighter)) return true;

  return false;
}

/**
 * Decide if Fighter should use Second Wind
 * (Already implemented in selectBonusAction, but here for completeness)
 */
export function shouldUseSecondWind(fighter) {
  if (!hasResource(fighter, 'secondWind', 1)) return false;
  return isLowHp(fighter, 0.5);
}

/**
 * Decide if Fighter should use Indomitable
 */
export function shouldUseIndomitable(fighter, saveType, effect) {
  if (!hasResource(fighter, 'indomitable', 1)) return false;

  // Always use against dangerous conditions
  const dangerousEffects = ['paralyzed', 'stunned', 'petrified', 'incapacitated', 'death'];
  if (dangerousEffects.includes(effect)) return true;

  // Always use against high damage
  if (effect === 'damage' && isCriticalHp(fighter)) return true;

  // Use against moderate effects if we have spare uses
  if (getResource(fighter, 'indomitable') >= 2) return true;

  return false;
}

// ============================================
// ROGUE AI
// ============================================

/**
 * Decide Cunning Action type
 */
export function selectCunningAction(rogue, allies, enemies) {
  const livingEnemies = enemies.filter(e => !e.isDead && !e.isUnconscious);

  // Hide if in back position and not hidden
  if (rogue.position === 'back' && !rogue.isHidden) {
    return 'hide';
  }

  // Disengage if low HP and in melee range (front position)
  if (isLowHp(rogue, 0.3) && rogue.position === 'front') {
    return 'disengage';
  }

  // Otherwise, prefer to not use (save bonus action for potential off-hand)
  return null;
}

/**
 * Decide if Rogue should use Uncanny Dodge
 */
export function shouldUseUncannyDodge(rogue, incomingDamage) {
  if (!hasFeature('rogue', rogue.level || 1, 'uncannyDodge')) return false;
  if (!rogue.hasReaction) return false;
  if (rogue.uncannyDodgeUsedThisRound) return false;

  // Always use if damage would knock us down
  if (incomingDamage >= rogue.currentHp) return true;

  // Use if damage is significant (>25% of max HP)
  if (incomingDamage >= rogue.maxHp * 0.25) return true;

  // Use if we're already low on HP
  if (isLowHp(rogue, 0.5) && incomingDamage >= 5) return true;

  return false;
}

// ============================================
// BARBARIAN AI
// ============================================

/**
 * Decide if Barbarian should Rage
 */
export function shouldRage(barbarian, round, enemies) {
  if (barbarian.isRaging) return false;
  if (!hasResource(barbarian, 'rage', 1)) return false;

  // Always rage round 1 if there are enemies
  if (round === 1 && countLivingEnemies(enemies) > 0) return true;

  // Rage if we're below 50% HP (defensive rage)
  if (isLowHp(barbarian, 0.5)) return true;

  // Rage if facing multiple enemies
  if (countLivingEnemies(enemies) >= 3) return true;

  return false;
}

/**
 * Decide if Barbarian should use Reckless Attack
 */
export function shouldUseRecklessAttack(barbarian, target, allies, enemies) {
  if (!hasFeature('barbarian', barbarian.level || 1, 'recklessAttack')) return false;

  // Use if raging (resistance offsets the disadvantage)
  if (barbarian.isRaging) return true;

  // Use if target has high AC (need the advantage)
  if (target.armorClass >= 18) return true;

  // Use if we would likely kill the target
  const avgDamage = getAverageDamage(barbarian.damage) * (barbarian.numAttacks || 1);
  if (wouldKillTarget(target, avgDamage)) return true;

  // Use if we heavily outnumber enemies
  const livingAllies = countLivingAllies(allies);
  const livingEnemies = countLivingEnemies(enemies);
  if (livingAllies >= livingEnemies * 2) return true;

  // Don't use if low HP and not raging
  if (isLowHp(barbarian, 0.3) && !barbarian.isRaging) return false;

  return false;
}

// ============================================
// PALADIN AI
// ============================================

/**
 * Decide if Paladin should use Lay on Hands
 */
export function shouldUseLayOnHands(paladin, allies) {
  if (!hasResource(paladin, 'layOnHands', 1)) return false;

  const pool = getResource(paladin, 'layOnHands');

  // Priority 1: Revive unconscious ally (5 HP to get them up)
  const unconscious = findUnconsciousAlly(allies);
  if (unconscious && pool >= 5) {
    return { target: unconscious, amount: 5 };
  }

  // Priority 2: Heal critically injured ally
  const lowestAlly = findLowestHpAlly(allies);
  if (lowestAlly && isCriticalHp(lowestAlly)) {
    const healAmount = Math.min(pool, lowestAlly.maxHp - lowestAlly.currentHp);
    if (healAmount >= 10) {
      return { target: lowestAlly, amount: healAmount };
    }
  }

  // Priority 3: Heal self if critical
  if (isCriticalHp(paladin)) {
    const selfHeal = Math.min(pool, paladin.maxHp - paladin.currentHp);
    if (selfHeal >= 10) {
      return { target: paladin, amount: selfHeal };
    }
  }

  return null;
}

/**
 * Decide if Paladin should Divine Smite
 */
export function shouldDivineSmite(paladin, isCritical, targetIsUndead, target) {
  if (!hasFeature('paladin', paladin.level || 1, 'divineSmite')) return null;
  if (!paladin.currentSlots) return null;

  // Find highest available slot (prefer not using highest for non-crits)
  let slotLevel = null;
  for (let level = 5; level >= 1; level--) {
    if (paladin.currentSlots[level] > 0) {
      slotLevel = level;
      break;
    }
  }

  if (!slotLevel) return null;

  // Always smite on crits (double damage!)
  if (isCritical) {
    return slotLevel;
  }

  // Always smite vs undead/fiend
  if (targetIsUndead || target.creatureType === 'fiend') {
    return Math.min(slotLevel, 2); // Use lower slot if possible
  }

  // Smite if it would kill the target
  const avgSmiteDamage = (1 + slotLevel) * 4.5; // d8 average
  if (wouldKillTarget(target, avgSmiteDamage)) {
    return Math.min(slotLevel, 2);
  }

  // Smite if we have lots of slots
  const totalSlots = Object.values(paladin.currentSlots).reduce((a, b) => a + b, 0);
  if (totalSlots >= 4) {
    return 1; // Use lowest slot
  }

  return null;
}

// ============================================
// MONK AI
// ============================================

/**
 * Decide Monk's bonus action
 */
export function selectMonkBonusAction(monk, target, allies, enemies) {
  if (!hasResource(monk, 'ki', 1)) return null;

  const ki = getResource(monk, 'ki');
  const livingEnemies = countLivingEnemies(enemies);

  // Priority 1: Flurry of Blows if target is wounded
  if (target && isLowHp(target, 0.5) && ki >= 1) {
    return { type: 'flurryOfBlows', target };
  }

  // Priority 2: Patient Defense if outnumbered or low HP
  if (isCriticalHp(monk) || livingEnemies >= 3) {
    return { type: 'patientDefense' };
  }

  // Priority 3: Flurry for damage
  if (target && livingEnemies > 0 && ki >= 2) {
    return { type: 'flurryOfBlows', target };
  }

  // Default: regular martial arts bonus attack (free)
  return { type: 'martialArtsBonus', target };
}

/**
 * Decide if Monk should use Stunning Strike
 */
export function shouldUseStunningStrike(monk, target) {
  if (!hasFeature('monk', monk.level || 1, 'stunningStrike')) return false;
  if (!hasResource(monk, 'ki', 1)) return false;

  const ki = getResource(monk, 'ki');

  // Always try to stun spellcasters
  if (isSpellcaster(target) && ki >= 2) return true;

  // Stun targets with low CON
  const targetCon = target.conMod || 0;
  if (targetCon <= 0 && ki >= 2) return true;

  // Stun if we have lots of ki
  if (ki >= monk.level * 0.7) return true;

  // Stun high-value targets (high damage output)
  const targetDamage = getAverageDamage(target.damage);
  if (targetDamage >= 15) return true;

  return false;
}

// ============================================
// CASTER AI
// ============================================

/**
 * Decide if Sorcerer should use Quickened Spell
 */
export function shouldUseQuickenedSpell(sorcerer, spellToCast, enemies) {
  if (!hasResource(sorcerer, 'sorceryPoints', 2)) return false;

  // Use for damage spells when multiple enemies
  if (countLivingEnemies(enemies) >= 3 && spellToCast?.isAoE) return true;

  // Use when action was used for something else
  if (!sorcerer.hasAction && sorcerer.hasBonusAction) return true;

  return false;
}

/**
 * Decide if Sorcerer should use Twinned Spell
 */
export function shouldUseTwinnedSpell(sorcerer, spellToCast, targets) {
  if (!spellToCast) return false;

  const cost = Math.max(1, spellToCast.level || 0);
  if (!hasResource(sorcerer, 'sorceryPoints', cost)) return false;

  // Only twin single-target spells
  if (spellToCast.isAoE) return false;

  // Twin if there are multiple valid targets
  const validTargets = targets.filter(t => !t.isDead && !t.isUnconscious);
  return validTargets.length >= 2;
}

/**
 * Decide if Bard should use Bardic Inspiration
 */
export function shouldUseBardicInspiration(bard, allies) {
  if (!hasResource(bard, 'bardicInspiration', 1)) return false;

  // Find a frontline ally who could use it
  const frontliners = allies.filter(a =>
    !a.isDead &&
    !a.isUnconscious &&
    a.position === 'front' &&
    !a.bardicInspirationDie &&
    a.id !== bard.id
  );

  if (frontliners.length === 0) return null;

  // Prefer the ally with highest attack bonus (they'll use it best)
  const target = frontliners.reduce((best, current) =>
    (current.attackBonus || 0) > (best.attackBonus || 0) ? current : best
  );

  return target;
}

// ============================================
// GENERAL CLASS ABILITY SELECTOR
// ============================================

/**
 * Select class-specific bonus action
 */
export function selectClassBonusAction(combatant, allies, enemies) {
  const livingEnemies = enemies.filter(e => !e.isDead && !e.isUnconscious);
  const target = findLowestHpEnemy(enemies);

  switch (combatant.class) {
    case 'barbarian':
      // Rage as bonus action
      if (shouldRage(combatant, 1, enemies)) {
        return { type: 'rage' };
      }
      break;

    case 'monk': {
      const monkAction = selectMonkBonusAction(combatant, target, allies, enemies);
      if (monkAction) return monkAction;
      break;
    }

    case 'bard': {
      const inspireTarget = shouldUseBardicInspiration(combatant, allies);
      if (inspireTarget) {
        return { type: 'bardicInspiration', target: inspireTarget };
      }
      break;
    }

    case 'rogue': {
      const cunningAction = selectCunningAction(combatant, allies, enemies);
      if (cunningAction) {
        return { type: 'cunningAction', cunningActionType: cunningAction };
      }
      break;
    }

    default:
      break;
  }

  return null;
}

export default {
  // Fighter
  shouldUseActionSurge,
  shouldUseSecondWind,
  shouldUseIndomitable,
  // Rogue
  selectCunningAction,
  shouldUseUncannyDodge,
  // Barbarian
  shouldRage,
  shouldUseRecklessAttack,
  // Paladin
  shouldUseLayOnHands,
  shouldDivineSmite,
  // Monk
  selectMonkBonusAction,
  shouldUseStunningStrike,
  // Casters
  shouldUseQuickenedSpell,
  shouldUseTwinnedSpell,
  shouldUseBardicInspiration,
  // General
  selectClassBonusAction
};
