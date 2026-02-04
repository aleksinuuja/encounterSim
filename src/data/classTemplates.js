// D&D 5e Class Templates - Combat-impacting features only
// Levels 1-20, base classes (subclasses deferred)

export const FIGHTING_STYLES = {
  archery: { name: 'Archery', attackBonus: 2, ranged: true },
  defense: { name: 'Defense', acBonus: 1 },
  dueling: { name: 'Dueling', damageBonus: 2, oneHanded: true },
  greatWeaponFighting: { name: 'Great Weapon Fighting', rerollDamage: [1, 2] },
  protection: { name: 'Protection', reaction: 'imposedDisadvantage' },
  twoWeaponFighting: { name: 'Two-Weapon Fighting', offHandDamageBonus: true }
};

// Martial Arts die progression by monk level
export const MARTIAL_ARTS_DIE = {
  1: '1d4', 2: '1d4', 3: '1d4', 4: '1d4',
  5: '1d6', 6: '1d6', 7: '1d6', 8: '1d6', 9: '1d6', 10: '1d6',
  11: '1d8', 12: '1d8', 13: '1d8', 14: '1d8', 15: '1d8', 16: '1d8',
  17: '1d10', 18: '1d10', 19: '1d10', 20: '1d10'
};

// Rage damage bonus by barbarian level
export const RAGE_DAMAGE = {
  1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2,
  9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3, 15: 3,
  16: 4, 17: 4, 18: 4, 19: 4, 20: 4
};

// Rages per day by barbarian level
export const RAGES_PER_DAY = {
  1: 2, 2: 2, 3: 3, 4: 3, 5: 3, 6: 4, 7: 4, 8: 4, 9: 4, 10: 4, 11: 4,
  12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 6, 18: 6, 19: 6, 20: Infinity
};

// Sneak Attack dice by rogue level
export const SNEAK_ATTACK_DICE = level => Math.ceil(level / 2);

// Extra Attacks by class and level
export const EXTRA_ATTACKS = {
  fighter: { 5: 2, 11: 3, 20: 4 },
  barbarian: { 5: 2 },
  paladin: { 5: 2 },
  ranger: { 5: 2 },
  monk: { 5: 2 }
};

// Proficiency bonus by level
export const PROFICIENCY_BONUS = level => Math.ceil(level / 4) + 1;

// Ki points = monk level
export const KI_POINTS = level => level;

// Lay on Hands pool = 5 * paladin level
export const LAY_ON_HANDS_POOL = level => level * 5;

// Sorcery Points = sorcerer level
export const SORCERY_POINTS = level => level;

// Bardic Inspiration dice
export const BARDIC_INSPIRATION_DIE = {
  1: '1d6', 2: '1d6', 3: '1d6', 4: '1d6',
  5: '1d8', 6: '1d8', 7: '1d8', 8: '1d8', 9: '1d8',
  10: '1d10', 11: '1d10', 12: '1d10', 13: '1d10', 14: '1d10',
  15: '1d12', 16: '1d12', 17: '1d12', 18: '1d12', 19: '1d12', 20: '1d12'
};

// Bardic Inspiration uses (CHA mod, min 1) - varies by CHA, but fixed uses before level 5
export const BARDIC_INSPIRATION_USES = (level, chaMod) => {
  return Math.max(1, chaMod);
};

// Channel Divinity uses
export const CHANNEL_DIVINITY_USES = {
  1: 0, 2: 1, 3: 1, 4: 1, 5: 1,
  6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2,
  18: 3, 19: 3, 20: 3
};

