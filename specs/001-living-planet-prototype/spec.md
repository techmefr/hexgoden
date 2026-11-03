# Feature Specification: Living Planet Prototype

**Feature Branch**: `001-living-planet-prototype`

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description: "A zen, contemplative low-poly pastel god game. One hexagonal planet, the player is the god of water and acts through weather and terrain; biomes, life and evolution emerge on their own. The player can only modify and observe. Responsive, installable PWA."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Contemplate a low-poly hexagonal planet (Priority: P1)

The player opens the game and sees a planet made of hexagonal tiles (with the 12 unavoidable pentagons), flat-shaded low-poly, in pastel colours, floating in space. They rotate and zoom it with touch or mouse.

**Why this priority**: it is the visual identity and the base every other story builds on.

**Independent Test**: load the app on a phone and a desktop; the planet renders, rotates and zooms smoothly; tapping a tile highlights it.

**Acceptance Scenarios**:

1. **Given** the app is loaded, **When** the player drags, **Then** the planet rotates following the pointer.
2. **Given** the planet is shown, **When** the player pinches or scrolls, **Then** the camera zooms within limits.
3. **Given** a tile is tapped, **Then** it is highlighted and its values (altitude, humidity, temperature, biome, life) are shown.

---

### User Story 2 - Act as the god of water (Priority: P1)

The player starts a run as the god of water. They pick a power (rain, sun, raise land, lower land) and tap tiles to apply it. Each action changes the tile and spreads to neighbours.

**Why this priority**: it is the only way the player interacts; without it there is no game.

**Independent Test**: apply rain on a tile and observe its humidity rise and spread to neighbours over time.

**Acceptance Scenarios**:

1. **Given** the water god is selected, **When** the player uses rain on a tile, **Then** humidity increases there and diffuses to neighbours.
2. **Given** a tile, **When** the player uses sun repeatedly, **Then** temperature rises and humidity drops.
3. **Given** a tile, **When** the player raises land, **Then** altitude increases; lowering decreases it.

---

### User Story 3 - Biomes and water emerge from weather and terrain (Priority: P1)

Biomes are derived from humidity, temperature and altitude. Water flows downhill and forms rivers and lakes. Too much sun makes desert, too much water makes swamp, cold makes tundra then ice.

**Why this priority**: shows cause and effect, which is the core fun of the game.

**Independent Test**: starting from a neutral planet, concentrated sun produces desert tiles and sustained rain on a flat area produces swamp.

**Acceptance Scenarios**:

1. **Given** a hot and dry tile, **Then** its biome becomes desert and its colour changes.
2. **Given** a flat and very humid tile, **Then** its biome becomes swamp.
3. **Given** a slope with water, **Then** water flows to the lowest neighbour and a river or lake forms.
4. **Given** a mountain, **Then** the windward side receives more rain than the leeward side.

---

### User Story 4 - Life appears and evolves on its own (Priority: P2)

Once biomes are suitable, plants appear, then herbivores, then predators. Species have simple traits (size, diet, mobility, climate tolerance, reproduction rate) that mutate slightly each generation. The environment selects which species thrive, so one species (for example flies in a hot swamp) can dominate. The player cannot control life.

**Why this priority**: it is the emergent payoff, but it needs stories 1 to 3 first.

**Independent Test**: run the simulation for N ticks on a seeded planet; life appears on suitable tiles, populations oscillate, and at least one new species emerges.

**Acceptance Scenarios**:

1. **Given** a humid temperate tile, **Then** vegetation grows over time.
2. **Given** vegetation, **Then** herbivores colonise; given herbivores, predators can follow.
3. **Given** a population isolated by terrain, **When** enough generations pass, **Then** a distinct species emerges.
4. **Given** a hostile climate shift, **Then** unfit species decline.

---

### User Story 5 - Actions have side effects and catastrophes happen (Priority: P2)

Every power has a consequence: adding land builds tectonic tension that triggers earthquakes; sustained sun and dryness raise fire risk; too much rain causes floods and erosion. Catastrophes are random, spread to neighbours, destroy life, but life recolonises slowly (ash, grass, shrubs, young trees, forest). There is never a game over.

**Why this priority**: gives risk, randomness and the roguelite feel.

**Independent Test**: raise a tile repeatedly until tension crosses its threshold and an earthquake shifts nearby altitudes; a dry forest eventually burns and later regrows.

**Acceptance Scenarios**:

