/**
 * Class Abilities Execution System
 * Execute functions for all D&D 5e class abilities
 */

import { rollD20, rollDice, rollD20WithAdvantage, rollDamage } from './dice.js';
import {
  hasResource,
  consumeResource,
  startRage,
  getSneakAttackDice,
  getMartialArtsDie,
  getRageDamage,
  getBrutalCriticalDice,
  getAuraRadius,
  hasClassFeatureSync
} from './resources.js';

// Use sync version for combat checks
const hasFeature = (className, level, featureName) => {
  return hasClassFeatureSync({ class: className, level }, featureName);
};

// ============================================
// FIGHTER ABILITIES
// ============================================

/**
 * Execute Action Surge - grants an extra action this turn
 */
export function executeActionSurge(fighter, round, turn) {
  const updated = consumeResource(fighter, 'actionSurge', 1);
  if (!updated) return null;

  Object.assign(fighter, updated);
  fighter.hasActionSurgeThisTurn = true;

  return {
    round,
    turn,
    actorName: fighter.name,
    actionType: 'freeAction',
    abilityType: 'actionSurge',
    message: `${fighter.name} uses Action Surge!`
  };
}

/**
 * Execute Indomitable - reroll a failed saving throw
 */
export function executeIndomitable(fighter, originalRoll, saveDC, round, turn) {
  const updated = consumeResource(fighter, 'indomitable', 1);
  if (!updated) return null;

  Object.assign(fighter, updated);
  const reroll = rollD20();
  const newTotal = reroll + (fighter.savingThrowBonus || 0);
  const success = newTotal >= saveDC;

  return {
    round,
    turn,
    actorName: fighter.name,
    actionType: 'reaction',
    abilityType: 'indomitable',
    originalRoll,
    reroll,
    newTotal,
    saveDC,
    success,
    message: `${fighter.name} uses Indomitable! Rerolled ${originalRoll} -> ${reroll}`
  };
}

// ============================================
// ROGUE ABILITIES
// ============================================

/**
 * Calculate Sneak Attack damage
 * Returns damage dice string if conditions are met, null otherwise
 */
export function calculateSneakAttack(rogue, target, allies, hasAdvantage) {
  if (rogue.class !== 'rogue') return null;
  if (rogue.sneakAttackUsedThisTurn) return null;

  const level = rogue.level || 1;

  // Check conditions: advantage OR ally adjacent to target
  const hasAllyAdjacent = allies.some(ally =>
    !ally.isDead &&
    !ally.isUnconscious &&
    ally.id !== rogue.id &&
    ally.position === target.position // Simplified: same position means adjacent
  );

  if (!hasAdvantage && !hasAllyAdjacent) return null;

  const numDice = getSneakAttackDice({ class: 'rogue', level });
  return `${numDice}d6`;
}

/**
 * Apply Sneak Attack damage to an attack
 */
export function applySneakAttack(rogue, baseDamage, target, allies, hasAdvantage) {
  const sneakDice = calculateSneakAttack(rogue, target, allies, hasAdvantage);
  if (!sneakDice) return { damage: baseDamage, sneakAttackDamage: 0 };

  rogue.sneakAttackUsedThisTurn = true;
  const { total: sneakDamage } = rollDice(sneakDice);

  return {
    damage: baseDamage + sneakDamage,
    sneakAttackDamage: sneakDamage,
    sneakAttackDice: sneakDice
  };
}

/**
 * Execute Cunning Action - Dash, Disengage, or Hide as bonus action
 */
export function executeCunningAction(rogue, actionType, round, turn) {
  if (rogue.class !== 'rogue') return null;
  if (!hasFeature('rogue', rogue.level || 1, 'cunningAction')) return null;

  const validActions = ['dash', 'disengage', 'hide'];
  if (!validActions.includes(actionType)) return null;

  const effects = {
    dash: () => { rogue.hasDashed = true; },
    disengage: () => { rogue.hasDisengaged = true; },
    hide: () => {
      // Simplified: automatic success for now
      rogue.isHidden = true;
    }
  };

  effects[actionType]();

  return {
    round,
    turn,
    actorName: rogue.name,
    actionType: 'bonusAction',
    bonusActionType: 'cunningAction',
    cunningActionType: actionType,
    message: `${rogue.name} uses Cunning Action to ${actionType}!`
  };
}

