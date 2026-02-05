/**
 * Monster Statblock Parser
 *
 * Parses D&D 5e monster statblocks from text (extracted from screenshots, PDFs, etc.)
 * and converts them to our simulator's combatant format.
 *
 * This is the "LLM translation layer" proof of concept:
 * In Chimerulator, this would be a constrained parser that maps
 * natural language + structured data to simulation primitives.
 */

/**
 * Parse a monster statblock from plain text
 * @param {string} text - Raw statblock text
 * @returns {object} - Combatant ready for simulator
 */
export function parseStatblock(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  const name = extractName(lines)
  const sizeTypeAlignment = extractSizeTypeAlignment(lines)
  const ac = extractAC(text)
  const hp = extractHP(text)
  const speed = extractSpeed(text)
  const abilities = extractAbilities(text)
  const attacks = extractAttacks(text)
  const specialAbilities = extractSpecialAbilities(text)
  const saves = extractSavingThrows(text)
  const conditionImmunities = extractConditionImmunities(text)
  const damageResistances = extractDamageResistances(text)
  const damageImmunities = extractDamageImmunities(text)
  const cr = extractCR(text)

  // Pick the best attack (highest average damage)
  const primaryAttack = attacks.length > 0
    ? attacks.reduce((best, a) => {
        const bestAvg = estimateAvgDamage(best.damage)
        const curAvg = estimateAvgDamage(a.damage)
        return curAvg > bestAvg ? a : best
      })
    : { attackBonus: abilities.strMod + 2, damage: '1d4+' + abilities.strMod }

  // Check for multiattack
  const multiattack = extractMultiattack(text, attacks)

  const combatant = {
    name,
    maxHp: hp.average,
    armorClass: ac.value,
    attackBonus: primaryAttack.attackBonus,
    damage: primaryAttack.damage,
    initiativeBonus: abilities.dexMod,
    isPlayer: false,
    numAttacks: multiattack.count,
    position: 'front',

    // Ability modifiers
    strMod: abilities.strMod,
    dexMod: abilities.dexMod,
    conMod: abilities.conMod,
    intMod: abilities.intMod,
    wisMod: abilities.wisMod,
    chaMod: abilities.chaMod,

    // CR for reference
    challengeRating: cr,

    // Source tracking
    importedFrom: 'statblock'
  }

  // Add saving throw bonuses
  if (saves.length > 0) {
    for (const save of saves) {
      combatant[save.ability + 'Save'] = save.bonus
    }
  }

  // Add condition immunities
  if (conditionImmunities.length > 0) {
    combatant.conditionImmunities = conditionImmunities
  }

  // Add damage resistances/immunities
  if (damageResistances.length > 0) {
    combatant.damageResistances = damageResistances
  }
  if (damageImmunities.length > 0) {
    combatant.damageImmunities = damageImmunities
  }

  // Add special abilities (breath weapon, etc.)
  if (specialAbilities.breathWeapon) {
    combatant.rechargeAbilities = [{
      name: specialAbilities.breathWeapon.name,
      damage: specialAbilities.breathWeapon.damage,
      damageType: specialAbilities.breathWeapon.damageType,
      saveDC: specialAbilities.breathWeapon.saveDC,
      saveAbility: specialAbilities.breathWeapon.saveAbility,
      aoeShape: specialAbilities.breathWeapon.aoeShape || 'cone',
      rechargeOn: specialAbilities.breathWeapon.rechargeOn || [6],
      isCharged: true
    }]
  }

  // Store all parsed attacks for reference
  if (attacks.length > 1) {
    combatant.allAttacks = attacks
  }

  return combatant
}

// --- Extraction helpers ---

function extractName(lines) {
  // Name is typically the first line, often in larger text
  return lines[0] || 'Unknown Monster'
}

function extractSizeTypeAlignment(lines) {
  // Second line is usually "Medium humanoid (goblin), neutral evil"
  const line = lines.find(l => /^(tiny|small|medium|large|huge|gargantuan)/i.test(l))
  return line || ''
}

