/**
 * Advanced monster abilities for D&D 5e combat
 * Handles multiattack variants, recharge abilities, and legendary actions
 */

import { rollD20, rollDice } from './dice.js'
import { applyCondition } from './conditions.js'
import { getDefaultPosition } from './positioning.js'

/**
 * Roll to recharge an ability
 * @param {object} ability - The recharge ability
 * @returns {{ recharged: boolean, roll: number }}
 */
export function rollRecharge(ability) {
  const roll = rollD20()
  // Recharge abilities typically recharge on 5-6 (d6), simulated with d20
  // 5-6 on d6 = 33% chance, so we'll use roll >= ability.rechargeMin on d6 scale
  // Convert: 5-6 on d6 = 17-20 on d20 (for 5-6), or 14-20 for (4-6)
  const d6Roll = Math.ceil(roll / 3.34) // Convert d20 to d6 range
  const recharged = d6Roll >= ability.rechargeMin

  return { recharged, roll: d6Roll }
}

/**
 * Execute a multiattack sequence
 * @param {object} attacker - The monster
 * @param {object[]} targets - Available targets
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @returns {object[]} - Array of log entries
 */
export function executeMultiattack(attacker, targets, round, turn) {
  const logs = []
  const livingTargets = targets.filter(t => !t.isDead && !t.isUnconscious)

  if (!attacker.multiattack || livingTargets.length === 0) {
    return logs
  }

  for (const attack of attacker.multiattack) {
    // Pick target (focus fire on lowest HP)
    const target = [...livingTargets]
      .filter(t => !t.isDead && !t.isUnconscious)
      .sort((a, b) => a.currentHp - b.currentHp)[0]

    if (!target) break

    const attackRoll = rollD20()
    const totalAttack = attackRoll + attack.attackBonus

    const logEntry = {
      round,
      turn,
      actorName: attacker.name,
      targetName: target.name,
      actionType: 'multiattack',
      attackType: attack.type,
      attackRoll,
      totalAttack,
      targetAC: target.armorClass,
      hit: false
    }

    if (attackRoll === 1) {
      logs.push(logEntry)
      continue
    }

    const isCritical = attackRoll === 20
    const hit = isCritical || totalAttack >= target.armorClass

    if (hit) {
      logEntry.hit = true
      logEntry.isCritical = isCritical
      logEntry.targetHpBefore = target.currentHp

      const { total: baseDamage } = rollDice(attack.damage)
      const damage = isCritical ? baseDamage * 2 : baseDamage

      logEntry.damageRoll = damage
      logEntry.damageType = attack.damageType
      target.currentHp = Math.max(0, target.currentHp - damage)
      logEntry.targetHpAfter = target.currentHp

      if (target.currentHp <= 0) {
        if (target.isPlayer) {
          target.isUnconscious = true
          logEntry.targetDowned = true
        } else {
          target.isDead = true
          logEntry.targetDied = true
        }
      }
    }

    logs.push(logEntry)
  }

  return logs
}

/**
 * Execute a breath weapon or area ability
 * @param {object} monster - The monster using the ability
 * @param {object} ability - The breath weapon ability
 * @param {object[]} targets - All targets in area
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @param {string} targetPosition - Position group targeted ('front' or 'back')
 * @returns {object[]} - Array of log entries
 */
