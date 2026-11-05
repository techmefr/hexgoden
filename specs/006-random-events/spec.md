# Feature Specification: Random Events

**Feature Branch**: `006-random-events`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Lots of events can happen on the planet: meteorites and more. They are punishing and random, never final, and give the planet a life of its own."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The planet has surprises (Priority: P1)

Every few minutes an unplanned event strikes a part of the planet: meteorite, drought, flood, volcano or cold snap. The player sees a short notice naming the event and where it happened, and the planet shows the damage.

**Independent Test**: run a seeded planet for 20 minutes of ticks; several events of different kinds occur, deterministically for the seed.

**Acceptance Scenarios**:

1. **Given** a run past the grace period, **Then** events occur at a rate of about one every two minutes.
2. **Given** an event, **Then** a notice names it and the planet shows its marks (crater, ash, dried or flooded land).
3. **Given** the first five minutes of a run, **Then** no event occurs.

---

### User Story 2 - Punishing but never final (Priority: P1)

Events destroy life locally but life returns: a meteorite crater becomes fertile land, volcanic ash enriches the soil, a drought can be undone by rain, a flood recedes.

**Independent Test**: after a meteorite, the affected tiles lose life, then vegetation returns when rain is applied nearby.

**Acceptance Scenarios**:

1. **Given** a meteorite, **Then** populations and vegetation near the impact collapse and fertility there rises.
2. **Given** a drought, **Then** the area dries and the player can restore it with Rain, Fog or Monsoon.
3. **Given** any event, **Then** the run never ends and points are never lost.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Events MUST be deterministic for a seed and use the world random generator.
- **FR-002**: Event kinds: meteorite, drought, flood, volcano, cold snap, each with its own local effects.
- **FR-003**: No event before tick 1200 (five minutes); mean rate about one per 480 ticks afterwards.
- **FR-004**: Each event MUST leave fertility higher or recoverable land, never permanent barrenness.
- **FR-005**: The latest event MUST reach the interface with kind, tile and tick; the UI shows a notice.
- **FR-006**: Events MUST be opt-in per world so existing balance tests stay valid; game runs enable them.

## Success Criteria *(mandatory)*

- **SC-001**: Over 20 simulated minutes at least three kinds of events occur.
- **SC-002**: Unit tests cover each event effect and the grace period.

## Assumptions

- Rates and radii are first values to tune later; ice ages and civilizations reacting to events come with later lots.
