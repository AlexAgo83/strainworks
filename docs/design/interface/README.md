# Interface: grafted HUD

Approved on 2026-11-22. The scene takes the whole screen and the interface grows
from its edges: membranes, veins, portholes holding the real models.

`interface.png` shows the seven boards, left to right then down:

1. `Main`: playing, with a selection (petals round the object, linked card)
2. `Construire`: a family open, a piece in hand
3. `Assaut`: hot edges, dry turret, rebuild
4. `Croissance`: a stage reached
5. `Defaite`: the core falls
6. `Mobile`: 390 x 844, thumb bar and low sheet
7. `Inventaire`: the 75 elements, where each one lives and how it moves

The inventory is the checklist of the implementation. Its green rows were
additions and were approved with the rest.

The `.dc.html` files, `hud.css` and `canvas.json` are the sources of the boards.
Their `/_blob/` images live with the canvas, the picture here holds the render.
Figures on the boards are examples, the rules live in `docs/concept.md`.

Changed after approval, on request: ways in and out and position numbers are
hidden at rest. The ghost, the hovered and the selected object show them big,
at one size on screen whatever the zoom. This replaces the inventory row
"Ports et sorties".

## Opening screen

Approved on 2026-11-22. `opening.png` shows boards 8 to 14, `titre.css` is their style.

- `Accueil`: the organic planet on the left under a spherical grid of hexagons, one
  hexagon a game, the orbital station on the right projecting the game picked:
  resume, export, duplicate, erase by a held press.
- `AccueilImport`: an export grafted into a free hexagon. Nothing is written before
  confirmation and no game is ever overwritten.
- `AccueilTombee`: a fallen station keeps its scar, founded again or erased.
- `AccueilMobile`: the planet on top, the projection under the thumb.
- `Reglages`, `ReglagesJeu`: one menu for both. In a game it adds export and the way
  back to the planet.
- `Progression`: a hexagon gets denser with the game, from three arms to a crown of
  outposts.

In the game the planet turns under the finger to reach the other hexagons.
