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
