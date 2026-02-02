# Persistence

This document describes how data is saved and loaded.

## Current Implementation `[IMPLEMENTED]`

### localStorage

Party and monsters are persisted to browser localStorage.

```typescript
const STORAGE_KEYS = {
  party: 'dnd-sim-party',
  monsters: 'dnd-sim-monsters'
}

// Save
function saveToStorage(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or disabled
  }
}

// Load
function loadFromStorage(key: string, defaultValue: any) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}
```

### Auto-save
State is saved automatically when it changes:

```typescript
useEffect(() => {
  saveToStorage(STORAGE_KEYS.party, party)
}, [party])

useEffect(() => {
  saveToStorage(STORAGE_KEYS.monsters, monsters)
}, [monsters])
```

### Limitations
- ~5MB storage limit
- Per-origin (same domain only)
- Can be cleared by user
- Not synced across devices

---

## Planned Persistence Options `[PLANNED]`

### IndexedDB
For larger data (full combat logs):

```typescript
const db = await openDB('encounter-sim', 1, {
  upgrade(db) {
    db.createObjectStore('encounters', { keyPath: 'id' })
    db.createObjectStore('results', { keyPath: 'id' })
  }
})

await db.put('encounters', encounter)
const saved = await db.get('encounters', encounterId)
```

### File Export/Import
Allow users to save to files:

```typescript
// Export
function exportToFile(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

// Import
function importFromFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(JSON.parse(reader.result as string))
    reader.onerror = reject
    reader.readAsText(file)
  })
}
```

### URL State
Encode small encounters in URL:

```typescript
// Encode
const encoded = btoa(JSON.stringify(encounter))
const url = `${location.origin}?e=${encoded}`

// Decode
const params = new URLSearchParams(location.search)
const encoded = params.get('e')
if (encoded) {
  const encounter = JSON.parse(atob(encoded))
}
```

### Cloud Sync `[FUTURE]`
Sync across devices:
- User accounts
- Cloud storage (Firebase, Supabase, etc.)
- Real-time sync
- Conflict resolution

---

## Data Migration

When schema changes, migrate old data:

```typescript
function migrateData(data: any, fromVersion: number): any {
  let migrated = data

  if (fromVersion < 2) {
    // v1 → v2: Add numAttacks field
    migrated = {
      ...migrated,
      numAttacks: migrated.numAttacks || 1
    }
  }

  if (fromVersion < 3) {
    // v2 → v3: Add death save fields
    migrated = {
      ...migrated,
      // These are runtime-only, no migration needed
    }
  }

  return migrated
}
```

### Version Tracking
Store version with data:

```json
{
  "version": 3,
  "party": [ ... ],
  "monsters": [ ... ]
}
```

---

## Error Handling

### Storage Quota Exceeded
```typescript
try {
  localStorage.setItem(key, value)
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // Notify user, offer to clear old data
    showError('Storage full. Clear old simulation results?')
  }
}
```

### Corrupted Data
```typescript
try {
  return JSON.parse(stored)
} catch {
  // Data corrupted, reset to default
  localStorage.removeItem(key)
  return defaultValue
}
```

### Private Browsing
localStorage may not work in private/incognito mode:
```typescript
function isStorageAvailable() {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}
```

---

## Related Specs
- [State Management](state-management.md)
- [Custom JSON Format](../integrations/custom-json.md)
