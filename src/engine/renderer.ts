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
  depthGrid: number[][]; // 12 rows of depth levels
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

  // Inspect tiles at Distances 1, 2, 3, 4
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

  // 30 inner cols, 10 inner rows (plus 2 borders = 12 rows total!)
  const innerRows: string[] = [];
  const innerDepths: number[][] = [];

  const addInnerRow = (lineStr: string, depthPattern: number | number[]) => {
    let s = lineStr;
    if (s.length < 30) s = s.padEnd(30, ' ');
    if (s.length > 30) s = s.slice(0, 30);
    innerRows.push(s);

    if (Array.isArray(depthPattern)) {
      const arr = [...depthPattern];
      while (arr.length < 30) arr.push(1);
      innerDepths.push(arr.slice(0, 30));
    } else {
      innerDepths.push(Array(30).fill(depthPattern));
    }
  };

  const monsterInFront = d1Monster;
  const objectInFront = d1Tile;

  // WIDESCREEN (30 cols x 10 inner rows) RAYCAST RENDERING:
  // CASE 1: CLOSE WALL DIRECTLY AHEAD (Distance 1 - Foreground / Touch: # or █)
  if (d1Tile === 'wall') {
    for (let r = 0; r < 10; r++) {
      addInnerRow('##############################', 1);
    }
  }
  // CASE 2: CLOSED DOOR AT DISTANCE 1 (Foreground / Touch)
  else if (d1Tile === 'door_closed') {
    addInnerRow('######+------------------+######', 1);
    addInnerRow('######|      [  ]        |######', 1);
    addInnerRow('######|      |  |        |######', 1);
    addInnerRow('######|      |  |        |######', 1);
    addInnerRow('######|     [ (o) ]      |######', 1);
    addInnerRow('######|      |  |        |######', 1);
    addInnerRow('######|      |  |        |######', 1);
    addInnerRow('######|      |  |        |######', 1);
    addInnerRow('######|      [  ]        |######', 1);
    addInnerRow('######+------------------+######', 1);
  }
  // CASE 3: MONSTER AT DISTANCE 1 (Foreground Touch Combat - Large multi-character sprite)
  else if (d1Monster) {
    const sym = d1Monster.symbol.toUpperCase();
    addInnerRow(' \\                            / ', 1);
    addInnerRow(`  \\         [  /${sym}\\  ]        /  `, 1);
    addInnerRow('   \\       /  o  o  \\       /   ', 1);
    addInnerRow('    |      \\  ====  /      |    ', 1);
    addInnerRow('    |     /| |    | |\\     |    ', 1);
    addInnerRow('    |    / | |    | | \\    |    ', 1);
    addInnerRow('    |      | |====| |      |    ', 1);
    addInnerRow('   /        | |  | |        \\   ', 1);
    addInnerRow('  /         |_|  |_|         \\  ', 1);
    addInnerRow(' /                            \\ ', 1);
  }
  // CASE 4: CHEST AT DISTANCE 1
  else if (d1Chest && !d1Chest.opened) {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 1);
    addInnerRow('   |                        |   ', 1);
    addInnerRow('   |       +--------+       |   ', 1);
    addInnerRow('   |       |[======]|       |   ', 1);
    addInnerRow('   |       || [ o ]||       |   ', 1);
    addInnerRow('   |       +--------+       |   ', 1);
    addInnerRow('   |                        |   ', 1);
    addInnerRow('  /==========================\\  ', 1);
    addInnerRow(' /                            \\ ', 1);
  }
  // CASE 5: FOUNTAIN AT DISTANCE 1
  else if (d1Tile === 'fountain') {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 1);
    addInnerRow('   |                        |   ', 1);
    addInnerRow('   |       ( ~~~~~~ )       |   ', 1);
    addInnerRow('   |       ( * * *  )       |   ', 1);
    addInnerRow('   |       (========)       |   ', 1);
    addInnerRow('   |       |  ||||  |       |   ', 1);
    addInnerRow('   |                        |   ', 1);
    addInnerRow('  /==========================\\  ', 1);
    addInnerRow(' /                            \\ ', 1);
  }
  // CASE 6: STAIRS DOWN AT DISTANCE 1
  else if (d1Tile === 'stairs_down') {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 1);
    addInnerRow('   |       [>>>>>>>>>]      |   ', 1);
    addInnerRow('   |       | v  v  v |      |   ', 1);
    addInnerRow('   |       |  v  v   |      |   ', 1);
    addInnerRow('   |       |   v     |      |   ', 1);
    addInnerRow('   |       [>>>>>>>>>]      |   ', 1);
    addInnerRow('   |                        |   ', 1);
    addInnerRow('  /==========================\\  ', 1);
    addInnerRow(' /                            \\ ', 1);
  }
  // CASE 7: NEAR WALL AT DISTANCE 2 (Near Wall: = or ▒)
  else if (d2Tile === 'wall') {
    const hasLeftOpening = d1LeftTile !== 'wall';
    const hasRightOpening = d1RightTile !== 'wall';

    if (hasLeftOpening && !hasRightOpening) {
      // Wide corner turning left
      addInnerRow('         \\===================/  ', 2);
      addInnerRow(' <======  \\=================/   ', 2);
      addInnerRow('           |===============|    ', 2);
      addInnerRow('           |===============|    ', 2);
      addInnerRow('           |===============|    ', 2);
      addInnerRow('           |===============|    ', 2);
      addInnerRow('           |===============|    ', 2);
      addInnerRow('           |===============|    ', 2);
      addInnerRow(' <======  /=================\\   ', 2);
      addInnerRow('         /===================\\  ', 2);
    } else if (!hasLeftOpening && hasRightOpening) {
      // Wide corner turning right
      addInnerRow('  \\===================/         ', 2);
      addInnerRow('   \\=================/  ======> ', 2);
      addInnerRow('    |===============|           ', 2);
      addInnerRow('    |===============|           ', 2);
      addInnerRow('    |===============|           ', 2);
      addInnerRow('    |===============|           ', 2);
      addInnerRow('    |===============|           ', 2);
      addInnerRow('    |===============|           ', 2);
      addInnerRow('   /=================\\  ======> ', 2);
      addInnerRow('  /===================\\         ', 2);
    } else if (hasLeftOpening && hasRightOpening) {
      // Wide T-Junction
      addInnerRow(' <====  \\==============/  ====> ', 2);
      addInnerRow('         |============|         ', 2);
      addInnerRow('         |============|         ', 2);
      addInnerRow('         |============|         ', 2);
      addInnerRow('         |============|         ', 2);
      addInnerRow('         |============|         ', 2);
      addInnerRow('         |============|         ', 2);
      addInnerRow('         |============|         ', 2);
      addInnerRow('         |============|         ', 2);
      addInnerRow(' <====  /==============\\  ====> ', 2);
    } else {
      // Dead end corridor at distance 2
      addInnerRow(' \\                            / ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1]);
      addInnerRow('  \\==========================/  ', 2);
      addInnerRow('   \\========================/   ', 2);
      addInnerRow('    |======================|    ', 2);
      addInnerRow('    |======================|    ', 2);
      addInnerRow('    |======================|    ', 2);
      addInnerRow('    |======================|    ', 2);
      addInnerRow('   /========================\\   ', 2);
      addInnerRow('  /==========================\\  ', 2);
      addInnerRow(' /                            \\ ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1]);
    }
  }
  // CASE 8: OBJECT / MONSTER AT DISTANCE 2
  else if (d2Monster) {
    const sym = d2Monster.symbol.toLowerCase();
    addInnerRow(' \\                            / ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1]);
    addInnerRow('  \\==========================/  ', 2);
    addInnerRow('   \\                        /   ', 2);
    addInnerRow(`    |       [  /${sym}\\  ]      |    `, 2);
    addInnerRow('    |       /  ..  \\       |    ', 2);
    addInnerRow('    |       \\  ==  /       |    ', 2);
    addInnerRow('    |        | || |        |    ', 2);
    addInnerRow('   /                        \\   ', 2);
    addInnerRow('  /==========================\\  ', 2);
    addInnerRow(' /                            \\ ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1]);
  } else if (d2Tile === 'door_closed') {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 2);
    addInnerRow('   \\      [  [+]  ]         /   ', 2);
    addInnerRow('    |     |  | |  |        |    ', 2);
    addInnerRow('    |     |  |(o) |        |    ', 2);
    addInnerRow('    |     |  | |  |        |    ', 2);
    addInnerRow('    |     [  [+]  ]        |    ', 2);
    addInnerRow('   /                        \\   ', 2);
    addInnerRow('  /==========================\\  ', 2);
    addInnerRow(' /                            \\ ', 1);
  } else if (d2Chest && !d2Chest.opened) {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 2);
    addInnerRow('   \\                        /   ', 2);
    addInnerRow('    |       [====]         |    ', 2);
    addInnerRow('    |       |[o ]|         |    ', 2);
    addInnerRow('    |       ======         |    ', 2);
    addInnerRow('    |                      |    ', 2);
    addInnerRow('   /                        \\   ', 2);
    addInnerRow('  /==========================\\  ', 2);
    addInnerRow(' /                            \\ ', 1);
  } else if (d2Tile === 'stairs_down') {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 2);
    addInnerRow('   \\     [  [>>>]  ]        /   ', 2);
    addInnerRow('    |       v v v          |    ', 2);
    addInnerRow('    |        v v           |    ', 2);
    addInnerRow('    |         v            |    ', 2);
    addInnerRow('    |     [  [>>>]  ]      |    ', 2);
    addInnerRow('   /                        \\   ', 2);
    addInnerRow('  /==========================\\  ', 2);
    addInnerRow(' /                            \\ ', 1);
  }
  // CASE 9: DISTANCE 3 (Mid-Range Wall: ░ or :)
  else if (d3Tile === 'wall') {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 2);
    addInnerRow('   \\                        /   ', 2);
    addInnerRow('    |  ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ |    ', 3);
    addInnerRow('    |  : : : : : : : : : : |    ', 3);
    addInnerRow('    |  : : : : : : : : : : |    ', 3);
    addInnerRow('    |  ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ |    ', 3);
    addInnerRow('   /                        \\   ', 2);
    addInnerRow('  /==========================\\  ', 2);
    addInnerRow(' /                            \\ ', 1);
  } else if (d3Monster) {
    const sym = d3Monster.symbol.toLowerCase();
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 2);
    addInnerRow('   \\                        /   ', 2);
    addInnerRow('    |  ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ |    ', 3);
    addInnerRow(`    |       [  .${sym}.  ]       |    `, 3);
    addInnerRow('    |         . .          |    ', 3);
    addInnerRow('    |  ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ |    ', 3);
    addInnerRow('   /                        \\   ', 2);
    addInnerRow('  /==========================\\  ', 2);
    addInnerRow(' /                            \\ ', 1);
  } else if (d3Tile === 'door_closed') {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 2);
    addInnerRow('   \\                        /   ', 2);
    addInnerRow('    |  ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ |    ', 3);
    addInnerRow('    |        [ [+] ]       |    ', 3);
    addInnerRow('    |        [     ]       |    ', 3);
    addInnerRow('    |  ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ |    ', 3);
    addInnerRow('   /                        \\   ', 2);
    addInnerRow('  /==========================\\  ', 2);
    addInnerRow(' /                            \\ ', 1);
  }
  // CASE 10: OPEN STRAIGHT CORRIDOR (Deep Vanishing Point Centered: [     .     ])
  else {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 2);
    addInnerRow('   |  ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ |   ', 3);
    addInnerRow('   |  : : : : : : : : : : |   ', 3);
    addInnerRow('   |  - - [     .     ] - |   ', 4);
    addInnerRow('   |  . . [     .     ] . |   ', 4);
    addInnerRow('   |  : : : : : : : : : : |   ', 3);
    addInnerRow('   |  ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ |   ', 3);
    addInnerRow('  /==========================\\  ', 2);
    addInnerRow(' /                            \\ ', 1);
  }

  // Viewport borders (30 inner columns + 2 side bars = 32 chars wide!)
  const formattedInnerRows = innerRows.slice(0, 10).map((row) => `| ${row} |`.slice(0, 32));
  const viewportLines: string[] = [
    '+------------------------------+',
    ...formattedInnerRows,
    '+------------------------------+',
  ];

  // EXPANDED 11x11 TILE RADAR MINI-MAP
  // Centered on player (radius 5 in X and Y)
  const mapRadius = 5; // 11x11 grid centered on player (-5 to +5)
  const miniGrid: string[] = [];
  const miniDepths: number[][] = [];

  for (let dyOffset = -mapRadius; dyOffset <= mapRadius; dyOffset++) {
    const rowChars: string[] = [];
    const rowDepths: number[] = [];
    const my = py + dyOffset;

    for (let dxOffset = -mapRadius; dxOffset <= mapRadius; dxOffset++) {
      const mx = px + dxOffset;
      const dist = Math.max(Math.abs(dxOffset), Math.abs(dyOffset));

      if (dxOffset === 0 && dyOffset === 0) {
        // Player position with direction marker
        rowChars.push(`@${DIRECTION_ARROWS[facing]}`);
        rowDepths.push(1);
      } else if (mx < 0 || mx >= map.width || my < 0 || my >= map.height) {
        // Outer boundaries
        if (dist <= 2) {
          rowChars.push('#');
          rowDepths.push(1);
        } else if (dist <= 4) {
          rowChars.push('=');
          rowDepths.push(2);
        } else {
          rowChars.push('-');
          rowDepths.push(3);
        }
      } else {
        const monster = getMonster(mx, my);
        const chest = getChest(mx, my);
        const t = map.tiles[my][mx];

        if (dist <= 2) {
          // Inner Bright Torchlight
          if (monster) rowChars.push(monster.symbol.toUpperCase());
          else if (chest && !chest.opened) rowChars.push('$');
          else if (t === 'wall') rowChars.push('#');
          else if (t === 'door_closed') rowChars.push('+');
          else if (t === 'door_open') rowChars.push('/');
          else if (t === 'stairs_down') rowChars.push('>');
          else if (t === 'fountain') rowChars.push('~');
          else rowChars.push('.');
          rowDepths.push(1);
        } else if (dist <= 4) {
          // Mid Radar Range
          if (monster) rowChars.push(monster.symbol.toLowerCase());
          else if (chest && !chest.opened) rowChars.push('$');
          else if (t === 'wall') rowChars.push('=');
          else if (t === 'door_closed') rowChars.push('+');
          else if (t === 'door_open') rowChars.push('/');
          else if (t === 'stairs_down') rowChars.push('>');
          else if (t === 'fountain') rowChars.push('~');
          else rowChars.push('·');
          rowDepths.push(2);
        } else {
          // Perimeter Distance
          if (monster) rowChars.push('?');
          else if (chest && !chest.opened) rowChars.push('.');
          else if (t === 'wall') rowChars.push('-');
          else if (t === 'door_closed') rowChars.push('·');
          else if (t === 'door_open') rowChars.push('/');
          else if (t === 'stairs_down') rowChars.push('·');
          else if (t === 'fountain') rowChars.push('·');
          else rowChars.push(' ');
          rowDepths.push(3);
        }
      }
    }

    // Format row with spacing
    let formattedRow = '';
    const formattedDepths: number[] = [];
    for (let i = 0; i < rowChars.length; i++) {
      const ch = rowChars[i];
      const d = rowDepths[i];
      if (ch.startsWith('@')) {
        formattedRow += ch;
        formattedDepths.push(d, d);
      } else {
        formattedRow += ch;
        formattedDepths.push(d);
        if (i < rowChars.length - 1 && !rowChars[i + 1]?.startsWith('@')) {
          formattedRow += ' ';
          formattedDepths.push(d);
        }
      }
    }
    miniGrid.push(formattedRow);
    miniDepths.push(formattedDepths);
  }

  // Mini-map lines to align with the 12 viewport rows:
  // Row 0: Header
  // Rows 1 to 10: Map rows 0 to 9
  // Row 11: Map row 10 + Facing status
  const miniMapLines: string[] = [
    ' [11x11 MINI-MAP]',
    ` ${miniGrid[0]}`,
    ` ${miniGrid[1]}`,
    ` ${miniGrid[2]}`,
    ` ${miniGrid[3]}`,
    ` ${miniGrid[4]}`,
    ` ${miniGrid[5]}`,
    ` ${miniGrid[6]}`,
    ` ${miniGrid[7]}`,
    ` ${miniGrid[8]}`,
    ` ${miniGrid[9]}`,
    ` ${miniGrid[10]}  Facing: ${DIRECTION_NAMES[facing]}`,
  ];

  // Combined side-by-side lines (12 lines total!)
  const combinedLines: string[] = [];
  const depthGrid: number[][] = [];

  for (let i = 0; i < 12; i++) {
    const vp = viewportLines[i] || '+------------------------------+';
    const mm = miniMapLines[i] || '';
    const lineStr = `${vp}  ${mm}`;
    combinedLines.push(lineStr);

    const lineDepths: number[] = [];
    if (i === 0 || i === 11) {
      for (let c = 0; c < 32; c++) lineDepths.push(0);
    } else {
      lineDepths.push(0); // '|'
      const rowD = innerDepths[i - 1] || Array(30).fill(1);
      for (let c = 0; c < 30; c++) {
        lineDepths.push(rowD[c] ?? 1);
      }
      lineDepths.push(0); // '|'
    }

    lineDepths.push(0, 0); // 2 spaces separator

    if (i >= 1 && i <= 11) {
      const mmDepths = miniDepths[i - 1] || [];
      lineDepths.push(0);
      for (let c = 0; c < mm.length - 1; c++) {
        lineDepths.push(mmDepths[c] ?? 2);
      }
    } else {
      for (let c = 0; c < mm.length; c++) lineDepths.push(0);
    }

    depthGrid.push(lineDepths);
  }

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
    depthGrid,
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
    return `A snarling ${d1Monster.name} fills your entire field of view, poised to strike at arm's length! Cold subterranean drafts whip across your face as adrenaline surges through your veins. The stench of wet stone and beastly fury hangs heavy in the oppressive gloom.`;
  }

  if (d1Tile === 'door_closed') {
    return 'An imposing heavy wooden door reinforced with blackened iron studs blocks the widescreen corridor directly ahead. Faint scratching sounds and a damp chill whisper from beyond the ancient timbers. The expansive stone walls curve away into the torchlit darkness on either side.';
  }

  if (d1Tile === 'door_open') {
    return 'An arched doorway stands wide open before you, framing the deep corridor beyond. Cool subterranean air flows freely through the threshold, stirring cobwebs draped along the high stone ceiling. Echoes of distant water droplets reverberate along the flagstones.';
  }

  if (d1Tile === 'wall') {
    return 'A massive barrier of rough-hewn granite spans the entire 30-column foreground directly before you. Moisture glistens along the deep mortar seams in the warm flicker of your torchlight. The broad corridor forces you to turn your heading left or right.';
  }

  if (d1Chest && !d1Chest.opened) {
    return 'A heavy iron-banded treasure chest rests solidly upon the stone floor right before your boots. Its brass padlock glistens with ancient polish against the dark flagstones. The surrounding corridor stretches wide and quiet in the subterranean stillness.';
  }

  if (d1Tile === 'fountain') {
    return 'A wide stone basin brimming with crystalline holy water ripples serenely in the foreground. A radiant celestial hum vibrates through the masonry, illuminating the surrounding stone arches with soothing azure light. The air tastes crisp and rejuvenating.';
  }

  if (d1Tile === 'stairs_down') {
    return `A broad spiral flight of stone steps plunges steeply downward into the dark abyss of Floor ${floorNumber + 1}. A distant, heavy rumble echoes up from the vast subterranean vaults below. The expansive radar map confirms the depths waiting ahead.`;
  }

  if (d2Monster) {
    return `You discern the silhouette of a ${d2Monster.name} lurking a few paces ahead in the near corridor shadows. Ragged breathing and scraping claws bounce off the wide stone masonry. The wide-angle field of view highlights open retreat paths along the corridor flanks.`;
  }

  if (d2Tile === 'door_closed') {
    return 'The wide stone passage extends forward before terminating at an imposing timber gateway. Ambient subterranean drafts whistle through the mortar fissures in the silence. The 11x11 radar indicates branching rooms deeper in the dungeon.';
  }

  if (d2Tile === 'wall') {
    return 'The wide corridor ends at a solid stone barrier just a few paces ahead, opening into crosswise intersections. Shadows dance across the ceiling rafters as your torch flickers. The damp chill of the catacombs seeps through the subterranean floor.';
  }

  if (d3Tile === 'wall') {
    return 'The expansive stone corridor stretches deep into the gloom before culminating at a distant masonry barrier. Ancient cobwebs hang motionless from the high vaulted ceiling in the still air. Your wide radar reveals extensive dungeon terrain surrounding your position.';
  }

  return 'A deep, panoramic stone corridor recedes into the oppressive gloom toward a distant vanishing point. Shadows dance along the 30-column masonry as your torchlight flickers in the quiet depths. The 11x11 radar tracks the vast 30x30 floor grid extending all around you.';
}
