/**
 * Tests for the statblock parser
 */

import { describe, it, expect } from 'vitest'
import { parseStatblock } from './statblockParser.js'

const YOUNG_GREEN_DRAGON = `Young Green Dragon
Large dragon, lawful evil

Armor Class 18 (natural armor)
Hit Points 136 (16d10 + 48)
Speed 40 ft., fly 80 ft., swim 40 ft.

STR DEX CON INT WIS CHA
19 (+4) 12 (+1) 17 (+3) 16 (+3) 13 (+1) 15 (+2)

Saving Throws Dex +4, Con +6, Wis +4, Cha +5
Skills Deception +5, Perception +7, Stealth +4
Damage Immunities poison
Condition Immunities poisoned
Senses blindsight 30 ft., darkvision 120 ft., passive Perception 17
Languages Common, Draconic
Challenge 8 (3,900 XP)

Amphibious. The dragon can breathe air and water.

Actions

Multiattack. The dragon makes three attacks: one with its bite and two with its claws.

Bite. Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 15 (2d10 + 4) piercing damage plus 7 (2d6) poison damage.

Claw. Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage.

Poison Breath (Recharge 5-6). The dragon exhales poisonous gas in a 30-foot cone. Each creature in that area must make a DC 14 Constitution saving throw, taking 42 (12d6) poison damage on a failed save, or half as much damage on a successful one.`

const ORC = `Orc
Medium humanoid (orc), chaotic evil

Armor Class 13 (hide armor)
Hit Points 15 (2d8 + 6)
Speed 30 ft.

STR DEX CON INT WIS CHA
16 (+3) 12 (+1) 16 (+3) 7 (-2) 11 (+0) 10 (+0)

Skills Intimidation +2
Senses darkvision 60 ft., passive Perception 10
Languages Common, Orc
Challenge 1/2 (100 XP)

Aggressive. As a bonus action, the orc can move up to its speed toward a hostile creature that it can see.

Actions

Greataxe. Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 9 (1d12 + 3) slashing damage.

Javelin. Melee or Ranged Weapon Attack: +5 to hit, reach 5 ft. or range 30/120 ft., one target. Hit: 6 (1d6 + 3) piercing damage.`

describe('parseStatblock', () => {
  describe('Young Green Dragon', () => {
    const dragon = parseStatblock(YOUNG_GREEN_DRAGON)

    it('extracts name', () => {
      expect(dragon.name).toBe('Young Green Dragon')
    })

    it('extracts AC', () => {
      expect(dragon.armorClass).toBe(18)
    })

    it('extracts HP', () => {
      expect(dragon.maxHp).toBe(136)
    })

    it('extracts ability modifiers', () => {
      expect(dragon.strMod).toBe(4)
      expect(dragon.dexMod).toBe(1)
      expect(dragon.conMod).toBe(3)
      expect(dragon.intMod).toBe(3)
      expect(dragon.wisMod).toBe(1)
      expect(dragon.chaMod).toBe(2)
    })

    it('extracts saving throws', () => {
      expect(dragon.dexteritySave).toBe(4)
      expect(dragon.constitutionSave).toBe(6)
      expect(dragon.wisdomSave).toBe(4)
    })

    it('extracts attack bonus and damage', () => {
      expect(dragon.attackBonus).toBe(7)
      // Should pick the bite as primary (highest damage)
      expect(dragon.damage).toMatch(/2d10\+4/)
    })

    it('extracts multiattack count', () => {
      expect(dragon.numAttacks).toBe(3)
    })

    it('extracts challenge rating', () => {
      expect(dragon.challengeRating).toBe(8)
    })

    it('extracts condition immunities', () => {
      expect(dragon.conditionImmunities).toContain('poisoned')
    })

    it('extracts damage immunities', () => {
      expect(dragon.damageImmunities).toContain('poison')
    })

    it('extracts breath weapon', () => {
      expect(dragon.rechargeAbilities).toBeDefined()
      expect(dragon.rechargeAbilities[0].name).toBe('Poison Breath')
      expect(dragon.rechargeAbilities[0].damage).toBe('12d6')
      expect(dragon.rechargeAbilities[0].saveDC).toBe(14)
      expect(dragon.rechargeAbilities[0].saveAbility).toBe('constitution')
      expect(dragon.rechargeAbilities[0].aoeShape).toBe('cone')
      expect(dragon.rechargeAbilities[0].rechargeOn).toEqual([5, 6])
    })

    it('is not a player', () => {
      expect(dragon.isPlayer).toBe(false)
    })
  })

  describe('Orc', () => {
    const orc = parseStatblock(ORC)

    it('extracts name', () => {
      expect(orc.name).toBe('Orc')
    })

    it('extracts AC', () => {
      expect(orc.armorClass).toBe(13)
    })

    it('extracts HP', () => {
      expect(orc.maxHp).toBe(15)
    })

    it('extracts ability modifiers', () => {
      expect(orc.strMod).toBe(3)
      expect(orc.dexMod).toBe(1)
      expect(orc.conMod).toBe(3)
      expect(orc.intMod).toBe(-2)
      expect(orc.wisMod).toBe(0)
      expect(orc.chaMod).toBe(0)
    })

    it('extracts greataxe as primary attack', () => {
      expect(orc.attackBonus).toBe(5)
      expect(orc.damage).toMatch(/1d12\+3/)
    })

    it('has single attack', () => {
      expect(orc.numAttacks).toBe(1)
    })

    it('extracts CR', () => {
      expect(orc.challengeRating).toBe(0.5)
    })
  })
})