// Class definitions with level-based features
export const CLASS_TEMPLATES = {
  fighter: {
    name: 'Fighter',
    hitDie: 10,
    primaryAbility: 'strength',
    savingThrows: ['strength', 'constitution'],
    features: {
      1: ['fightingStyle', 'secondWind'],
      2: ['actionSurge'],
      5: ['extraAttack'],
      9: ['indomitable'],
      11: ['extraAttack2'],
      13: ['indomitable2'],
      17: ['indomitable3', 'actionSurge2'],
      20: ['extraAttack3']
    },
    resources: level => ({
      secondWind: { max: 1, restType: 'short' },
      actionSurge: { max: level >= 17 ? 2 : 1, restType: 'short' },
      indomitable: { max: level >= 17 ? 3 : level >= 13 ? 2 : level >= 9 ? 1 : 0, restType: 'long' }
    }),
    numAttacks: level => level >= 20 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1
  },

  rogue: {
    name: 'Rogue',
    hitDie: 8,
    primaryAbility: 'dexterity',
    savingThrows: ['dexterity', 'intelligence'],
    features: {
      1: ['sneakAttack', 'expertise'],
      2: ['cunningAction'],
      3: ['steadyAim'], // Optional from Tasha's
      5: ['uncannyDodge'],
      7: ['evasion'],
      11: ['reliableTalent'],
      14: ['blindsense'],
      18: ['elusive'],
      20: ['strokeOfLuck']
    },
    resources: level => ({
      strokeOfLuck: { max: level >= 20 ? 1 : 0, restType: 'short' }
    }),
    sneakAttackDice: SNEAK_ATTACK_DICE,
    numAttacks: () => 1
  },

  barbarian: {
    name: 'Barbarian',
    hitDie: 12,
    primaryAbility: 'strength',
    savingThrows: ['strength', 'constitution'],
    features: {
      1: ['rage', 'unarmoredDefense'],
      2: ['recklessAttack', 'dangerSense'],
      5: ['extraAttack', 'fastMovement'],
      9: ['brutalCritical'],
      11: ['relentlessRage'],
      13: ['brutalCritical2'],
      15: ['persistentRage'],
      17: ['brutalCritical3'],
      18: ['indomitableMight'],
      20: ['primalChampion']
    },
    resources: level => ({
      rage: { max: RAGES_PER_DAY[level], restType: 'long' }
    }),
    rageDamage: level => RAGE_DAMAGE[level],
    brutalCriticalDice: level => level >= 17 ? 3 : level >= 13 ? 2 : level >= 9 ? 1 : 0,
    numAttacks: level => level >= 5 ? 2 : 1
  },

  paladin: {
    name: 'Paladin',
    hitDie: 10,
    primaryAbility: 'strength',
    secondaryAbility: 'charisma',
    savingThrows: ['wisdom', 'charisma'],
    features: {
      1: ['divineSense', 'layOnHands'],
      2: ['fightingStyle', 'spellcasting', 'divineSmite'],
      3: ['divineHealth', 'channelDivinity'],
      5: ['extraAttack'],
      6: ['auraOfProtection'],
      10: ['auraOfCourage'],
      11: ['improvedDivineSmite'],
      14: ['cleansingTouch'],
      18: ['auraExpansion']
    },
    resources: level => ({
      layOnHands: { max: LAY_ON_HANDS_POOL(level), restType: 'long' },
      channelDivinity: { max: level >= 3 ? 1 : 0, restType: 'short' },
      divineSense: { max: 1, restType: 'long' } // Simplified; actual is 1 + CHA mod
    }),
    numAttacks: level => level >= 5 ? 2 : 1,
    auraRadius: level => level >= 18 ? 30 : 10
  },

  ranger: {
    name: 'Ranger',
    hitDie: 10,
    primaryAbility: 'dexterity',
    secondaryAbility: 'wisdom',
    savingThrows: ['strength', 'dexterity'],
    features: {
      1: ['favoredEnemy', 'naturalExplorer'],
      2: ['fightingStyle', 'spellcasting'],
      3: ['primevalAwareness'],
      5: ['extraAttack'],
      8: ['landsStride'],
      10: ['hideInPlainSight'],
      14: ['vanish'],
      18: ['feralSenses'],
      20: ['foeSlayer']
    },
    resources: level => ({}),
    numAttacks: level => level >= 5 ? 2 : 1
  },

  monk: {
    name: 'Monk',
    hitDie: 8,
    primaryAbility: 'dexterity',
    secondaryAbility: 'wisdom',
    savingThrows: ['strength', 'dexterity'],
    features: {
      1: ['unarmoredDefense', 'martialArts'],
      2: ['ki', 'flurryOfBlows', 'patientDefense', 'stepOfTheWind', 'unarmoredMovement'],
      3: ['deflectMissiles'],
      4: ['slowFall'],
      5: ['extraAttack', 'stunningStrike'],
      6: ['kiEmpoweredStrikes'],
      7: ['evasion', 'stillnessOfMind'],
      10: ['purityOfBody'],
      13: ['tongueOfSunAndMoon'],
      14: ['diamondSoul'],
      15: ['timelessBody'],
      18: ['emptyBody'],
      20: ['perfectSelf']
    },
    resources: level => ({
      ki: { max: KI_POINTS(level), restType: 'short' }
    }),
    martialArtsDie: level => MARTIAL_ARTS_DIE[level],
    numAttacks: level => level >= 5 ? 2 : 1
  },

  wizard: {
    name: 'Wizard',
    hitDie: 6,
    primaryAbility: 'intelligence',
    savingThrows: ['intelligence', 'wisdom'],
    features: {
      1: ['spellcasting', 'arcaneRecovery'],
      2: ['arcaneTradition'],
      18: ['spellMastery'],
      20: ['signatureSpells']
    },
    resources: level => ({
      arcaneRecovery: { max: Math.ceil(level / 2), restType: 'long' } // Slot levels recoverable
    }),
    numAttacks: () => 1
  },

  sorcerer: {
    name: 'Sorcerer',
    hitDie: 6,
    primaryAbility: 'charisma',
    savingThrows: ['constitution', 'charisma'],
    features: {
      1: ['spellcasting', 'sorcerousOrigin'],
      2: ['fontOfMagic'],
      3: ['metamagic'],
      10: ['metamagic2'],
      17: ['metamagic3'],
      20: ['sorcerousRestoration']
    },
    resources: level => ({
      sorceryPoints: { max: SORCERY_POINTS(level), restType: 'long' }
    }),
    metamagicOptions: level => level >= 17 ? 4 : level >= 10 ? 3 : level >= 3 ? 2 : 0,
    numAttacks: () => 1
  },

  warlock: {
    name: 'Warlock',
    hitDie: 8,
    primaryAbility: 'charisma',
    savingThrows: ['wisdom', 'charisma'],
    features: {
      1: ['otherworldlyPatron', 'pactMagic'],
      2: ['eldritchInvocations'],
      3: ['pactBoon'],
      11: ['mysticArcanum6'],
      13: ['mysticArcanum7'],
      15: ['mysticArcanum8'],
      17: ['mysticArcanum9'],
      20: ['eldritchMaster']
    },
    resources: level => ({
      // Pact Magic slots (short rest recovery)
      pactSlots: { max: level >= 17 ? 4 : level >= 11 ? 3 : level >= 2 ? 2 : 1, restType: 'short' },
      mysticArcanum: {
        max: (level >= 17 ? 1 : 0) + (level >= 15 ? 1 : 0) + (level >= 13 ? 1 : 0) + (level >= 11 ? 1 : 0),
        restType: 'long'
      }
    }),
    pactSlotLevel: level => level >= 9 ? 5 : level >= 7 ? 4 : level >= 5 ? 3 : level >= 3 ? 2 : 1,
    numAttacks: () => 1
  },

  cleric: {
    name: 'Cleric',
    hitDie: 8,
    primaryAbility: 'wisdom',
    savingThrows: ['wisdom', 'charisma'],
    features: {
      1: ['spellcasting', 'divineDomain'],
      2: ['channelDivinity', 'turnUndead'],
      5: ['destroyUndead'],
      6: ['channelDivinity2'],
      8: ['divineStrike'], // Or Potent Spellcasting depending on domain
      10: ['divineIntervention'],
      17: ['destroyUndead4'],
      18: ['channelDivinity3'],
      20: ['improvedDivineIntervention']
    },
    resources: level => ({
      channelDivinity: { max: CHANNEL_DIVINITY_USES[level], restType: 'short' }
    }),
    numAttacks: () => 1
  },

  bard: {
    name: 'Bard',
    hitDie: 8,
    primaryAbility: 'charisma',
    savingThrows: ['dexterity', 'charisma'],
    features: {
      1: ['spellcasting', 'bardicInspiration'],
      2: ['jackOfAllTrades', 'songOfRest'],
      3: ['bardCollege', 'expertise'],
      5: ['bardicInspirationD8', 'fontOfInspiration'],
      6: ['countercharm'],
      10: ['bardicInspirationD10', 'magicalSecrets'],
      14: ['magicalSecrets2'],
      15: ['bardicInspirationD12'],
      18: ['magicalSecrets3'],
      20: ['superiorInspiration']
    },
    resources: (level, chaMod = 3) => ({
      bardicInspiration: { max: BARDIC_INSPIRATION_USES(level, chaMod), restType: level >= 5 ? 'short' : 'long' }
    }),
    bardicInspirationDie: level => BARDIC_INSPIRATION_DIE[level],
    numAttacks: () => 1
  },

  druid: {
    name: 'Druid',
    hitDie: 8,
    primaryAbility: 'wisdom',
    savingThrows: ['intelligence', 'wisdom'],
    features: {
      1: ['druidic', 'spellcasting'],
      2: ['wildShape', 'druidCircle'],
      18: ['timelessBody', 'beastSpells'],
      20: ['archdruid']
    },
    resources: level => ({
      wildShape: { max: level >= 20 ? Infinity : 2, restType: 'short' }
    }),
    wildShapeCR: level => {
      if (level >= 8) return 1;
      if (level >= 4) return 0.5;
      return 0.25;
    },
    numAttacks: () => 1
  }
};

