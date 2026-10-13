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
  depthGrid: number[][]; // 8 rows of depth levels (0: border/UI, 1: close, 2: mid, 3: far, 4: horizon/dark)
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

  // 16 inner cols, 6 inner rows
  const innerRows: string[] = [];
  // Row depths for each of the 6 inner rows: array of 16 numbers each
  const innerDepths: number[][] = [];

  // Helper to push a row with its depth values
  const addInnerRow = (lineStr: string, depthPattern: number | number[]) => {
    let s = lineStr;
    if (s.length < 16) s = s.padEnd(16, ' ');
    if (s.length > 16) s = s.slice(0, 16);
    innerRows.push(s);

    if (Array.isArray(depthPattern)) {
      const arr = [...depthPattern];
      while (arr.length < 16) arr.push(1);
      innerDepths.push(arr.slice(0, 16));
    } else {
      innerDepths.push(Array(16).fill(depthPattern));
    }
  };

  // Determine what is directly in front
  const monsterInFront = d1Monster;
  const objectInFront = d1Tile;

  // RENDERING LOGIC WITH FOV DEPTH-GRADED ASCII SHADING:
  // CASE 1: CLOSE WALL AT DISTANCE 1 (High contrast dense characters: # or █)
  if (d1Tile === 'wall') {
    for (let r = 0; r < 6; r++) {
      addInnerRow('################', 1);
    }
  }
  // CASE 2: CLOSED DOOR AT DISTANCE 1 (High contrast close door)
  else if (d1Tile === 'door_closed') {
    addInnerRow('###+--------+###', 1);
    addInnerRow('###|  [  ]  |###', 1);
    addInnerRow('###|  |  |  |###', 1);
    addInnerRow('###|  |(o)| |###', 1);
    addInnerRow('###|  |  |  |###', 1);
    addInnerRow('###+--------+###', 1);
  }
  // CASE 3: MONSTER AT DISTANCE 1 (MELEE ENGAGEMENT - Bold uppercase scaled sprite)
  else if (d1Monster) {
    const sym = d1Monster.symbol.toUpperCase();
    addInnerRow(` \\   [ ${sym} ]    / `, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    addInnerRow('  \\  /o  o\\  /  ', 1);
    addInnerRow('   | \\====/ |   ', 1);
    addInnerRow('   | /|  |\\ |   ', 1);
    addInnerRow('  /  | || |  \\  ', 1);
    addInnerRow(' /   |_||_|   \\ ', 1);
  }
  // CASE 4: CHEST AT DISTANCE 1
  else if (d1Chest && !d1Chest.opened) {
    addInnerRow(' \\            / ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1]);
    addInnerRow('  \\==========/  ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow('   | [====] |   ', 1);
    addInnerRow('   | |[ o]| |   ', 1);
    addInnerRow('  /==========\\  ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow(' /            \\ ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1]);
  }
  // CASE 5: FOUNTAIN AT DISTANCE 1
  else if (d1Tile === 'fountain') {
    addInnerRow(' \\            / ', 1);
    addInnerRow('  \\==========/  ', 1);
    addInnerRow('   | (~*~)  |   ', 1);
    addInnerRow('   | (===)  |   ', 1);
    addInnerRow('  /==========\\  ', 1);
    addInnerRow(' /            \\ ', 1);
  }
  // CASE 6: STAIRS DOWN AT DISTANCE 1
  else if (d1Tile === 'stairs_down') {
    addInnerRow(' \\            / ', 1);
    addInnerRow('  \\==========/  ', 1);
    addInnerRow('   | [>>>>] |   ', 1);
    addInnerRow('   |  v  v  |   ', 1);
    addInnerRow('  /==========\\  ', 1);
    addInnerRow(' /            \\ ', 1);
  }
  // CASE 7: MID WALL AT DISTANCE 2 (Medium contrast characters: = or ▒)
  else if (d2Tile === 'wall') {
    const hasLeftOpening = d1LeftTile !== 'wall';
    const hasRightOpening = d1RightTile !== 'wall';

    if (hasLeftOpening && !hasRightOpening) {
      // Corner turning left
      addInnerRow('      \\=======/ ', [2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1]);
      addInnerRow(' <===  \\=====/  ', [2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
      addInnerRow('        |===|   ', [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1]);
      addInnerRow('        |===|   ', [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1]);
      addInnerRow(' <===  /=====\\  ', [2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
      addInnerRow('      /=======\\ ', [2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1]);
    } else if (!hasLeftOpening && hasRightOpening) {
      // Corner turning right
      addInnerRow(' \\=======/      ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2]);
      addInnerRow('  \\=====/  ===> ', [1, 1, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2]);
      addInnerRow('   |===|        ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
      addInnerRow('   |===|        ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
      addInnerRow('  /=====\\  ===> ', [1, 1, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2]);
      addInnerRow(' /=======\\      ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2]);
    } else if (hasLeftOpening && hasRightOpening) {
      // T-junction (open left and right, mid wall ahead)
      addInnerRow(' <==  \\====/ ==> ', 2);
      addInnerRow('       |==|     ', 2);
      addInnerRow('       |==|     ', 2);
      addInnerRow('       |==|     ', 2);
      addInnerRow('       |==|     ', 2);
      addInnerRow(' <==  /====\\ ==> ', 2);
    } else {
      // Dead end corridor at mid distance (Medium contrast = )
      addInnerRow(' \\============/ ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1]);
      addInnerRow('  \\==========/  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
      addInnerRow('   |========|   ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
      addInnerRow('   |========|   ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
      addInnerRow('  /==========\\  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
      addInnerRow(' /============\\ ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1]);
    }
  }
  // CASE 8: MID OBJECT AT DISTANCE 2 (Monster, Door, Chest - Medium contrast)
  else if (d2Monster) {
    // Render scaled down lowercase sprite for mid-distance contrast
    const sym = d2Monster.symbol.toLowerCase();
    addInnerRow(' \\            / ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1]);
    addInnerRow(`  \\   [${sym}]    /  `, [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1]);
    addInnerRow('  |   /| |\\  |  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1]);
    addInnerRow('  |    | |   |  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1]);
    addInnerRow('  /==========\\  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow(' /            \\ ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1]);
  } else if (d2Tile === 'door_closed') {
    addInnerRow(' \\            / ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1]);
    addInnerRow('  \\==[ + ]===/  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow('  |  | | |   |  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow('  |  |===|   |  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow('  /==========\\  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow(' /            \\ ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1]);
  } else if (d2Chest && !d2Chest.opened) {
    addInnerRow(' \\            / ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1]);
    addInnerRow('  \\===[$]====/  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow('  |   |o|    |  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow('  |  =====   |  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow('  /==========\\  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow(' /            \\ ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1]);
  } else if (d2Tile === 'stairs_down') {
    addInnerRow(' \\            / ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1]);
    addInnerRow('  \\==[ > ]===/  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow('  |   >>>    |  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow('  |   >>>    |  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow('  /==========\\  ', [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1]);
    addInnerRow(' /            \\ ', [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1]);
  }
  // CASE 9: DISTANCE 3 (FAR WALL / OBJECT - Low contrast characters: - or ░ or ·)
  else if (d3Tile === 'wall') {
    addInnerRow(' \\            / ', [1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1]);
    addInnerRow('  \\==========/  ', [1, 1, 1, 2, 2, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1]);
    addInnerRow('  |  - - - - |  ', [1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 1, 1]);
    addInnerRow('  |  - - - - |  ', [1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 1, 1]);
    addInnerRow('  /==========\\  ', [1, 1, 1, 2, 2, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1]);
    addInnerRow(' /            \\ ', [1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1]);
  } else if (d3Monster) {
    // Distant monster: faint lowercase dot-bounded symbol
    const sym = d3Monster.symbol.toLowerCase();
    addInnerRow(' \\            / ', [1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1]);
    addInnerRow('  \\==========/  ', [1, 1, 1, 2, 2, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1]);
    addInnerRow(`  |   [·${sym}·]   |  `, [1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 1, 1]);
    addInnerRow('  |   . .    |  ', [1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 1, 1]);
    addInnerRow('  /==========\\  ', [1, 1, 1, 2, 2, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1]);
    addInnerRow(' /            \\ ', [1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1]);
  } else if (d3Tile === 'door_closed') {
    addInnerRow(' \\            / ', [1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1]);
    addInnerRow('  \\==========/  ', [1, 1, 1, 2, 2, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1]);
    addInnerRow('  |   [·]    |  ', [1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 1, 1]);
    addInnerRow('  |   . .    |  ', [1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 1, 1]);
    addInnerRow('  /==========\\  ', [1, 1, 1, 2, 2, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1]);
    addInnerRow(' /            \\ ', [1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1]);
  }
  // CASE 10: OPEN STRAIGHT CORRIDOR (Vanishing point in distance 4 - Faint horizon dots)
  else {
    addInnerRow(' \\            / ', [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 3, 3, 2, 2, 1, 1]);
    addInnerRow('  \\==========/  ', [1, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 1]);
    addInnerRow('  |  - - - - |  ', [1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 1]);
    addInnerRow('  |  . [·] . |  ', [1, 1, 2, 3, 3, 4, 4, 4, 4, 3, 3, 2, 1, 1, 1, 1]);
    addInnerRow('  /==========\\  ', [1, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1, 1, 1]);
    addInnerRow(' /            \\ ', [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 3, 3, 2, 2, 1, 1]);
  }

  // Format the 8 viewport lines
  const formattedInnerRows = innerRows.slice(0, 6).map((row) => `|${row}|`);
  const viewportLines: string[] = [
    '+----------------+',
    ...formattedInnerRows,
    '+----------------+',
  ];

  // OVERHEAD MINI-MAP WITH REAL-TIME FOV DISTANCE ATTENUATION
  // In FOV:
  // - Radius 0 (Player): @^ (Depth 1, high contrast)
  // - Radius 1: Solid wall '#', clear floor '.', uppercase monster 'M' (Depth 1, high contrast)
  // - Radius 2: Mid wall '=', small floor '·', lowercase monster 'm' (Depth 2, medium contrast)
  // - Radius 3: Dim wall '-', dark floor ' ', distant silhouette '?' (Depth 3, low contrast)
  const mapRadius = 2; // 5x5 grid centered on player
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
        // Player position with facing arrow: @^, @>, @v, @<
        rowChars.push(`@${DIRECTION_ARROWS[facing]}`);
        rowDepths.push(1);
      } else if (mx < 0 || mx >= map.width || my < 0 || my >= map.height) {
        // Outer boundaries dimmed by FOV distance
        if (dist === 1) {
          rowChars.push('#');
          rowDepths.push(1);
        } else if (dist === 2) {
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

        if (dist === 1) {
          // CLOSE FOV: High contrast characters
          if (monster) rowChars.push(monster.symbol.toUpperCase());
          else if (chest && !chest.opened) rowChars.push('$');
          else if (t === 'wall') rowChars.push('#');
          else if (t === 'door_closed') rowChars.push('+');
          else if (t === 'door_open') rowChars.push('/');
          else if (t === 'stairs_down') rowChars.push('>');
          else if (t === 'fountain') rowChars.push('~');
          else rowChars.push('.');
          rowDepths.push(1);
        } else if (dist === 2) {
          // MID FOV: Medium contrast characters
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
          // FAR FOV / PERIMETER: Low contrast dimmed characters
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

  // Combine side-by-side & build full character-level depth grid (8 rows)
  const combinedLines: string[] = [];
  const depthGrid: number[][] = [];

  for (let i = 0; i < 8; i++) {
    const vp = viewportLines[i] || '+----------------+';
    const mm = miniMapLines[i] || '';
    const lineStr = `${vp}  ${mm}`;
    combinedLines.push(lineStr);

    const lineDepths: number[] = [];
    // Viewport border row 0 and 7
    if (i === 0 || i === 7) {
      for (let c = 0; c < 18; c++) lineDepths.push(0);
    } else {
      // Inner viewport line: '|' + 16 chars + '|'
      lineDepths.push(0); // '|'
      const rowD = innerDepths[i - 1] || Array(16).fill(1);
      for (let c = 0; c < 16; c++) {
        lineDepths.push(rowD[c] ?? 1);
      }
      lineDepths.push(0); // '|'
    }

    // 2 separator spaces
    lineDepths.push(0, 0);

    // Mini-map part
    if (i >= 1 && i <= 5) {
      const mmRowDepths = miniDepths[i - 1] || [];
      lineDepths.push(0); // leading space
      for (let c = 0; c < mm.length - 1; c++) {
        lineDepths.push(mmRowDepths[c] ?? 2);
      }
    } else {
      for (let c = 0; c < mm.length; c++) {
        lineDepths.push(0);
      }
    }

    depthGrid.push(lineDepths);
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
    return `You spot a ${d2Monster.name} lingering just a few paces ahead in the mid shadows. Echoes of scraping claws and ragged breathing bounce off the stone corridor walls.`;
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
