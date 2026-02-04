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
    position: 'back',
    description: 'Shortbow (ranged, back line)'
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
    position: 'back',
    // Spellcasting
    spellcastingAbility: 'intelligence',
    spellcastingMod: 4,
    spellSaveDC: 14,
    spellAttackBonus: 6,
    level: 5,
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    cantrips: ['fire-bolt', 'toll-the-dead'],
    spells: ['magic-missile', 'fireball', 'hold-person'],
    description: 'Fire Bolt cantrip, Fireball, Magic Missile (back line)'
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
    position: 'back',
    // Spellcasting
    spellcastingAbility: 'wisdom',
    spellcastingMod: 3,
    spellSaveDC: 13,
    spellAttackBonus: 5,
    level: 5,
    spellSlots: { 1: 4, 2: 3 },
    cantrips: ['sacred-flame'],
    spells: ['healing-word', 'hold-person'],
    description: 'Sacred Flame, Healing Word, Hold Person (back line)'
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
  // === DRAGONS (v0.10) ===
  // Young Dragons - CR 7-10, no legendary features
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
    damageImmunities: ['fire'],
    multiattack: [
      { type: 'bite', attackBonus: 10, damage: '2d10+6', damageType: 'piercing' },
      { type: 'claw', attackBonus: 10, damage: '2d6+6', damageType: 'slashing' },
      { type: 'claw', attackBonus: 10, damage: '2d6+6', damageType: 'slashing' }
    ],
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
    tacticalAI: true,
    description: 'Fire immune, breath (16d6), multiattack'
  },
  {
    key: 'young-blue-dragon',
    name: 'Young Blue Dragon',
    maxHp: 152,
    armorClass: 18,
    attackBonus: 9,
    damage: '2d10+5',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    dexteritySave: 4,
    constitutionSave: 8,
    wisdomSave: 4,
    damageImmunities: ['lightning'],
    multiattack: [
      { type: 'bite', attackBonus: 9, damage: '2d10+5', damageType: 'piercing' },
      { type: 'claw', attackBonus: 9, damage: '2d6+5', damageType: 'slashing' },
      { type: 'claw', attackBonus: 9, damage: '2d6+5', damageType: 'slashing' }
    ],
    rechargeAbilities: [
      {
        name: 'Lightning Breath',
        rechargeMin: 5,
        available: true,
        type: 'area',
        shape: 'line',
        size: 60,
        saveDC: 16,
        saveAbility: 'dexterity',
        damage: '10d10',
        damageType: 'lightning',
        saveEffect: 'half'
      }
    ],
    conditionImmunities: ['frightened'],
    tacticalAI: true,
    description: 'Lightning immune, breath (10d10), multiattack'
  },
  {
    key: 'young-green-dragon',
    name: 'Young Green Dragon',
    maxHp: 136,
    armorClass: 18,
    attackBonus: 7,
    damage: '2d10+4',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    dexteritySave: 4,
    constitutionSave: 7,
    wisdomSave: 3,
    damageImmunities: ['poison'],
    conditionImmunities: ['frightened', 'poisoned'],
    multiattack: [
      { type: 'bite', attackBonus: 7, damage: '2d10+4', damageType: 'piercing' },
      { type: 'claw', attackBonus: 7, damage: '2d6+4', damageType: 'slashing' },
      { type: 'claw', attackBonus: 7, damage: '2d6+4', damageType: 'slashing' }
    ],
    rechargeAbilities: [
      {
        name: 'Poison Breath',
        rechargeMin: 5,
        available: true,
        type: 'area',
        shape: 'cone',
        size: 30,
        saveDC: 14,
        saveAbility: 'constitution',
        damage: '12d6',
        damageType: 'poison',
        saveEffect: 'half'
      }
    ],
    tacticalAI: true,
    description: 'Poison immune, breath (12d6), multiattack'
  },
  {
    key: 'young-white-dragon',
    name: 'Young White Dragon',
    maxHp: 133,
    armorClass: 17,
    attackBonus: 7,
    damage: '2d10+4',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    dexteritySave: 3,
    constitutionSave: 7,
    wisdomSave: 2,
    damageImmunities: ['cold'],
    multiattack: [
      { type: 'bite', attackBonus: 7, damage: '2d10+4', damageType: 'piercing' },
      { type: 'claw', attackBonus: 7, damage: '2d6+4', damageType: 'slashing' },
      { type: 'claw', attackBonus: 7, damage: '2d6+4', damageType: 'slashing' }
    ],
    rechargeAbilities: [
      {
        name: 'Cold Breath',
        rechargeMin: 5,
        available: true,
        type: 'area',
        shape: 'cone',
        size: 30,
        saveDC: 15,
        saveAbility: 'constitution',
        damage: '10d8',
        damageType: 'cold',
        saveEffect: 'half'
      }
    ],
    conditionImmunities: ['frightened'],
    tacticalAI: true,
    description: 'Cold immune, breath (10d8), multiattack'
  },
  {
    key: 'young-black-dragon',
    name: 'Young Black Dragon',
    maxHp: 127,
    armorClass: 18,
    attackBonus: 7,
    damage: '2d10+4',
    initiativeBonus: 3,
    numAttacks: 1,
    healingDice: null,
    dexteritySave: 5,
    constitutionSave: 6,
    wisdomSave: 2,
    damageImmunities: ['acid'],
    multiattack: [
      { type: 'bite', attackBonus: 7, damage: '2d10+4', damageType: 'piercing' },
      { type: 'claw', attackBonus: 7, damage: '2d6+4', damageType: 'slashing' },
      { type: 'claw', attackBonus: 7, damage: '2d6+4', damageType: 'slashing' }
    ],
    rechargeAbilities: [
      {
        name: 'Acid Breath',
        rechargeMin: 5,
        available: true,
        type: 'area',
        shape: 'line',
        size: 30,
        saveDC: 14,
        saveAbility: 'dexterity',
        damage: '11d8',
        damageType: 'acid',
        saveEffect: 'half'
      }
    ],
    conditionImmunities: ['frightened'],
    tacticalAI: true,
    description: 'Acid immune, breath (11d8), multiattack'
  },

  // Adult Dragons - CR 13-17, with legendary features
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
    damageImmunities: ['fire'],
    legendaryResistances: 3,
    multiattack: [
      { type: 'bite', attackBonus: 14, damage: '2d10+8', damageType: 'piercing' },
      { type: 'claw', attackBonus: 14, damage: '2d6+8', damageType: 'slashing' },
      { type: 'claw', attackBonus: 14, damage: '2d6+8', damageType: 'slashing' }
    ],
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
    frightfulPresence: {
      saveDC: 19,
      duration: 10
    },
    legendaryActions: 3,
    legendaryAbilities: [
      {
        name: 'Tail Attack',
        cost: 1,
        type: 'attack',
        attackBonus: 14,
        damage: '2d8+8',
        damageType: 'bludgeoning',
        reach: true
      },
      {
        name: 'Wing Attack',
        cost: 2,
        type: 'area',
        meleeRange: true, // Only hits front line
        saveDC: 22,
        saveAbility: 'dexterity',
        damage: '2d6+8',
        damageType: 'bludgeoning',
        onFail: 'prone'
      }
    ],
    conditionImmunities: ['frightened', 'charmed'],
    tacticalAI: true,
    description: 'Legendary (3 res, 3 act), fire immune, frightful presence'
  },
  {
    key: 'adult-blue-dragon',
    name: 'Adult Blue Dragon',
    maxHp: 225,
    armorClass: 19,
    attackBonus: 12,
    damage: '2d10+7',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    dexteritySave: 5,
    constitutionSave: 11,
    wisdomSave: 7,
    damageImmunities: ['lightning'],
    legendaryResistances: 3,
    multiattack: [
      { type: 'bite', attackBonus: 12, damage: '2d10+7', damageType: 'piercing' },
      { type: 'claw', attackBonus: 12, damage: '2d6+7', damageType: 'slashing' },
      { type: 'claw', attackBonus: 12, damage: '2d6+7', damageType: 'slashing' }
    ],
    rechargeAbilities: [
      {
        name: 'Lightning Breath',
        rechargeMin: 5,
        available: true,
        type: 'area',
        shape: 'line',
        size: 90,
        saveDC: 19,
        saveAbility: 'dexterity',
        damage: '12d10',
        damageType: 'lightning',
        saveEffect: 'half'
      }
    ],
    frightfulPresence: {
      saveDC: 17,
      duration: 10
    },
    legendaryActions: 3,
    legendaryAbilities: [
      {
        name: 'Tail Attack',
        cost: 1,
        type: 'attack',
        attackBonus: 12,
        damage: '2d8+7',
        damageType: 'bludgeoning',
        reach: true
      },
      {
        name: 'Wing Attack',
        cost: 2,
        type: 'area',
        meleeRange: true,
        saveDC: 20,
        saveAbility: 'dexterity',
        damage: '2d6+7',
        damageType: 'bludgeoning',
        onFail: 'prone'
      }
    ],
    conditionImmunities: ['frightened', 'charmed'],
    tacticalAI: true,
    description: 'Legendary (3 res, 3 act), lightning immune, frightful presence'
  },
  {
    key: 'adult-green-dragon',
    name: 'Adult Green Dragon',
    maxHp: 207,
    armorClass: 19,
    attackBonus: 11,
    damage: '2d10+6',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    dexteritySave: 6,
    constitutionSave: 10,
    wisdomSave: 7,
    damageImmunities: ['poison'],
    conditionImmunities: ['frightened', 'charmed', 'poisoned'],
    legendaryResistances: 3,
    multiattack: [
      { type: 'bite', attackBonus: 11, damage: '2d10+6', damageType: 'piercing' },
      { type: 'claw', attackBonus: 11, damage: '2d6+6', damageType: 'slashing' },
      { type: 'claw', attackBonus: 11, damage: '2d6+6', damageType: 'slashing' }
    ],
    rechargeAbilities: [
      {
        name: 'Poison Breath',
        rechargeMin: 5,
        available: true,
        type: 'area',
        shape: 'cone',
        size: 60,
        saveDC: 18,
        saveAbility: 'constitution',
        damage: '16d6',
        damageType: 'poison',
        saveEffect: 'half'
      }
    ],
    frightfulPresence: {
      saveDC: 16,
      duration: 10
    },
    legendaryActions: 3,
    legendaryAbilities: [
      {
        name: 'Tail Attack',
        cost: 1,
        type: 'attack',
        attackBonus: 11,
        damage: '2d8+6',
        damageType: 'bludgeoning',
        reach: true
      },
      {
        name: 'Wing Attack',
        cost: 2,
        type: 'area',
        meleeRange: true,
        saveDC: 19,
        saveAbility: 'dexterity',
        damage: '2d6+6',
        damageType: 'bludgeoning',
        onFail: 'prone'
      }
    ],
    tacticalAI: true,
    description: 'Legendary (3 res, 3 act), poison immune, frightful presence'
  },
  {
    key: 'adult-white-dragon',
    name: 'Adult White Dragon',
    maxHp: 200,
    armorClass: 18,
    attackBonus: 11,
    damage: '2d10+6',
    initiativeBonus: 2,
    numAttacks: 1,
    healingDice: null,
    dexteritySave: 5,
    constitutionSave: 10,
    wisdomSave: 5,
    damageImmunities: ['cold'],
    legendaryResistances: 3,
    multiattack: [
      { type: 'bite', attackBonus: 11, damage: '2d10+6', damageType: 'piercing' },
      { type: 'claw', attackBonus: 11, damage: '2d6+6', damageType: 'slashing' },
      { type: 'claw', attackBonus: 11, damage: '2d6+6', damageType: 'slashing' }
    ],
    rechargeAbilities: [
      {
        name: 'Cold Breath',
        rechargeMin: 5,
        available: true,
        type: 'area',
        shape: 'cone',
        size: 60,
        saveDC: 19,
        saveAbility: 'constitution',
        damage: '12d8',
        damageType: 'cold',
        saveEffect: 'half'
      }
    ],
    frightfulPresence: {
      saveDC: 14,
      duration: 10
    },
    legendaryActions: 3,
    legendaryAbilities: [
      {
        name: 'Tail Attack',
        cost: 1,
        type: 'attack',
        attackBonus: 11,
        damage: '2d8+6',
        damageType: 'bludgeoning',
        reach: true
      },
      {
        name: 'Wing Attack',
        cost: 2,
        type: 'area',
        meleeRange: true,
        saveDC: 19,
        saveAbility: 'dexterity',
        damage: '2d6+6',
        damageType: 'bludgeoning',
        onFail: 'prone'
      }
    ],
    conditionImmunities: ['frightened', 'charmed'],
    tacticalAI: true,
    description: 'Legendary (3 res, 3 act), cold immune, frightful presence'
  },
  {
    key: 'adult-black-dragon',
    name: 'Adult Black Dragon',
    maxHp: 195,
    armorClass: 19,
    attackBonus: 11,
    damage: '2d10+6',
    initiativeBonus: 3,
    numAttacks: 1,
    healingDice: null,
    dexteritySave: 7,
    constitutionSave: 9,
    wisdomSave: 5,
    damageImmunities: ['acid'],
    legendaryResistances: 3,
    multiattack: [
      { type: 'bite', attackBonus: 11, damage: '2d10+6', damageType: 'piercing' },
      { type: 'claw', attackBonus: 11, damage: '2d6+6', damageType: 'slashing' },
      { type: 'claw', attackBonus: 11, damage: '2d6+6', damageType: 'slashing' }
    ],
    rechargeAbilities: [
      {
        name: 'Acid Breath',
        rechargeMin: 5,
        available: true,
        type: 'area',
        shape: 'line',
        size: 60,
        saveDC: 18,
        saveAbility: 'dexterity',
        damage: '13d8',
        damageType: 'acid',
        saveEffect: 'half'
      }
    ],
    frightfulPresence: {
      saveDC: 16,
      duration: 10
    },
    legendaryActions: 3,
    legendaryAbilities: [
      {
        name: 'Tail Attack',
        cost: 1,
        type: 'attack',
        attackBonus: 11,
        damage: '2d8+6',
        damageType: 'bludgeoning',
        reach: true
      },
      {
        name: 'Wing Attack',
        cost: 2,
        type: 'area',
        meleeRange: true,
        saveDC: 19,
        saveAbility: 'dexterity',
        damage: '2d6+6',
        damageType: 'bludgeoning',
        onFail: 'prone'
      }
    ],
    conditionImmunities: ['frightened', 'charmed'],
    tacticalAI: true,
    description: 'Legendary (3 res, 3 act), acid immune, frightful presence'
  },

  // === OTHER ADVANCED MONSTERS ===
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
    tacticalAI: true,
    description: 'Mind blast (4d8+4 psychic, stun), tentacles'
  }
]
