import { useState } from 'react'
import CombatantForm from './CombatantForm'
import { exampleParty } from '../data/examples'
import { generateId } from '../utils/ids'

function PartySetup({ party, setParty }) {
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
    setParty(party.filter(c => c.id !== id))
  }

  const handleSave = (formData) => {
    if (editingCombatant) {
      setParty(party.map(c =>
        c.id === editingCombatant.id ? { ...formData, id: c.id, isPlayer: true } : c
      ))
    } else {
      setParty([...party, { ...formData, id: generateId('player'), isPlayer: true }])
    }
    setShowForm(false)
    setEditingCombatant(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCombatant(null)
  }

  const loadExample = () => {
    setParty(exampleParty.map(c => ({ ...c, id: generateId('player') })))
  }

  return (
    <div className="setup-section">
      <div className="section-header">
        <h2>Party</h2>
        <div className="section-actions">
          <button className="btn btn-secondary btn-sm" onClick={loadExample}>
            Load Example
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            + Add
          </button>
        </div>
      </div>

      {party.length === 0 ? (
        <p className="empty-state">No party members. Add some or load an example.</p>
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
            {party.map(c => (
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
          <h3>{editingCombatant ? 'Edit' : 'Add'} Party Member</h3>
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

export default PartySetup
