import {
  Direction,
  DIRECTION_NAMES,
  DIRECTION_ARROWS,
  DIRECTION_OFFSETS,
  DungeonMap,
  Monster,
  Player,
  TileType,
} from '../types';

export interface ViewportResult {
  viewportLines: string[];
  miniMapLines: string[];
  combinedBlock: string;
  description: string;
  facingName: string;
  monsterInFront: Monster | null;
  objectInFront: TileType | null;
}

export function renderFirstPersonView(player: Player, map: DungeonMap, floorNumber: number): ViewportResult {
  const { x: px, y: py, facing } = player;
  const { dx, dy } = DIRECTION_OFFSETS[facing];

  // Vectors for relative coordinates
  // Forward: (dx, dy)
  // Left: (-dy, dx)
  // Right: (dy, -dx)
  const leftDx = -dy;
  const leftDy = dx;
  const rightDx = dy;
  const rightDy = -dx;

  const getTile = (x: number, y: number): TileType => {
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
      return 'wall';
    }
    return map.tiles[y][x];
  };

  const getMonster = (x: number, y: number): Monster | null => {
    return map.monsters.find((m) => m.x === x && m.y === y && m.hp > 0) || null;
  };

  const getChest = (x: number, y: number) => {
    return map.chests.find((c) => c.x === x && c.y === y);
  };

  // Inspect tiles at Distance 1, 2, 3
  const d1X = px + dx;
  const d1Y = py + dy;
  const d1Tile = getTile(d1X, d1Y);
  const d1Monster = getMonster(d1X, d1Y);
  const d1Chest = getChest(d1X, d1Y);

  const d2X = px + dx * 2;
  const d2Y = py + dy * 2;
  const d2Tile = getTile(d2X, d2Y);
  const d2Monster = getMonster(d2X, d2Y);
  const d2Chest = getChest(d2X, d2Y);

  const d3X = px + dx * 3;
  const d3Y = py + dy * 3;
  const d3Tile = getTile(d3X, d3Y);
  const d3Monster = getMonster(d3X, d3Y);
  const d3Chest = getChest(d3X, d3Y);

  // Side tiles at distance 1
  const d1LeftTile = getTile(d1X + leftDx, d1Y + leftDy);
  const d1RightTile = getTile(d1X + rightDx, d1Y + rightDy);

  // Side tiles adjacent to player (distance 0)
  const adjLeftTile = getTile(px + leftDx, py + leftDy);
  const adjRightTile = getTile(px + rightDx, py + rightDy);

  // 16 inner cols, 6 inner rows
  const innerRows: string[] = [];

  // Determine what is directly in front
  const monsterInFront = d1Monster;
  const objectInFront = d1Tile;

  // RENDERING LOGIC:
  // CASE 1: CLOSE WALL AT DISTANCE 1
  if (d1Tile === 'wall') {
    // Player is facing a solid barrier right in front of them
    innerRows.push('################');
    innerRows.push('################');
    innerRows.push('################');
    innerRows.push('################');
    innerRows.push('################');
    innerRows.push('################');
  }
  // CASE 2: CLOSED DOOR AT DISTANCE 1
  else if (d1Tile === 'door_closed') {
    innerRows.push('###+--------+###');
    innerRows.push('###|  [  ]  |###');
    innerRows.push('###|  |  |  |###');
    innerRows.push('###|  |(o)| |###');
    innerRows.push('###|  |  |  |###');
    innerRows.push('###+--------+###');
  }
  // CASE 3: MONSTER AT DISTANCE 1 (MELEE ENGAGEMENT)
  else if (d1Monster) {
    const sym = d1Monster.symbol;
    innerRows.push(` \\   [ ${sym} ]    / `);
    innerRows.push('  \\  /o  o\\  /  ');
    innerRows.push('   | \\====/ |   ');
    innerRows.push('   | /|  |\\ |   ');
    innerRows.push('  /  | || |  \\  ');
    innerRows.push(' /   |_||_|   \\ ');
  }
  // CASE 4: CHEST AT DISTANCE 1
  else if (d1Chest && !d1Chest.opened) {
    innerRows.push(' \\            / ');
    innerRows.push('  \\==========/  ');
    innerRows.push('   | [====] |   ');
    innerRows.push('   | |[ o]| |   ');
    innerRows.push('  /==========\\  ');
    innerRows.push(' /            \\ ');
  }
  // CASE 5: FOUNTAIN AT DISTANCE 1
  else if (d1Tile === 'fountain') {
    innerRows.push(' \\            / ');
    innerRows.push('  \\==========/  ');
    innerRows.push('   | (~*~)  |   ');
    innerRows.push('   | (===)  |   ');
    innerRows.push('  /==========\\  ');
    innerRows.push(' /            \\ ');
  }
  // CASE 6: STAIRS DOWN AT DISTANCE 1
  else if (d1Tile === 'stairs_down') {
    innerRows.push(' \\            / ');
    innerRows.push('  \\==========/  ');
    innerRows.push('   | [>>>>] |   ');
    innerRows.push('   |  v  v  |   ');
    innerRows.push('  /==========\\  ');
    innerRows.push(' /            \\ ');
  }
  // CASE 7: MID WALL AT DISTANCE 2 (Wall at 2 steps)
  else if (d2Tile === 'wall') {
    const hasLeftOpening = d1LeftTile !== 'wall';
    const hasRightOpening = d1RightTile !== 'wall';

    if (hasLeftOpening && !hasRightOpening) {
      // Corner turning left
      innerRows.push('      \\=======/ ');
      innerRows.push(' <===  \\=====/  ');
      innerRows.push('        |===|   ');
      innerRows.push('        |===|   ');
      innerRows.push(' <===  /=====\\  ');
      innerRows.push('      /=======\\ ');
    } else if (!hasLeftOpening && hasRightOpening) {
      // Corner turning right
      innerRows.push(' \\=======/      ');
      innerRows.push('  \\=====/  ===> ');
      innerRows.push('   |===|        ');
      innerRows.push('   |===|        ');
      innerRows.push('  /=====\\  ===> ');
      innerRows.push(' /=======\\      ');
    } else if (hasLeftOpening && hasRightOpening) {
      // T-junction (open left and right, wall ahead)
      innerRows.push(' <==  \\====/ ==> ');
      innerRows.push('       |==|     ');
      innerRows.push('       |==|     ');
      innerRows.push('       |==|     ');
      innerRows.push('       |==|     ');
      innerRows.push(' <==  /====\\ ==> ');
    } else {
      // Dead end corridor at mid distance
      innerRows.push(' \\============/ ');
      innerRows.push('  \\==========/  ');
      innerRows.push('   |========|   ');
      innerRows.push('   |========|   ');
      innerRows.push('  /==========\\  ');
      innerRows.push(' /============\\ ');
    }
  }
  // CASE 8: MID OBJECT AT DISTANCE 2 (Door, Monster, Chest)
  else if (d2Monster) {
    const sym = d2Monster.symbol;
    innerRows.push(' \\            / ');
    innerRows.push(`  \\   [${sym}]    /  `);
    innerRows.push('  |   /| |\\  |  ');
    innerRows.push('  |    | |   |  ');
    innerRows.push('  /==========\\  ');
    innerRows.push(' /            \\ ');
  } else if (d2Tile === 'door_closed') {
    innerRows.push(' \\            / ');
    innerRows.push('  \\==[ + ]===/  ');
    innerRows.push('  |  | | |   |  ');
    innerRows.push('  |  |===|   |  ');
    innerRows.push('  /==========\\  ');
    innerRows.push(' /            \\ ');
  } else if (d2Chest && !d2Chest.opened) {
    innerRows.push(' \\            / ');
    innerRows.push('  \\===[$]====/  ');
    innerRows.push('  |   |o|    |  ');
    innerRows.push('  |  =====   |  ');
    innerRows.push('  /==========\\  ');
    innerRows.push(' /            \\ ');
  } else if (d2Tile === 'stairs_down') {
    innerRows.push(' \\            / ');
    innerRows.push('  \\==[ > ]===/  ');
    innerRows.push('  |   >>>    |  ');
    innerRows.push('  |   >>>    |  ');
    innerRows.push('  /==========\\  ');
    innerRows.push(' /            \\ ');
  }
  // CASE 9: DISTANCE 3 (FAR WALL / OBJECT)
  else if (d3Tile === 'wall') {
    innerRows.push(' \\            / ');
    innerRows.push('  \\==========/  ');
    innerRows.push('  |  - - - - |  ');
    innerRows.push('  |  - - - - |  ');
    innerRows.push('  /==========\\  ');
    innerRows.push(' /            \\ ');
  } else if (d3Monster) {
    const sym = d3Monster.symbol;
    innerRows.push(' \\            / ');
    innerRows.push('  \\==========/  ');
    innerRows.push(`  |   [${sym}]   |  `);
    innerRows.push('  |   . .    |  ');
    innerRows.push('  /==========\\  ');
    innerRows.push(' /            \\ ');
  } else if (d3Tile === 'door_closed') {
    innerRows.push(' \\            / ');
    innerRows.push('  \\==========/  ');
    innerRows.push('  |   [+]    |  ');
    innerRows.push('  |   . .    |  ');
    innerRows.push('  /==========\\  ');
    innerRows.push(' /            \\ ');
  }
  // CASE 10: OPEN STRAIGHT CORRIDOR (Vanishing point in center)
  else {
    innerRows.push(' \\            / ');
    innerRows.push('  \\==========/  ');
    innerRows.push('  |  - - - - |  ');
    innerRows.push('  |  . [.] . |  ');
    innerRows.push('  /==========\\  ');
    innerRows.push(' /            \\ ');
  }

  // Ensure exact 16 characters width per row
  const formattedInnerRows = innerRows.slice(0, 6).map((row) => {
    let s = row;
    if (s.length < 16) s = s.padEnd(16, ' ');
    if (s.length > 16) s = s.slice(0, 16);
    return `|${s}|`;
  });

  const viewportLines: string[] = [
    '+----------------+',
    ...formattedInnerRows,
    '+----------------+',
  ];

  // OVERHEAD 7x7 MINI-MAP (or 5x5 / compact)
  // Let's create an authentic overhead 5x5 or 7x7 map with player at center
  // Notice user example:
  // # # # # #
  // # . . . #
  // # . @^. #
  // # # + # #
  //
  // Facing: NORTH
  const mapRadius = 2; // 5x5 grid centered on player
  const miniGrid: string[] = [];

  for (let dyOffset = -mapRadius; dyOffset <= mapRadius; dyOffset++) {
    const rowChars: string[] = [];
    const my = py + dyOffset;

    for (let dxOffset = -mapRadius; dxOffset <= mapRadius; dxOffset++) {
      const mx = px + dxOffset;

      if (dxOffset === 0 && dyOffset === 0) {
        // Player position with facing arrow: @^, @>, @v, @<
        rowChars.push(`@${DIRECTION_ARROWS[facing]}`);
      } else if (mx < 0 || mx >= map.width || my < 0 || my >= map.height) {
        rowChars.push('#');
      } else {
        const monster = getMonster(mx, my);
        const chest = getChest(mx, my);
        const t = map.tiles[my][mx];

        if (monster) {
          rowChars.push(monster.symbol);
        } else if (chest && !chest.opened) {
          rowChars.push('$');
        } else if (t === 'wall') {
          rowChars.push('#');
        } else if (t === 'door_closed') {
          rowChars.push('+');
        } else if (t === 'door_open') {
          rowChars.push('/');
        } else if (t === 'stairs_down') {
          rowChars.push('>');
        } else if (t === 'fountain') {
          rowChars.push('~');
        } else {
          rowChars.push('.');
        }
      }
    }

    // Format row with spacing
    let formattedRow = '';
    for (let i = 0; i < rowChars.length; i++) {
      const ch = rowChars[i];
      if (ch.startsWith('@')) {
        // e.g. @^ is 2 chars, so don't add extra trailing space if not needed
        formattedRow += ch;
      } else {
        formattedRow += ch;
        if (i < rowChars.length - 1 && !rowChars[i + 1]?.startsWith('@')) {
          formattedRow += ' ';
        }
      }
    }
    miniGrid.push(formattedRow);
  }

  // Mini-map lines to align with 8 viewport rows
  const miniMapLines: string[] = [
    ' [MINI-MAP]',
    ` ${miniGrid[0] || '# # # # #'}`,
    ` ${miniGrid[1] || '# . . . #'}`.padEnd(14, ' '),
    ` ${miniGrid[2] || '# . @^. #'}`.padEnd(14, ' '),
    ` ${miniGrid[3] || '# # + # #'}`.padEnd(14, ' '),
    ` ${miniGrid[4] || '# # # # #'}`.padEnd(14, ' '),
    ` Facing: ${DIRECTION_NAMES[facing]}`,
    ` Pos: (${px}, ${py}) Fl: ${floorNumber}`,
  ];

  // Combine side-by-side
  const combinedLines: string[] = [];
  for (let i = 0; i < 8; i++) {
    const vp = viewportLines[i] || '+----------------+';
    const mm = miniMapLines[i] || '';
    combinedLines.push(`${vp}  ${mm}`);
  }

  // Generate atmospheric 2-sentence viewport description
  const description = generateDescription(
    player,
    d1Tile,
    d1Monster,
    d1Chest,
    d2Tile,
    d2Monster,
    d3Tile,
    floorNumber
  );

  return {
    viewportLines,
    miniMapLines,
    combinedBlock: combinedLines.join('\n'),
    description,
    facingName: DIRECTION_NAMES[facing],
    monsterInFront,
    objectInFront,
  };
}

