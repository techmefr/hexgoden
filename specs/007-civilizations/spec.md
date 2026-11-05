# Feature Specification: Civilizations

**Feature Branch**: `007-civilizations`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Civilizations emerge on their own; the player can only help them through weather."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Peoples emerge and grow (Priority: P1)

On lush land with plants and herbivores, after a while a settlement appears by itself. It grows with food and a mild climate, spreads to good neighbor tiles, and tints the tile warm. The tile panel shows its size.

**Independent Test**: lush land with settlement grows and spreads; the emergence never happens before tick 2000.

### User Story 2 - Hardship and recovery (Priority: P1)

Drought, fire, flood, cold and events shrink or end settlements; peoples can return later on recovered land. The player helps only through weather.

**Independent Test**: dry land makes a settlement fade to zero; a meteorite leaves less than 10 percent of it.

### User Story 3 - Eras and points (Priority: P2)

The total settlement mass names an era (Tribes, Villages, Towns, Cities), shown in the header, and adds Harmony points.

**Independent Test**: era thresholds 0, 3, 10, 25 map to names; points rise with settlement mass.

## Requirements *(mandatory)*

- **FR-001**: Settlements MUST be deterministic and opt-in per world (game runs enable them).
- **FR-002**: Emergence needs vegetation, herbivores, mild climate and tick 2000 or later.
- **FR-003**: Settlements MUST NOT change vegetation or species; they are read-only observers of the climate.
- **FR-004**: Settlements MUST shrink under dry, hot, cold, flooded or burning conditions and under events.
- **FR-005**: The interface MUST show the era and the size of a settlement on a tile.

## Assumptions

- Technology, trade and wars between peoples are later lots; this slice is a first, simple model.