export function executeBreathWeapon(monster, ability, targets, round, turn, targetPosition = null) {
  const logs = []
  const { total: baseDamage } = rollDice(ability.damage)

  // Main log entry for the breath weapon
  const mainLog = {
    round,
    turn,
    actorName: monster.name,
    actionType: 'breathWeapon',
    abilityName: ability.name,
    shape: ability.shape,
    size: ability.size,
    baseDamage,
    damageType: ability.damageType,
    targetsHit: targets.length
  }

  // Add position info if available
  if (targetPosition) {
    mainLog.targetPosition = targetPosition
  }

  logs.push(mainLog)

  // Mark ability as used
  ability.available = false

  // Individual target effects
  for (const target of targets) {
    const saveRoll = rollD20()
    const saveBonus = target[ability.saveAbility + 'Save'] || 0
    const saveTotal = saveRoll + saveBonus
    const saved = saveTotal >= ability.saveDC

    const damage = saved && ability.saveEffect === 'half'
      ? Math.floor(baseDamage / 2)
      : saved && ability.saveEffect === 'none'
        ? 0
        : baseDamage

    const hpBefore = target.currentHp
    target.currentHp = Math.max(0, target.currentHp - damage)

    const targetLog = {
      round,
      turn,
      actorName: monster.name,
      targetName: target.name,
      actionType: 'breathEffect',
      abilityName: ability.name,
      saveRoll,
      saveTotal,
      saveDC: ability.saveDC,
      saveAbility: ability.saveAbility,
      savePassed: saved,
      damageRoll: damage,
      damageType: ability.damageType,
      targetHpBefore: hpBefore,
      targetHpAfter: target.currentHp
    }

    if (target.currentHp <= 0) {
      if (target.isPlayer) {
        target.isUnconscious = true
        targetLog.targetDowned = true
      } else {
        target.isDead = true
        targetLog.targetDied = true
      }
    }

    logs.push(targetLog)
  }

  return logs
}

/**
 * Execute a legendary action
 * @param {object} monster - The legendary monster
 * @param {object} ability - The legendary ability to use
 * @param {object[]} targets - Available targets
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @returns {object[]} - Array of log entries
 */
export function executeLegendaryAction(monster, ability, targets, round, turn) {
  const logs = []
  const livingTargets = targets.filter(t => !t.isDead && !t.isUnconscious)

  if (livingTargets.length === 0) return logs

  // Deduct cost
  monster.currentLegendaryActions -= ability.cost

  if (ability.type === 'attack') {
    const target = livingTargets[0]
    const attackRoll = rollD20()
    const totalAttack = attackRoll + ability.attackBonus

    const logEntry = {
      round,
      turn,
      actorName: monster.name,
      targetName: target.name,
      actionType: 'legendaryAction',
      abilityName: ability.name,
      cost: ability.cost,
      attackRoll,
      totalAttack,
      targetAC: target.armorClass,
      hit: false
    }

    if (attackRoll !== 1) {
      const isCritical = attackRoll === 20
      const hit = isCritical || totalAttack >= target.armorClass

      if (hit) {
        logEntry.hit = true
        logEntry.isCritical = isCritical
        logEntry.targetHpBefore = target.currentHp

        const { total: baseDamage } = rollDice(ability.damage)
        const damage = isCritical ? baseDamage * 2 : baseDamage

        logEntry.damageRoll = damage
        target.currentHp = Math.max(0, target.currentHp - damage)
        logEntry.targetHpAfter = target.currentHp

        if (target.currentHp <= 0) {
          if (target.isPlayer) {
            target.isUnconscious = true
            logEntry.targetDowned = true
          } else {
            target.isDead = true
            logEntry.targetDied = true
          }
        }
      }
    }

    logs.push(logEntry)
  } else if (ability.type === 'area') {
    // Area effect (like Wing Attack)
    const { total: baseDamage } = rollDice(ability.damage)

    logs.push({
      round,
      turn,
      actorName: monster.name,
      actionType: 'legendaryAction',
      abilityName: ability.name,
      cost: ability.cost,
      effectType: 'area',
      baseDamage
    })

    for (const target of livingTargets) {
      const saveRoll = rollD20()
      const saveBonus = target[ability.saveAbility + 'Save'] || 0
      const saveTotal = saveRoll + saveBonus
      const saved = saveTotal >= ability.saveDC

      const damage = saved ? 0 : baseDamage
      const hpBefore = target.currentHp
      target.currentHp = Math.max(0, target.currentHp - damage)

      const targetLog = {
        round,
        turn,
        actorName: monster.name,
        targetName: target.name,
        actionType: 'legendaryEffect',
        abilityName: ability.name,
        saveRoll,
        saveTotal,
        saveDC: ability.saveDC,
        savePassed: saved,
        damageRoll: damage,
        targetHpBefore: hpBefore,
        targetHpAfter: target.currentHp
      }

      // Apply condition on fail
      if (!saved && ability.onFail) {
        applyCondition(target, {
          type: ability.onFail,
          duration: 1,
          source: monster.name
        })
        targetLog.conditionApplied = ability.onFail
      }

      if (target.currentHp <= 0) {
        if (target.isPlayer) {
          target.isUnconscious = true
          targetLog.targetDowned = true
        } else {
          target.isDead = true
          targetLog.targetDied = true
        }
      }

      logs.push(targetLog)
    }
  }

  return logs
}