/**
 * Execute Uncanny Dodge - halve damage from an attack
 */
export function executeUncannyDodge(rogue, incomingDamage, attackerName, round, turn) {
  if (rogue.class !== 'rogue') return null;
  if (!hasFeature('rogue', rogue.level || 1, 'uncannyDodge')) return null;
  if (!rogue.hasReaction) return null;
  if (rogue.uncannyDodgeUsedThisRound) return null;

  rogue.hasReaction = false;
  rogue.uncannyDodgeUsedThisRound = true;

  const reducedDamage = Math.floor(incomingDamage / 2);

  return {
    round,
    turn,
    actorName: rogue.name,
    actionType: 'reaction',
    abilityType: 'uncannyDodge',
    originalDamage: incomingDamage,
    reducedDamage,
    attackerName,
    message: `${rogue.name} uses Uncanny Dodge to halve ${incomingDamage} damage to ${reducedDamage}!`
  };
}

/**
 * Apply Evasion - DEX save: 0 damage on success, half on fail
 */
export function applyEvasion(combatant, damage, savedSuccessfully) {
  const hasEvasion =
    (combatant.class === 'rogue' && hasFeature('rogue', combatant.level || 1, 'evasion')) ||
    (combatant.class === 'monk' && hasFeature('monk', combatant.level || 1, 'evasion'));

  if (!hasEvasion) {
    return savedSuccessfully ? Math.floor(damage / 2) : damage;
  }

  // Evasion: success = 0 damage, fail = half damage
  return savedSuccessfully ? 0 : Math.floor(damage / 2);
}

// ============================================
// BARBARIAN ABILITIES
// ============================================

/**
 * Execute Rage - enter rage state
 */
export function executeRage(barbarian, round, turn) {
  if (barbarian.class !== 'barbarian') return null;
  if (barbarian.isRaging) return null;

  const updated = startRage(barbarian);
  if (!updated) return null;

  Object.assign(barbarian, updated);

  return {
    round,
    turn,
    actorName: barbarian.name,
    actionType: 'bonusAction',
    bonusActionType: 'rage',
    rageDamageBonus: getRageDamage(barbarian),
    message: `${barbarian.name} enters a RAGE!`
  };
}

/**
 * Execute Reckless Attack - advantage on attacks, enemies have advantage on you
 */
export function executeRecklessAttack(barbarian, round, turn) {
  if (barbarian.class !== 'barbarian') return null;
  if (!hasFeature('barbarian', barbarian.level || 1, 'recklessAttack')) return null;

  barbarian.isReckless = true;
  barbarian.recklessUntilNextTurn = true;

  return {
    round,
    turn,
    actorName: barbarian.name,
    actionType: 'freeAction',
    abilityType: 'recklessAttack',
    message: `${barbarian.name} attacks recklessly!`
  };
}

/**
 * Get rage damage bonus for attacks
 */
export function getRageBonus(barbarian) {
  if (!barbarian.isRaging) return 0;
  if (barbarian.class !== 'barbarian') return 0;
  return getRageDamage(barbarian);
}

/**
 * Apply rage damage resistance (B/P/S only)
 */
export function applyRageResistance(barbarian, damage, damageType) {
  if (!barbarian.isRaging) return damage;
  if (barbarian.class !== 'barbarian') return damage;

  const resistedTypes = ['bludgeoning', 'piercing', 'slashing'];
  if (resistedTypes.includes(damageType?.toLowerCase())) {
    return Math.floor(damage / 2);
  }
  return damage;
}

/**
 * Calculate Brutal Critical bonus dice
 */
export function getBrutalCriticalBonus(barbarian) {
  if (barbarian.class !== 'barbarian') return 0;
  return getBrutalCriticalDice(barbarian);
}

// ============================================
// PALADIN ABILITIES
// ============================================

/**
 * Execute Lay on Hands healing
 */
