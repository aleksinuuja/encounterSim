import { useState } from 'react'

const defaultCombatant = {
  name: '',
  maxHp: 10,
  armorClass: 10,
  attackBonus: 0,
  damage: '1d6',
  initiativeBonus: 0,
  numAttacks: 1,
  healingDice: ''
}

function getInitialForm(combatant) {
  if (combatant) {
    return {
      ...defaultCombatant,
      ...combatant,
      numAttacks: combatant.numAttacks || 1,
      healingDice: combatant.healingDice || ''
    }
  }
  return defaultCombatant
}

function CombatantForm({ combatant, onSave, onCancel }) {
  const [form, setForm] = useState(() => getInitialForm(combatant))
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value
    }))
    setErrors(prev => ({ ...prev, [name]: null }))
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave(form)
    }
  }

  return (
    <form className="combatant-form" onSubmit={handleSubmit}>
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

      <div className="form-row">
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
      </div>

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
