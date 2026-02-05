/**
 * D&D Beyond Character Import Utility
 *
 * Fetches character data from D&D Beyond's (unofficial) API
 * and converts it to our simulator's combatant format.
 *
 * NOTE: This uses an undocumented API that may change without notice.
 * See: https://www.dndbeyond.com/forums/d-d-beyond-general/bugs-support/63362-exporting-data-and-characters-json
 */

/**
 * Extract character ID from a D&D Beyond URL
 * @param {string} url - Full D&D Beyond character URL
 * @returns {string|null} - Character ID or null if invalid
 */
export function extractCharacterId(url) {
  // Match patterns like:
  // https://www.dndbeyond.com/characters/30794220
  // https://www.dndbeyond.com/characters/30794220/elio-hidens
  const match = url.match(/dndbeyond\.com\/characters\/(\d+)/)
  return match ? match[1] : null
}

/**
 * Fetch raw character data from D&D Beyond API
 * Uses Vite dev proxy to avoid CORS, falls back to direct URL.
 * @param {string} characterId - The character ID
 * @returns {Promise<object>} - Raw API response
 */
export async function fetchDndBeyondCharacter(characterId) {
  // In dev, use proxy to avoid CORS; in prod, try direct
  const proxyUrl = `/api/dndbeyond/character/v5/character/${characterId}`
  const directUrl = `https://character-service.dndbeyond.com/character/v5/character/${characterId}`

  const url = import.meta.env.DEV ? proxyUrl : directUrl

  const response = await fetch(url)
  if (!response.ok) {
    if (response.status === 403 || response.status === 401) {
      throw new Error('Character is not public. Set it to Public in D&D Beyond character settings.')
    }
    throw new Error(`Failed to fetch character (${response.status}). Make sure the URL is correct and the character is public.`)
  }

  const data = await response.json()
  return data
}

/**
 * Calculate ability modifier from score
 * @param {number} score - Ability score (1-30)
 * @returns {number} - Modifier (-5 to +10)
 */
function abilityModifier(score) {
  return Math.floor((score - 10) / 2)
}

/**
 * Calculate proficiency bonus from level
 * @param {number} level - Character level (1-20)
 * @returns {number} - Proficiency bonus (2-6)
 */
function proficiencyBonus(level) {
  return Math.floor((level - 1) / 4) + 2
}

/**
 * Extract ability scores from D&D Beyond data
 * @param {object} data - Raw API data
 * @returns {object} - Ability scores and modifiers
 */
