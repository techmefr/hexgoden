# Feature Specification: Simulation Balance

**Feature Branch**: `004-balance`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Tune the balance: player actions should leave lasting marks, the untouched world should stay stable, dry forests should be able to burn, and points should reach the Wind price in about ten minutes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Actions leave lasting marks (Priority: P1)

Strong sun dries land into grassland and desert that stays for minutes; rain and sun also shift the local climate baseline so the change does not vanish at once.

**Independent Test**: heat 30 forest tiles, run 300 ticks, at least 15 fewer forest tiles remain.

### User Story 2 - A stable untouched world (Priority: P1)

After a short settling period the climate does not drift: forest and swamp counts change by fewer than 30 tiles over 1500 ticks.

**Independent Test**: run a settled seeded world and compare counts.

### User Story 3 - Real consequences (Priority: P2)

A dried, hot forest can catch fire within a few hundred ticks and the fire spreads.

**Independent Test**: heat a forest, run 300 ticks, at least one tile burns.

### User Story 4 - Progress at a gentle pace (Priority: P2)

A typical run earns between 100 and 260 Harmony points in ten minutes, so the Wind god (150) is reachable in about one run.

**Independent Test**: sum run points over 2400 ticks.

## Requirements *(mandatory)*

- **FR-001**: Humidity MUST relax toward a per-tile baseline, which rain and sun shift.
- **FR-002**: Climate diffusion MUST be slow enough for player effects to last minutes.
- **FR-003**: New worlds MUST settle their climate before the first tick of play.
- **FR-004**: Vegetation MUST decline gradually under hostile conditions so dry fuel can burn.
- **FR-005**: Point rates MUST keep the Wind price reachable in about ten minutes.

## Success Criteria *(mandatory)*

- **SC-001**: The four tests in `tests/balance.test.ts` pass.
- **SC-002**: All earlier tests still pass.

## Assumptions

- Values are tuned by feel and measured over seeds 5, 42, 777 and 9.
- Species variety and predators are left as they are.
