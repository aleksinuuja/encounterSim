/**
 * Pre-built Class Character Presets
 * Ready-to-use characters at levels 1, 5, 10, 15, 20
 */

import { getNumAttacks, initializeClassResources } from './classTemplates.js';

// Standard array ability scores by class archetype
const ABILITY_SCORES = {
  // STR-based melee
  strMelee: { str: 16, dex: 12, con: 14, int: 10, wis: 13, cha: 8 },
  // DEX-based melee/ranged
  dexMelee: { str: 10, dex: 16, con: 14, int: 12, wis: 13, cha: 8 },
  // CHA-based caster
  chaCaster: { str: 8, dex: 14, con: 14, int: 10, wis: 12, cha: 16 },
  // INT-based caster
  intCaster: { str: 8, dex: 14, con: 14, int: 16, wis: 12, cha: 10 },
  // WIS-based caster
  wisCaster: { str: 10, dex: 14, con: 14, int: 12, wis: 16, cha: 8 }
};

// Calculate ability modifier
function mod(score) {
  return Math.floor((score - 10) / 2);
}

// Calculate proficiency bonus
function profBonus(level) {
  return Math.ceil(level / 4) + 1;
}

// Calculate HP by class hit die
function calculateHp(hitDie, level, conMod) {
  // Max at first level, average thereafter
  const averageRoll = Math.floor(hitDie / 2) + 1;
  return hitDie + conMod + (level - 1) * (averageRoll + conMod);
}

// Generate base preset structure
function createPreset(config) {
  const {
    name, class: className, level, abilities,
    hitDie, armorClass, damage, fightingStyle,
    hasSecondWind, hasActionSurge, hasTwoWeaponFighting,
    position = 'front', spells, cantrips, spellSlots, spellcastingMod,
    invocations
  } = config;

  const strMod = mod(abilities.str);
  const dexMod = mod(abilities.dex);
  const conMod = mod(abilities.con);
  const intMod = mod(abilities.int);
  const wisMod = mod(abilities.wis);
  const chaMod = mod(abilities.cha);

  const prof = profBonus(level);
  const numAttacks = getNumAttacks(className, level);

  // Calculate attack bonus based on primary stat
  const primaryMod = className === 'wizard' || className === 'artificer' ? intMod
    : className === 'cleric' || className === 'druid' || className === 'ranger' || className === 'monk' ? wisMod
    : className === 'rogue' || className === 'ranger' ? dexMod
    : className === 'bard' || className === 'sorcerer' || className === 'warlock' || className === 'paladin' ? chaMod
    : strMod;

  const attackBonus = prof + (
    dexMod > strMod && (className === 'rogue' || className === 'monk' || className === 'ranger')
      ? dexMod : strMod
  );

  return {
    key: `${className}-${level}`,
    name,
    class: className,
    level,
    isPlayer: true,

    // Ability scores
    strMod, dexMod, conMod, intMod, wisMod, chaMod,
    proficiencyBonus: prof,

    // Combat stats
    maxHp: calculateHp(hitDie, level, conMod),
    armorClass,
    attackBonus,
    damage,
    numAttacks,
    initiativeBonus: dexMod,
    position,

    // Class features
    fightingStyle,
    hasSecondWind: hasSecondWind || false,
    hasActionSurge: hasActionSurge || false,
    hasTwoWeaponFighting: hasTwoWeaponFighting || false,

    // Spellcasting
    spells,
    cantrips,
    spellSlots,
    spellcastingMod,

    // Warlock specific
    invocations,

    // Initialize resources
    classResources: initializeClassResources(className, level, {
      charisma: chaMod,
      wisdom: wisMod
    })
  };
}

// ============================================
// FIGHTER PRESETS
// ============================================

