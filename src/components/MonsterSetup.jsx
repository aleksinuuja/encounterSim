import { useState, useRef, useEffect } from 'react'
import CombatantForm from './CombatantForm'
import { exampleMonsters } from '../data/examples'
import { monsterPresets } from '../data/monsterPresets'
import { generateId } from '../utils/ids'
import { parseStatblock } from '../utils/statblockParser'

function MonsterSetup({ monsters, setMonsters }) {
  const [showForm, setShowForm] = useState(false)
  const [editingCombatant, setEditingCombatant] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showStatblock, setShowStatblock] = useState(false)
  const [statblockText, setStatblockText] = useState('')
  const [statblockError, setStatblockError] = useState(null)
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
    const { key: _key, description: _desc, ...monsterData } = preset
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

  const handleParseStatblock = () => {
    if (!statblockText.trim()) return
    setStatblockError(null)

    try {
      const combatant = parseStatblock(statblockText.trim())
      setMonsters([...monsters, { ...combatant, id: generateId('monster'), isPlayer: false }])
      setStatblockText('')
      setShowStatblock(false)
    } catch (err) {
      setStatblockError('Failed to parse statblock: ' + err.message)
    }
  }

  return (
    <div className="setup-section">
      <div className="section-header">
        <h2>Monsters</h2>
        <div className="section-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => { setShowStatblock(!showStatblock); setShowForm(false) }}>
            Paste Statblock
          </button>
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

      {showStatblock && (
        <div className="import-section">
          <textarea
            className="statblock-input"
            value={statblockText}
            onChange={e => setStatblockText(e.target.value)}
            placeholder={"Paste a monster statblock here...\n\nExample:\nOrc\nMedium humanoid, chaotic evil\n\nArmor Class 13\nHit Points 15 (2d8 + 6)\n..."}
            rows={8}
          />
          <div className="import-row">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleParseStatblock}
              disabled={!statblockText.trim()}
            >
              Parse & Add
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setShowStatblock(false); setStatblockText(''); setStatblockError(null) }}
            >
              Cancel
            </button>
          </div>
          {statblockError && (
            <p className="import-error">{statblockError}</p>
          )}
        </div>
      )}

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
              <th>Pos</th>
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
                </td>
                <td>{c.maxHp}</td>
                <td>{c.armorClass}</td>
                <td>+{c.attackBonus}</td>
                <td>{c.damage}</td>
                <td>{c.initiativeBonus >= 0 ? '+' : ''}{c.initiativeBonus}</td>
                <td>
                  <span className={`position-badge position-${c.position || 'front'}`}>
                    {c.position === 'back' ? 'B' : 'F'}
                  </span>
                </td>
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
