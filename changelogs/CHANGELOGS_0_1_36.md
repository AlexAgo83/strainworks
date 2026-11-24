# Strainworks 0.1.36

Release date: 2026-11-24.

## New buildings

- Recycler (stage 6, one per game): its tractor beam pulls the nearest corpse within 4 cells and analyses it.
  Half the time it copies the creature's gene, otherwise it gives carbon K, out of its front.
- Laboratory: Replication raises the Recycler's copy to 65 %, 80 %, then always; Suction takes its beam to 6, 8 and
  10 cells.
- Deligase (stage 6): the Ligase run backwards, a gene in behind, base 1 out on the left, 2 ahead, 3 on the right.
- Separator (stage 5): the Assembler run backwards, a strand in behind, gene 1 out on the left, gene 2 on the right.
- Both turn, take MK2 and MK3 and swap their left and right outputs.

## Nerves

- Cysts and large cysts join a nerve and report their level against a threshold set on them.
- A wired gate opens on a condition: the gene asked, a threat, no threat, low stock, full stock, threat AND low stock,
  or threat OR low stock.
- Console (stage 3): sets the network's priority: the most numerous, the nearest, each in turn, or a gene by hand.
- Every wired piece can read its network in words: sources, demand, priority, stores and listeners.
- The gene no longer rides along the nerve.

## Developer

- Buy every Laboratory upgrade at once, and +100 DNA.

## Defences

- The glue holds the nine cells round it, its own included: whatever walks there slows and burns, not only what
  crosses it.
