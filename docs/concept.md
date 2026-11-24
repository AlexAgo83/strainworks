# Strainworks: game concept

The reference for the game and its decisions. The game speaks English and French; French names are given in brackets on first use, and the English ones are in section 15. The working name was SOUCHE. The availability of the name Strainworks has not been checked.

**Write the living. Make it a factory. Survive its mutations.**

This document wins over earlier drafts and mockups.

- Transport mockup: `prototype/transports/`
- Playable prototype: `prototype/`

## 1. The game in short

Strainworks is an incremental automation game crossed with tower defense, for browser and mobile. In a cyberpunk world with a touch of space horror, seen from above in 3D, you run a station that industrializes living matter.

You harvest four organic bases, assemble them into genes and then into strands of DNA, and hatch them into machines, weapons and convoys. The more you produce and expand, the more the threat grows. Its creatures resemble what you manufacture, and your best weapon is their exact opposite.

Seen from afar, factories become organs and convoys flow like blood. **It was never a factory. It was a creature.**

The loop: harvest, write, hatch, expand, defend, recycle.

## 2. State of the decisions

| Subject | State | Choice |
|---|---|---|
| Platforms | Decided | Browser and mobile |
| Rendering | Decided | 3D, fixed top-down view, cyberpunk and space horror |
| Genre | Decided | Shape-recipe factory, technology that depends on it, incremental, tower defense |
| Matter | Decided | Primary organic zones, transformed by cutting and assembling |
| Language of items | Decided | Chains, like strands of DNA that you build |
| Map | Decided | More or less unlimited, generated on demand from a seed |
| Outpost attacks | Decided | A breach out in the open world attacks the outpost that woke it |
| Long distance | Decided | Carrier worms as trains |
| Threat | Decided | Carried by breaches: asleep, woken by expansion, then a rising pressure and assaults until they are emptied |
| Breaches | Decided | They do not last: once emptied they fade. They push the player to explore and to defend in many places |
| Limited defenses | Decided | Walls and turrets are not unlimited: rising ADN cost, proposed scale in section 10 |
| Build time | Decided | Nothing appears at once: sites do not advance while paused |
| Builder drones | Decided | As many drones as simultaneous sites: a site only advances while its drone is beside it |
| Two splitters | Decided | Two ways (left and right) from the start, three ways unlocked by tech |
| Buildings of 2 x 2 cells | Decided | A large storage and a large harvester |
| Dismantling | Decided | It takes time and a drone, like building |
| Repair | Decided | Damaged buildings repair over time |
| Goal besides defense | Decided | The core demands shapes: delivering them grows it and unlocks what follows. Three stages in the prototype |
| Nervous system | Decided | Nerves link smart objects that emit or read what is needed, including in position 1, 2 or 3 |
| Adaptive ligase | Rejected | Sending the right compositions is the player's job |
| Three turrets | Decided | Beside the Turret: the Dard shoots far and slowly, the Gueule close and two shots at once |
| Creature target | Decided | A turret closer than the core takes priority |
| Name | Decided | Strainworks |
| Transports | Decided | Richer distant deposits, veins and worms, all in the prototype |
| Mutation | Decided | It adds an enemy family, it does not replace the old ones |
| Room at the start | Decided | Large grid, deposits away from the core, spaced elements |
| Maturation on belts | Rejected | Too complex: a strand only changes inside a machine |
| Ranks | Decided | Belts and harvesters have MK2 and MK3, bought in ADN on the object or its whole row. A bridge runs at the slowest rail round it |
| ADN rate bonus | Rejected | Ranks replace it. Games that bought it get their ADN back |
| Crossing time | Decided | Nothing crosses a building at once: 0.25 s a cell, the rate stays the same |
| Deposit shape | Decided | Irregular round patches with splashes, never rectangles |
| Distance | Decided | Nests are sparse and come in four bodies. Five levels by distance, capped at 640 cells: harder nests, richer deposits |
| Fog of war | Decided | Never seen, seen before, seen now round structures, drones and worms. No building in the unknown. An assault is always announced |
| Games | Decided | The game opens on an organic planet, one hexagon a game, denser as it advances. Export, import and copy never write over a game |
| Carbon and containers | Decided | Carbon stays outside the genetic code. The Encapsulator packs magazines for turrets and tech capsules for the core |
| Higher tech matter | Decided | Later stages ask for a rarer matter instead of carbon, like uranium found farther. Its mutagen effect is a proposal |
| Four bases, genes of three | Proposed | See sections 3 and 4 |
| Built-in ports (membranes) | Proposed | No transfer arm to place |
| Antidote by opposite strand | Proposed | To validate in the prototype |
| Playability corrections | Proposed | See section 13 |
| Offline | Proposed | The threat is capped and destroys nothing |
| Prestige | Proposed | A few genes are bequeathed to the next station |