export function executeLayOnHands(paladin, target, amount, round, turn) {
  if (paladin.class !== 'paladin') return null;
  if (!hasResource(paladin, 'layOnHands', amount)) return null;

  const updated = consumeResource(paladin, 'layOnHands', amount);
  if (!updated) return null;

  Object.assign(paladin, updated);

  const hpBefore = target.currentHp;
  target.currentHp = Math.min(target.maxHp, target.currentHp + amount);

  // If target was unconscious and healed, they wake up
  if (target.isUnconscious && target.currentHp > 0) {
    target.isUnconscious = false;
    target.deathSaveSuccesses = 0;
    target.deathSaveFailures = 0;
  }

  return {
    round,
    turn,
    actorName: paladin.name,
    targetName: target.name,
    actionType: 'action',
    abilityType: 'layOnHands',
    healAmount: amount,
    targetHpBefore: hpBefore,
    targetHpAfter: target.currentHp,
    message: `${paladin.name} uses Lay on Hands to heal ${target.name} for ${amount} HP!`
  };
}

/**
 * Execute Divine Smite on a hit
 */
export function executeDivineSmite(paladin, slotLevel, isCritical, targetIsUndead, round, turn) {
  if (paladin.class !== 'paladin') return null;
  if (!hasFeature('paladin', paladin.level || 1, 'divineSmite')) return null;

  // Check spell slots
  if (!paladin.currentSlots || paladin.currentSlots[slotLevel] <= 0) return null;

  // Consume the slot
  paladin.currentSlots[slotLevel]--;

  // Calculate damage: 2d8 base + 1d8 per slot level above 1st (max 5d8)
  let numDice = Math.min(1 + slotLevel, 5);
  // +1d8 vs undead/fiend
  if (targetIsUndead) numDice++;

  const diceNotation = `${numDice}d8`;
  let smiteDamage = rollDamage(diceNotation, isCritical);

  return {
    round,
    turn,
    actorName: paladin.name,
    actionType: 'freeAction',
    abilityType: 'divineSmite',
    slotLevel,
    smiteDice: diceNotation,
    smiteDamage,
    isCritical,
    message: `${paladin.name} uses Divine Smite (${slotLevel}st level) for ${smiteDamage} radiant damage!`
  };
}

/**
 * Calculate Improved Divine Smite bonus
 */
export function getImprovedSmiteDamage(paladin, isCritical) {
  if (paladin.class !== 'paladin') return 0;
  if (!hasFeature('paladin', paladin.level || 1, 'improvedDivineSmite')) return 0;

  return rollDamage('1d8', isCritical);
}

/**
 * Apply Aura of Protection bonus to saving throws
 */
export function getAuraOfProtectionBonus(combatant, paladin) {
  if (!paladin || paladin.class !== 'paladin') return 0;
  if (!hasFeature('paladin', paladin.level || 1, 'auraOfProtection')) return 0;
  if (paladin.isDead || paladin.isUnconscious) return 0;

  // Check if combatant is within aura radius
  const radius = getAuraRadius(paladin);
  if (radius === 0) return 0;

  // Simplified: same team = in aura (no actual distance calculation)
  const bonus = paladin.chaMod || 0;
  return Math.max(0, bonus); // Minimum 0
}

// ============================================
// RANGER ABILITIES
// ============================================

/**
 * Apply Foe Slayer bonus (level 20)
 */
export function getFoeSlayerBonus(ranger, isAttack) {
  if (ranger.class !== 'ranger') return 0;
  if (!hasFeature('ranger', ranger.level || 1, 'foeSlayer')) return 0;

  // Can add WIS mod to attack OR damage once per turn
  if (!ranger.foeSlayerUsedThisTurn) {
    ranger.foeSlayerUsedThisTurn = true;
    return ranger.wisMod || 0;
  }
  return 0;
}

// ============================================
// MONK ABILITIES
// ============================================

/**
 * Execute Flurry of Blows - 2 unarmed strikes as bonus action
 */
