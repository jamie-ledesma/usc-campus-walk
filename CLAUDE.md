# USC Campus Walk

A single-file, keyboard-only, first-person three.js (r128) walking tour of USC's
University Park Campus and Exposition Park. Jamie built it to show family around campus.
Published as a claude.ai artifact, and this repo deploys to Vercel as a static site
(Vercel serves the root `index.html`; there is no build step on Vercel).

## Build

- `./build.sh` concatenates the sources into `game.html` (git-ignored) (three.js from cdnjs) and
  `test.html` (uses `three.local.js`, no network):
  `a_world.js a2_coliseum.js a2b_assoc.js a2c_rose.js a2d_nhm.js a2e_sci.js a2f_courts.js a2g_metro.js a2h_fence.js a2i_halls.js a2n_dmc.js a2k_alumni.js a2l_road.js a2p_pardee.js a2m_hahn.js a2j_bounds.js a2o_lewis.js a2q_widney.js a2r_tcc.js a2s_union.js a2t_hammock.js a2u_galen.js a2v_leavey.js a2x_bovard.js a2w_felix.js a2y_shrine.js a2z_shrinesite.js a2za_rawlinson.js a2zb_hancock.js a3_landscape.js a4_city.js a4b_skyline.js b_play.js b2_band.js e_crowd.js c_main.js d_loop.js`
  wrapped in `head.html` + `world.txt` (the map data, in a `<script type="text/plain">`).
- `d_loop.js` is always a copy of `d_loop.rel.js` (release). `d_loop.dev.js` adds debug
  hooks (`window.__cam`, `window.__lock`, `window.__dbg`). Edit BOTH when changing the loop.
- `./builddev.sh` builds `testdev.html` with the dev loop, then rebuilds the release files.
- `python3 make_deploy.py` turns `game.html` into the root `index.html` (adds doctype/head/body).
  Commit `index.html` after every change so the Vercel site updates.
- Release check: `grep -c __dbg game.html` must be 0.

## Visual testing

`node snap.js <prefix> testdev.html` loads the page in headless Chromium (SwiftShader),
clicks Play, and for each `[name,x,y,z,tx,ty,tz]` in `shots.json` puts the camera at x,y,z
looking at tx,ty,tz and saves `snap/<prefix>_<name>.png`. Needs `npm i playwright` and a
Chromium (`npx playwright install chromium`). SwiftShader is slow: allow ~1-2 min per shot
around the rose garden. Chromium occasionally crashes ("Target crashed"); just rerun.

## Coordinates and data

- Metres. +x east, +z south, y up. Tommy Trojan is near the origin. The campus street grid
  is rotated about 27.6 degrees from true north.
- `world.txt` sections: `##L` labels, `##C` USC buildings (`style+height|name|tower|ring`),
  `##B` city buildings, `##R` roads, `##P` paths, `##A` areas, `##W` water, `##N` points,
  `##S` stadia, `##G` parks. Rings are an absolute first point then deltas.
- Buildings in `CUSTOM[name]` (in `a_world.js`) get hand-built geometry; others use style rules.
- Shared helpers in `a_world.js`: `prism`, `band`, `flat`, `archFace`, `hipRoof`,
  `sqWindows`, `archedWindows`, `bayFacade`, `lombardBand`, `wallFacing`, `wallKit`,
  `faceToward`, `facadeText`, `segBox`, `oriBox`, `addCollider`, `Mesher`.
- Tree placement: `TREE_POS` entries `[x,z,kind,species,scale]`; exclusions via `NO_PLANT`,
  `NO_LAWN_TREES`. Trees are built in `a3_landscape.js`.
- Code runs inside a strict-mode IIFE: functions declared inside blocks are block-scoped,
  so use `var f=function(){}` inside loops/ifs.

## Notable hand-built places

- Coliseum (`a2_coliseum.js`): sunken bowl, peristyle, torch, Court of Honor.
- Associates Park (`a2b_assoc.js`).
- Exposition Park Rose Garden (`a2c_rose.js`): bed grid, central walk, fountain plaza.
  `ROSE` is set in `a_world.js`, which also strips the garden's OSM fountain and paths.
