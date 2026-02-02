# D&D Encounter Simulator - Specifications

## Purpose

A web application that simulates D&D 5e combat encounters to help DMs and players estimate:
- Party win/loss probability
- Expected combat duration
- Individual survival rates
- Effectiveness of different party compositions

## How to Use These Specs

Each spec file describes **what** the system should do, not **how** to code it. An LLM or developer should be able to recreate the implementation from these specs alone.

### Status Markers

Each feature in the specs is marked with its implementation status:

- `[IMPLEMENTED]` - Currently working in the codebase
- `[PLANNED]` - Designed but not yet built
- `[FUTURE]` - Rough idea, needs more design

### Spec Structure

```
specs/
├── README.md                 # This file
├── ROADMAP.md                # Version history and planned features
│
├── rules/                    # D&D 5e mechanics (game rules)
├── data/                     # Data models and schemas
├── integrations/             # External data sources
├── simulation/               # Combat engine behavior
├── ui/                       # User interface requirements
└── architecture/             # Technical decisions
```

## Glossary

| Term | Definition |
|------|------------|
| **Combatant** | Any creature participating in combat (player or monster) |
| **Party** | The group of player characters |
| **Encounter** | A single combat between party and monsters |
| **Simulation** | Running one encounter from start to finish |
| **Batch** | Running multiple simulations to gather statistics |
| **Downed** | Reduced to 0 HP (unconscious for players, dead for monsters) |
| **Death Save** | D20 roll to determine if unconscious player stabilizes or dies |
| **Yo-yo Healing** | Strategy of only healing unconscious allies to maximize action economy |

## Quick Reference

- Current version: **v0.3**
- See [ROADMAP.md](ROADMAP.md) for version history
- Core combat rules: [rules/combat.md](rules/combat.md)
- Data schemas: [data/](data/)
- UI specs: [ui/](ui/)