export function executeFlurryOfBlows(monk, target, round, turn) {
  if (monk.class !== 'monk') return null;
  if (!hasFeature('monk', monk.level || 1, 'flurryOfBlows')) return null;

  const updated = consumeResource(monk, 'ki', 1);
  if (!updated) return null;

  Object.assign(monk, updated);

  const martialArtsDie = getMartialArtsDie(monk);
  const results = [];

  // Two unarmed strikes
  for (let i = 0; i < 2; i++) {
    const attackRoll = rollD20();
    const totalAttack = attackRoll + monk.attackBonus;

    const strike = {
      attackRoll,
      totalAttack,
      hit: false
    };

    if (attackRoll === 1) {
      results.push(strike);
      continue;
    }

    const isCritical = attackRoll === 20;
    const hit = isCritical || totalAttack >= target.armorClass;

    if (hit) {
      strike.hit = true;
      strike.isCritical = isCritical;

      const damage = rollDamage(martialArtsDie, isCritical) + (monk.dexMod || monk.strMod || 0);
      strike.damage = damage;

      target.currentHp = Math.max(0, target.currentHp - damage);

      if (target.currentHp <= 0) {
        if (target.isPlayer) {
          target.isUnconscious = true;
          strike.targetDowned = true;
        } else {
          target.isDead = true;
          strike.targetDied = true;
        }
      }
    }
    results.push(strike);
  }

  return {
    round,
    turn,
    actorName: monk.name,
    targetName: target.name,
    actionType: 'bonusAction',
    bonusActionType: 'flurryOfBlows',
    strikes: results,
    targetHpAfter: target.currentHp,
    message: `${monk.name} uses Flurry of Blows!`
  };
}

/**
 * Execute Patient Defense - Dodge as bonus action
 */
export function executePatientDefense(monk, round, turn) {
  if (monk.class !== 'monk') return null;
  if (!hasFeature('monk', monk.level || 1, 'patientDefense')) return null;

  const updated = consumeResource(monk, 'ki', 1);
  if (!updated) return null;

  Object.assign(monk, updated);
  monk.isDodging = true;

  return {
    round,
    turn,
    actorName: monk.name,
    actionType: 'bonusAction',
    bonusActionType: 'patientDefense',
    message: `${monk.name} uses Patient Defense and takes the Dodge action!`
  };
}

/**
 * Execute Step of the Wind - Dash or Disengage as bonus action
 */
export function executeStepOfTheWind(monk, actionType, round, turn) {
  if (monk.class !== 'monk') return null;
  if (!hasFeature('monk', monk.level || 1, 'stepOfTheWind')) return null;

  const updated = consumeResource(monk, 'ki', 1);
  if (!updated) return null;

  Object.assign(monk, updated);

  if (actionType === 'dash') {
    monk.hasDashed = true;
  } else {
    monk.hasDisengaged = true;
  }

  return {
    round,
    turn,
    actorName: monk.name,
    actionType: 'bonusAction',
    bonusActionType: 'stepOfTheWind',
    stepType: actionType,
    message: `${monk.name} uses Step of the Wind to ${actionType}!`
  };
}

/**
 * Execute Stunning Strike attempt
 */
export function executeStunningStrike(monk, target, round, turn) {
  if (monk.class !== 'monk') return null;
  if (!hasFeature('monk', monk.level || 1, 'stunningStrike')) return null;

  const updated = consumeResource(monk, 'ki', 1);
  if (!updated) return null;

  Object.assign(monk, updated);

  // Target makes CON save
  const saveDC = 8 + (monk.proficiencyBonus || 2) + (monk.wisMod || 0);
  const saveRoll = rollD20();
  const saveTotal = saveRoll + (target.conMod || 0);
  const saved = saveTotal >= saveDC;

  const result = {
    round,
    turn,
    actorName: monk.name,
    targetName: target.name,
    actionType: 'freeAction',
    abilityType: 'stunningStrike',
    saveDC,
    saveRoll,
    saveTotal,
    saved
  };

  if (!saved) {
    // Apply stunned condition
    target.conditions = target.conditions || [];
    target.conditions.push({
      type: 'stunned',
      duration: 1, // Until end of monk's next turn
      source: monk.name
    });
    result.message = `${target.name} is STUNNED!`;
  } else {
    result.message = `${target.name} resists Stunning Strike!`;
  }

  return result;
}