1. **Given** accumulated tension on a tile, **When** it crosses the threshold, **Then** a quake redistributes tension and shifts neighbour altitudes.
2. **Given** a dry hot forest, **Then** it can catch fire and the fire spreads to dry neighbours.
3. **Given** a burnt tile, **Then** it recolonises through successive stages over many ticks and its soil is more fertile.

---

### User Story 6 - Install and play anywhere (Priority: P3)

The app is a responsive PWA: installable, usable offline, adapted to portrait phone, tablet and desktop.

**Why this priority**: required for the "test it everywhere" goal, but not for the core loop.

**Independent Test**: install from the browser, go offline, and play; run on a 375 px wide viewport without horizontal scroll.

**Acceptance Scenarios**:

1. **Given** the app is installed, **When** the network is off, **Then** the game still loads and runs.
2. **Given** a phone viewport, **Then** the power bar sits at the bottom and nothing overflows.
3. **Given** a desktop viewport, **Then** the controls use a side panel and the mouse works.

---

### Edge Cases

- Pentagon tiles (5 neighbours) must behave like hexagons in every rule.
- A planet fully frozen or fully desert must still allow recovery by the player's actions.
- Extinction of every species must not break the run; life can reappear from suitable conditions.
- Rapid repeated taps must not queue unbounded work in the worker.
- Pausing the tab must pause the simulation and resume without a time jump.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render a planet as a geodesic hexagonal grid with 12 pentagons, flat-shaded low-poly, pastel palette.
- **FR-002**: The system MUST support rotate, zoom and tile selection with touch and mouse.
- **FR-003**: Each tile MUST hold altitude, humidity, temperature, tectonic tension, biome and life populations.
- **FR-004**: The player MUST be able to apply rain, sun, raise land and lower land to a tile as the water god.
- **FR-005**: The simulation MUST diffuse humidity and temperature to neighbours and make water flow downhill.
- **FR-006**: The biome of a tile MUST be derived from humidity, temperature and altitude.
- **FR-007**: The simulation MUST model vegetation, herbivores and predators as per-tile populations with a food chain.
- **FR-008**: Species MUST carry mutable traits and MUST evolve or split under environmental pressure.
- **FR-009**: Raising land MUST add tectonic tension that can trigger earthquakes; dry heat MUST raise fire risk; excess rain MUST cause floods and erosion.
- **FR-010**: Catastrophes MUST be random from a seeded generator, MUST NOT end the run, and life MUST recolonise through staged succession.
- **FR-011**: The simulation MUST run in a Web Worker, be independent of rendering, and be deterministic for a given seed.
- **FR-012**: The player MUST NOT be able to control or spawn life directly.
- **FR-013**: The app MUST be an installable, offline-capable, responsive PWA.
- **FR-014**: The UI MUST be internationalised from the start, with English as the first language.

### Key Entities

- **Planet**: seed, grid of tiles, current tick, chosen god.
- **Tile**: neighbours (5 or 6), altitude, humidity, temperature, tectonic tension, biome, populations.
- **Biome**: ocean, desert, grassland, forest, jungle, swamp, tundra, ice, mountain, with colour and fertility.
- **Species**: traits (size, diet, mobility, heat tolerance, cold tolerance, moisture tolerance, reproduction rate) and lineage.
- **Population**: species and count on a tile.
- **God**: a set of powers (the water god has rain, sun, raise land, lower land).
- **Power**: an action on a tile with a magnitude and a side effect.
- **Event**: earthquake, fire, flood, erosion with its origin tile and spread.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The planet renders and responds to input at 60 fps on a mid-range phone with the prototype grid size.
- **SC-002**: Starting from a neutral seeded planet, a player produces a visible desert and a visible swamp within 2 minutes of play.
- **SC-003**: Over a 10-minute unattended run, plants, herbivores and predators all appear and at least one new species emerges.
- **SC-004**: The same seed and the same sequence of actions reproduce the same planet state, verified by an automated test.
- **SC-005**: The installed app loads and is playable with the network disabled.
- **SC-006**: No horizontal scroll and no clipped controls from 360 px to 1920 px wide.

## Assumptions

- Prototype scope: one planet, one god (water), no space map, no accelerated time, no civilisations.
- Time runs at a fixed natural rate; time acceleration belongs to a future time god.
- Roguelite meta-progression (unlocking gods, powers, planet types) is out of scope for this feature.
- Rules and numbers are tuned by feel and will be adjusted during play.
- The name HexGoden is the project name; tile counts are chosen at plan time.
