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
  },
  // === ADVANCED MONSTERS (v0.8) ===
  {
    key: 'young-red-dragon',
    name: 'Young Red Dragon',
    maxHp: 178,
    armorClass: 18,
    attackBonus: 10,
    damage: '2d10+6',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    dexteritySave: 4,
    constitutionSave: 9,
    wisdomSave: 4,
    // Multiattack: bite + 2 claws
    multiattack: [
      { type: 'bite', attackBonus: 10, damage: '2d10+6', damageType: 'piercing' },
      { type: 'claw', attackBonus: 10, damage: '2d6+6', damageType: 'slashing' },
      { type: 'claw', attackBonus: 10, damage: '2d6+6', damageType: 'slashing' }
    ],
    // Fire Breath (Recharge 5-6)
    rechargeAbilities: [
      {
        name: 'Fire Breath',
        rechargeMin: 5,
        available: true,
        type: 'area',
        shape: 'cone',
        size: 30,
        saveDC: 17,
        saveAbility: 'dexterity',
        damage: '16d6',
        damageType: 'fire',
        saveEffect: 'half'
      }
    ],
    conditionImmunities: ['frightened'],
    description: 'Fire breath (16d6), multiattack (bite + 2 claws)'
  },
  {
    key: 'adult-red-dragon',
    name: 'Adult Red Dragon',
    maxHp: 256,
    armorClass: 19,
    attackBonus: 14,
    damage: '2d10+8',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    dexteritySave: 6,
    constitutionSave: 13,
    wisdomSave: 7,
    // Multiattack: bite + 2 claws
    multiattack: [
      { type: 'bite', attackBonus: 14, damage: '2d10+8', damageType: 'piercing' },
      { type: 'claw', attackBonus: 14, damage: '2d6+8', damageType: 'slashing' },
      { type: 'claw', attackBonus: 14, damage: '2d6+8', damageType: 'slashing' }
    ],
    // Fire Breath (Recharge 5-6)
    rechargeAbilities: [
      {
        name: 'Fire Breath',
        rechargeMin: 5,
        available: true,
        type: 'area',
        shape: 'cone',
        size: 60,
        saveDC: 21,
        saveAbility: 'dexterity',
        damage: '18d6',
        damageType: 'fire',
        saveEffect: 'half'
      }
    ],
    // Legendary Actions (3/round)
    legendaryActions: 3,
    legendaryAbilities: [
      {
        name: 'Tail Attack',
        cost: 1,
        type: 'attack',
        attackBonus: 14,
        damage: '2d8+8',
        damageType: 'bludgeoning'
      },
      {
        name: 'Wing Attack',
        cost: 2,
        type: 'area',
        saveDC: 22,
        saveAbility: 'dexterity',
        damage: '2d6+8',
        damageType: 'bludgeoning',
        onFail: 'prone'
      }
    ],
    conditionImmunities: ['frightened', 'charmed'],
    description: 'Legendary (3 actions), fire breath (18d6), multiattack'
  },
  {
    key: 'hill-giant',
    name: 'Hill Giant',
    maxHp: 105,
    armorClass: 13,
    attackBonus: 8,
    damage: '3d8+5',
    initiativeBonus: -1,
    numAttacks: 1,
    healingDice: null,
    strengthSave: 8,
    constitutionSave: 8,
    // Multiattack: 2 greatclub
    multiattack: [
      { type: 'greatclub', attackBonus: 8, damage: '3d8+5', damageType: 'bludgeoning' },
      { type: 'greatclub', attackBonus: 8, damage: '3d8+5', damageType: 'bludgeoning' }
    ],
    description: 'Multiattack (2 greatclub hits)'
  },
  {
    key: 'mind-flayer',
    name: 'Mind Flayer',
    maxHp: 71,
    armorClass: 15,
    attackBonus: 7,
    damage: '2d10+4',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    intelligenceSave: 8,
    wisdomSave: 6,
    // Mind Blast (Recharge 5-6)
    rechargeAbilities: [
      {
        name: 'Mind Blast',
        rechargeMin: 5,
        available: true,
        type: 'area',
        shape: 'cone',
        size: 60,
        saveDC: 15,
        saveAbility: 'intelligence',
        damage: '4d8+4',
        damageType: 'psychic',
        saveEffect: 'none',
        onFail: 'stunned'
      }
    ],
    conditionImmunities: ['charmed'],
    description: 'Mind blast (4d8+4 psychic, stun), tentacles'
  }
]
