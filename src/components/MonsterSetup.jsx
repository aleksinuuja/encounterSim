import { useState } from 'react'
import CombatantForm from './CombatantForm'
import { exampleMonsters } from '../data/examples'
import { generateId } from '../utils/ids'

function MonsterSetup({ monsters, setMonsters }) {
  const [showForm, setShowForm] = useState(false)
  const [editingCombatant, setEditingCombatant] = useState(null)

  const handleAdd = () => {
    setEditingCombatant(null)
    setShowForm(true)
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
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            + Add
          </button>
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
                <td>{c.name}</td>
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
