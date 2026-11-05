# Feature Specification: From Desert to Life

**Feature Branch**: `005-arid-to-life`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "The player only influences the planet through weather. It lives on its own. Start from an arid planet and, as life develops, gain more powers and actions to help it thrive."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start on an arid planet (Priority: P1)

A new run starts on a mostly desert planet: little water, a few oceans or polar caps, almost no vegetation and a single hardy species. The player sees a barren world that can wake up.

**Independent Test**: create a world for several seeds; desert and bare tiles dominate, vegetated tiles are under 5 percent, and at least one species exists.

**Acceptance Scenarios**:

1. **Given** a new run, **Then** more than 60 percent of land tiles are desert or tundra and fewer than 5 percent carry vegetation.
2. **Given** the player rains on dry land for a while, **Then** vegetation can appear there and spread by itself.
3. **Given** the player does nothing, **Then** the planet stays barren and nothing is lost.

---

### User Story 2 - Vitality stages (Priority: P1)

A planet vitality value (0 to 100 percent) is computed from vegetated land and species variety. Named stages mark progress: Barren, Lichen, Meadow, Forest, Teeming. The current stage and the progress to the next are always visible.

**Independent Test**: vitality is 0 on a bare world and rises as vegetation and species grow; stage names change at fixed thresholds.

**Acceptance Scenarios**:

1. **Given** a run, **Then** the stage and the percentage to the next stage are shown.
2. **Given** vegetation dies out after a catastrophe, **Then** vitality falls but powers already earned stay.

---

### User Story 3 - Powers earned by stages (Priority: P1)

Each stage reached during a run grants a new weather power for that run: Barren gives Rain and Sun, Lichen gives Fog, Meadow gives Storm, Forest gives Monsoon, Teeming gives Warm Wind. Powers already owned or rented from the market are available from the start.

**Independent Test**: reaching a stage adds its power to the power menu without restarting.

**Acceptance Scenarios**:

1. **Given** a run reaching the Lichen stage, **Then** Fog appears in the power menu.
2. **Given** a new run, **Then** only the starting powers and market powers are available.

---

### User Story 4 - Weather only (Priority: P2)

The Water god acts only on weather. Raising and lowering land move to the future Stone god. Existing saves stay valid.

**Independent Test**: a Water run offers no terrain power; a Stone god is not yet playable.

---

### User Story 5 - Short tutorial (Priority: P1)

On the first run, a few calm hints guide the player step by step: look at the barren planet, tap a tile, use Rain, watch life appear, see the stage banner, and use a new power when a stage is reached. Hints can be skipped and replayed from the start screen. Nothing blocks the game.

**Independent Test**: a fresh save shows the first hint; following each step advances to the next; skipping marks it done and it is not shown again.

**Acceptance Scenarios**:

1. **Given** a first run, **Then** the first hint is shown and advances when the player does the asked action.
2. **Given** the tutorial is skipped or finished, **Then** it is not shown again until replayed from the start screen.
3. **Given** a reload mid-tutorial, **Then** it resumes at the same step.

---

### Edge Cases

- A planet that loses all life stays at Barren and can restart from rain; nothing is a game over.
- Stage powers granted in a run are not kept after the run, only market powers persist.
- A run restored from an older save without stage data starts at Barren.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: New worlds MUST start arid: over 60 percent of land desert or tundra, under 5 percent vegetated, deterministic for a seed.
- **FR-002**: Life MUST be able to emerge from rain alone, without terrain actions.
- **FR-003**: Vitality MUST be computed from vegetated land and species count, deterministically.
- **FR-004**: Stages MUST have fixed thresholds and never block progress when vitality drops.
- **FR-005**: Each stage MUST grant exactly one new weather power for the current run.
- **FR-006**: New powers (Fog, Storm, Monsoon, Warm Wind) MUST act only on humidity, temperature and seeds of a tile and its neighbours.
- **FR-007**: Terrain powers MUST be removed from the Water god.
- **FR-009**: A skippable, replayable tutorial MUST guide the first run and its state MUST persist in local storage.
- **FR-008**: Species and populations MUST stay read-only for every power.

### Key Entities

- **Stage**: id, vitality threshold, granted power.
- **Vitality**: 0 to 1 value derived from the world.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With steady rain on a few tiles, a first vegetated area appears within 5 minutes and the Lichen stage within 10.
- **SC-002**: The stage logic and the arid start are covered by unit tests over several seeds.
- **SC-003**: Reaching the Teeming stage is possible in a 60 minute run with sensible play.

## Assumptions

- Civilizations and random events come in later lots (006, 007).
- Stage thresholds and new power effects are first values, tuned by measurement as in spec 004.
- Points, ranking and market stay unchanged.
