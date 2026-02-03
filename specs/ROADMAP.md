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

### v0.4 - Conditions and Effects `[IMPLEMENTED]`
- Conditions: prone, stunned, poisoned, restrained, blinded
- Advantage/disadvantage system
- Duration tracking with end-of-turn saves
- On-hit effects (Giant Spider poison, Wolf knockdown)
- Monster preset dropdown

### v0.5 - More Conditions and Immunities `[IMPLEMENTED]`
- Additional conditions: paralyzed, frightened, charmed, incapacitated
- Condition immunities (undead immune to poison/charm/fear)
- Attack types (melee vs ranged)
- Auto-crit on paralyzed/stunned targets
- Vitest test suite (64 tests)
- GitHub Actions CI pipeline

### v0.6 - Spellcasting `[IMPLEMENTED]`
- Spell slots and slot levels (1st through 3rd)
- Cantrips vs leveled spells (Fire Bolt, Sacred Flame, Toll the Dead)
- Concentration tracking with CON saves on damage
- Damage spells (Magic Missile, Fireball, Scorching Ray)
- Healing spells (Healing Word, Cure Wounds)
- Control spells (Hold Person)
- Buff spells (Bless, Haste, Shield)
- Caster presets (Mage, Priest, Cultist)
- 22 new tests (86 total)

### v0.7 - Action Economy `[IMPLEMENTED]`
- Bonus actions (off-hand attack, Second Wind, Spiritual Weapon)
- Reactions (Shield spell blocks attacks)
- Action/bonus action/reaction tracking per turn
- Two-weapon fighting for rogues
- Second Wind for fighters (1d10+level healing)
- 17 new tests (103 total)

### v0.8 - Advanced Monster Abilities `[IMPLEMENTED]`
- Legendary actions (3/round, different costs)
- Multiattack with different weapons (bite + claws)
- Recharge abilities (breath weapons recharge 5-6)
- Area damage abilities (breath weapons)
- Monster presets: Young/Adult Red Dragon, Hill Giant, Mind Flayer
- 15 new tests (118 total)

### v0.9 - AOE Positioning `[IMPLEMENTED]`
- Abstract positioning system (front/back lines)
- Position-aware AOE targeting
- Fireball (sphere): targets chosen position group
- Breath weapons (cone): targets front line only
- Position shown in UI and fight log
- 17 new tests (135 total)

### v0.10 - Data Import `[PLANNED]`
- Import from D&D Beyond
- Import from SRD JSON
- Custom JSON format
- Character/monster presets library

### v1.1 - Polish `[PLANNED]`
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