## 3. The bases

| Base | Letter | Silhouette | Meaning | Opposite |
|---|---|---|---|---|
| Spore | S | green circle | energy, growth | Chitin |
| Fiber (Fibre) | F | amber capsule | structure, movement | Nerve |
| Chitin (Chitine) | C | ivory point | hardness, damage | Spore |
| Nerve (Nerf) | N | cyan star | signal, targeting | Fiber |

All four deposits are present near the core from the start, otherwise the first antidotes are impossible. Farther away they are richer, or already assembled into genes to cut.

## 4. Genes

Three bases in a precise order make a gene. 64 are possible, 16 are named to begin with. A strand chains 1 to 4 genes, and research lengthens it, notably for worms.

| Age | Gene | Sequence | Effect | Opposite |
|---|---|---|---|---|
| 1 | Motor (Moteur) | SFS | moves | CNC |
| 1 | Hold (Soute) | FFF | contains | NNN |
| 1 | Mouth (Bouche) | FSF | takes, gives back | NCN |
| 1 | Root (Racine) | SSS | grows, draws | CCC |
| 2 | Shell (Carapace) | CCF | absorbs hits | SSN |
| 2 | Sting (Dard) | CFC | pierces | SNS |
| 2 | Blade (Lame) | CCC | slices | SSS |
| 2 | Acid (Acide) | CSC | corrodes | SCS |
| 3 | Eye (Œil) | NFN | sees, aims | FNF |
| 3 | Care (Soin) | SSN | repairs | CCF |
| 3 | Scent (Flair) | NSN | follows a trail | FCF |
| 3 | Pulse (Pulsation) | FNF | sets a rhythm | NFN |
| 4 | Memory (Mémoire) | NNN | retains | FFF |
| 4 | Command (Commande) | NCN | decides | FSF |
| 4 | Mutation | CNS | alters | SFC |
| 4 | Instinct | SNS | reacts | CFC |

Ages unlock technologies, not matters. A gene is unlocked by delivering it in quantity to the core. An opposite can be produced as ammunition before its technology is known.

## 5. The grid and the machines

- The ligase has three numbered inputs: **the position of the belts writes the gene**. Swapping two inputs changes the recipe, turning the machine over reverses it.
- The assembler has four ordered inputs, one per gene, and produces the strand.
- Belts are drawn cell by cell. A crossing costs a bridge.
- Sorting is a building, not a setting present on every port.
- Two machines side by side transfer without a belt.
- Compact is shorter to defend, but harder to route and to extend.

### Building takes time

- Planning while paused is allowed, but sites only advance while the game runs.
- **3 drones live on the core, one per site**, and take sites in placement order. A site only advances while its drone is within 2 cells. A drone flies 20 cells per second and goes from one site to the next without returning to its nest.
- Prototype build times, travel excluded: Belt 0.15 s, gate and bridge 0.5 s, splitters and sorter 1 s, large cyst 5 s, large harvester 6 s, pump 1.5 s, harvester and cyst 2 s, ligase 2.5 s, wall 3 s, Gueule 5 s, turret 6 s, Dard 7 s, vein by length.
- A site does not carry, shoot, block or attract creatures.
- **Dismantling shares the same drones and queue, and lasts as long as building did.** A building works until its drone starts, the refund comes at the end, and it can be cancelled. A site nobody started is cancelled at once.