export const FIGHTER_PRESETS = {
  'fighter-1': createPreset({
    name: 'Fighter (1)',
    class: 'fighter',
    level: 1,
    abilities: ABILITY_SCORES.strMelee,
    hitDie: 10,
    armorClass: 16, // Chain mail + shield
    damage: '1d8+3', // Longsword
    fightingStyle: 'dueling',
    hasSecondWind: true
  }),

  'fighter-5': createPreset({
    name: 'Fighter (5)',
    class: 'fighter',
    level: 5,
    abilities: { ...ABILITY_SCORES.strMelee, str: 18 }, // ASI
    hitDie: 10,
    armorClass: 18, // Plate
    damage: '1d8+4',
    fightingStyle: 'dueling',
    hasSecondWind: true,
    hasActionSurge: true
  }),

  'fighter-10': createPreset({
    name: 'Fighter (10)',
    class: 'fighter',
    level: 10,
    abilities: { ...ABILITY_SCORES.strMelee, str: 20 },
    hitDie: 10,
    armorClass: 20, // Plate + shield +1
    damage: '1d8+5',
    fightingStyle: 'dueling',
    hasSecondWind: true,
    hasActionSurge: true
  }),

  'fighter-15': createPreset({
    name: 'Fighter (15)',
    class: 'fighter',
    level: 15,
    abilities: { ...ABILITY_SCORES.strMelee, str: 20, con: 16 },
    hitDie: 10,
    armorClass: 21,
    damage: '1d8+5',
    fightingStyle: 'dueling',
    hasSecondWind: true,
    hasActionSurge: true
  }),

  'fighter-20': createPreset({
    name: 'Fighter (20)',
    class: 'fighter',
    level: 20,
    abilities: { ...ABILITY_SCORES.strMelee, str: 20, con: 20 },
    hitDie: 10,
    armorClass: 22,
    damage: '1d8+5',
    fightingStyle: 'dueling',
    hasSecondWind: true,
    hasActionSurge: true
  })
};

// ============================================
// ROGUE PRESETS
// ============================================

export const ROGUE_PRESETS = {
  'rogue-1': createPreset({
    name: 'Rogue (1)',
    class: 'rogue',
    level: 1,
    abilities: ABILITY_SCORES.dexMelee,
    hitDie: 8,
    armorClass: 14, // Leather + DEX
    damage: '1d6+3', // Shortsword
    position: 'back'
  }),

  'rogue-5': createPreset({
    name: 'Rogue (5)',
    class: 'rogue',
    level: 5,
    abilities: { ...ABILITY_SCORES.dexMelee, dex: 18 },
    hitDie: 8,
    armorClass: 15,
    damage: '1d6+4',
    position: 'back'
  }),

  'rogue-10': createPreset({
    name: 'Rogue (10)',
    class: 'rogue',
    level: 10,
    abilities: { ...ABILITY_SCORES.dexMelee, dex: 20 },
    hitDie: 8,
    armorClass: 16,
    damage: '1d6+5',
    position: 'back'
  }),

  'rogue-15': createPreset({
    name: 'Rogue (15)',
    class: 'rogue',
    level: 15,
    abilities: { ...ABILITY_SCORES.dexMelee, dex: 20, con: 16 },
    hitDie: 8,
    armorClass: 17,
    damage: '1d6+5',
    position: 'back'
  }),

  'rogue-20': createPreset({
    name: 'Rogue (20)',
    class: 'rogue',
    level: 20,
    abilities: { ...ABILITY_SCORES.dexMelee, dex: 20, con: 18 },
    hitDie: 8,
    armorClass: 18,
    damage: '1d6+5',
    position: 'back'
  })
};

// ============================================
// BARBARIAN PRESETS
// ============================================

export const BARBARIAN_PRESETS = {
  'barbarian-1': createPreset({
    name: 'Barbarian (1)',
    class: 'barbarian',
    level: 1,
    abilities: { ...ABILITY_SCORES.strMelee, con: 15 },
    hitDie: 12,
    armorClass: 14, // Unarmored (10 + DEX + CON)
    damage: '2d6+3' // Greatsword
  }),

  'barbarian-5': createPreset({
    name: 'Barbarian (5)',
    class: 'barbarian',
    level: 5,
    abilities: { ...ABILITY_SCORES.strMelee, str: 18, con: 16 },
    hitDie: 12,
    armorClass: 15,
    damage: '2d6+4'
  }),

  'barbarian-10': createPreset({
    name: 'Barbarian (10)',
    class: 'barbarian',
    level: 10,
    abilities: { ...ABILITY_SCORES.strMelee, str: 20, con: 16 },
    hitDie: 12,
    armorClass: 15,
    damage: '2d6+5'
  }),

  'barbarian-15': createPreset({
    name: 'Barbarian (15)',
    class: 'barbarian',
    level: 15,
    abilities: { ...ABILITY_SCORES.strMelee, str: 20, con: 18 },
    hitDie: 12,
    armorClass: 16,
    damage: '2d6+5'
  }),

  'barbarian-20': createPreset({
    name: 'Barbarian (20)',
    class: 'barbarian',
    level: 20,
    abilities: { ...ABILITY_SCORES.strMelee, str: 24, con: 24 }, // Primal Champion
    hitDie: 12,
    armorClass: 18,
    damage: '2d6+7'
  })
};