// Metamagic options for Sorcerer
export const METAMAGIC = {
  careful: { name: 'Careful Spell', cost: 1, description: 'Allies auto-succeed on save' },
  distant: { name: 'Distant Spell', cost: 1, description: 'Double range' },
  empowered: { name: 'Empowered Spell', cost: 1, description: 'Reroll damage dice' },
  extended: { name: 'Extended Spell', cost: 1, description: 'Double duration' },
  heightened: { name: 'Heightened Spell', cost: 3, description: 'Target has disadvantage on save' },
  quickened: { name: 'Quickened Spell', cost: 2, description: 'Cast as bonus action' },
  seeking: { name: 'Seeking Spell', cost: 2, description: 'Reroll missed spell attack' },
  subtle: { name: 'Subtle Spell', cost: 1, description: 'No verbal/somatic components' },
  transmuted: { name: 'Transmuted Spell', cost: 1, description: 'Change damage type' },
  twinned: { name: 'Twinned Spell', cost: 'spellLevel', description: 'Target second creature' }
};

// Eldritch Invocations for Warlock (combat-relevant ones)
export const ELDRITCH_INVOCATIONS = {
  agonizingBlast: { name: 'Agonizing Blast', requirement: 'eldritchBlast', effect: 'Add CHA to eldritch blast damage' },
  armorOfShadows: { name: 'Armor of Shadows', effect: 'Cast mage armor at will' },
  devilsSight: { name: "Devil's Sight", effect: 'See in magical darkness 120ft' },
  eldritchSpear: { name: 'Eldritch Spear', requirement: 'eldritchBlast', effect: 'Eldritch blast range 300ft' },
  graspOfHadar: { name: 'Grasp of Hadar', requirement: 'eldritchBlast', effect: 'Pull target 10ft on hit' },
  lanceOfLethargy: { name: 'Lance of Lethargy', requirement: 'eldritchBlast', effect: 'Reduce speed by 10ft on hit' },
  repellingBlast: { name: 'Repelling Blast', requirement: 'eldritchBlast', effect: 'Push target 10ft on hit' },
  thirsting: { name: 'Thirsting Blade', requirement: { pactBoon: 'blade', level: 5 }, effect: 'Attack twice with pact weapon' },
  lifedrinker: { name: 'Lifedrinker', requirement: { pactBoon: 'blade', level: 12 }, effect: 'Add CHA necrotic damage' }
};

