// Resource Management System for D&D Class Abilities
import { initializeClassResources } from '../data/classTemplates.js';

/**
 * Initialize all class resources for a combatant
 * Called at combat start (simulates fresh party)
 */
export function initResources(combatant) {
  if (!combatant.class || !combatant.level) {
    return { ...combatant };
  }

  const abilityMods = {
    strength: combatant.strMod || 0,
    dexterity: combatant.dexMod || 0,
    constitution: combatant.conMod || 0,
    intelligence: combatant.intMod || 0,
    wisdom: combatant.wisMod || 0,
    charisma: combatant.chaMod || 0
  };

  const classResources = initializeClassResources(combatant.class, combatant.level, abilityMods);

  return {
    ...combatant,
    classResources,
    // Per-turn tracking
    sneakAttackUsedThisTurn: false,
    // State tracking
    isRaging: false,
    rageRoundsRemaining: 0,
    // Reaction tracking (in addition to hasReaction)
    uncannyDodgeUsedThisRound: false
  };
}

/**
 * Reset per-turn resource flags
 * Called at start of each combatant's turn
 */
export function resetTurnResources(combatant) {
  return {
    ...combatant,
    sneakAttackUsedThisTurn: false
  };
}

/**
 * Reset per-round resource flags
 * Called at start of each round
 */
export function resetRoundResources(combatant) {
  return {
    ...combatant,
    uncannyDodgeUsedThisRound: false
  };
}

/**
 * Check if a resource is available
 */
export function hasResource(combatant, resourceName, amount = 1) {
  if (!combatant.classResources) return false;
  const resource = combatant.classResources[resourceName];
  if (!resource) return false;
  return resource.current >= amount;
}

/**
 * Consume a resource
 * Returns updated combatant or null if resource not available
 */
export function consumeResource(combatant, resourceName, amount = 1) {
  if (!hasResource(combatant, resourceName, amount)) {
    return null;
  }

  return {
    ...combatant,
    classResources: {
      ...combatant.classResources,
      [resourceName]: {
        ...combatant.classResources[resourceName],
        current: combatant.classResources[resourceName].current - amount
      }
    }
  };
}

/**
 * Restore a resource
 */
export function restoreResource(combatant, resourceName, amount) {
  if (!combatant.classResources?.[resourceName]) {
    return combatant;
  }

  const resource = combatant.classResources[resourceName];
  const newCurrent = Math.min(resource.max, resource.current + amount);

  return {
    ...combatant,
    classResources: {
      ...combatant.classResources,
      [resourceName]: {
        ...resource,
        current: newCurrent
      }
    }
  };
}

/**
 * Get current resource value
 */
export function getResource(combatant, resourceName) {
  return combatant.classResources?.[resourceName]?.current || 0;
}

/**
 * Get max resource value
 */
export function getMaxResource(combatant, resourceName) {
  return combatant.classResources?.[resourceName]?.max || 0;
}

/**
 * Set rage state
 */
export function startRage(combatant) {
  const updated = consumeResource(combatant, 'rage', 1);
  if (!updated) return null;

  return {
    ...updated,
    isRaging: true,
    rageRoundsRemaining: 10 // 1 minute = 10 rounds
  };
}

/**
 * End rage state
 */
export function endRage(combatant) {
  return {
    ...combatant,
    isRaging: false,
    rageRoundsRemaining: 0
  };
}

/**
 * Tick down rage duration
 * Called at end of each round
 */
export function tickRage(combatant) {
  if (!combatant.isRaging) return combatant;

  const newRounds = combatant.rageRoundsRemaining - 1;
  if (newRounds <= 0) {
    return endRage(combatant);
  }

  return {
    ...combatant,
    rageRoundsRemaining: newRounds
  };
}

/**
 * Short rest - restore short rest resources
 */
export function shortRest(combatant) {
  if (!combatant.classResources) return combatant;

  const restored = { ...combatant.classResources };
  for (const [key, resource] of Object.entries(restored)) {
    if (resource.restType === 'short') {
      restored[key] = { ...resource, current: resource.max };
    }
  }

  return {
    ...combatant,
    classResources: restored,
    isRaging: false,
    rageRoundsRemaining: 0
  };
}

/**
 * Long rest - restore all resources
 */
export function longRest(combatant) {
  if (!combatant.classResources) return combatant;

  const restored = { ...combatant.classResources };
  for (const [key, resource] of Object.entries(restored)) {
    restored[key] = { ...resource, current: resource.max };
  }

  return {
    ...combatant,
    classResources: restored,
    isRaging: false,
    rageRoundsRemaining: 0
  };
}