### Damaged buildings repair

- After 5 seconds without a hit, 2% of hit points per second, 0.5% for the core. Never while paused.
- A wounded vein closes the same way. A severed vein or a destroyed building is rebuilt, with its build time.

## 6. Filling and quantities

Starting values, to balance:

| Element | Value |
|---|---|
| Harvester (Récolteur) | 1 base per second |
| Ligase | 1 gene per second, so 3 bases |
| Belt (Tapis) | 4 items per second, 8 at MK2 (1 ADN a cell), 12 at MK3 (3 ADN a cell) |
| Turret (Tourelle) | up to 3 genes fired per second |
| Cyst (Kyste) | 60 items |
| Large cyst (Grand kyste), 2 x 2, stage 2 | 360 items, 720 at MK2 (30 ADN), 1440 at MK3 (80 ADN), two mouths at the pace of their rails |
| Large harvester (Grand récolteur), 2 x 2, stage 2 | as 6 harvesters, out by its 8 faces |

- A machine pushes as soon as a place is free and stops when its output is full. The stop travels back up the line.
- A junction alternates. A priority is set with an arrow.
- An item takes one place whatever its length: a belt carries 4 bases per second, or 12 once bound into genes. Assembling near the deposit or near the front becomes a real choice.
- A harvester pulls 1, 2 or 3 per second by rank (15 and 40 ADN for MK2 and MK3, 60 and 160 for the large one), times the deposit's richness. Prices are counted from MK1 and are a first setting.
- A bridge, gate, splitter or sorter runs at the slowest rail it joins, those side by side share one pace. A cyst gives at the pace of the rail it gives to.
- An item stays 0.25 s in a cyst, pump or pocket, 0.5 s in a large cyst, several at a time. A machine starts giving 0.25 s after its last ingredient at the earliest. Turrets and the core take at once.
- An upgrade is a drone's job: the piece goes on working at its old rank until it is done. Cancelled, it is paid back.
- A cyst holds 60, 120 or 240 by rank (10 and 25 ADN).
- Example: the CNC antidote needs 2 chitin harvesters and 1 nerve harvester for 1 gene per second. A turret firing 3 empties a cyst of 60 in 30 seconds, even when fed.

Continuous sinks: ammunition, research delivered to the core, and the upkeep of worms.

## 7. Readability and player impact

- A known gene folds into a pictogram.
- Each input shows the expected base in outline.
- A pale port lacks matter, a swollen port has too much.
- Touching a machine gives its real rate over its maximum (for example 0.6 of 1 per second) and lights up the upstream link responsible.
- The intended satisfaction: see the bottleneck, fix it, see the flow restart.

### The nervous system

- **Radar pylon** (2026-11-23, stage 2, family Commander): keeps 36 cells around it in sight, pulses every 3 s
  across that zone. Wired by a nerve, the creatures crossing its zone count for the net as those in range of its
  turrets do, so gates and sorters get the right antidote ready before a wave reaches the guns. A net with only
  a radar still steers its gates and sorters. 30 ADN plus 15 per radar, 4 s to build, 120 hit points.

Nerves carry one kind of information only: what is needed. Routing stays with the player, machines do not change recipe.

- The turret emits the antidotes of the creatures in range, the most numerous first.
- The gate (Feu) and the sorter (Trieur) listen. Each reads either the whole gene, or the base in position 1, 2 or 3 of that gene.
- Readings by position all follow the same gene until its family has been out of range for 4 seconds. This is what avoids hybrid genes.
- Gate: what is asked passes, the rest waits. For dedicated lines.
- Sorter: what is asked is diverted. Reading by position, the overflow continues to the next sorter, because a base can be asked twice.
- A nerve is 24 cells long at most, relays through a gate or a sorter, and can be cut by creatures. Cut, each returns to its manual setting.
- Unlocked at stage 2. The Eye, placed forward to warn earlier, remains to be built.
- **Logic (2026-11-24)**: cysts and large cysts join a nerve and report their level against a threshold the player
  sets (25, 50, 75 or 100 %); the net is full once every store is over it. A wired gate opens on the gene asked (as
  before), a threat, no threat, low stock, full stock, threat AND low stock, or threat OR low stock.
