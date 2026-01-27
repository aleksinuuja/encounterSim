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
    healingDice: null
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
    healingDice: null
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
    healingDice: '1d8+3'
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
    healingDice: null
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
  },
  {
    id: 'orc-4',
    name: 'Orc 4',
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
