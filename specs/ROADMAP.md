# Roadmap

## Version History

### v0.1 - Basic Combat `[IMPLEMENTED]`
- Basic combatant stats (HP, AC, attack bonus, damage)
- Initiative rolling and turn order
- Attack resolution (d20 + bonus vs AC)
- Critical hits (nat 20) and fumbles (nat 1)
- Combat ends when one side reaches 0 HP
- Simple UI for party/monster setup
- Run multiple simulations, show win percentage

### v0.2 - Multi-attack and Healing `[IMPLEMENTED]`
- Multiple attacks per turn
- Healing dice for support characters
- Heal targets below 50% HP threshold
- Focus-fire targeting (attack lowest HP enemy)

### v0.3 - Death Saves and Yo-yo Healing `[IMPLEMENTED]`
- Players go unconscious at 0 HP instead of dying
- Death saving throws (d20 at start of turn)
- Natural 20: recover with 1 HP
- Natural 1: two failures
- 3 successes: stabilized
- 3 failures: dead
- Yo-yo healing: only heal unconscious allies
- Monsters die immediately at 0 HP
- Monsters skip unconscious targets

---

## Planned Versions

### v0.4 - Conditions and Effects `[PLANNED]`
- Conditions: prone, stunned, restrained, etc.
- Condition effects on combat (advantage/disadvantage)
- Duration tracking (until end of next turn, etc.)

### v0.5 - Saving Throws `[PLANNED]`
- Ability-based saving throws
- Effects that require saves (breath weapons, etc.)
- Save-or-suck abilities

### v0.6 - Spellcasting `[PLANNED]`
- Spell slots and slot levels
- Cantrips vs leveled spells
- Concentration tracking
- Common damage spells (Fireball, etc.)
- Common buff/debuff spells

### v0.7 - Action Economy `[PLANNED]`
- Bonus actions
- Reactions
- Opportunity attacks
- Action surge, cunning action, etc.

### v0.8 - Advanced Monster Abilities `[PLANNED]`
- Legendary actions
- Lair actions
- Multiattack with different weapons
- Special abilities (breath weapons, etc.)

### v0.9 - Data Import `[PLANNED]`
- Import from D&D Beyond
- Import from SRD JSON
- Custom JSON format
- Character/monster presets library

### v1.0 - Polish `[PLANNED]`
- Encounter difficulty calculator (CR-based)
- Save/load encounter configurations
- Share encounters via URL
- Detailed statistics and charts
- Export results to CSV/JSON

---

## Future Ideas `[FUTURE]`

- Terrain and positioning (simplified)
- Cover mechanics
- Environmental hazards
- Rest mechanics (short/long rest between encounters)
- Multi-encounter adventuring day simulation
- Class-specific features (rage, sneak attack, smite)
- Magic item effects
- Variant rules (flanking, etc.)