- **Sources (2026-11-24)**: a network is a cable; every listener (gate, sorter, Ligase, assembler, encapsulator,
  screen) hears the whole network by default or one source on it, picked by tapping: a gun or a radar (the antidote of
  what that one sees), the core (its recipe), a console (its gene set by hand) or a cyst (its level, for gates). One
  network can run several independent lines. A source taken off the network is forgotten until it is back.
- **Own stores and batches (2026-11-24)**: a gate on a stock condition listens to the cyst the player picks on
  its net (the nearest until then), shown by a dashed line when selected, so one net runs several lines. The threshold reads in items ("full at 30 /
  60"). A batch (5, 10, 20 or 50) lets that many through each time the condition holds, then waits for it to drop.
  The gate's card says in one sentence why it is green or red, what it watches and how much of its batch passed.
- **Console (Pupitre, 2026-11-24)**: on a nerve it sets the priority of what the net asks: the most numerous (the
  default), the nearest to the net's guns and radars, each threat in turn every 20 s, or a gene set by hand.
- **Reading the network (2026-11-24)**: every wired piece has "Read the network": its sources, what it asks and how
  many creatures each, the priority, its stores and who listens. The gene no longer rides the nerve in the view.

## 8. Transfer and transports

| Means | Distance | Rule |
|---|---|---|
| Membrane | contact | port built into the edge of each building |
| Belt | inside the factory | item by item |
| Vein and pump | between neighboring factories | high rate of a single matter, in pulses |
| Worm and nest station | long distance | one gene per wagon, one station pocket per hold |

Worms follow pheromone trails with branches and priorities. They leave full, empty or on a timer.

Example worms:

- Carrier: Motor + Hold + Hold
- Armored: Motor + Hold + Shell + Sting
- Nurse: Motor + Care + Scent

Prototype rules:

- Deposit: 1 base per second near the core, 2 at mid distance, 4 at the edge of the landing square, then 4 to 8 by level of distance, for a MK1 harvester. Stage 2 opens x2, stage 3 everything above.
- Vein: 16 items per second of a single matter, under everything, 24 cells at most between two pumps. The last pump empties on its four sides.
- Wounded, a vein drops to 7 per second and attracts nearby creatures until it breaks.
- Trail (Piste): one exit per cell, under everything, as a loop. Branches and priorities remain to be built.
- Pocket (Poche): against the trail, loads or empties, 120 items of a single matter, 16 per second.
- Worm (Ver): 3 holds of 40, 12 cells per second, 5 seconds of incubation, 20 ADN plus 10 per existing worm. It stops when its first hold faces the last pocket of a row. Departure automatic, full or empty, or after 5 seconds. Creatures bite it and it repairs out of combat.
- Measured rate for two stations 48 cells apart: 9.4 per second with one worm, 18.4 with two, 27.4 with three.
- Sorter, bridge with settable direction and red or green gate complete the belts.

## 9. Buildings and recipes

Each building is an incubated strand, in a number of copies to balance. Starting kit: the core, harvesters, belts, a ligase, an assembler and an incubator.

### Age 1: prime

| Building | Role | Genes |
|---|---|---|
| Harvester | draws from a deposit | Mouth + Root |
| Belt | moves items | Motor |
| Bridge | passes one belt over another | Motor + Hold |
| Sorter | separates by pattern | Mouth + Hold + Motor |
| Cyst | stores, buffers | Hold + Root |
| Ligase | binds three bases into a gene | Mouth + Motor |
| Assembler | binds up to four genes into a strand | Mouth + Mouth + Motor |
| Inverter | reverses a strand | Motor + Motor |
| Incubator | gives life to a strand | Root + Hold + Mouth |

### Age 2: defend

| Building | Role | Genes |
|---|---|---|
| Enzyme | cuts between two bases | Blade + Mouth |
| Template | writes the opposite strand, consuming bases | Shell + Mouth + Motor |
| Polymerase | copies, consuming bases | Root + Root + Motor + Mouth |
| Wall | blocks, absorbs hits | Shell + Shell |
| Turret | fires the genes delivered | Sting + Motor + Mouth |
| Grinder | turns bodies back into bases | Blade + Blade + Motor |

### Age 3: expand

| Building | Role | Genes |
|---|---|---|
| Pump | pushes in pulses | Pulse + Mouth |
| Vein | links two factories | Pulse + Hold |
| Trail | guides worms | Scent + Root |
| Nest station | loads and empties worms | Scent + Hold + Mouth + Root |
| Sentinel | announces distant assaults earlier | Eye + Scent |
| Care nest | repairs around itself | Care + Pulse |

### Age 4: master

| Building | Role | Genes |
|---|---|---|
| Sequencer | reveals unknown genes | Memory + Eye + Mouth |
| Mutagen | changes a base at random | Mutation + Acid + Mouth |
| Spitter | area antidote | Acid + Instinct + Mouth |
| Huntress | guided-fire turret | Eye + Command + Sting + Motor |
| Brain | copies a factory blueprint | Memory + Command + Instinct |
| Gene bank | engraves prestige genes | Memory + Hold + Shell |

## 10. Threat and defense

- **Breaches sleep** while nothing is built or drawn inside their circle. Each guards a rich deposit and shows its weak gene and creature count.
- **Levels**: every 160 cells from the core, up to level 5 at 640: 70 to 260 creatures, 1 to 3 times as tough, guarding x4 to x8. Carbon far out goes from x2 to x6, unguarded.
- **Fog**: the core sees 56 cells, a structure 18, a drone at work or a worm 8. What was seen stays, dimmed, as last seen, without creatures. A nest shows once ground in sight reaches its circle, so none wakes unseen. Its edge is a soft dark mist that breathes, never drawn lines.
- **Few nests**: six on the landing square, a single one, to the north, within 30 cells of the core. Two x2 deposits are free, the other rich ones are guarded. Beyond, nests stand at least 30 cells apart, about one in 70 cells each way.
- Once awake, a breach sends prowlers and assaults. **A nest has health and must be destroyed** (2026-11-23):
  3000 hit points times its level's toughness (400 fell to two fed turrets in 4 s, before a creature came out). A turret with no creature in range shoots the nest, with the same
  damage rule against the nest's family gene. Left 8 s without a hit, a nest heals 2 % of its health a second. Its
  emptied wave comes back 60 s after the last creature dies, as long as it stands. **Destroyed, it fades**, returns
  the ground and pays its creatures in ADN.
- Creatures are thrown out of the nest and land 2 to 5 cells away, in an arc of 0.7 s; they neither walk nor can be
  shot while flying.
- Defense is prepared at the edge of the circle, then the player expands: each advance needs its outpost and its supply.
- The threat rises with woken or emptied breaches and with production.
- **A creature targets the nearest turret when that is closer than the core.**
- **Walls and turrets cost ADN**, so an empty turret is no longer a free decoy. Prototype scale: 80 ADN at the start, turret 20 plus 10 per existing turret (the first is given), wall 5 plus 1 every five. Dismantling refunds in proportion to hit points, rebuilding costs half. A gene delivered to the core or a creature killed earns 1 ADN, an emptied breach pays its creatures. Logistics stay free in the prototype until strand costs exist.
- Three kinds of assault are considered: hive awakening hits an outpost, migration cuts lines, mutation creates a new family one base away from an old one.
- An assault shows its weak gene before it arrives.
- Each creature has **a single weak gene**, so three bases to counter. The gene fired is compared with its exact opposite, position by position: 3, 2, 1 or 0 correct bases deal **12, 5, 2 or 1 damage**. The player is never blocked.
- **No family reads the same backwards**, at the start or after mutation: the order of ligase inputs always matters.
- Three turrets take the same genes and share one rising price:

| Turret | Range | Volleys per second | Genes per volley | Damage | Hit points | Price |
|---|---|---|---|---|---|---|
| Tourelle | 6.8 | 3 | 1 | ×1 | 180 | 20 + 10 per turret |
| Dard | 13 | 1 | 1 | ×2 | 120 | 40 + 10 per turret |
| Gueule | 4 | 2.5 | 2 | ×1 | 260 | 30 + 10 per turret |

- A turret fires at everything by default. In economy mode it only fires with 2 or more correct bases and moves on to a target it can counter.
- A mutation **adds** a family. The old ones stay: a line built still serves, and the factory grows.
- The number of families per region is capped, to allow durable lines prioritized during assaults. The prototype starts with 3 and caps at 6, to tune.
- Creatures inherit the genes you produce most. The dead are recycled into bases and genes.
- Open question: once every woken breach is emptied, the player is at peace until the next expansion. To confirm by playing.

## 11. Map and zoom

The landing square, 96 cells wide, is the same in every game. Around it the world is generated on demand from the save's seed, by sectors of 32 cells: only the seed and the breaches that woke are saved. Deposits grow with the distance, and so do their breaches, in numbers and in strength.
A deposit is a patch: a main blot and two or three splashes, always with room for a large harvester, a bare cell from the next one, and inside its nest's circle when it has one.

A breach out there attacks the outpost that woke it, then the nearest thing still standing once that outpost is razed. Drones cruise faster over long distances, so a flight takes 4 seconds at most.

Near the core, simple deposits and little danger. Farther, raw genes to cut. Very far, mutant biomes, rare genes and hives that eat the map.

The camera keeps its angle and pans and zooms freely:

1. close up, bases and machines;
2. in the middle, each factory becomes a block with its inputs and outputs;
3. from afar, the network is an organism, with its failures in red.

What is off screen is computed as rates and convoy schedules. This is also what makes offline play possible.

## 12. Progression

### The core is hungry

Producing has a purpose: feeding the core to grow the organism. Breaches guard what comes next.

| Prototype stage | The core demands | Unlocks |
|---|---|---|
| 1. Cell (Cellule) | 100 Motor (SFS), loose | three-way splitter, sorter, Encapsulator |
| 2. Tissue (Tissu) | capsules of Shell (CCF): 2 genes per second, held for 60 seconds | veins, nerves, ×2 deposits, assembler |
| 3. Organ (Organe) | 10 capsules of 6 Motor + Hold strands (SFSFFF) | trails, pockets, worms, ×4 deposits |
| 4. System (Système, 2026-11-23) | 30 magazines (6 genes, 1 carbon) of the antidote of the family born on entering | the Separator, a mutation every 5 minutes, up to 8 families |
| 5. Nucleus (Noyau, 2026-11-23) | 6 heavy capsules (12 Motor + Hold strands, 2 carbon, 1 isotope) | isotope, heavy capsule, the Recycler, the Deligase, a fourth drone; swarming next |

- A stage gives 100 ADN (40 before item_018) and restores the core's hit points.
- **Economy (Decided, 2026-11-24, item_018)**: a deposit feeds at most 3 harvesters (a large one counts as one);
  past them a harvester's line is shared with a splitter or ranked up. What the core does not ask for pays a sixth
  of a gene a gene, half of what it paid before, and producers and stores rank up at one and a half times their
  former prices. The figures are first values, to tune by playing.
  The base genes the core eats are its food and pay nothing; a stage pays 100. A reference game to stage 4
  (tests/sim/reference-game.test.ts) holds about 600 DNA at a reasonable pace, 826 at a slow one, under the
  1,000 decided.
- **ADN (2026-11-23)**: what the core demands moves the stage and pays no ADN. What it does not demand pays a third
  of a gene a gene (a strand two thirds, a capsule two). Kills pay 1, an emptied breach pays its creatures, a stage 40.
  Before, every gene paid 1 whatever it was, so income grew without bound with production and prices never held.
  The performance graph shows ADN a minute by source, to tune these figures by playing.
- A dip in rate at stage 2 loses the time it lasted, never the whole minute.
- **Room and recipes (Decided, 2026-11-24, item_020)**: a 16 x 16 square round the core is free of deposits and
  nests in new games. A recipe takes at most three input lines, this game's base genes counting as one line each:
  the heavy capsule holds one base gene, and the family born at stage 4 is the one a base gene answers, so its
  antidote magazines are magazines of that base gene.
- **A mechanic a stage (Decided, 2026-11-24, item_019)**: besides its recipes, stage 2 asks for 30 items sorted aside,
  stage 3 for 30 items passed or sorted under a nerve, stage 4 for 10 creatures killed by their antidote, stage 5 for
  two minutes of a harvester held within a nest's reach.
- **Threat with the base (Decided, 2026-11-24, item_016)**: from stage 3, a base of more than 20 machines wakes the
  nest nearest the core on its own, one more every 10 machines, 3 minutes apart at least. Every rich deposit lies in
  a kept nest's reach; a destroyed nest pays its creatures in DNA and frees its ground.
- **Hunger (Decided, 2026-11-24)**: in a game with drawn base genes, the core eats them continuously. While one it
  eats has not arrived in the last 30 seconds, stage deliveries count half, not nothing.
- The prototype assembler has two inputs: gene 1 on the left, gene 2 on the right.
- **Taking apart (2026-11-24)**: the Deligase is the Ligase run backwards, a gene in behind, base 1 out on the left,
  2 ahead, 3 on the right; the Separator is the Assembler run backwards, a strand in behind, gene 1 out on the
  left, gene 2 on the right. Both turn, take ranks and mirror their sides.
- **Recycler (2026-11-24)**: one per game, from stage 6. Its tractor beam pulls the nearest corpse within 4 cells
  and analyses it: half the time it copies the creature's gene, otherwise it gives carbon. The Laboratory raises the
  copy (65 %, 80 %, always) and the reach (6, 8, 10 cells).
- Proposed next: the System and Organism stages, organs to place and feed, and creatures invented by writing their genes.

### Carbon and containers

Carbon is matter, not a base: it has no pair and never enters a gene. One free deposit lies east of the core, more lie unguarded in the open world.

The Encapsulator takes six identical loose items from behind and carbon on one side, and the player picks its recipe:

| Container | Recipe | Use |
|---|---|---|
| Magazine (Chargeur) | 1 carbon, 6 genes | 6 shots in one belt item, a turret holds 24 |
| Tech capsule (Capsule) | 2 carbons, 6 genes or strands | what the core demands from stage 2 on |

- Loose genes still load a turret: loose reacts fast to a new antidote, magazines carry throughput.
- Containers are used up. Carbon is never a building price, which would be a second currency to get stuck on.
- Filters, smart gates and smart sorters read what a magazine holds.

### Rhythms

- Minutes: tune rates, multiply lines, copy with the polymerase.
- Days: take regions, discover genes, copy whole factories.
- Prestige: the station dies, and a few engraved genes are born with the next one, in a new world.

## 13. What we corrected

| Problem found | Proposed correction |
|---|---|
| 5 of the first 8 opposites needed nerve, absent from the ground | All four bases from the start |
| A strand of 12 bases needed 11 two-input ligases | Three-input ligase, four-input assembler |
| A factory was useless once built | Ammunition, research and worm upkeep |
| Automatic routing and filters everywhere killed the puzzle | Cell-by-cell drawing, bridges, sorters |
| A 12-base antidote was unreadable | A single three-base weak gene per creature |

## 14. Risks and prototypes

1. **Grid, flow and antidote**: four deposits, belts, ligases, a turret and a rising threat. To learn: is it readable by finger, and is changing recipe a pleasure or a chore?
2. **Distant logistics**: two factories, a worm and off-screen rate computation. This is the biggest technical risk.
3. **3D dressing**: only once the first two are fun in simple shapes. To measure: readability and frame rate on a phone.

### What the first play test taught

- An 11 × 14 grid is far too small: the prototype moved to 96 × 96, with pan and zoom.
- Deposits against the core and packed machines make wiring unreadable: first deposits at least 10 cells away, machines spaced at the start.
- The player must see the antidote and stock for the creatures present, not only for the next assault.
- A covered deposit must stay visible.
- Redrawing a destroyed line is a chore: a button rebuilds it identically.

Open questions: building costs in strands, research pace, the penalty when the core falls, the balance of gene inheritance by creatures, and the business model.

### Ranks of splitters, sorters, transformers and defences (2026-11-22)

| Piece | MK2 / MK3 cost (ADN) | What a rank gives |
|---|---|---|
| Splitter 2 and 3 | 2 / 6 | Passes at most 4, 8 or 12 a second, whatever the rails |
| Sorter | 3 / 8 | Same cap as a splitter |
| Ligase, Assembler | 15 / 40 | Makes 1, 2 or 3 objects a second |
| Packer | 30 / 80 | Makes 1, 2 or 3 containers a second |
| Turret, Sting, Maw | 20/50, 40/100, 30/75 | Fires 1, 1.5 or 2 times as often, holds 1, 1.5 or 2 times the health |
| Wall | 5 / 15 | Holds 1, 2 or 3 times the health |

Bridges and gates keep the pace of their rails. Splitters and sorters of a game saved before these ranks take the
rank of their rails, free, so no line slows down. A turret's shots now keep their pace exactly: the time a step
overshoots counts toward the next shot.

### Isotope and the heavy capsule (2026-11-23)

- Isotope (I) is matter like carbon, never a base. From level 3 (320 cells out) half the carbon rows are isotope.
  Harvesters stand on it before stage 5 but only work it from stage 5 on.
- The Encapsulator's third recipe, Capsule lourde: 12 strands or genes behind, 2 carbon and 1 isotope on the side.
  The side takes exactly what the recipe needs.
- Entering stage 5 hatches a fourth drone.

## 15. Languages

The game opens in English and asks for its language on first opening, keeps it in the browser, and changes it from the menu
(**Langue** / **Language**). A change saves the game in progress and reopens it in the other language.

The French text in the code is the key: `L('…')`, or a template tagged `L`, gives it in the chosen
language (`src/sim/text.ts`), and the `EN` table in `prototype/en.js` holds the English line of every key. The markup
is written in French and translated on load. `tests/prototype/language.test.mjs` fails on a key with no
English line, or on French left on screen in English. The rule tests run in French.

| French | English |
|---|---|
| ADN | DNA |
| Spore, Fibre, Chitine, Nerf | Spore, Fiber, Chitin, Nerve |
| Gène, brin, base | Gene, strand, base |
| Cœur, brèche, nid | Core, breach, nest |
| Tapis, Feu, Pont, Diviseur, Trieur | Belt, Gate, Bridge, Splitter, Sorter |
| Récolteur, Grand récolteur | Harvester, Large harvester |
| Ligase, Assembleur, Encapsuleur | Ligase, Assembler, Encapsulator |
| Déligase, Séparateur, Recycleur | Deligase, Separator, Recycler |
| Kyste, Grand kyste | Cyst, Large cyst |
| Veine, pompe, Piste, Poche, Ver, soute | Vein, pump, Trail, Pocket, Worm, hold |
| Nerf (outil), Pylône radar | Nerve, Radar pylon |
| Tourelle, Dard, Gueule, Mur | Turret, Sting, Maw, Wall |
| Chargeur, Capsule, Capsule lourde | Magazine, Capsule, Heavy capsule |
| Carbone, Isotope | Carbon, Isotope |
| Cellule, Tissu, Organe, Système, Noyau | Cell, Tissue, Organ, System, Nucleus |
| Récolter, Acheminer, Transformer, Défendre, Commander | Harvest, Convey, Transform, Defend, Command |
| Démonter, Inspecter, Reconstruire | Dismantle, Inspect, Rebuild |