function extractAC(text) {
  const match = text.match(/armor\s*class\s*(\d+)/i)
  return { value: match ? parseInt(match[1]) : 10 }
}

function extractHP(text) {
  // Match "Hit Points 136 (16d10 + 48)" or "Hit Points 52 (8d8+16)"
  const match = text.match(/hit\s*points?\s*(\d+)\s*\(([^)]+)\)/i)
  if (match) {
    return {
      average: parseInt(match[1]),
      formula: match[2].trim()
    }
  }

  // Fallback: just a number
  const simple = text.match(/hit\s*points?\s*(\d+)/i)
  return { average: simple ? parseInt(simple[1]) : 10, formula: null }
}

function extractSpeed(text) {
  const match = text.match(/speed\s+(\d+)\s*ft/i)
  return match ? parseInt(match[1]) : 30
}

function extractAbilities(text) {
  // Match ability score blocks like:
  // STR DEX CON INT WIS CHA
  // 19 (+4) 12 (+1) 17 (+3) 16 (+3) 13 (+1) 15 (+2)
  // or: STR 19 (+4) DEX 12 (+1) ...

  const modifiers = {}
  const abilityNames = ['str', 'dex', 'con', 'int', 'wis', 'cha']

  // Try to find all six ability scores with modifiers
  const modPattern = /(\d+)\s*\(\s*([+-]\d+)\s*\)/g
  const matches = [...text.matchAll(modPattern)]

  // Find the cluster of 6 consecutive ability scores
  // They usually appear together in the statblock
  if (matches.length >= 6) {
    // Find which 6 are the ability scores - look for the group near ability labels
    const abilitySection = text.match(/STR.*?CHA[^]*?(\d+\s*\([+-]\d+\)\s*){6}/i)

    if (abilitySection) {
      const sectionMods = [...abilitySection[0].matchAll(modPattern)]
      for (let i = 0; i < Math.min(6, sectionMods.length); i++) {
        modifiers[abilityNames[i] + 'Mod'] = parseInt(sectionMods[i][2])
      }
    } else {
      // Fallback: take the first 6 matches
      for (let i = 0; i < 6; i++) {
        modifiers[abilityNames[i] + 'Mod'] = parseInt(matches[i][2])
      }
    }
  }

  // Defaults
  for (const name of abilityNames) {
    if (modifiers[name + 'Mod'] === undefined) {
      modifiers[name + 'Mod'] = 0
    }
  }

  return modifiers
}

function extractSavingThrows(text) {
  const saves = []
  const saveMatch = text.match(/saving\s*throws?\s+([^\n]+)/i)
  if (!saveMatch) return saves

  const line = saveMatch[1]
  const abilityMap = {
    str: 'strength', dex: 'dexterity', con: 'constitution',
    int: 'intelligence', wis: 'wisdom', cha: 'charisma'
  }

  for (const [abbr, full] of Object.entries(abilityMap)) {
    const match = line.match(new RegExp(abbr + '\\s*([+-]\\d+)', 'i'))
    if (match) {
      saves.push({ ability: full, bonus: parseInt(match[1]) })
    }
  }

  return saves
}

function extractConditionImmunities(text) {
  const match = text.match(/condition\s*immunities?\s+([^\n]+)/i)
  if (!match) return []

  return match[1].toLowerCase().split(/,\s*/).map(s => s.trim()).filter(Boolean)
}

function extractDamageResistances(text) {
  const match = text.match(/damage\s*resistances?\s+([^\n]+)/i)
  if (!match) return []

  return match[1].toLowerCase().split(/,\s*/).map(s => s.trim()).filter(Boolean)
}

function extractDamageImmunities(text) {
  const match = text.match(/damage\s*immunities?\s+([^\n]+)/i)
  if (!match) return []

  return match[1].toLowerCase().split(/,\s*/).map(s => s.trim()).filter(Boolean)
}

