import { useState, useRef, useEffect } from 'react'
import CombatantForm from './CombatantForm'
import { exampleMonsters } from '../data/examples'
import { monsterPresets } from '../data/monsterPresets'
import { generateId } from '../utils/ids'

function MonsterSetup({ monsters, setMonsters }) {
  const [showForm, setShowForm] = useState(false)
  const [editingCombatant, setEditingCombatant] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddCustom = () => {
    setEditingCombatant(null)
    setShowForm(true)
    setShowDropdown(false)
  }

  const handleAddPreset = (preset) => {
    const { key, description, ...monsterData } = preset
    setMonsters([...monsters, { ...monsterData, id: generateId('monster'), isPlayer: false }])
    setShowDropdown(false)
  }

  const handleEdit = (combatant) => {
    setEditingCombatant(combatant)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setMonsters(monsters.filter(c => c.id !== id))
  }

  const handleSave = (formData) => {
    if (editingCombatant) {
      setMonsters(monsters.map(c =>
        c.id === editingCombatant.id ? { ...formData, id: c.id, isPlayer: false } : c
      ))
    } else {
      setMonsters([...monsters, { ...formData, id: generateId('monster'), isPlayer: false }])
    }
    setShowForm(false)
    setEditingCombatant(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCombatant(null)
  }

  const loadExample = () => {
    setMonsters(exampleMonsters.map(c => ({ ...c, id: generateId('monster') })))
  }

  return (
    <div className="setup-section">
      <div className="section-header">
        <h2>Monsters</h2>
        <div className="section-actions">
          <button className="btn btn-secondary btn-sm" onClick={loadExample}>
            Load Example
          </button>
          <div className="dropdown" ref={dropdownRef}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              + Add ▾
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item dropdown-item-custom"
                  onClick={handleAddCustom}
                >
                  Custom...
                </button>
                <div className="dropdown-divider" />
                {monsterPresets.map(preset => (
                  <button
                    key={preset.key}
                    className="dropdown-item"
                    onClick={() => handleAddPreset(preset)}
                    title={preset.description}
                  >
                    <span className="preset-name">{preset.name}</span>
                    <span className="preset-stats">
                      HP {preset.maxHp} / AC {preset.armorClass}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {monsters.length === 0 ? (
        <p className="empty-state">No monsters. Add some or load an example.</p>
      ) : (
        <table className="combatant-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>HP</th>
              <th>AC</th>
              <th>Attack</th>
              <th>Damage</th>
              <th>Init</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {monsters.map(c => (
              <tr key={c.id}>
                <td>
                  {c.name}
                  {c.attackType === 'ranged' && (
                    <span className="attack-type-badge" title="Ranged attack">R</span>
                  )}
                  {c.onHitEffect && (
                    <span
                      className="effect-badge"
                      title={`On hit: ${c.onHitEffect.condition} (DC ${c.onHitEffect.saveDC} ${c.onHitEffect.saveAbility?.toUpperCase()}, ${c.onHitEffect.duration} rounds)`}
                    >
                      {c.onHitEffect.condition}
                    </span>
                  )}
                  {c.conditionImmunities?.length > 0 && (
                    <span
                      className="immunity-badge"
                      title={`Immune: ${c.conditionImmunities.join(', ')}`}
                    >
                      IMM
                    </span>
                  )}
                </td>
                <td>{c.maxHp}</td>
                <td>{c.armorClass}</td>
                <td>+{c.attackBonus}</td>
                <td>{c.damage}</td>
                <td>{c.initiativeBonus >= 0 ? '+' : ''}{c.initiativeBonus}</td>
                <td className="actions">
                  <button className="btn-icon" onClick={() => handleEdit(c)} title="Edit">
                    ✏️
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(c.id)} title="Delete">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="form-container">
          <h3>{editingCombatant ? 'Edit' : 'Add'} Monster</h3>
          <CombatantForm
            combatant={editingCombatant}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  )
}

export default MonsterSetup
