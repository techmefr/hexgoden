# Feature Specification: Stone God

**Feature Branch**: `008-stone-god`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "More gods and more powers as the player progresses."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unlock the Stone god (Priority: P1)

With 400 Harmony points the player unlocks the Stone god and starts a run with Raise land and Lower land. Raising builds tension and causes earthquakes; lowering calms it.

**Independent Test**: unlock fails below 400 points and succeeds at 400; a Stone run offers only Raise and Lower plus stage powers.

### User Story 2 - Terrain powers in the market (Priority: P2)

Raise and Lower can be bought or rented from the power market at rank River, for use in any run.

**Independent Test**: a River-rank player can rent Raise; a lower rank cannot.

## Requirements *(mandatory)*

- **FR-001**: Stone MUST be playable with price 400 and powers raise and lower.
- **FR-002**: Stone offers MUST follow the market rules (rank gate, buy for good, rent 30 minutes).
- **FR-003**: Species and populations stay read-only.