// ============================================
// PALADIN PRESETS
// ============================================

export const PALADIN_PRESETS = {
  'paladin-1': createPreset({
    name: 'Paladin (1)',
    class: 'paladin',
    level: 1,
    abilities: { str: 16, dex: 10, con: 14, int: 8, wis: 10, cha: 14 },
    hitDie: 10,
    armorClass: 18, // Chain mail + shield
    damage: '1d8+3',
    fightingStyle: 'defense'
  }),

  'paladin-5': createPreset({
    name: 'Paladin (5)',
    class: 'paladin',
    level: 5,
    abilities: { str: 18, dex: 10, con: 14, int: 8, wis: 10, cha: 14 },
    hitDie: 10,
    armorClass: 20,
    damage: '1d8+4',
    fightingStyle: 'defense',
    spellSlots: { 1: 4, 2: 2 },
    spellcastingMod: 2
  }),

  'paladin-10': createPreset({
    name: 'Paladin (10)',
    class: 'paladin',
    level: 10,
    abilities: { str: 20, dex: 10, con: 14, int: 8, wis: 10, cha: 16 },
    hitDie: 10,
    armorClass: 21,
    damage: '1d8+5',
    fightingStyle: 'defense',
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    spellcastingMod: 3
  }),

  'paladin-15': createPreset({
    name: 'Paladin (15)',
    class: 'paladin',
    level: 15,
    abilities: { str: 20, dex: 10, con: 14, int: 8, wis: 10, cha: 18 },
    hitDie: 10,
    armorClass: 22,
    damage: '1d8+5',
    fightingStyle: 'defense',
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 1 },
    spellcastingMod: 4
  }),

  'paladin-20': createPreset({
    name: 'Paladin (20)',
    class: 'paladin',
    level: 20,
    abilities: { str: 20, dex: 10, con: 14, int: 8, wis: 10, cha: 20 },
    hitDie: 10,
    armorClass: 23,
    damage: '1d8+5',
    fightingStyle: 'defense',
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
    spellcastingMod: 5
  })
};

// ============================================
// RANGER PRESETS
// ============================================