/**
 * Check if combatant has a specific class feature
 */
export function hasClassFeature(combatant, featureName) {
  if (!combatant.class || !combatant.level) return false;

  // Import the hasFeature function at runtime to avoid circular dependency
  // This is evaluated lazily when the function is called
  return import('../data/classTemplates.js').then(module => {
    return module.hasFeature(combatant.class, combatant.level, featureName);
  });
}

/**
 * Synchronous version - checks against known features
 */
export function hasClassFeatureSync(combatant, featureName) {
  if (!combatant.class || !combatant.level) return false;

  // Known feature mappings for synchronous checks
  const featuresByClassLevel = {
    rogue: {
      cunningAction: 2,
      uncannyDodge: 5,
      evasion: 7,
      elusive: 18,
      strokeOfLuck: 20
    },
    monk: {
      martialArts: 1,
      ki: 2,
      flurryOfBlows: 2,
      patientDefense: 2,
      stepOfTheWind: 2,
      stunningStrike: 5,
      evasion: 7,
      diamondSoul: 14
    },
    barbarian: {
      rage: 1,
      recklessAttack: 2,
      brutalCritical: 9,
      relentlessRage: 11
    },
    paladin: {
      layOnHands: 1,
      divineSmite: 2,
      auraOfProtection: 6,
      improvedDivineSmite: 11
    },
    fighter: {
      fightingStyle: 1,
      secondWind: 1,
      actionSurge: 2,
      indomitable: 9
    },
    ranger: {
      fightingStyle: 2,
      foeSlayer: 20
    }
  };

  const classFeatures = featuresByClassLevel[combatant.class];
  if (!classFeatures) return false;

  const requiredLevel = classFeatures[featureName];
  if (!requiredLevel) return false;

  return combatant.level >= requiredLevel;
}

/**
 * Calculate Sneak Attack dice for current level
 */
export function getSneakAttackDice(combatant) {
  if (combatant.class !== 'rogue') return 0;
  return Math.ceil((combatant.level || 1) / 2);
}

/**
 * Calculate Martial Arts die for current level
 */
export function getMartialArtsDie(combatant) {
  if (combatant.class !== 'monk') return null;
  const level = combatant.level || 1;

  if (level >= 17) return '1d10';
  if (level >= 11) return '1d8';
  if (level >= 5) return '1d6';
  return '1d4';
}

/**
 * Calculate Rage damage bonus for current level
 */
export function getRageDamage(combatant) {
  if (combatant.class !== 'barbarian') return 0;
  const level = combatant.level || 1;

  if (level >= 16) return 4;
  if (level >= 9) return 3;
  return 2;
}

/**
 * Calculate Brutal Critical dice for current level
 */
export function getBrutalCriticalDice(combatant) {
  if (combatant.class !== 'barbarian') return 0;
  const level = combatant.level || 1;

  if (level >= 17) return 3;
  if (level >= 13) return 2;
  if (level >= 9) return 1;
  return 0;
}

/**
 * Calculate Lay on Hands pool for current level
 */
export function getLayOnHandsPool(combatant) {
  if (combatant.class !== 'paladin') return 0;
  return (combatant.level || 1) * 5;
}

/**
 * Calculate Bardic Inspiration die for current level
 */
export function getBardicInspirationDie(combatant) {
  if (combatant.class !== 'bard') return null;
  const level = combatant.level || 1;

  if (level >= 15) return '1d12';
  if (level >= 10) return '1d10';
  if (level >= 5) return '1d8';
  return '1d6';
}

/**
 * Get Paladin aura radius
 */
export function getAuraRadius(combatant) {
  if (combatant.class !== 'paladin') return 0;
  if ((combatant.level || 1) >= 18) return 30;
  if ((combatant.level || 1) >= 6) return 10;
  return 0;
}

export default {
  initResources,
  resetTurnResources,
  resetRoundResources,
  hasResource,
  consumeResource,
  restoreResource,
  getResource,
  getMaxResource,
  startRage,
  endRage,
  tickRage,
  shortRest,
  longRest,
  hasClassFeature,
  getSneakAttackDice,
  getMartialArtsDie,
  getRageDamage,
  getBrutalCriticalDice,
  getLayOnHandsPool,
  getBardicInspirationDie,
  getAuraRadius
};
