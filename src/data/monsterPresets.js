/**
 * Preset monsters for quick adding
 * These are templates - id will be generated when added
 */

export const monsterPresets = [
  {
    key: 'giant-spider',
    name: 'Giant Spider',
    maxHp: 26,
    armorClass: 14,
    attackBonus: 5,
    damage: '1d8+3',
    initiativeBonus: 3,
    numAttacks: 1,
    healingDice: null,
    onHitEffect: {
      condition: 'poisoned',
      duration: 3,
      saveDC: 11,
      saveAbility: 'constitution',
      // Can repeat save at end of each turn
      saveEndOfTurn: {
        ability: 'constitution',
        dc: 11
      }
    },
    description: 'Poison bite (DC 11 CON, save each turn)'
  },
  {
    key: 'orc',
    name: 'Orc',
    maxHp: 15,
    armorClass: 13,
    attackBonus: 5,
    damage: '1d12+3',
    initiativeBonus: 1,
    numAttacks: 1,
    healingDice: null,
    description: 'Greataxe brute'
  },
  {
    key: 'goblin',
    name: 'Goblin',
    maxHp: 7,
    armorClass: 15,
    attackBonus: 4,
    damage: '1d6+2',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    description: 'Nimble and sneaky'
  },
  {
    key: 'skeleton',
    name: 'Skeleton',
    maxHp: 13,
    armorClass: 13,
    attackBonus: 4,
    damage: '1d6+2',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    conditionImmunities: ['poisoned', 'frightened', 'charmed'],
    description: 'Undead - immune to poison/fear/charm'
  },
  {
    key: 'wolf',
    name: 'Wolf',
    maxHp: 11,
    armorClass: 13,
    attackBonus: 4,
    damage: '2d4+2',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    onHitEffect: {
      condition: 'prone',
      duration: 1,
      saveDC: 11,
      saveAbility: 'strength'
    },
    description: 'Knockdown bite (DC 11 STR)'
  },
  {
    key: 'zombie',
    name: 'Zombie',
    maxHp: 22,
    armorClass: 8,
    attackBonus: 3,
    damage: '1d6+1',
    initiativeBonus: -2,
    numAttacks: 1,
    healingDice: null,
    conditionImmunities: ['poisoned', 'frightened', 'charmed'],
    description: 'Undead - immune to poison/fear/charm'
  },
  {
    key: 'bandit',
    name: 'Bandit',
    maxHp: 11,
    armorClass: 12,
    attackBonus: 3,
    damage: '1d6+1',
    initiativeBonus: 1,
    numAttacks: 1,
    healingDice: null,
    description: 'Common thug'
  },
  {
    key: 'ogre',
    name: 'Ogre',
    maxHp: 59,
    armorClass: 11,
    attackBonus: 6,
    damage: '2d8+4',
    initiativeBonus: -1,
    numAttacks: 1,
    healingDice: null,
    description: 'Big and brutal'
  },
  {
    key: 'goblin-archer',
    name: 'Goblin Archer',
    maxHp: 7,
    armorClass: 13,
    attackBonus: 4,
    damage: '1d6+2',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    attackType: 'ranged',
    description: 'Shortbow (ranged)'
  },
  {
    key: 'ghoul',
    name: 'Ghoul',
    maxHp: 22,
    armorClass: 12,
    attackBonus: 4,
    damage: '2d6+2',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    conditionImmunities: ['poisoned', 'charmed'],
    onHitEffect: {
      condition: 'paralyzed',
      duration: 2,
      saveDC: 10,
      saveAbility: 'constitution',
      saveEndOfTurn: {
        ability: 'constitution',
        dc: 10
      }
    },
    description: 'Paralyzing claws (DC 10 CON)'
  },
  {
    key: 'specter',
    name: 'Specter',
    maxHp: 22,
    armorClass: 12,
    attackBonus: 4,
    damage: '3d6',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    conditionImmunities: ['poisoned', 'frightened', 'charmed', 'prone'],
    description: 'Incorporeal undead'
  },
  // === CASTERS (v0.6) ===
  {
    key: 'mage',
    name: 'Mage',
    maxHp: 40,
    armorClass: 12,
    attackBonus: 3,
    damage: '1d4',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    // Spellcasting
    spellcastingAbility: 'intelligence',
    spellcastingMod: 4,
    spellSaveDC: 14,
    spellAttackBonus: 6,
    level: 5,
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    cantrips: ['fire-bolt', 'toll-the-dead'],
    spells: ['magic-missile', 'fireball', 'hold-person'],
    description: 'Fire Bolt cantrip, Fireball, Magic Missile'
  },
  {
    key: 'priest',
    name: 'Priest',
    maxHp: 27,
    armorClass: 13,
    attackBonus: 2,
    damage: '1d6',
    initiativeBonus: 1,
    numAttacks: 1,
    healingDice: null,
    // Spellcasting
    spellcastingAbility: 'wisdom',
    spellcastingMod: 3,
    spellSaveDC: 13,
    spellAttackBonus: 5,
    level: 5,
    spellSlots: { 1: 4, 2: 3 },
    cantrips: ['sacred-flame'],
    spells: ['healing-word', 'hold-person'],
    description: 'Sacred Flame, Healing Word, Hold Person'
  },
  {
    key: 'cultist',
    name: 'Cultist',
    maxHp: 9,
    armorClass: 12,
    attackBonus: 3,
    damage: '1d4+1',
    initiativeBonus: 1,
    numAttacks: 1,
    healingDice: null,
    // Spellcasting (cantrips only)
    spellcastingAbility: 'wisdom',
    spellcastingMod: 2,
    spellSaveDC: 12,
    spellAttackBonus: 4,
    level: 1,
    cantrips: ['sacred-flame'],
    spells: [],
    description: 'Sacred Flame cantrip'
  }
]
