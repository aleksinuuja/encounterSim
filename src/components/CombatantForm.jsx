import { useState, useEffect } from 'react'
import { CLASS_TEMPLATES, FIGHTING_STYLES } from '../data/classTemplates.js'
import { getPreset, getAvailableLevels } from '../data/classPresets.js'

const defaultCombatant = {
  name: '',
  maxHp: 10,
  armorClass: 10,
  attackBonus: 0,
  damage: '1d6',
  initiativeBonus: 0,
  numAttacks: 1,
  healingDice: '',
  position: 'front',
  class: '',
  level: 1,
  fightingStyle: ''
}

const CLASS_OPTIONS = [
  { value: '', label: 'Custom / None' },
  { value: 'fighter', label: 'Fighter' },
  { value: 'rogue', label: 'Rogue' },
  { value: 'barbarian', label: 'Barbarian' },
  { value: 'paladin', label: 'Paladin' },
  { value: 'ranger', label: 'Ranger' },
  { value: 'monk', label: 'Monk' },
  { value: 'wizard', label: 'Wizard' },
  { value: 'sorcerer', label: 'Sorcerer' },
  { value: 'warlock', label: 'Warlock' },
  { value: 'cleric', label: 'Cleric' },
  { value: 'bard', label: 'Bard' },
  { value: 'druid', label: 'Druid' }
]

const FIGHTING_STYLE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'archery', label: 'Archery (+2 ranged attack)' },
  { value: 'defense', label: 'Defense (+1 AC)' },
  { value: 'dueling', label: 'Dueling (+2 one-handed damage)' },
  { value: 'greatWeaponFighting', label: 'Great Weapon Fighting' },
  { value: 'twoWeaponFighting', label: 'Two-Weapon Fighting' }
]

function getInitialForm(combatant) {
  if (combatant) {
    return {
      ...defaultCombatant,
      ...combatant,
      numAttacks: combatant.numAttacks || 1,
      healingDice: combatant.healingDice || '',
      position: combatant.position || 'front',
      class: combatant.class || '',
      level: combatant.level || 1,
      fightingStyle: combatant.fightingStyle || ''
    }
  }
  return defaultCombatant
}

