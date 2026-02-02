# Performance

This document describes performance considerations and optimizations.

## Current Implementation `[IMPLEMENTED]`

### Synchronous Simulation
Simulations run synchronously on the main thread:
- Simple implementation
- Blocks UI during long runs
- Limited to ~1000 simulations before noticeable lag

### setTimeout Wrapper
Allows UI to update before simulation starts:

```typescript
const handleRunSimulation = (numSimulations) => {
  setIsRunning(true)

  setTimeout(() => {
    const { results, summary } = runSimulations(party, monsters, numSimulations)
    setResults(results)
    setSummary(summary)
    setIsRunning(false)
  }, 50)
}
```

---

## Performance Characteristics

### Single Simulation
- Typical: 1-5ms
- Complex (many combatants, long fight): 10-50ms
- Memory: ~10KB per simulation with log

### Batch Simulation
| Count | Time | Memory |
|-------|------|--------|
| 100 | ~100ms | ~1MB |
| 1,000 | ~1s | ~10MB |
| 10,000 | ~10s | ~100MB |

### UI Impact
- <100ms: Imperceptible
- 100-500ms: Slight delay
- 500ms-2s: Noticeable, needs loading indicator
- >2s: Should show progress, consider Web Worker

---

## Planned Optimizations `[PLANNED]`

### Web Workers
Run simulations in background thread:

```typescript
// main.js
const worker = new Worker('simulation-worker.js')

worker.postMessage({ party, monsters, count: 10000 })

worker.onmessage = (e) => {
  if (e.data.type === 'progress') {
    setProgress(e.data.completed / e.data.total)
  }
  if (e.data.type === 'complete') {
    setResults(e.data.results)
    setSummary(e.data.summary)
  }
}

// simulation-worker.js
self.onmessage = (e) => {
  const { party, monsters, count } = e.data

  for (let i = 0; i < count; i++) {
    const result = runCombat(party, monsters, i + 1)
    results.push(result)

    if (i % 100 === 0) {
      self.postMessage({ type: 'progress', completed: i, total: count })
    }
  }

  self.postMessage({ type: 'complete', results, summary })
}
```

### Streaming Results
Process results as they complete:
- Show running win percentage
- Update charts in real-time
- Allow early stopping

### Batched Rendering
For fight log with many entries:

```typescript
// Virtual scrolling - only render visible rows
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={500}
  itemCount={results.length}
  itemSize={50}
>
  {({ index, style }) => (
    <FightRow result={results[index]} style={style} />
  )}
</FixedSizeList>
```

### Log Truncation
For very long combats, truncate log:
- Keep first N entries
- Keep last N entries
- Summarize middle

```typescript
const MAX_LOG_ENTRIES = 500

if (log.length > MAX_LOG_ENTRIES) {
  const truncated = [
    ...log.slice(0, 200),
    { type: 'truncated', count: log.length - 400 },
    ...log.slice(-200)
  ]
}
```

### Memoization
Cache expensive calculations:

```typescript
const summary = useMemo(() => {
  return calculateSummary(results)
}, [results])

const survivorRates = useMemo(() => {
  return calculateSurvivorRates(results, party)
}, [results, party])
```

---

## Memory Management

### Clear Old Results
Don't keep all simulation logs in memory:
- Keep summary statistics
- Keep recent N results with logs
- Archive older to IndexedDB

### Garbage Collection
Release references when done:

```typescript
// After displaying summary, allow GC of full logs
setResults(results.map(r => ({
  ...r,
  log: null  // Release log memory
})))
```

---

## Benchmarking

### Performance Tests
```typescript
function benchmark(fn, iterations = 100) {
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const end = performance.now()
  return (end - start) / iterations
}

// Example
const avgTime = benchmark(() => {
  runCombat(party, monsters, 1)
}, 1000)
console.log(`Average combat: ${avgTime.toFixed(2)}ms`)
```

### Profiling
Use browser dev tools:
- Performance tab for CPU profiling
- Memory tab for heap snapshots
- React DevTools Profiler for component rendering

---

## Related Specs
- [Combat Loop](../simulation/combat-loop.md)
- [Simulation Runner UI](../ui/simulation-runner.md)