- Natural History Museum (`a2d_nhm.js`): 1913 brick building with the rotunda dome facing
  east down the Rose Garden, Otis Booth Pavilion (glass, fin whale) on the north, cream wings
  under red tile, the white south front (name, loggia, steps) facing the lawn walk and the
  Coliseum, NHM Commons in glass at the south-west. `NHM` and `NHM_ANNEX` are set in
  `a_world.js`, which skips them in the city pass and keeps props off them via `NO_PLANT`.
- California Science Center (`a2e_sci.js`): salmon tile walls with pixel patterns, the 1912
  State Exposition Building brick front facing the Rose Garden (jet on a pylon, cafe), green
  glass south front, glass prism, the red steel rotunda on columns over the entrance terrace
  and steps, the IMAX block, the Samuel Oschin Air and Space Center steel tower on the west
  side (opens Nov 13, 2026), and the California African American Museum. `SCI` is set in
  `a_world.js`; the plaza stops at Exposition Park Drive, which runs just south of it.
- `a2f_courts.js`: McCarthy Quad is open lawn with no trees (MCQ_RING); the Fertitta Hall
  courtyard (FERT_COURT, set in `a_world.js`) is paved outdoor seating with tables and umbrellas.
- Metro E Line (`a2g_metro.js`): tracks in the Exposition Blvd median (EXPO in `a_world.js`, which
  also pulls the carriageways apart and cuts a hole in the ground grid for the trench), the
  Expo Park/USC station at Trousdale with a parked 3-car train, and the trench and portal
  that take the line under Figueroa.
- Surrounding city (`a4_city.js`): procedural South LA outside the OSM rectangle (LG): a true
  north grid south of Exposition and west of Vermont, a 28 degree grid north toward downtown,
  houses, apartments, shops and billboards, warehouses east, taller buildings near downtown,
  trees, palms, parked cars, the 110 and 10 freeways. Meshes are chunked and cast no shadows.
- Downtown skyline and San Gabriels (`a4b_skyline.js`): real tower positions from lat/lon,
  drawn as a backdrop scaled about the eye each frame (BOOST 1.7 makes it read larger than
  life); the mountains and a haze ring ride on a ring round the eye.
- `a2i_halls.js`: Grace Ford Salvatori Hall (walk-under brick arcade, glass behind, thin white
  roof slab on ribs) and Michelson Hall (pointed tracery windows, corner pavilions, date palm
  planter on the east front). `HAND_HALLS` in `a_world.js` empties their CUSTOM entries.
  TREE_POS kind 3 is always a Canary date palm.
- `a2o_lewis.js`: Ralph and Goldy Lewis Hall (Price School). Footprint in `world.txt` redrawn from OSM way 406923981
  (the old ring had a thin strip running south across the walk). Three storey brick block on the grid under tile hip
  roofs, raised lantern of arched windows, projecting centre block on the north (Childs Way) front with the cast stone
  entrance pavilion, balcony with cypress, bollards, brick walk with a concrete centre. In `HAND_HALLS`; the generic
  frontage hedge skips it.
- `a2q_widney.js`: Widney Alumni House (1880), the white Italianate wood house at the north end of Pardee Way, facing
  grid south down the drive. Footprint redrawn from OSM way 154906712 (16.7 x 16.8 m; the old ring also took in the
  roof strip behind it). Clapboard as shadow lines, corner boards, pilasters, 2-over-2 sash windows, bracketed cornice,
  pediment with lunette, low hip roof with dormers and a balustraded deck, ALUMNI HOUSE entablature, brick stoop with
  iron rails, brick planter wall with shrubs, bench and plaque. Whites are lifted x1.14 so the paint reads white.
  In `HAND_HALLS`; the generic frontage hedge skips it. Its stoop and planter stop about 3.5 m in front of the wall.
