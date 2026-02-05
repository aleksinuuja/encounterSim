import { useState } from 'react'
import CombatantForm from './CombatantForm'
import { exampleParty } from '../data/examples'
import { generateId } from '../utils/ids'
import { importFromDndBeyond } from '../utils/dndbeyondImport'
import { initializeClassResources } from '../data/classTemplates'

function PartySetup({ party, setParty }) {
  const [showForm, setShowForm] = useState(false)
  const [editingCombatant, setEditingCombatant] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importError, setImportError] = useState(null)
  const [importing, setImporting] = useState(false)

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

  const handleImport = async () => {
    if (!importUrl.trim()) return

    setImporting(true)
    setImportError(null)

    try {
      const combatant = await importFromDndBeyond(importUrl.trim())

      // Add class resources
      if (combatant.class) {
        combatant.classResources = initializeClassResources(combatant.class, combatant.level)
      }

      setParty([...party, { ...combatant, id: generateId('player'), isPlayer: true }])
      setImportUrl('')
      setShowImport(false)
    } catch (err) {
      setImportError(err.message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="setup-section">
      <div className="section-header">
        <h2>Party</h2>
        <div className="section-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowImport(!showImport)}>
            Import D&DB
          </button>
          <button className="btn btn-secondary btn-sm" onClick={loadExample}>
            Load Example
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            + Add
          </button>
        </div>
      </div>

      {showImport && (
        <div className="import-section">
          <div className="import-row">
            <input
              type="text"
              className="import-input"
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              placeholder="https://www.dndbeyond.com/characters/12345678"
              onKeyDown={e => e.key === 'Enter' && handleImport()}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handleImport}
              disabled={importing || !importUrl.trim()}
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
          {importError && (
            <p className="import-error">{importError}</p>
          )}
        </div>
      )}

      {party.length === 0 ? (
        <p className="empty-state">No party members. Add some or load an example.</p>
      ) : (
        <table className="combatant-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Class/Lvl</th>
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
            {party.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.class ? `${c.class.charAt(0).toUpperCase() + c.class.slice(1)} ${c.level || 1}` : '—'}</td>
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
