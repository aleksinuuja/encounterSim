/**
 * Dice notation parser and roller
 * Supports notation like "1d8+4", "2d6+3", "1d12", "3d6"
 */

/**
 * Parse dice notation into components
 * @param {string} notation - Dice notation like "2d6+3"
 * @returns {{ count: number, sides: number, modifier: number }}
 */
export function parseDiceNotation(notation) {
  const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/i)
  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`)
  }

  const count = parseInt(match[1], 10)
  const sides = parseInt(match[2], 10)
  const modifier = match[3] ? parseInt(match[3], 10) : 0

  return { count, sides, modifier }
}

/**
 * Roll a single die
 * @param {number} sides - Number of sides on the die
 * @returns {number}
 */
export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1
}

/**
 * Roll dice from notation string
 * @param {string} notation - Dice notation like "2d6+3"
 * @returns {{ total: number, rolls: number[], modifier: number }}
 */
export function rollDice(notation) {
  const { count, sides, modifier } = parseDiceNotation(notation)
  const rolls = []

  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides))
  }

  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier

  return { total, rolls, modifier }
}

/**
 * Roll damage with critical hit support (doubles dice, not modifier)
 * @param {string} notation - Dice notation like "1d8+4"
 * @param {boolean} isCritical - Whether this is a critical hit
 * @returns {number}
 */
export function rollDamage(notation, isCritical = false) {
  const { count, sides, modifier } = parseDiceNotation(notation)
  const diceCount = isCritical ? count * 2 : count
  let total = 0

  for (let i = 0; i < diceCount; i++) {
    total += rollDie(sides)
  }

  return total + modifier
}

/**
 * Roll 1d20 for attacks and initiative
 * @returns {number}
 */
export function rollD20() {
  return rollDie(20)
}

/**
 * Roll 1d20 with advantage (roll twice, take higher)
 * @returns {{ result: number, rolls: [number, number] }}
 */
export function rollD20WithAdvantage() {
  const roll1 = rollDie(20)
  const roll2 = rollDie(20)
  return {
    result: Math.max(roll1, roll2),
    rolls: [roll1, roll2]
  }
}

/**
 * Roll 1d20 with disadvantage (roll twice, take lower)
 * @returns {{ result: number, rolls: [number, number] }}
 */
export function rollD20WithDisadvantage() {
  const roll1 = rollDie(20)
  const roll2 = rollDie(20)
  return {
    result: Math.min(roll1, roll2),
    rolls: [roll1, roll2]
  }
}

/**
 * Roll 1d20 with optional advantage/disadvantage
 * @param {'advantage' | 'disadvantage' | 'normal'} modifier
 * @returns {{ result: number, rolls: number[], modifier: string }}
 */
export function rollD20WithModifier(modifier = 'normal') {
  if (modifier === 'advantage') {
    const { result, rolls } = rollD20WithAdvantage()
    return { result, rolls, modifier: 'advantage' }
  }
  if (modifier === 'disadvantage') {
    const { result, rolls } = rollD20WithDisadvantage()
    return { result, rolls, modifier: 'disadvantage' }
  }
  const result = rollD20()
  return { result, rolls: [result], modifier: 'normal' }
}