- `a2r_tcc.js`: the Ronald Tutor Campus Center courtyard between TCC (grid west), the Student Union (grid east) and
  Sample Hall (grid south end), opening grid north onto the walk through a row of bollards. `TCC` in `a_world.js` (Hahn
  grid frame, u east, v south) holds the paved ring and the apron in front of the mouth and the Student Union; it cuts
  the OSM walks there and adds hidden crowd walks, replaces `PLAZAS[1]`, skips the old terrace umbrellas, the frontage
  hedge on the three buildings, the TCC and Sample Hall CUSTOM courtyard fronts and Sample Hall's balustrade. a2r draws
  blue-gray paving with granite bands, instanced tables, chairs, umbrellas, bollards and planters, the grand stair with
  bronze lattice rails and the fountain (gold niche, arcing jets) on the TCC side, seating terraces on the Student Union
  side, and facade skins on TCC's courtyard front, its block at the mouth and Sample Hall's end (arches, marble columns,
  names, balconettes, pergola, cupola).
- `a2s_union.js`: the Gwynn Wilson Student Union (1928), in `HAND_HALLS`. Footprint redrawn from OSM relation 6095474
  (outer way 406923992, about 37 x 37 m; the old ring had a notch on the south side). Main front east on Trousdale
  and Hahn Plaza, north front on the walk, west side on the TCC courtyard. East and north: banded cream and brick ground
  storey of round arched windows over basement lights, corbel tables, paired windows in cast stone surrounds, diaper
  panels (canvas texture), paired round headed windows, cornice, attic of small lights, corner pavilions with pilasters,
  centre bay (east: arched entrance with steps, traceried balcony, carved panel). Courtyard side: plain brick with cast
  stone trimmed windows, tall chimney stack, the arched doorway (pierced tympanum, carved jambs, alternating voussoirs,
  lanterns, bronze letters) up a stair between cheek walls with fluted lamp posts; a2r's terraces stop either side of
  it (s 12.65..17.85 on a2r's `SU` frame). Low tile hip roof with finials round a flat crown with the light court.
- `a2k_alumni.js`: Alumni Park in front of Doheny, laid out on the library's axis (local u along
  the front, v out into the park): limestone steps, rose brick walk, round brick plaza with a two-tier
  fountain in a ring of red roses, boxwood hedges framing the lawns, the raised SC bed (red and yellow
  flowers, letters in hedge, readable facing the library), lamps, white benches, shade trees and four
  Canary palms. `ALUM` in `a_world.js` clears the OSM fountain and walks there and adds the new walks
  to `PATHS` with `hide:1` (crowd and minimap use them; the concrete walkway and furniture passes skip
  them). The fountain itself is built in the fountain pass in `a_world.js` so its jets are instanced.
- `a2m_hahn.js`: Hahn Central Plaza in front of Tommy Trojan, on the campus grid (`HAHN` in
  `a_world.js`: origin at Tommy, u east, v south; it is also `PLAZAS[0]`, follows the OSM pedestrian
  area pushed out round Traveler's bed, and hides that area's outline way). Buff brick field, red
  bands on a 5.4 m grid of squares centred on Tommy, a red X in each square (the diagonals run on
  as long lines), darker border, all flat quads in one ground mesh with the fountain and Traveler's
  bed cut out. Tommy stands on three gray granite steps (`HAHN.baseH`), turned to the grid and facing
  the plaza; three lamps on brick pedestals with cream caps. NO_PLANT keeps props and trees off it.
- `a2l_road.js`: Childs Way, the gated campus street from the corner of Alumni Park along Doheny's south
  side to the square-paved plaza where Pardee Way turns south between Lewis Hall (Price) and Popovich Hall.
  Pale concrete with brick cross bands, brick bays of nose-in parking on both sides between tree planters,
  instanced parked cars (colliders), simple low brown fences along both edges at the OSM lift gate and at
  the plaza, bollards on the plaza's east side. `CHILDS` in `a_world.js` removes the old OSM walk and adds a
  hidden crowd path; a2l pushes the street into `ROADS` (minimap) after the ground pass so no asphalt is drawn.