function extractAbilityScores(data) {
  const stats = data.data?.stats || []
  const bonusStats = data.data?.bonusStats || []
  const overrideStats = data.data?.overrideStats || []

  // D&D Beyond stat IDs: 1=STR, 2=DEX, 3=CON, 4=INT, 5=WIS, 6=CHA
  const abilityNames = ['', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']

  const abilities = {}

  for (let i = 1; i <= 6; i++) {
    const baseStat = stats.find(s => s.id === i)
    const bonusStat = bonusStats.find(s => s.id === i)
    const overrideStat = overrideStats.find(s => s.id === i)

    let score = baseStat?.value || 10
    if (bonusStat?.value) score += bonusStat.value
    if (overrideStat?.value) score = overrideStat.value

    const name = abilityNames[i]
    abilities[name] = {
      score,
      modifier: abilityModifier(score)
    }
  }

  return abilities
}

/**
 * Extract class information
 * @param {object} data - Raw API data
 * @returns {object} - Class name, level, subclass
 */
function extractClass(data) {
  const classes = data.data?.classes || []

  if (classes.length === 0) {
    return { className: 'unknown', level: 1, subclass: null }
  }

  // For multiclass, take the highest level class as primary
  const primaryClass = classes.reduce((a, b) =>
    (a.level || 0) > (b.level || 0) ? a : b
  )

  const totalLevel = classes.reduce((sum, c) => sum + (c.level || 0), 0)

  return {
    className: primaryClass.definition?.name?.toLowerCase() || 'unknown',
    level: totalLevel,
    subclass: primaryClass.subclassDefinition?.name || null
  }
}

/**
 * Calculate hit points
 * @param {object} data - Raw API data
 * @returns {object} - Current and max HP
 */
function extractHitPoints(data) {
  const hp = data.data?.baseHitPoints || 10
  const bonusHp = data.data?.bonusHitPoints || 0
  const removedHp = data.data?.removedHitPoints || 0
  const tempHp = data.data?.temporaryHitPoints || 0

  const maxHp = hp + bonusHp
  const currentHp = maxHp - removedHp

  return { maxHp, currentHp, tempHp }
}

/**
 * Calculate armor class (simplified - doesn't account for all modifiers)
 * @param {object} data - Raw API data
 * @param {object} abilities - Extracted abilities
 * @returns {number} - Armor class
 */
function extractArmorClass(data, abilities) {
  const dexMod = abilities.dexterity.modifier
  const inventory = data.data?.inventory || []

  let ac = 10 + dexMod // Base unarmored

  // Check for equipped armor
  const equippedArmor = inventory.find(item =>
    item.equipped &&
    item.definition?.armorTypeId &&
    item.definition.armorTypeId !== 4 // Not a shield
  )

  if (equippedArmor) {
    const baseAc = equippedArmor.definition?.armorClass || 10
    const armorType = equippedArmor.definition?.armorTypeId
    const magicBonus = equippedArmor.definition?.magic ? (equippedArmor.definition?.magicBonus || 1) : 0

    // Light armor (1): AC + full DEX
    // Medium armor (2): AC + DEX (max 2)
    // Heavy armor (3): AC only
    if (armorType === 1) {
      ac = baseAc + dexMod + magicBonus
    } else if (armorType === 2) {
      ac = baseAc + Math.min(dexMod, 2) + magicBonus
    } else if (armorType === 3) {
      ac = baseAc + magicBonus
    }
  }

  // Check for equipped shield (armorTypeId 4)
  const equippedShield = inventory.find(item =>
    item.equipped &&
    item.definition?.armorTypeId === 4
  )

  if (equippedShield) {
    const shieldBonus = equippedShield.definition?.armorClass || 2
    const shieldMagic = equippedShield.definition?.magic ? (equippedShield.definition?.magicBonus || 1) : 0
    ac += shieldBonus + shieldMagic
  }

  return ac
}

/**
 * Extract primary weapon attack
 * @param {object} data - Raw API data
 * @param {object} abilities - Extracted abilities
 * @param {number} profBonus - Proficiency bonus
 * @returns {object} - Attack bonus, damage dice, damage type
 */
function extractPrimaryAttack(data, abilities, profBonus) {
  const inventory = data.data?.inventory || []

  // Find equipped weapons
  const weapons = inventory.filter(item =>
    item.equipped &&
    item.definition?.damage
  )

  if (weapons.length === 0) {
    // Unarmed strike fallback
    return {
      attackBonus: abilities.strength.modifier + profBonus,
      damage: `1d4+${abilities.strength.modifier}`,
      damageType: 'bludgeoning'
    }
  }

  // Prefer the highest damage weapon
  const weapon = weapons.reduce((best, w) => {
    const bestDmg = (best.definition?.damage?.diceCount || 0) * (best.definition?.damage?.diceValue || 0)
    const curDmg = (w.definition?.damage?.diceCount || 0) * (w.definition?.damage?.diceValue || 0)
    return curDmg > bestDmg ? w : best
  })

  const weaponDef = weapon.definition

  // Determine if finesse (can use DEX)
  const properties = weaponDef.properties || []
  const isFinesse = properties.some(p =>
    p.name === 'Finesse' || p.description?.includes('Finesse')
  )
  const isRanged = weaponDef.attackType === 2

  let abilityMod
  if (isRanged) {
    abilityMod = abilities.dexterity.modifier
  } else if (isFinesse) {
    abilityMod = Math.max(abilities.strength.modifier, abilities.dexterity.modifier)
  } else {
    abilityMod = abilities.strength.modifier
  }

  // Build damage dice string from diceCount/diceValue
  const diceCount = weaponDef.damage?.diceCount || 1
  const diceValue = weaponDef.damage?.diceValue || 4
  const damageDice = `${diceCount}d${diceValue}`

  // Check for magic bonus
  const magicBonus = weaponDef.magic ? (weaponDef.magicBonus || 1) : 0

  const attackBonus = abilityMod + profBonus + magicBonus
  const damageBonus = abilityMod + magicBonus
  const damage = damageBonus >= 0 ? `${damageDice}+${damageBonus}` : `${damageDice}${damageBonus}`

  return {
    attackBonus,
    damage,
    damageType: weaponDef.damageType?.toLowerCase() || 'bludgeoning',
    weaponName: weaponDef.name,
    attackType: isRanged ? 'ranged' : 'melee'
  }
}

/**
 * Check for spellcasting and extract spell data
 * @param {object} data - Raw API data
 * @param {object} abilities - Extracted abilities
 * @param {number} profBonus - Proficiency bonus
 * @returns {object|null} - Spellcasting data or null
 */
function extractSpellcasting(data, abilities, profBonus) {
  const classSpells = data.data?.classSpells || []
  const spells = data.data?.spells || { class: [], race: [], item: [] }

  if (classSpells.length === 0) {
    return null
  }

  // Determine spellcasting ability
  // Fighter (EK) = INT, Paladin/Bard = CHA, Cleric/Druid/Ranger = WIS, Wizard = INT, etc.
  const spellcastingAbility = classSpells[0]?.spellCastingAbilityId
  const abilityMap = { 1: 'strength', 2: 'dexterity', 3: 'constitution', 4: 'intelligence', 5: 'wisdom', 6: 'charisma' }
  const abilityName = abilityMap[spellcastingAbility] || 'intelligence'
  const spellMod = abilities[abilityName].modifier

  const spellSaveDC = 8 + profBonus + spellMod
  const spellAttackBonus = profBonus + spellMod

  // Extract spell slots
  const spellSlots = {}
  const slotData = classSpells[0]?.spellSlots || []
  slotData.forEach((slot, index) => {
    if (slot.available > 0) {
      spellSlots[index + 1] = slot.available
    }
  })

  // Extract known spells (simplified - just names for now)
  const allSpells = [...(spells.class || []), ...(spells.race || [])]
  const cantrips = allSpells
    .filter(s => s.definition?.level === 0)
    .map(s => s.definition?.name?.toLowerCase().replace(/\s+/g, '-'))
  const knownSpells = allSpells
    .filter(s => s.definition?.level > 0)
    .map(s => s.definition?.name?.toLowerCase().replace(/\s+/g, '-'))

  return {
    spellcastingAbility: abilityName,
    spellcastingMod: spellMod,
    spellSaveDC,
    spellAttackBonus,
    spellSlots,
    cantrips,
    spells: knownSpells
  }
}

/**
 * Convert D&D Beyond character to simulator combatant format
 * @param {object} data - Raw API response
 * @returns {object} - Combatant ready for simulator
 */
export function convertToCombatant(data) {
  const name = data.data?.name || 'Unknown Character'
  const { className, level, subclass } = extractClass(data)
  const abilities = extractAbilityScores(data)
  const { maxHp, currentHp } = extractHitPoints(data)
  const profBonus = proficiencyBonus(level)
  const armorClass = extractArmorClass(data, abilities)
  const attack = extractPrimaryAttack(data, abilities, profBonus)
  const spellcasting = extractSpellcasting(data, abilities, profBonus)

  // Calculate number of attacks based on class and level
  let numAttacks = 1
  if (['fighter', 'paladin', 'ranger', 'barbarian', 'monk'].includes(className)) {
    if (level >= 5) numAttacks = 2
    if (className === 'fighter' && level >= 11) numAttacks = 3
    if (className === 'fighter' && level >= 20) numAttacks = 4
  }

  const combatant = {
    name,
    class: className,
    level,
    subclass,
    maxHp,
    currentHp: maxHp, // Start fresh for simulation
    armorClass,
    attackBonus: attack.attackBonus,
    damage: attack.damage,
    initiativeBonus: abilities.dexterity.modifier,
    isPlayer: true,
    numAttacks,
    position: 'front',

    // Ability modifiers
    strMod: abilities.strength.modifier,
    dexMod: abilities.dexterity.modifier,
    conMod: abilities.constitution.modifier,
    intMod: abilities.intelligence.modifier,
    wisMod: abilities.wisdom.modifier,
    chaMod: abilities.charisma.modifier,

    // Proficiency
    proficiencyBonus: profBonus,

    // Saving throws (simplified - assumes proficiency in class saves)
    constitutionSave: abilities.constitution.modifier + profBonus,
    dexteritySave: abilities.dexterity.modifier,
    wisdomSave: abilities.wisdom.modifier,

    // Source tracking
    importedFrom: 'dndbeyond',
    dndbeyondId: data.data?.id
  }

  // Add class-specific features
  if (className === 'fighter') {
    combatant.hasSecondWind = true
    combatant.hasActionSurge = level >= 2
  }

  // Add spellcasting if present
  if (spellcasting) {
    Object.assign(combatant, spellcasting)
    if (className === 'fighter') {
      combatant.position = 'front' // Eldritch Knights are still frontline
    } else {
      combatant.position = 'back'
    }
  }

  return combatant
}

/**
 * Import a character from D&D Beyond URL
 * @param {string} url - D&D Beyond character URL
 * @returns {Promise<object>} - Combatant ready for simulator
 */
export async function importFromDndBeyond(url) {
  const characterId = extractCharacterId(url)
  if (!characterId) {
    throw new Error('Invalid D&D Beyond URL. Expected format: https://www.dndbeyond.com/characters/12345678')
  }

  const rawData = await fetchDndBeyondCharacter(characterId)
  return convertToCombatant(rawData)
}
