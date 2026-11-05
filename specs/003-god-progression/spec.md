# Feature Specification: God Progression

**Feature Branch**: `003-god-progression`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Unlock elements to improve the planet; later earn points, climb a ranking of gods, recruit gods into a team and buy their powers."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Earn points from a thriving planet (Priority: P1)

While a planet lives, the player earns Harmony points from what emerges on it (living species, vegetated land). Points are never lost, only spent. They are saved on the device between sessions.

**Why this priority**: it is the base of every unlock and of the ranking.

**Independent Test**: play a run; points rise with life on the planet; reload the app and the banked total is still there.

**Acceptance Scenarios**:

1. **Given** a planet with life, **When** time passes, **Then** the run points increase faster with more species and more vegetated land.
2. **Given** points were earned, **When** the app is reloaded, **Then** the banked total is restored.
3. **Given** a planet without life, **Then** points grow at most very slowly and nothing is ever deducted.

---

### User Story 2 - Unlock another god (Priority: P1)

On the start screen the player spends points to unlock the Wind god, then starts a run with it. Wind has its own powers: Gust spreads humidity, warmth and seeds around a tile, Chill cools it. Stone stays locked for now with its price shown.

**Why this priority**: gives the points a purpose and starts the roguelite loop.

**Independent Test**: with enough points, unlock Wind, begin a run, and see Gust and Chill instead of the water powers.

**Acceptance Scenarios**:

1. **Given** fewer points than the price, **Then** the unlock button is disabled and the missing amount is shown.
2. **Given** enough points, **When** the player unlocks Wind, **Then** points are spent, Wind becomes selectable and stays unlocked.
3. **Given** a Wind run, **Then** only Gust and Chill are offered and Gust smooths humidity and temperature around the tile.

---

### User Story 3 - Climb the ranking of gods (Priority: P2)

Banked points place the player in a ranking of simulated gods; ranks are named and the player sees the next rank and the points it needs. Solo only, no server.

**Why this priority**: long-term motivation, builds on points.

**Independent Test**: the rank shown changes when the banked points cross a threshold.

**Acceptance Scenarios**:

1. **Given** banked points, **Then** the player sees their rank and the points needed for the next one.

---

### User Story 4 - Buy or rent other gods' powers (Priority: P3)

The ranking only serves to reach other gods: a higher rank opens their powers. A power can be bought for good or rented for a limited time, then used from a Worms-style power menu (a grid of power cards grouped by god) in any run.

**Why this priority**: the end goal of the progression, needs the ranking.

**Independent Test**: rent a power of a ranked god; it appears in the power menu for the rental duration, then disappears.

**Acceptance Scenarios**:

1. **Given** a god within reach of the player's rank, **When** a power is bought, **Then** it stays in the power menu of every run.
2. **Given** a rented power, **When** the rental ends, **Then** it leaves the menu and can be rented again.

---

### Edge Cases

- Storage unavailable or blocked: the game still works, progress lasts for the session only.
- Corrupt saved data: it is ignored and replaced by a fresh state, never crashing the app.
- Unlocking twice or with not enough points must change nothing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST compute run points from living species and vegetated land, deterministically for a seed and actions.
- **FR-002**: Points MUST only increase while playing and only decrease when spent on an unlock or purchase.
- **FR-003**: Banked points and unlocked gods MUST persist in local storage with safe fallbacks.
- **FR-004**: The start screen MUST show banked points, unlock prices and the missing amount.
- **FR-005**: Unlocking a god MUST spend its price exactly once and persist.
- **FR-006**: Each god MUST expose its own list of powers; Water keeps rain, sun, raise land and lower land; Wind has Gust and Chill.
- **FR-007**: The ranking (P2) MUST be solo and local; no real-money purchase exists anywhere.
- **FR-008**: Species and populations MUST stay read-only for every god.

### Key Entities

- **God**: id, powers, unlock price.
- **Progress**: banked points, unlocked god ids, schema version.
- **Rank**: name and points threshold.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new player can afford the Wind god after about 10 minutes of a thriving run.
- **SC-002**: Progress survives a page reload in 100 percent of runs with storage available.
- **SC-003**: Unlock logic is covered by unit tests, including insufficient points and double unlock.

## Assumptions

- Only P1 and the Wind god are built in this slice; P2 and P3 stay specified for later.
- Points are earned only by playing; there are no purchases with real money.
- Stone stays locked and shows its price.
- The ranking is solo with simulated gods; an online ranking would need a server and is out of scope.