function extractCR(text) {
  const match = text.match(/challenge\s+(\d+(?:\/\d+)?)\s*\(/i)
  if (match) {
    const cr = match[1]
    if (cr.includes('/')) {
      const [num, den] = cr.split('/')
      return parseInt(num) / parseInt(den)
    }
    return parseInt(cr)
  }
  return null
}

function extractAttacks(text) {
  const attacks = []

  // Match attack entries like:
  // "Bite. Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 15 (2d10 + 4) piercing damage"
  // "Claw. Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage"
  const attackPattern = /([A-Z][a-z]+(?:\s+[A-Za-z]+)*)\.\s*(?:Melee|Ranged)\s*Weapon\s*Attack:\s*\+(\d+)\s*to\s*hit.*?Hit:\s*(\d+)\s*\((\d+d\d+(?:\s*[+-]\s*\d+)?)\)\s*(\w+)\s*damage/gi

  for (const match of text.matchAll(attackPattern)) {
    const damageDice = match[4].replace(/\s+/g, '')
    attacks.push({
      name: match[1],
      attackBonus: parseInt(match[2]),
      avgDamage: parseInt(match[3]),
      damage: damageDice,
      damageType: match[5].toLowerCase(),
      attackType: /melee/i.test(match[0]) ? 'melee' : 'ranged'
    })
  }

  return attacks
}

function extractMultiattack(text, attacks) {
  const multiMatch = text.match(/multiattack.*?makes?\s*(\w+)\s*(?:melee\s*)?attacks?/i)
  if (multiMatch) {
    const wordToNum = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 }
    const count = wordToNum[multiMatch[1].toLowerCase()] || parseInt(multiMatch[1]) || 2
    return { count }
  }

  // Check for specific multiattack descriptions like "two claw attacks and one bite"
  const specificMulti = text.match(/multiattack.*?(\d+|two|three|four)\s+\w+\s+attacks?\s+and\s+(\d+|one|two)\s+\w+/i)
  if (specificMulti) {
    const wordToNum = { one: 1, two: 2, three: 3, four: 4 }
    const a = wordToNum[specificMulti[1].toLowerCase()] || parseInt(specificMulti[1]) || 2
    const b = wordToNum[specificMulti[2].toLowerCase()] || parseInt(specificMulti[2]) || 1
    return { count: a + b }
  }

  return { count: 1 }
}

function extractSpecialAbilities(text) {
  const abilities = {}

  // Breath weapon: find name + recharge, then extract DC, save ability, damage from the block
  const breathHeader = text.match(
    /([A-Z][a-z]+(?:\s+[A-Za-z]+)*\s+Breath)\s*\(Recharge\s+(\d+)(?:-(\d+))?\)\.\s*([^]*?)(?=\n[A-Z]|\n\n|$)/i
  )

  if (breathHeader) {
    const breathText = breathHeader[0]
    const dcMatch = breathText.match(/DC\s+(\d+)\s+(\w+)/i)
    const damageMatch = breathText.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)\s*\)\s*(\w+)\s+damage/i)

    if (dcMatch && damageMatch) {
      const rechargeStart = parseInt(breathHeader[2])
      const rechargeEnd = breathHeader[3] ? parseInt(breathHeader[3]) : 6
      const rechargeOn = []
      for (let i = rechargeStart; i <= rechargeEnd; i++) {
        rechargeOn.push(i)
      }

      const aoeShape = /cone/i.test(breathText) ? 'cone' : 'line'

      abilities.breathWeapon = {
        name: breathHeader[1],
        damage: damageMatch[1].replace(/\s+/g, ''),
        damageType: damageMatch[2].toLowerCase(),
        saveDC: parseInt(dcMatch[1]),
        saveAbility: dcMatch[2].toLowerCase(),
        rechargeOn,
        aoeShape
      }
    }
  }

  return abilities
}

/**
 * Estimate average damage from a dice string
 * @param {string} diceStr - e.g., "2d6+4"
 * @returns {number}
 */
function estimateAvgDamage(diceStr) {
  if (!diceStr) return 0
  const match = diceStr.match(/(\d+)d(\d+)([+-]\d+)?/)
  if (!match) return 0
  const count = parseInt(match[1])
  const sides = parseInt(match[2])
  const bonus = parseInt(match[3] || '0')
  return count * (sides + 1) / 2 + bonus
}
