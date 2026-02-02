# State Management

This document describes how application state is managed.

## Current Implementation `[IMPLEMENTED]`

### Technology
- React useState hooks
- Props drilling for child components
- No global state library

### State Location

```
App.jsx
├── party: Combatant[]           # Party members
├── monsters: Combatant[]        # Encounter monsters
├── isRunning: boolean           # Simulation in progress
├── results: SimulationResult[]  # Simulation results
└── summary: SimulationSummary   # Aggregated statistics

PartySetup
└── Local form state for add/edit

MonsterSetup
└── Local form state for add/edit

FightLog
└── expandedId: number           # Which fight is expanded
```

### Data Flow

```
User Action → setState → Re-render → UI Update
                ↓
           localStorage (persist)
```

---

## State Categories

### Persisted State
Saved to localStorage, survives page refresh:
- Party composition
- Monster composition

### Session State
Lives in memory, lost on refresh:
- Simulation results
- UI state (expanded panels, etc.)

### Derived State
Calculated from other state:
- Win percentage (from results)
- Survival rates (from results)
- Validation errors (from form values)

---

## Planned Improvements `[PLANNED]`

### Context API
Use React Context for:
- Party state (avoid prop drilling)
- Monster state
- Simulation settings

```typescript
const EncounterContext = createContext<{
  party: Combatant[]
  setParty: (party: Combatant[]) => void
  monsters: Combatant[]
  setMonsters: (monsters: Combatant[]) => void
}>()
```

### Reducer Pattern
For complex state updates:

```typescript
type EncounterAction =
  | { type: 'ADD_PARTY_MEMBER', combatant: Combatant }
  | { type: 'REMOVE_PARTY_MEMBER', id: string }
  | { type: 'UPDATE_PARTY_MEMBER', id: string, updates: Partial<Combatant> }
  | { type: 'ADD_MONSTER', combatant: Combatant }
  | { type: 'REMOVE_MONSTER', id: string }
  | { type: 'CLEAR_ALL' }

function encounterReducer(state, action) {
  switch (action.type) {
    case 'ADD_PARTY_MEMBER':
      return { ...state, party: [...state.party, action.combatant] }
    // ...
  }
}
```

### Undo/Redo
Track state history for undo functionality:

```typescript
interface StateHistory {
  past: EncounterState[]
  present: EncounterState
  future: EncounterState[]
}

function undo() {
  if (history.past.length === 0) return
  const previous = history.past[history.past.length - 1]
  history.future.unshift(history.present)
  history.present = previous
  history.past.pop()
}
```

---

## State Validation

### On Change
Validate as user types:
- Show inline errors
- Disable save if invalid

### On Save
Final validation before committing:
- All required fields present
- Values in valid ranges
- Dice notation parseable

### On Simulation Start
Validate encounter is runnable:
- At least 1 party member
- At least 1 monster
- All combatants valid

---

## Related Specs
- [Persistence](persistence.md)
- [Party Builder UI](../ui/party-builder.md)
- [Combatant Data](../data/combatant.md)