- `a2p_pardee.js`: the Pardee Way entrance off Exposition and Pardee Way up to Childs Way (Childs Way frame,
  `PARDEE` in `a_world.js`, which drops the OSM fountain, the U drive roads and the centre walk, adds hidden crowd
  walks, and keeps props off the paving). Herringbone brick forecourt (one canvas texture, uv on the grid), the
  U drive round the 125th Anniversary Fountain (U plan: cream back wall between brick piers, bronze medallion
  spouts, stepped tiers), the gate line between VPD and Popovich (brick piers with cast stone caps and USC seals,
  black iron gates standing open, iron railings, a tile-roofed brick pavilion against VPD), the brick loggia of
  iron-filled arches along Popovich's Exposition side, the attendant booth on its island with stop sign and
  bollards, the concrete drive with brick edges, hedges, trees, lamps and the rill along Popovich, and the
  Robert M. Widney statue in front of Widney Alumni House (the generic `Joe Widney` point is dropped). The fence
  (`a2h_fence.js`) detours round the forecourt and leaves the gate line and the loggia to a2p (`GATES` `own:1`).
- `a2j_bounds.js`: the invisible wall (`BOUNDS`, from Jamie's map: a block north of the Village,
  just east of the 110, below the Coliseum at 40th Pl, a block west of Vermont). `boundsClamp(P)` runs
  each frame in `update()` and slides the player along it; flying is capped at 240 m. Nothing is
  drawn in 3D; the minimap shows it as a dashed red line. Dev hook `window.__step(dt,n)` runs the
  game loop without rendering, for movement tests.
