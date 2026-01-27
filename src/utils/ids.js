/**
 * Simple ID generation utilities
 */

let counter = 0

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string}
 */
export function generateId(prefix = '') {
  counter++
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6)
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`
}

/**
 * Reset the counter (useful for testing)
 */
export function resetIdCounter() {
  counter = 0
}