/**
 * Get Martial Arts die for a monk
 */
export function getMonkMartialArtsDie(monk) {
  return getMartialArtsDie(monk);
}

// ============================================
// SORCERER ABILITIES
// ============================================

/**
 * Execute Quickened Spell metamagic
 */
export function executeQuickenedSpell(sorcerer, round, turn) {
  if (sorcerer.class !== 'sorcerer') return null;

  const updated = consumeResource(sorcerer, 'sorceryPoints', 2);
  if (!updated) return null;

  Object.assign(sorcerer, updated);
  sorcerer.hasQuickenedSpell = true;

  return {
    round,
    turn,
    actorName: sorcerer.name,
    actionType: 'freeAction',
    abilityType: 'quickenedSpell',
    message: `${sorcerer.name} uses Quickened Spell!`
  };
}

/**
 * Execute Twinned Spell metamagic
 */
export function executeTwinnedSpell(sorcerer, spellLevel, round, turn) {
  if (sorcerer.class !== 'sorcerer') return null;

  const cost = Math.max(1, spellLevel); // Cantrips cost 1
  const updated = consumeResource(sorcerer, 'sorceryPoints', cost);
  if (!updated) return null;

  Object.assign(sorcerer, updated);
  sorcerer.hasTwinnedSpell = true;

  return {
    round,
    turn,
    actorName: sorcerer.name,
    actionType: 'freeAction',
    abilityType: 'twinnedSpell',
    spellLevel,
    cost,
    message: `${sorcerer.name} uses Twinned Spell!`
  };
}

/**
 * Execute Heightened Spell metamagic
 */
export function executeHeightenedSpell(sorcerer, round, turn) {
  if (sorcerer.class !== 'sorcerer') return null;

  const updated = consumeResource(sorcerer, 'sorceryPoints', 3);
  if (!updated) return null;

  Object.assign(sorcerer, updated);
  sorcerer.hasHeightenedSpell = true;

  return {
    round,
    turn,
    actorName: sorcerer.name,
    actionType: 'freeAction',
    abilityType: 'heightenedSpell',
    message: `${sorcerer.name} uses Heightened Spell! Target has disadvantage on save.`
  };
}

// ============================================
// BARD ABILITIES
// ============================================

/**
 * Execute Bardic Inspiration - give inspiration die to ally
 */
export function executeBardicInspiration(bard, target, round, turn) {
  if (bard.class !== 'bard') return null;

  const updated = consumeResource(bard, 'bardicInspiration', 1);
  if (!updated) return null;

  Object.assign(bard, updated);

  // Determine die size based on level
  const level = bard.level || 1;
  let die = '1d6';
  if (level >= 15) die = '1d12';
  else if (level >= 10) die = '1d10';
  else if (level >= 5) die = '1d8';

  target.bardicInspirationDie = die;

  return {
    round,
    turn,
    actorName: bard.name,
    targetName: target.name,
    actionType: 'bonusAction',
    bonusActionType: 'bardicInspiration',
    inspirationDie: die,
    message: `${bard.name} inspires ${target.name} with a ${die}!`
  };
}

/**
 * Use Bardic Inspiration die
 */
export function useBardicInspiration(combatant) {
  if (!combatant.bardicInspirationDie) return 0;

  const { total } = rollDice(combatant.bardicInspirationDie);
  combatant.bardicInspirationDie = null; // Consumed

  return total;
}

// ============================================
// CLERIC ABILITIES
// ============================================

/**
 * Execute Turn Undead
 */