function CombatantForm({ combatant, onSave, onCancel }) {
  const [form, setForm] = useState(() => getInitialForm(combatant))
  const [errors, setErrors] = useState({})
  const [usePreset, setUsePreset] = useState(false)

  // When class or level changes, optionally load preset values
  useEffect(() => {
    if (usePreset && form.class && form.level) {
      const preset = getPreset(form.class, form.level)
      if (preset) {
        setForm(prev => ({
          ...prev,
          name: prev.name || preset.name,
          maxHp: preset.maxHp,
          armorClass: preset.armorClass,
          attackBonus: preset.attackBonus,
          damage: preset.damage,
          initiativeBonus: preset.initiativeBonus,
          numAttacks: preset.numAttacks,
          healingDice: preset.healingDice || '',
          position: preset.position,
          fightingStyle: preset.fightingStyle || '',
          hasSecondWind: preset.hasSecondWind,
          hasActionSurge: preset.hasActionSurge,
          spells: preset.spells,
          cantrips: preset.cantrips,
          spellSlots: preset.spellSlots,
          spellcastingMod: preset.spellcastingMod,
          // Copy ability modifiers
          strMod: preset.strMod,
          dexMod: preset.dexMod,
          conMod: preset.conMod,
          intMod: preset.intMod,
          wisMod: preset.wisMod,
          chaMod: preset.chaMod,
          proficiencyBonus: preset.proficiencyBonus,
          classResources: preset.classResources
        }))
      }
    }
  }, [form.class, form.level, usePreset])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value
    }))
    setErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleClassChange = (e) => {
    const newClass = e.target.value
    setForm(prev => ({
      ...prev,
      class: newClass,
      // Reset fighting style if class doesn't support it
      fightingStyle: ['fighter', 'paladin', 'ranger'].includes(newClass) ? prev.fightingStyle : ''
    }))
    setErrors(prev => ({ ...prev, class: null }))
  }

  const handleLevelChange = (e) => {
    const level = parseInt(e.target.value, 10) || 1
    setForm(prev => ({
      ...prev,
      level: Math.max(1, Math.min(20, level))
    }))
  }

  const handlePresetToggle = () => {
    setUsePreset(prev => !prev)
  }

  const validate = () => {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (form.maxHp < 1) {
      newErrors.maxHp = 'HP must be at least 1'
    }
    if (form.armorClass < 1) {
      newErrors.armorClass = 'AC must be at least 1'
    }
    if (!form.damage.match(/^\d+d\d+([+-]\d+)?$/i)) {
      newErrors.damage = 'Invalid dice notation (e.g., 1d8+4)'
    }
    if (form.numAttacks < 1) {
      newErrors.numAttacks = 'Must be at least 1'
    }
    if (form.healingDice && !form.healingDice.match(/^\d+d\d+([+-]\d+)?$/i)) {
      newErrors.healingDice = 'Invalid dice notation (e.g., 1d8+3)'
    }
    if (form.level < 1 || form.level > 20) {
      newErrors.level = 'Level must be 1-20'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave(form)
    }
  }

  // Determine if fighting style is available for this class
  const hasFightingStyle = ['fighter', 'paladin', 'ranger'].includes(form.class)

  // Get class features to display
  const classTemplate = form.class ? CLASS_TEMPLATES[form.class] : null
  const classFeatures = classTemplate ? Object.entries(classTemplate.features)
    .filter(([lvl]) => parseInt(lvl) <= form.level)
    .flatMap(([, features]) => features)
    .slice(0, 5) : []

  return (
    <form className="combatant-form" onSubmit={handleSubmit}>
      {/* Class and Level Selection */}
      <div className="form-row form-row-grid">
        <label>
          Class
          <select
            name="class"
            value={form.class}
            onChange={handleClassChange}
          >
            {CLASS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label>
          Level
          <input
            type="number"
            name="level"
            value={form.level}
            onChange={handleLevelChange}
            min="1"
            max="20"
            disabled={!form.class}
          />
          {errors.level && <span className="error">{errors.level}</span>}
        </label>
      </div>

      {/* Load Preset Toggle */}
      {form.class && (
        <div className="form-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={usePreset}
              onChange={handlePresetToggle}
            />
            Load preset stats for {CLASS_TEMPLATES[form.class]?.name} level {form.level}
          </label>
        </div>
      )}

      {/* Class Features Preview */}
      {classFeatures.length > 0 && (
        <div className="form-row class-features-preview">
          <small>
            <strong>Class Features:</strong> {classFeatures.join(', ')}
          </small>
        </div>
      )}

      <div className="form-row">
        <label>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., Fighter"
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </label>
      </div>

      <div className="form-row form-row-grid">
        <label>
          HP
          <input
            type="number"
            name="maxHp"
            value={form.maxHp}
            onChange={handleChange}
            min="1"
          />
          {errors.maxHp && <span className="error">{errors.maxHp}</span>}
        </label>

        <label>
          AC
          <input
            type="number"
            name="armorClass"
            value={form.armorClass}
            onChange={handleChange}
            min="1"
          />
          {errors.armorClass && <span className="error">{errors.armorClass}</span>}
        </label>
      </div>

      <div className="form-row form-row-grid">
        <label>
          Attack Bonus
          <input
            type="number"
            name="attackBonus"
            value={form.attackBonus}
            onChange={handleChange}
          />
        </label>

        <label>
          Initiative Bonus
          <input
            type="number"
            name="initiativeBonus"
            value={form.initiativeBonus}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="form-row form-row-grid">
        <label>
          Damage
          <input
            type="text"
            name="damage"
            value={form.damage}
            onChange={handleChange}
            placeholder="e.g., 1d8+4"
          />
          {errors.damage && <span className="error">{errors.damage}</span>}
        </label>

        <label>
          # of Attacks
          <input
            type="number"
            name="numAttacks"
            value={form.numAttacks}
            onChange={handleChange}
            min="1"
          />
          {errors.numAttacks && <span className="error">{errors.numAttacks}</span>}
        </label>
      </div>

      <div className="form-row form-row-grid">
        <label>
          Healing (optional)
          <input
            type="text"
            name="healingDice"
            value={form.healingDice}
            onChange={handleChange}
            placeholder="e.g., 1d8+3 (leave empty if none)"
          />
          {errors.healingDice && <span className="error">{errors.healingDice}</span>}
        </label>

        <label>
          Position
          <select
            name="position"
            value={form.position}
            onChange={handleChange}
          >
            <option value="front">Front (melee)</option>
            <option value="back">Back (ranged)</option>
          </select>
        </label>
      </div>

      {/* Fighting Style (only for Fighter, Paladin, Ranger) */}
      {hasFightingStyle && (
        <div className="form-row">
          <label>
            Fighting Style
            <select
              name="fightingStyle"
              value={form.fightingStyle}
              onChange={handleChange}
            >
              {FIGHTING_STYLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {combatant ? 'Update' : 'Add'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default CombatantForm