function generateDescription(
  player: Player,
  d1Tile: TileType,
  d1Monster: Monster | null,
  d1Chest: { opened: boolean } | undefined,
  d2Tile: TileType,
  d2Monster: Monster | null,
  d3Tile: TileType,
  floorNumber: number
): string {
  if (d1Monster) {
    return `A snarling ${d1Monster.name} looms right in front of you, weapon drawn and ready to strike! The smell of copper and stale crypt air fills your lungs as combat begins.`;
  }

  if (d1Tile === 'door_closed') {
    return 'A heavy wooden door bound with blackened iron studs blocks the passage directly ahead. Faint cold drafts and scratching sounds whisper from beyond the ancient timber.';
  }

  if (d1Tile === 'door_open') {
    return 'An open doorway reveals the passage beyond, its timber frame marked with chisel notches. Cold stagnant air drafts through the threshold into the corridor.';
  }

  if (d1Tile === 'wall') {
    return 'A solid rough-hewn stone wall stands immediately before you, slick with green dungeon dampness. Your torchlight reflects dimly off the mortar seams, offering no way forward.';
  }

  if (d1Chest && !d1Chest.opened) {
    return 'A reinforced iron-banded treasure chest sits on the flagstones directly in front of you. Its brass padlock glistens in the flickering torchlight, undisturbed by time.';
  }

  if (d1Tile === 'fountain') {
    return 'A tranquil stone basin of crystalline holy water ripples gently before you. A soothing hum vibrates through the masonry, radiating restorative magical energy.';
  }

  if (d1Tile === 'stairs_down') {
    return `A spiral flight of stone steps plunges steeply downward into the suffocating darkness of Floor ${floorNumber + 1}. A distant rumbling echo rises from the subterranean depths below.`;
  }

  if (d2Monster) {
    return `You spot a ${d2Monster.name} lingering just a few paces ahead in the shadows. Echoes of scraping claws and ragged breathing bounce off the stone corridor walls.`;
  }

  if (d2Tile === 'door_closed') {
    return 'The stone passage extends a short distance before terminating at an imposing timber doorway. Distant water drops rhythmically strike the dungeon floor in the silence.';
  }

  if (d2Tile === 'wall') {
    return 'The corridor terminates in a solid stone wall just a few paces ahead, forcing a turn. The damp chill of the subterranean catacombs seeps through your boots.';
  }

  if (d3Tile === 'wall') {
    return 'The dim corridor stretches ahead into the shadows before ending at a far stone barrier. Cobwebs hang motionless from the arched ceiling in the still, stale air.';
  }

  return 'A long, echoing stone corridor recedes into the oppressive gloom toward a distant vanishing point. Shadows dance along the masonry as your torch flickers in the quiet depths.';
}