/**
 * Select which legendary action to use
 * @param {object} monster - The legendary monster
 * @param {object[]} enemies - Enemy combatants
 * @returns {object|null} - Selected ability or null
 */
export function selectLegendaryAction(monster, enemies) {
  if (!monster.legendaryAbilities || monster.currentLegendaryActions <= 0) {
    return null
  }

  const livingEnemies = enemies.filter(e => !e.isDead && !e.isUnconscious)
  if (livingEnemies.length === 0) return null

  // Find affordable abilities, prefer higher cost ones
  const affordable = monster.legendaryAbilities
    .filter(a => a.cost <= monster.currentLegendaryActions)
    .sort((a, b) => b.cost - a.cost)

  if (affordable.length === 0) return null

  // Use area attack if multiple enemies, otherwise single target
  if (livingEnemies.length >= 2) {
    const areaAbility = affordable.find(a => a.type === 'area')
    if (areaAbility) return areaAbility
  }

  return affordable[0]
}

/**
 * Check if monster should use breath weapon
 * Breath weapons are cones - they primarily hit the front line
 * @param {object} monster - The monster
 * @param {object[]} enemies - Enemy combatants
 * @returns {object|null} - The breath weapon ability or null
 */
export function shouldUseBreathWeapon(monster, enemies) {
  if (!monster.rechargeAbilities) return null

  const livingEnemies = enemies.filter(e => !e.isDead && !e.isUnconscious)
  // Count enemies in front position (cone targets)
  const frontEnemies = livingEnemies.filter(e =>
    (e.position || getDefaultPosition(e)) === 'front'
  )

  for (const ability of monster.rechargeAbilities) {
    if (ability.available && ability.type === 'area') {
      // For cone shapes, check front line count
      if (ability.shape === 'cone') {
        // Use if 2+ enemies in front, or 1 enemy in front with decent HP
        if (frontEnemies.length >= 2) {
          return ability
        }
        if (frontEnemies.length === 1 && frontEnemies[0].currentHp >= 30) {
          return ability
        }
        // If no front targets but back targets exist, still use on 1 back target
        if (frontEnemies.length === 0 && livingEnemies.length >= 1) {
          return ability
        }
      } else {
        // Non-cone area abilities use old logic
        if (livingEnemies.length >= 2) {
          return ability
        }
        if (livingEnemies.length === 1 && livingEnemies[0].currentHp >= 30) {
          return ability
        }
      }
    }
  }

  return null
}

/**
 * Process recharge abilities at start of monster's turn
 * @param {object} monster - The monster
 * @param {number} round - Current round
 * @param {number} turn - Current turn
 * @returns {object[]} - Log entries for recharges
 */
export function processRecharges(monster, round, turn) {
  const logs = []

  if (!monster.rechargeAbilities) return logs

  for (const ability of monster.rechargeAbilities) {
    if (!ability.available) {
      const { recharged, roll } = rollRecharge(ability)
      logs.push({
        round,
        turn,
        actorName: monster.name,
        actionType: 'recharge',
        abilityName: ability.name,
        roll,
        recharged
      })

      if (recharged) {
        ability.available = true
      }
    }
  }

  return logs
}