- `b2_band.js`: plays `usc_fight_song.mp3` (Jamie's recording, next to the page) twice in a row
  when the walk starts, then stops. Decoded into Web Audio so volume works on phones; ducks on pause,
  suspends with the tab hidden. B or the note button turns it off, or plays it twice more. `MUSIC_VOL`
  sets the level (0.11 since v29, half the earlier 0.22). The mp3 must ship beside index.html (and as a supporting file of the artifact).
- `a2n_dmc.js`: Dr. Joseph Medicine Crow Center (DMC; formerly Von KleinSmid), a square doughnut from
  OSM's multipolygon (open courtyard about 31.6 x 17 m in the hole of the white roof): podium and low
  steps all round, sunken round amphitheatre, glass ground storey under a white balcony with rail and
  flags, piers and round arches on all four courtyard sides, the 51 m tower with its lattice globe in
  the courtyard's north west corner, fins on N/W/E, the flagged arcade on the south front. Walk in
  through the south arcade, the west front or the east front. Its CUSTOM entry in `a_world.js` is a stub.
- `a2t_hammock.js`: Hammock Hill, the lawn (OSM way 221557193, `HHILL` in `a_world.js`) between the walk on McCarthy
  Quad's east side and the walk in front of the McCarthy Way Parking Structure. Frame s along the walks (grid south),
  t across (grid east). A smooth mound (2.1 m crest, fades to zero about 1 m short of both walks) drawn as its own
  heightfield mesh in the lawn colour (`HHILL.sh`); `hillAt(x,z)` gives its height and the loop uses it for the player
  (snaps down the slope too). Two rows of 12 multi-stemmed trees on the crest with bare earth rings, four hammocks
  across the rows with students, backpacks, students sitting on the slope, a paved pad with a metal table and stool.
  The old random trees are cleared from the patch; `HHILL_PAD` keeps the benches off it. The crowd does not walk on it.
- `a2u_galen.js`: Galen Center, the arena on the south east corner of Figueroa and Jefferson (OSM way 406923895, 29.8 m).
  In `HAND_HALLS`; its old raked bowl line in `world.txt` `##S` is gone. Campus grid frame (u east, v south). A buff
  concrete box (27 m) striped with brick courses over a brick base storey, stepped roof boxes to about 32 m, the lower
  practice pavilion at the south end. West front on Figueroa: brick piers and tall windows, the glazed 3400 entrance bay,
  banded cast stone base, GALEN CENTER entablature, sidewalk trees and banner lamps. North front on Jefferson: brick
  pavilion of six tall glazed bays under its own GALEN CENTER band, brick piers with red gates and hedges, fan palms.
  South west: the student entrance stair (walkable, steel rails) to a raised brick-walled plaza with palms and trees.
  TREE_POS kind 4 is always a Mexican fan palm; `TREE_POS[i][5]` lifts a tree onto a raised plaza (a3_landscape.js).
- `a2v_leavey.js`: Thomas and Dorothy Leavey Library (1994), in `HAND_HALLS`; `LEAVEY` in `a_world.js` holds the frame
  (origin on the south wall, u grid east, v grid south toward McCarthy Quad), the plaza ring (NO_PLANT) and the pool, whose
  OSM water the fountain pass skips. Footprint from OSM way 406923908. Four storey block under a low gabled tile roof
  (eave 18.6 m, red box on the ridge to 25.2), lower two storey west wing with a pediment, round stair tower on the north.
  Banding on every wall: stone ground storey with brick courses, brick fields with thin stone stripes, stone string courses,
  grouped windows with stone mullions, frieze of brick lozenges. South front: pale stone tower bay with stacked canted bay
  windows, LEAVEY LIBRARY and a pediment with a lunette, gabled porch on banded piers over steps; raised terrace (y 0.9,
  red umbrellas, steps at both ends) behind long planters under a white steel pergola on banded piers with vines, a shorter
  pergola west of the steps; reflecting pool (blue tile and Greek key border in one canvas texture, raised white coping,
  no jets); red brick basketweave plaza (canvas texture) under the walks; twin globe lamps.
- `a2x_bovard.js`: George Finley Bovard Administration Building and Auditorium (1921), in `HAND_HALLS`. Footprint in `world.txt`
  redrawn from OSM way 406923885, shifted like Tommy Trojan. `BOVARD` in `a_world.js` (Hahn frame, tower axis at v=-35.25) keeps
  props off the forecourt and front lawns (NO_PLANT) and adds a hidden crowd walk to the steps. Three storey front range (eave 12.5)
  facing grid east: brick ground arches (wood doors or windows), cast stone belt, paired round headed windows in cream surrounds,
  pairs of small arched lights, corbel table, tile hip roof. End ranges (eave 14.8) with projecting pavilions, square windows below
  and an arcade on colonnettes on top. Auditorium behind under a gabled tile roof with rose windows in both gables; lower blocks
  between. Tower (cornice 31.8, pyramid roof to 35.7): engaged shafts near every corner, the four order cast stone portal with
  colonnettes and dark wood doors up steps, bronze plaque, paired lights under a relieving arch, the two light window with the
  seal (canvas texture) on all four faces, belfry of five arches on twisted colonnettes, eight white statues on the shaft
  capitals, corbel table, modillion cornice. Forecourt of pale panels in red brick bands between clipped hedges, topiary cones
  and lamps on the step cheeks, magnolias and sycamores on the lawns.
- `a2w_felix.js`: Allyson Felix Field in Katherine B. Loker Track Stadium (Cromwell Field until 2023) and its entry plaza at
  Watt Way and Childs Way, north of Grace Ford Salvatori Hall. `FELIXP` in `a_world.js` (grid frame P(u,v); sign frame Q(s,t)
  with S the sign centre and n out of its face toward the plaza) holds the plaza and bed rings and the track (`TR`, `trackRing`),
  cuts the walks that cross the plaza (hidden there) and drops the OSM grandstand block. Track centre and outline match OSM ways
  140790303 / 442277339 (slightly compressed); eight lanes and a 100 x 53 yd infield per USC Recreational Sports. Striped turf
  with SC at midfield, red west end for the jumps, javelin runway and sand sector east. Grandstand on the north straight wrapping
  the north west bend (bench rows, cream front wall, brick back wall, press box); four light masts; black iron picket fence
  (canvas texture) on brick piers with cast stone caps, a brick wall stretch south east of the sign. Plaza: pale squares in a red
  brick diagonal lattice (canvas texture), low cast stone bench wall arc with urn planters, twin globe lamp on a brick pier,
  interpretive sign, hedges, planted bed, magnolias, and the sign: buff cast stone frame on brick piers, red ALLYSON FELIX FIELD
  letters, LED screen (canvas texture). The old Felix block in the athletics section only registers the SPORT_PLACES label.
- `a2y_shrine.js`: Shrine Auditorium (1926, Moorish Revival), across Jefferson from campus, in `HAND_HALLS`. Footprint in `world.txt`
  redrawn from OSM ways 407613039 and 407613027 (the exhibition wing's north west block), shifted like the rest (about -3.5, +4.0).
  Frame: grid u east, v south, origin (301,-269); Jefferson wall v -1, Royal St wall u -3.2 between the dome pavilions (v -26.7..-80.5).
  Pale pink stucco: two storey Jefferson wing (12.6 m) with paired arched windows and three arched doorways; Royal St front block
  (cornice 22.7) with five horseshoe arches (carved surrounds, colonnettes, stained glass lattice as a canvas texture, green doors,
  ENTRANCE), carved frieze, a row of pointed windows on colonnettes, heavy cornice; dome pavilions at both ends of the Royal front
  (slit windows, stepped bases, drums with arched windows, gold onion domes, crescent finials); crenellated auditorium box (28.6 m)
  under a shallow ribbed patchy dome (35.6) with vents and the SHRINE sign at its north end; small domed tower on the south east
  corner; flag pole; lower exhibition wing (16.5) to the north. Paves a 3 m band along the Jefferson and Royal St walls only.
- `a2z_shrinesite.js`: the grounds round the Shrine Auditorium across Jefferson (the building is `a2y_shrine.js`). `SHRS` in
  `a_world.js` (grid frame: origin at the building's south west corner (302,-268), u grid east, v grid south) holds the promenade and
  car park rings, hides the walks there (crowd keeps them), drops the OSM car park aisles, keeps props off (NO_PLANT) and moves
  Jefferson's north carriageway 3 m south in front of the building (taper u -120..130). Royal Street promenade (u -24.2 to 3 m off
  the west wall, Jefferson to v -180): rose and tan diamond paving (canvas texture), double row of tall date palms (u -19.5, -11.5;
  `TREE_POS[i][4]` on kind 3 now stretches the trunk), slim lamp posts, planters, green barricades. Green picket fence with two open
  gates to the surface car park (u -65..-24.6): asphalt, white stalls, two aisles, instanced cars, lot lights; brick piers and
  pickets on Jefferson, open at the driveways. Corner: white statue on a cast stone pedestal, twin lantern lamps, signals, yellow
  crosswalks, palms along the Jefferson sidewalk.
- `a2za_rawlinson.js`: Rawlinson Stadium (formerly McAlister Field), USC soccer and lacrosse. `RAWL` in `a_world.js` (grid frame,
  origin at the pitch centre, u grid east along the touchlines, v grid south to the stand) moves the parking lane behind the stand to
  v 53, drops the shed at the north west corner and gives the `NO_PLANT` zone; the athletics block only registers the label. Striped
  turf (u -60..60, v -37.5..35.6), lines for a 104 x 62 m pitch, SC at midfield, goals with nets (one textured mesh), corner flags.
  Grandstand on the south touchline (u -33..33): red front wall, 14 rows with maroon seats in seven sections, red tower at the west end,
  red block at the east end, press box of dark glass with red end caps under a white roof slab, RAWLINSON STADIUM fascia (unlit canvas plane so it reads in shade), roof terrace
  with rail and red umbrellas; brick back with cast stone arches, band, windows and cap. Cast stone gateway with open iron gates at the
  south east corner (u 37..45), picket fence (canvas texture) on a brick kerb with piers, four light masts, team benches, scoreboard.
  The match: 22 players, a referee and about 170 seated fans built like the students (six instanced meshes, kit tinted per instance;
  slots 0..10 USC in cardinal and gold, 11..21 blue, 22 referee, then fans). Simple AI: formation shape that shifts with the ball, the
  nearest player chases, dribble, pass with a lane check, shoot inside 30 m, keeper saves, tackles, throw ins, goal kicks, goal
  celebration (USC goals make the fans stand and cheer), kickoff. The scoreboard canvas is redrawn only on a goal. `updateSoccer(dt)` runs
  from `update()` in both loops, only while the camera is within 320 m (otherwise the meshes are hidden); too cheap to separate from the rest of the loop (a whole `__step` is about 0.18 ms beside the stadium, 0.23 ms at Tommy). Only the
  23 player matrices are uploaded each frame (`instanceMatrix.updateRange`), the fans only while they cheer. Dev: `window.__rawl.state()`.
- `a2zb_hancock.js`: Allan Hancock Foundation Building (1940) on Trousdale behind Traveler, in `HAND_HALLS`. Footprint in `world.txt`
  squared up from the old OSM ring (same extents, decimals). `HANC` in `a_world.js` (grid frame: origin at the north west corner, u grid
  east, v grid south; west wing u 0..14.5, v 0..47.3, east wing u 14.5..40.9, v 12.6..35, entrance at v=VC on the west front) adds the
  walk from the steps to Trousdale and keeps props off the front lawn (NO_PLANT). Three storeys and an attic: brick piers between bays,
  wider corner piers, a ground storey of pale cast stone striped with brick courses (one repeating canvas texture), a stone band with a
  row of brick squares, stone sills and heads across each bay, paired steel windows, carved plaques in the attic (sea creatures and the
  Velero III), stone coping. Entrance: Moderne cast stone pavilion (piers with fluted stepped tops, grille, two wood doors under chevron
  hoods, bronze plaque), three strips of windows above with stone spandrels in stone frames, steps between cheek walls with urns of
  flowers. Hedges along the base, magnolias and a sycamore on the lawn, penthouse and vent stack on the roof. The east end meets Newman
  Recital Hall and the museum and is plain. Four draw calls (world, ground, stone texture, one atlas for windows, plaques, grille,
  doors, hoods); about 10k triangles (`window.__hancock`).
- Doheny Memorial Library, Taper Hall, Zumberge Hall, Fertitta Hall in `a_world.js` CUSTOM.

## Crowd (`e_crowd.js`)

- Walk graph: every `PATHS` walk at least 1.6 m wide, hidden crowd walks included, inside the campus box.
  Points within 1.6 m merge, crossings split both walks, a walk ending within reach of another joins it
  (T junction). Edges are dropped where `fenceCuts` says they cross the perimeter fence, where they pass
  through a building (collider over 2.5 m), and at points inside anything over 0.9 m (beds, basins). Each
  half edge stores how far each side of the centreline is clear (walk width, less colliders over 0.3 m).
  Only the largest connected network is used. CSR typed arrays in `CG`.
- Destinations (`DEST`): up to three doors per named campus building (walk points within 9 m of the
  footprint), landmarks from `NAMED_PLACES`, gathering points in each of `PLAZAS`, benches (`BENCHES`,
  exported by the props pass in `a_world.js`), and the Expo/USC station. Weights are scaled by `hot(x,z)`
  (Hahn Plaza, TCC, the Village, the station, points along Trousdale; the far edges count half).
- Trips: pick a weighted destination near a random preferred trip length, route with a next-hop table per
  destination node (Dijkstra, built on first use and cached, about 250 tables). On arrival: go in at a door
  (shrink into the wall, reappear later at a weighted random door or the station), sit on a free bench seat,
  stand facing the landmark or in a little circle if in a group, or carry straight on.
- Walking: each student has a lane (fraction of the clear width, mostly keep right, drifting slowly), a
  speed (strollers to hurried) with small variation, steers at a capped turn rate toward a look-ahead point
  that rounds onto the next edge, so corners are cut. Groups of 2-3 (about a third of people) follow a
  leader side by side on wide walks, single file on narrow ones.
- Avoidance only within 130 m of the camera: a 4096-bucket spatial hash rebuilt each frame; separation,
  oncoming people step aside (both to their right when head on), slower people ahead are overtaken or
  followed, the player counts as a person. A student with no progress for 8 s is put back on the walk.
- Cost: no per-frame allocation. Matrices every frame near the camera, every 3rd frame further out (6th on
  ladder rung 3+), none past the fog. Measured about 0.3 ms per update for 1000 students in headless
  Chromium, against about 0.4 ms for the old line-walking crowd.
- Dev hooks (dev loop only): `window.__crowd()` returns `CROWD_DEV` (students, destinations, graph, counters);
  `window.__crowdTick(dt,n)` runs the crowd n steps and returns ms per step.

## Touch and performance

- Touch (`c_main.js`, markup and CSS in `head.html`): `body.touch` is set for coarse pointers or on
  the first touch. Left thumb is a floating stick feeding `touchMove` (analogue), right thumb drags
  to look, buttons: RUN, FLY, up/down while flying, NEXT STOP, pause, tap the map to zoom.
- Frame-rate ladder (`d_loop.*.js`, `QT`/`applyQ`/`quality`): under 27 fps for 2.5 s steps down one
  rung (pixel ratio, shadow size, then city cars/trees via `CITY_LOD`, fog distance). Never steps up.
  Touch devices start on rung 1. `cullFar` hides world and city chunks beyond the fog.
- Dev hooks: `window.__q(n)` sets a rung, `window.__cull()` reports visible chunks, `window.__noq=1`
  freezes the ladder (snap.js sets it so screenshots stay at full quality).

## Title screen

- The start screen is transparent over the live scene. `attract()` in `d_loop.*.js` flies the camera
  through the `ATT` list (from, to, look from, look to, seconds) with a fade (`#afade`) between
  shots, and keeps the crowd, culling and sun running. `begin()` resets the camera. Enter starts.
- Title type is Libre Caslon Text Bold (OFL), embedded as base64 in `head.html` as 'USC Caslon'.
- Dev hook: `window.__attract(i,t)` pins shot i at time t for screenshots; no args unpins.

## Perimeter fence

- `a2h_fence.js`: black steel picket fence (2.15 m) round campus on Vermont, Jefferson, Figueroa
  and Exposition. Jamie asked for this in v24, replacing his earlier request for no fence.
  `RING` is the line, `GATES` the pedestrian entrances from USC's entrance map (brick piers
  and bollards; `own:1` entries are drawn by their own file, e.g. Pardee Way in `a2p_pardee.js`). Other driveways crossing the line get an opening with a barrier arm; buildings on
  the line replace the fence. Pickets are a canvas texture on one quad per span; posts are geometry.
- `FENCE_RUNS` (solid stretches) and `fenceCuts()` are used by `e_crowd.js` so students only cross
  at entrances, and by the minimap in `c_main.js`.

## Jamie's standing requests (do not undo)

- Walkways: simple gray concrete with a brick edge. No street trees on walkways, no bikes,
  no tilework, no brick plaza overlay. Exception (Jamie asked for it): Hahn Central Plaza in front of
  Tommy Trojan gets its real brick pattern (`a2m_hahn.js`). Leave walkways elsewhere as they are.
- Traveler statue stays at (20,61).
- Keep the perimeter fence with gaps only at the marked entrances.
- No trees in McCarthy Quad or the Fertitta Hall courtyard. Exception (Jamie asked for it): Hammock Hill's two rows
  of trees (`a2t_hammock.js`). The rest of the quad stays open lawn.
- Use current building names (DMC, not VKC).
- Writing style for anything he reads: no em dashes, concise and plain, honest evaluation
  rather than praise.

## Publishing

The live artifact is https://claude.ai/artifact/Jd3u1kv8vcGABwVjfZZHCz (version 28 as of
this handoff). Publishing there needs the Artifact tool from a Claude session. From
Claude Code, rebuild `index.html` and push to GitHub; Vercel redeploys from `main`.
