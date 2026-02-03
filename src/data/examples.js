/**
 * Example party and monster data for testing
 */

export const exampleParty = [
  {
    id: 'fighter-1',
    name: 'Fighter',
    maxHp: 44,
    armorClass: 18,
    attackBonus: 7,
    damage: '1d8+4',
    initiativeBonus: 2,
    isPlayer: true,
    numAttacks: 2,
    healingDice: null,
    level: 5,
    // v0.7: Action economy features
    hasSecondWind: true,
    hasActionSurge: true,
    constitutionSave: 5
  },
  {
    id: 'rogue-1',
    name: 'Rogue',
    maxHp: 33,
    armorClass: 15,
    attackBonus: 7,
    damage: '1d6+4',
    initiativeBonus: 4,
    isPlayer: true,
    numAttacks: 1,
    healingDice: null,
    level: 5,
    // v0.7: Two-weapon fighting
    hasTwoWeaponFighting: true,
    offHandDamage: '1d6',
    dexteritySave: 7
  },
  {
    id: 'cleric-1',
    name: 'Cleric',
    maxHp: 38,
    armorClass: 18,
    attackBonus: 6,
    damage: '1d8+3',
    initiativeBonus: 0,
    isPlayer: true,
    numAttacks: 1,
    healingDice: '1d8+3',
    // v0.6: Spellcasting
    spellcastingAbility: 'wisdom',
    spellcastingMod: 4,
    spellSaveDC: 14,
    spellAttackBonus: 6,
    level: 5,
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    cantrips: ['sacred-flame', 'toll-the-dead'],
    spells: ['healing-word', 'cure-wounds', 'bless']
  },
  {
    id: 'sorcerer-1',
    name: 'Sorcerer',
    maxHp: 28,
    armorClass: 13,
    attackBonus: 7,
    damage: '1d10+4',
    initiativeBonus: 2,
    isPlayer: true,
    numAttacks: 1,
    healingDice: null,
    // v0.6: Spellcasting
    spellcastingAbility: 'charisma',
    spellcastingMod: 4,
    spellSaveDC: 14,
    spellAttackBonus: 6,
    level: 5,
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    cantrips: ['fire-bolt'],
    spells: ['magic-missile', 'fireball', 'scorching-ray']
  },
  {
    id: 'ranger-1',
    name: 'Ranger',
    maxHp: 42,
    armorClass: 15,
    attackBonus: 7,
    damage: '1d8+4',
    initiativeBonus: 3,
    isPlayer: true,
    numAttacks: 1,
    healingDice: null
  }
]

export const exampleMonsters = [
  {
    id: 'spider-1',
    name: 'Giant Spider',
    maxHp: 26,
    armorClass: 14,
    attackBonus: 5,
    damage: '1d8+3',
    initiativeBonus: 3,
    isPlayer: false,
    numAttacks: 1,
    healingDice: null,
    // Poison bite: on hit, target must save or be poisoned
    onHitEffect: {
      condition: 'poisoned',
      duration: 3,
      saveDC: 11,
      saveAbility: 'constitution',
      saveEndOfTurn: {
        ability: 'constitution',
        dc: 11
      }
    }
  },
  {
    id: 'orc-1',
    name: 'Orc 1',
    maxHp: 15,
    armorClass: 13,
    attackBonus: 5,
    damage: '1d12+3',
    initiativeBonus: 1,
    isPlayer: false,
    numAttacks: 1,
    healingDice: null
  },
  {
    id: 'orc-2',
    name: 'Orc 2',
    maxHp: 15,
    armorClass: 13,
    attackBonus: 5,
    damage: '1d12+3',
    initiativeBonus: 1,
    isPlayer: false,
    numAttacks: 1,
    healingDice: null
  },
  {
    id: 'orc-3',
    name: 'Orc 3',
    maxHp: 15,
    armorClass: 13,
    attackBonus: 5,
    damage: '1d12+3',
    initiativeBonus: 1,
    isPlayer: false,
    numAttacks: 1,
    healingDice: null
  }
]
