# Feature Specification: Time God

**Feature Branch**: `009-time-god`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "If you are the god of time you can accelerate, otherwise no; it is a kind of roguelite."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unlock the Time god (Priority: P1)

With 800 Harmony points the player unlocks the Time god. A Time run offers Fog and speed buttons x1, x2 and x4 in the header. Other gods have no speed control and always run at x1.

**Independent Test**: unlock fails below 800; a Time run shows speed buttons, a Water run does not; the worker refuses a speed the god does not have.

## Requirements *(mandatory)*

- **FR-001**: Only gods that list speeds above 1 MUST be able to accelerate; the worker MUST ignore other requests.
- **FR-002**: Speed changes the tick interval, not the simulation rules; the run stays deterministic per tick.
- **FR-003**: Points follow simulated ticks, so a faster run earns faster.

## Assumptions

- Price 800 and speeds x2, x4 are first values.