export function executeTurnUndead(cleric, enemies, round, turn) {
  if (cleric.class !== 'cleric') return null;
  if (!hasFeature('cleric', cleric.level || 1, 'turnUndead')) return null;

  const updated = consumeResource(cleric, 'channelDivinity', 1);
  if (!updated) return null;

  Object.assign(cleric, updated);

  const saveDC = 8 + (cleric.proficiencyBonus || 2) + (cleric.wisMod || 0);
  const results = [];

  // Affect all undead within 30 feet
  const undead = enemies.filter(e =>
    !e.isDead &&
    !e.isUnconscious &&
    e.creatureType === 'undead'
  );

  for (const target of undead) {
    const saveRoll = rollD20();
    const saveTotal = saveRoll + (target.wisMod || 0);
    const saved = saveTotal >= saveDC;

    const result = {
      targetName: target.name,
      saveRoll,
      saveTotal,
      saved
    };

    if (!saved) {
      // Check if destroyed instead of turned
      const clericLevel = cleric.level || 1;
      let destroyCR = 0;
      if (clericLevel >= 17) destroyCR = 4;
      else if (clericLevel >= 14) destroyCR = 3;
      else if (clericLevel >= 11) destroyCR = 2;
      else if (clericLevel >= 8) destroyCR = 1;
      else if (clericLevel >= 5) destroyCR = 0.5;

      if ((target.cr || 0) <= destroyCR) {
        target.isDead = true;
        result.destroyed = true;
      } else {
        target.conditions = target.conditions || [];
        target.conditions.push({
          type: 'turned',
          duration: 10, // 1 minute
          source: cleric.name
        });
        result.turned = true;
      }
    }
    results.push(result);
  }

  return {
    round,
    turn,
    actorName: cleric.name,
    actionType: 'action',
    abilityType: 'turnUndead',
    saveDC,
    results,
    message: `${cleric.name} presents their holy symbol and turns undead!`
  };
}

// ============================================
// WARLOCK ABILITIES
// ============================================

/**
 * Apply Agonizing Blast damage bonus
 */
export function getAgonizingBlastBonus(warlock) {
  if (warlock.class !== 'warlock') return 0;
  if (!warlock.invocations?.includes('agonizingBlast')) return 0;
  return warlock.chaMod || 0;
}

// ============================================
// FIGHTING STYLE HELPERS
// ============================================

/**
 * Get fighting style attack bonus
 */
export function getFightingStyleAttackBonus(combatant, isRanged) {
  if (!combatant.fightingStyle) return 0;

  if (combatant.fightingStyle === 'archery' && isRanged) {
    return 2;
  }
  return 0;
}

/**
 * Get fighting style damage bonus
 */
export function getFightingStyleDamageBonus(combatant, isOneHanded) {
  if (!combatant.fightingStyle) return 0;

  if (combatant.fightingStyle === 'dueling' && isOneHanded) {
    return 2;
  }
  return 0;
}

/**
 * Get fighting style AC bonus
 */
export function getFightingStyleACBonus(combatant) {
  if (!combatant.fightingStyle) return 0;

  if (combatant.fightingStyle === 'defense') {
    return 1;
  }
  return 0;
}

/**
 * Check if should reroll damage dice (Great Weapon Fighting)
 */
export function shouldRerollDamage(combatant, roll) {
  if (combatant.fightingStyle !== 'greatWeaponFighting') return false;
  return roll === 1 || roll === 2;
}

export default {
  // Fighter
  executeActionSurge,
  executeIndomitable,
  // Rogue
  calculateSneakAttack,
  applySneakAttack,
  executeCunningAction,
  executeUncannyDodge,
  applyEvasion,
  // Barbarian
  executeRage,
  executeRecklessAttack,
  getRageBonus,
  applyRageResistance,
  getBrutalCriticalBonus,
  // Paladin
  executeLayOnHands,
  executeDivineSmite,
  getImprovedSmiteDamage,
  getAuraOfProtectionBonus,
  // Ranger
  getFoeSlayerBonus,
  // Monk
  executeFlurryOfBlows,
  executePatientDefense,
  executeStepOfTheWind,
  executeStunningStrike,
  getMonkMartialArtsDie,
  // Sorcerer
  executeQuickenedSpell,
  executeTwinnedSpell,
  executeHeightenedSpell,
  // Bard
  executeBardicInspiration,
  useBardicInspiration,
  // Cleric
  executeTurnUndead,
  // Warlock
  getAgonizingBlastBonus,
  // Fighting Styles
  getFightingStyleAttackBonus,
  getFightingStyleDamageBonus,
  getFightingStyleACBonus,
  shouldRerollDamage
};
