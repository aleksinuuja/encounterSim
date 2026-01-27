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