export const RANGER_PRESETS = {
  'ranger-1': createPreset({
    name: 'Ranger (1)',
    class: 'ranger',
    level: 1,
    abilities: ABILITY_SCORES.dexMelee,
    hitDie: 10,
    armorClass: 15, // Leather + DEX
    damage: '1d8+3', // Longbow
    position: 'back'
  }),

  'ranger-5': createPreset({
    name: 'Ranger (5)',
    class: 'ranger',
    level: 5,
    abilities: { ...ABILITY_SCORES.dexMelee, dex: 18 },
    hitDie: 10,
    armorClass: 16,
    damage: '1d8+4',
    fightingStyle: 'archery',
    position: 'back',
    spells: ['huntersMark'],
    spellSlots: { 1: 4, 2: 2 },
    spellcastingMod: 1
  }),

  'ranger-10': createPreset({
    name: 'Ranger (10)',
    class: 'ranger',
    level: 10,
    abilities: { ...ABILITY_SCORES.dexMelee, dex: 20 },
    hitDie: 10,
    armorClass: 17,
    damage: '1d8+5',
    fightingStyle: 'archery',
    position: 'back',
    spells: ['huntersMark'],
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    spellcastingMod: 1
  }),

  'ranger-15': createPreset({
    name: 'Ranger (15)',
    class: 'ranger',
    level: 15,
    abilities: { ...ABILITY_SCORES.dexMelee, dex: 20, wis: 14 },
    hitDie: 10,
    armorClass: 18,
    damage: '1d8+5',
    fightingStyle: 'archery',
    position: 'back',
    spells: ['huntersMark'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 1 },
    spellcastingMod: 2
  }),

  'ranger-20': createPreset({
    name: 'Ranger (20)',
    class: 'ranger',
    level: 20,
    abilities: { ...ABILITY_SCORES.dexMelee, dex: 20, wis: 16 },
    hitDie: 10,
    armorClass: 19,
    damage: '1d8+5',
    fightingStyle: 'archery',
    position: 'back',
    spells: ['huntersMark'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
    spellcastingMod: 3
  })
};

// ============================================
// MONK PRESETS
// ============================================

export const MONK_PRESETS = {
  'monk-1': createPreset({
    name: 'Monk (1)',
    class: 'monk',
    level: 1,
    abilities: { str: 10, dex: 16, con: 14, int: 10, wis: 14, cha: 8 },
    hitDie: 8,
    armorClass: 15, // Unarmored (10 + DEX + WIS)
    damage: '1d4+3'
  }),

  'monk-5': createPreset({
    name: 'Monk (5)',
    class: 'monk',
    level: 5,
    abilities: { str: 10, dex: 18, con: 14, int: 10, wis: 14, cha: 8 },
    hitDie: 8,
    armorClass: 16,
    damage: '1d6+4'
  }),

  'monk-10': createPreset({
    name: 'Monk (10)',
    class: 'monk',
    level: 10,
    abilities: { str: 10, dex: 20, con: 14, int: 10, wis: 16, cha: 8 },
    hitDie: 8,
    armorClass: 18,
    damage: '1d6+5'
  }),

  'monk-15': createPreset({
    name: 'Monk (15)',
    class: 'monk',
    level: 15,
    abilities: { str: 10, dex: 20, con: 16, int: 10, wis: 18, cha: 8 },
    hitDie: 8,
    armorClass: 19,
    damage: '1d8+5'
  }),

  'monk-20': createPreset({
    name: 'Monk (20)',
    class: 'monk',
    level: 20,
    abilities: { str: 10, dex: 20, con: 18, int: 10, wis: 20, cha: 8 },
    hitDie: 8,
    armorClass: 20,
    damage: '1d10+5'
  })
};

// ============================================
// WIZARD PRESETS
// ============================================

export const WIZARD_PRESETS = {
  'wizard-1': createPreset({
    name: 'Wizard (1)',
    class: 'wizard',
    level: 1,
    abilities: ABILITY_SCORES.intCaster,
    hitDie: 6,
    armorClass: 12, // Mage armor
    damage: '1d10', // Fire Bolt
    position: 'back',
    cantrips: ['fireBolt', 'rayOfFrost'],
    spells: ['magicMissile', 'shield', 'sleep'],
    spellSlots: { 1: 2 },
    spellcastingMod: 3
  }),

  'wizard-5': createPreset({
    name: 'Wizard (5)',
    class: 'wizard',
    level: 5,
    abilities: { ...ABILITY_SCORES.intCaster, int: 18 },
    hitDie: 6,
    armorClass: 13,
    damage: '2d10',
    position: 'back',
    cantrips: ['fireBolt', 'rayOfFrost', 'shockingGrasp'],
    spells: ['magicMissile', 'shield', 'fireball', 'counterspell'],
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    spellcastingMod: 4
  }),

  'wizard-10': createPreset({
    name: 'Wizard (10)',
    class: 'wizard',
    level: 10,
    abilities: { ...ABILITY_SCORES.intCaster, int: 20 },
    hitDie: 6,
    armorClass: 14,
    damage: '3d10',
    position: 'back',
    cantrips: ['fireBolt', 'rayOfFrost', 'shockingGrasp'],
    spells: ['magicMissile', 'shield', 'fireball', 'counterspell', 'wallOfForce'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    spellcastingMod: 5
  }),

  'wizard-15': createPreset({
    name: 'Wizard (15)',
    class: 'wizard',
    level: 15,
    abilities: { ...ABILITY_SCORES.intCaster, int: 20, con: 16 },
    hitDie: 6,
    armorClass: 15,
    damage: '4d10',
    position: 'back',
    cantrips: ['fireBolt', 'rayOfFrost', 'shockingGrasp'],
    spells: ['magicMissile', 'shield', 'fireball', 'counterspell', 'wallOfForce', 'disintegrate'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1 },
    spellcastingMod: 5
  }),

  'wizard-20': createPreset({
    name: 'Wizard (20)',
    class: 'wizard',
    level: 20,
    abilities: { ...ABILITY_SCORES.intCaster, int: 20, con: 18 },
    hitDie: 6,
    armorClass: 16,
    damage: '4d10',
    position: 'back',
    cantrips: ['fireBolt', 'rayOfFrost', 'shockingGrasp'],
    spells: ['magicMissile', 'shield', 'fireball', 'counterspell', 'wallOfForce', 'disintegrate', 'meteor'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
    spellcastingMod: 5
  })
};

// ============================================
// CLERIC PRESETS
// ============================================

export const CLERIC_PRESETS = {
  'cleric-1': createPreset({
    name: 'Cleric (1)',
    class: 'cleric',
    level: 1,
    abilities: ABILITY_SCORES.wisCaster,
    hitDie: 8,
    armorClass: 18, // Chain mail + shield
    damage: '1d8', // Sacred Flame
    position: 'back',
    healingDice: '1d8+3',
    cantrips: ['sacredFlame', 'tollTheDead'],
    spells: ['cureWounds', 'healingWord', 'bless', 'guidingBolt'],
    spellSlots: { 1: 2 },
    spellcastingMod: 3
  }),

  'cleric-5': createPreset({
    name: 'Cleric (5)',
    class: 'cleric',
    level: 5,
    abilities: { ...ABILITY_SCORES.wisCaster, wis: 18 },
    hitDie: 8,
    armorClass: 19,
    damage: '2d8',
    position: 'back',
    healingDice: '2d8+4',
    cantrips: ['sacredFlame', 'tollTheDead'],
    spells: ['cureWounds', 'healingWord', 'bless', 'guidingBolt', 'spiritualWeapon', 'spiritGuardians'],
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    spellcastingMod: 4
  }),

  'cleric-10': createPreset({
    name: 'Cleric (10)',
    class: 'cleric',
    level: 10,
    abilities: { ...ABILITY_SCORES.wisCaster, wis: 20 },
    hitDie: 8,
    armorClass: 20,
    damage: '3d8',
    position: 'back',
    healingDice: '3d8+5',
    cantrips: ['sacredFlame', 'tollTheDead'],
    spells: ['cureWounds', 'healingWord', 'bless', 'guidingBolt', 'spiritualWeapon', 'spiritGuardians'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    spellcastingMod: 5
  }),

  'cleric-15': createPreset({
    name: 'Cleric (15)',
    class: 'cleric',
    level: 15,
    abilities: { ...ABILITY_SCORES.wisCaster, wis: 20, con: 16 },
    hitDie: 8,
    armorClass: 21,
    damage: '3d8',
    position: 'back',
    healingDice: '4d8+5',
    cantrips: ['sacredFlame', 'tollTheDead'],
    spells: ['cureWounds', 'healingWord', 'bless', 'guidingBolt', 'spiritualWeapon', 'spiritGuardians', 'heal'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1 },
    spellcastingMod: 5
  }),

  'cleric-20': createPreset({
    name: 'Cleric (20)',
    class: 'cleric',
    level: 20,
    abilities: { ...ABILITY_SCORES.wisCaster, wis: 20, con: 18 },
    hitDie: 8,
    armorClass: 22,
    damage: '4d8',
    position: 'back',
    healingDice: '5d8+5',
    cantrips: ['sacredFlame', 'tollTheDead'],
    spells: ['cureWounds', 'healingWord', 'bless', 'guidingBolt', 'spiritualWeapon', 'spiritGuardians', 'heal'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
    spellcastingMod: 5
  })
};

// ============================================
// SORCERER PRESETS
// ============================================

export const SORCERER_PRESETS = {
  'sorcerer-1': createPreset({
    name: 'Sorcerer (1)',
    class: 'sorcerer',
    level: 1,
    abilities: ABILITY_SCORES.chaCaster,
    hitDie: 6,
    armorClass: 13,
    damage: '1d10', // Fire Bolt
    position: 'back',
    cantrips: ['fireBolt', 'shockingGrasp'],
    spells: ['magicMissile', 'shield'],
    spellSlots: { 1: 2 },
    spellcastingMod: 3
  }),

  'sorcerer-5': createPreset({
    name: 'Sorcerer (5)',
    class: 'sorcerer',
    level: 5,
    abilities: { ...ABILITY_SCORES.chaCaster, cha: 18 },
    hitDie: 6,
    armorClass: 14,
    damage: '2d10',
    position: 'back',
    cantrips: ['fireBolt', 'shockingGrasp'],
    spells: ['magicMissile', 'shield', 'fireball'],
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    spellcastingMod: 4
  }),

  'sorcerer-10': createPreset({
    name: 'Sorcerer (10)',
    class: 'sorcerer',
    level: 10,
    abilities: { ...ABILITY_SCORES.chaCaster, cha: 20 },
    hitDie: 6,
    armorClass: 15,
    damage: '3d10',
    position: 'back',
    cantrips: ['fireBolt', 'shockingGrasp'],
    spells: ['magicMissile', 'shield', 'fireball', 'counterspell'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    spellcastingMod: 5
  }),

  'sorcerer-15': createPreset({
    name: 'Sorcerer (15)',
    class: 'sorcerer',
    level: 15,
    abilities: { ...ABILITY_SCORES.chaCaster, cha: 20, con: 16 },
    hitDie: 6,
    armorClass: 16,
    damage: '4d10',
    position: 'back',
    cantrips: ['fireBolt', 'shockingGrasp'],
    spells: ['magicMissile', 'shield', 'fireball', 'counterspell', 'disintegrate'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1 },
    spellcastingMod: 5
  }),

  'sorcerer-20': createPreset({
    name: 'Sorcerer (20)',
    class: 'sorcerer',
    level: 20,
    abilities: { ...ABILITY_SCORES.chaCaster, cha: 20, con: 18 },
    hitDie: 6,
    armorClass: 17,
    damage: '4d10',
    position: 'back',
    cantrips: ['fireBolt', 'shockingGrasp'],
    spells: ['magicMissile', 'shield', 'fireball', 'counterspell', 'disintegrate', 'wish'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
    spellcastingMod: 5
  })
};

// ============================================
// WARLOCK PRESETS
// ============================================

export const WARLOCK_PRESETS = {
  'warlock-1': createPreset({
    name: 'Warlock (1)',
    class: 'warlock',
    level: 1,
    abilities: ABILITY_SCORES.chaCaster,
    hitDie: 8,
    armorClass: 12,
    damage: '1d10', // Eldritch Blast
    position: 'back',
    cantrips: ['eldritchBlast'],
    spells: ['hex', 'armsOfHadar'],
    spellSlots: { 1: 1 },
    spellcastingMod: 3
  }),

  'warlock-5': createPreset({
    name: 'Warlock (5)',
    class: 'warlock',
    level: 5,
    abilities: { ...ABILITY_SCORES.chaCaster, cha: 18 },
    hitDie: 8,
    armorClass: 13,
    damage: '2d10+8', // 2 beams + agonizing blast
    position: 'back',
    cantrips: ['eldritchBlast'],
    spells: ['hex', 'armsOfHadar', 'hunger'],
    spellSlots: { 3: 2 }, // Pact Magic
    spellcastingMod: 4,
    invocations: ['agonizingBlast', 'repellingBlast']
  }),

  'warlock-10': createPreset({
    name: 'Warlock (10)',
    class: 'warlock',
    level: 10,
    abilities: { ...ABILITY_SCORES.chaCaster, cha: 20 },
    hitDie: 8,
    armorClass: 14,
    damage: '2d10+10',
    position: 'back',
    cantrips: ['eldritchBlast'],
    spells: ['hex', 'armsOfHadar', 'hunger', 'synapticStatic'],
    spellSlots: { 5: 2 },
    spellcastingMod: 5,
    invocations: ['agonizingBlast', 'repellingBlast', 'devilsSight']
  }),

  'warlock-15': createPreset({
    name: 'Warlock (15)',
    class: 'warlock',
    level: 15,
    abilities: { ...ABILITY_SCORES.chaCaster, cha: 20, con: 16 },
    hitDie: 8,
    armorClass: 15,
    damage: '3d10+15',
    position: 'back',
    cantrips: ['eldritchBlast'],
    spells: ['hex', 'armsOfHadar', 'hunger', 'synapticStatic'],
    spellSlots: { 5: 3 },
    spellcastingMod: 5,
    invocations: ['agonizingBlast', 'repellingBlast', 'devilsSight']
  }),

  'warlock-20': createPreset({
    name: 'Warlock (20)',
    class: 'warlock',
    level: 20,
    abilities: { ...ABILITY_SCORES.chaCaster, cha: 20, con: 18 },
    hitDie: 8,
    armorClass: 16,
    damage: '4d10+20',
    position: 'back',
    cantrips: ['eldritchBlast'],
    spells: ['hex', 'armsOfHadar', 'hunger', 'synapticStatic'],
    spellSlots: { 5: 4 },
    spellcastingMod: 5,
    invocations: ['agonizingBlast', 'repellingBlast', 'devilsSight', 'witchSight']
  })
};

// ============================================
// BARD PRESETS
// ============================================

export const BARD_PRESETS = {
  'bard-1': createPreset({
    name: 'Bard (1)',
    class: 'bard',
    level: 1,
    abilities: ABILITY_SCORES.chaCaster,
    hitDie: 8,
    armorClass: 14, // Leather + DEX
    damage: '1d6+2', // Rapier
    position: 'back',
    cantrips: ['viciousMockery'],
    spells: ['healingWord', 'dissonantWhispers', 'faerieFire'],
    spellSlots: { 1: 2 },
    spellcastingMod: 3,
    healingDice: '1d4+3'
  }),

  'bard-5': createPreset({
    name: 'Bard (5)',
    class: 'bard',
    level: 5,
    abilities: { ...ABILITY_SCORES.chaCaster, cha: 18 },
    hitDie: 8,
    armorClass: 15,
    damage: '1d6+2',
    position: 'back',
    cantrips: ['viciousMockery'],
    spells: ['healingWord', 'dissonantWhispers', 'faerieFire', 'hypnoticPattern'],
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    spellcastingMod: 4,
    healingDice: '1d4+4'
  }),

  'bard-10': createPreset({
    name: 'Bard (10)',
    class: 'bard',
    level: 10,
    abilities: { ...ABILITY_SCORES.chaCaster, cha: 20 },
    hitDie: 8,
    armorClass: 16,
    damage: '1d6+2',
    position: 'back',
    cantrips: ['viciousMockery'],
    spells: ['healingWord', 'dissonantWhispers', 'faerieFire', 'hypnoticPattern', 'synapticStatic'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    spellcastingMod: 5,
    healingDice: '2d4+5'
  }),

  'bard-15': createPreset({
    name: 'Bard (15)',
    class: 'bard',
    level: 15,
    abilities: { ...ABILITY_SCORES.chaCaster, cha: 20, con: 16 },
    hitDie: 8,
    armorClass: 17,
    damage: '1d6+2',
    position: 'back',
    cantrips: ['viciousMockery'],
    spells: ['healingWord', 'dissonantWhispers', 'faerieFire', 'hypnoticPattern', 'synapticStatic'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1 },
    spellcastingMod: 5,
    healingDice: '3d4+5'
  }),

  'bard-20': createPreset({
    name: 'Bard (20)',
    class: 'bard',
    level: 20,
    abilities: { ...ABILITY_SCORES.chaCaster, cha: 20, con: 18 },
    hitDie: 8,
    armorClass: 18,
    damage: '1d6+2',
    position: 'back',
    cantrips: ['viciousMockery'],
    spells: ['healingWord', 'dissonantWhispers', 'faerieFire', 'hypnoticPattern', 'synapticStatic', 'powerWord'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
    spellcastingMod: 5,
    healingDice: '4d4+5'
  })
};

// ============================================
// DRUID PRESETS
// ============================================

export const DRUID_PRESETS = {
  'druid-1': createPreset({
    name: 'Druid (1)',
    class: 'druid',
    level: 1,
    abilities: ABILITY_SCORES.wisCaster,
    hitDie: 8,
    armorClass: 14, // Hide + shield
    damage: '1d8', // Produce Flame
    position: 'back',
    cantrips: ['produceFlame', 'thornWhip'],
    spells: ['entangle', 'healingWord', 'faerieFire'],
    spellSlots: { 1: 2 },
    spellcastingMod: 3,
    healingDice: '1d4+3'
  }),

  'druid-5': createPreset({
    name: 'Druid (5)',
    class: 'druid',
    level: 5,
    abilities: { ...ABILITY_SCORES.wisCaster, wis: 18 },
    hitDie: 8,
    armorClass: 15,
    damage: '2d8',
    position: 'back',
    cantrips: ['produceFlame', 'thornWhip'],
    spells: ['entangle', 'healingWord', 'faerieFire', 'callLightning', 'conjureAnimals'],
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    spellcastingMod: 4,
    healingDice: '1d4+4'
  }),

  'druid-10': createPreset({
    name: 'Druid (10)',
    class: 'druid',
    level: 10,
    abilities: { ...ABILITY_SCORES.wisCaster, wis: 20 },
    hitDie: 8,
    armorClass: 16,
    damage: '3d8',
    position: 'back',
    cantrips: ['produceFlame', 'thornWhip'],
    spells: ['entangle', 'healingWord', 'faerieFire', 'callLightning', 'conjureAnimals'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    spellcastingMod: 5,
    healingDice: '2d4+5'
  }),

  'druid-15': createPreset({
    name: 'Druid (15)',
    class: 'druid',
    level: 15,
    abilities: { ...ABILITY_SCORES.wisCaster, wis: 20, con: 16 },
    hitDie: 8,
    armorClass: 17,
    damage: '3d8',
    position: 'back',
    cantrips: ['produceFlame', 'thornWhip'],
    spells: ['entangle', 'healingWord', 'faerieFire', 'callLightning', 'conjureAnimals'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1 },
    spellcastingMod: 5,
    healingDice: '3d4+5'
  }),

  'druid-20': createPreset({
    name: 'Druid (20)',
    class: 'druid',
    level: 20,
    abilities: { ...ABILITY_SCORES.wisCaster, wis: 20, con: 18 },
    hitDie: 8,
    armorClass: 18,
    damage: '4d8',
    position: 'back',
    cantrips: ['produceFlame', 'thornWhip'],
    spells: ['entangle', 'healingWord', 'faerieFire', 'callLightning', 'conjureAnimals'],
    spellSlots: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
    spellcastingMod: 5,
    healingDice: '4d4+5'
  })
};

// ============================================
// ALL PRESETS
// ============================================

export const ALL_CLASS_PRESETS = {
  ...FIGHTER_PRESETS,
  ...ROGUE_PRESETS,
  ...BARBARIAN_PRESETS,
  ...PALADIN_PRESETS,
  ...RANGER_PRESETS,
  ...MONK_PRESETS,
  ...WIZARD_PRESETS,
  ...CLERIC_PRESETS,
  ...SORCERER_PRESETS,
  ...WARLOCK_PRESETS,
  ...BARD_PRESETS,
  ...DRUID_PRESETS
};

// Get presets by class
export function getPresetsForClass(className) {
  const presets = [];
  for (const [key, preset] of Object.entries(ALL_CLASS_PRESETS)) {
    if (preset.class === className) {
      presets.push(preset);
    }
  }
  return presets.sort((a, b) => a.level - b.level);
}

// Get preset by class and level
export function getPreset(className, level) {
  return ALL_CLASS_PRESETS[`${className}-${level}`] || null;
}

// Get all available levels for a class
export function getAvailableLevels(className) {
  return [1, 5, 10, 15, 20];
}

export default ALL_CLASS_PRESETS;