// Helper to get all features a class has at a given level
export function getClassFeaturesAtLevel(className, level) {
  const classTemplate = CLASS_TEMPLATES[className];
  if (!classTemplate) return [];

  const features = [];
  for (let lvl = 1; lvl <= level; lvl++) {
    if (classTemplate.features[lvl]) {
      features.push(...classTemplate.features[lvl]);
    }
  }
  return features;
}

// Helper to check if a class has a specific feature at level
export function hasFeature(className, level, featureName) {
  const features = getClassFeaturesAtLevel(className, level);
  return features.includes(featureName);
}

// Helper to get number of attacks for a class at level
export function getNumAttacks(className, level) {
  const classTemplate = CLASS_TEMPLATES[className];
  if (!classTemplate) return 1;
  return classTemplate.numAttacks(level);
}

// Helper to initialize class resources for a combatant
export function initializeClassResources(className, level, abilityMods = {}) {
  const classTemplate = CLASS_TEMPLATES[className];
  if (!classTemplate) return {};

  const chaMod = abilityMods.charisma || 0;
  const resourceDefs = classTemplate.resources(level, chaMod);

  const resources = {};
  for (const [key, def] of Object.entries(resourceDefs)) {
    resources[key] = {
      max: def.max,
      current: def.max,
      restType: def.restType
    };
  }
  return resources;
}

export default CLASS_TEMPLATES;
