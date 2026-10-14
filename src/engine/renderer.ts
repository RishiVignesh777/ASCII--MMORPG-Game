import {
  Direction,
  DIRECTION_NAMES,
  DIRECTION_ARROWS,
  DIRECTION_OFFSETS,
  DungeonMap,
  Monster,
  Player,
  TileType,
  VisualFxType,
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

export function renderFirstPersonView(
  player: Player,
  map: DungeonMap,
  floorNumber: number,
  activeFx: VisualFxType = 'none'
): ViewportResult {
  const { x: px, y: py, facing, torchFuel } = player;
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

  // Inspect tiles at Distances 1, 2, 3
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

  // Side tiles at distance 1
  const d1LeftTile = getTile(d1X + leftDx, d1Y + leftDy);
  const d1RightTile = getTile(d1X + rightDx, d1Y + rightDy);

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

  // VISIBILITY LOGIC BASED ON TORCH LEVEL (0 to 5):
  // Torch Out (0): Pitch black except for adjacent touch tiles
  if (torchFuel === 0) {
    if (d1Tile === 'wall') {
      for (let r = 0; r < 10; r++) {
        addInnerRow('██████████████████████████████', 1);
      }
    } else if (d1Tile === 'door_closed') {
      addInnerRow('                              ', 4);
      addInnerRow('                              ', 4);
      addInnerRow('        +------------+        ', 1);
      addInnerRow('        | [ | + | ]  |        ', 1);
      addInnerRow('        |    (o)     |        ', 1);
      addInnerRow('        | [ | + | ]  |        ', 1);
      addInnerRow('        +------------+        ', 1);
      addInnerRow('                              ', 4);
      addInnerRow('                              ', 4);
      addInnerRow('                              ', 4);
    } else if (d1Monster) {
      addInnerRow('                              ', 4);
      addInnerRow('                              ', 4);
      addInnerRow('         [   EYES   ]         ', 1);
      addInnerRow('         ( * )  ( * )         ', 1);
      addInnerRow('          \\   vv   /          ', 1);
      addInnerRow('           \\======/           ', 1);
      addInnerRow('                              ', 4);
      addInnerRow('                              ', 4);
      addInnerRow('                              ', 4);
      addInnerRow('                              ', 4);
    } else {
      // Pitch black abyss
      for (let r = 0; r < 10; r++) {
        addInnerRow('                              ', 4);
      }
    }
  }
  // CASE 1: CLOSE WALL DIRECTLY AHEAD (Distance 1 - Foreground / Touch: # or █)
  else if (d1Tile === 'wall') {
    for (let r = 0; r < 10; r++) {
      addInnerRow('##############################', 1);
    }
  }
  // CASE 2: CLOSED DOOR AT DISTANCE 1 (Detailed Sprite: [ | + | ])
  else if (d1Tile === 'door_closed') {
    addInnerRow('######+------------------+######', 1);
    addInnerRow('######|    [ | + | ]     |######', 1);
    addInnerRow('######|      |   |       |######', 1);
    addInnerRow('######|      |   |       |######', 1);
    addInnerRow('######|     [ (o) ]      |######', 1);
    addInnerRow('######|      |   |       |######', 1);
    addInnerRow('######|      |   |       |######', 1);
    addInnerRow('######|      |   |       |######', 1);
    addInnerRow('######|    [ | + | ]     |######', 1);
    addInnerRow('######+------------------+######', 1);
  }
  // CASE 3: MERCHANT NPC AT DISTANCE 1 (Friendly Shopkeeper S)
  else if (d1Tile === 'merchant') {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 1);
    addInnerRow('   |       [ SHOPKEEPER ]   |   ', 1);
    addInnerRow('   |         /######\\       |   ', 1);
    addInnerRow('   |        | (o  o) |      |   ', 1);
    addInnerRow('   |        |  \\__/  |      |   ', 1);
    addInnerRow('   |        /| [$$] |\\      |   ', 1);
    addInnerRow('   |       /_|======|_\\     |   ', 1);
    addInnerRow('  /==========================\\  ', 1);
    addInnerRow(' /                            \\ ', 1);
  }
  // CASE 4: BOSS MONSTER AT DISTANCE 1 (Detailed 5x5 Boss Sprite)
  else if (d1Monster && d1Monster.isBoss) {
    addInnerRow(' \\          /\\____/\\          / ', 1);
    addInnerRow('  \\        /  \\  /  \\        /  ', 1);
    addInnerRow('   \\      |  (O) (O) |      /   ', 1);
    addInnerRow('    |     |   <___>  |     |    ', 1);
    addInnerRow('    |      \\  ==V== /      |    ', 1);
    addInnerRow('    |      /| |   | |\\     |    ', 1);
    addInnerRow('    |     / | |===| | \\    |    ', 1);
    addInnerRow('   /      |/  || ||  \\|     \\   ', 1);
    addInnerRow('  /           || ||          \\  ', 1);
    addInnerRow(' /            ^^ ^^           \\ ', 1);
  }
  // CASE 5: REGULAR MONSTER AT DISTANCE 1
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
  // CASE 6: CHEST AT DISTANCE 1 (Detailed Sprite: [ ( $ ) ])
  else if (d1Chest && !d1Chest.opened) {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 1);
    addInnerRow('   |                        |   ', 1);
    addInnerRow('   |       +--------+       |   ', 1);
    addInnerRow('   |       |[ ( $ ) ]|      |   ', 1);
    addInnerRow('   |       || [ o ]||       |   ', 1);
    addInnerRow('   |       +--------+       |   ', 1);
    addInnerRow('   |                        |   ', 1);
    addInnerRow('  /==========================\\  ', 1);
    addInnerRow(' /                            \\ ', 1);
  }
  // CASE 7: FOUNTAIN AT DISTANCE 1
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
  // CASE 8: STAIRS DOWN AT DISTANCE 1
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
  // CASE 9: NEAR WALL AT DISTANCE 2
  else if (d2Tile === 'wall') {
    const hasLeftOpening = d1LeftTile !== 'wall';
    const hasRightOpening = d1RightTile !== 'wall';

    if (hasLeftOpening && !hasRightOpening) {
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
  // CASE 10: OBJECT / MONSTER AT DISTANCE 2
  else if (d2Monster) {
    const sym = d2Monster.symbol.toLowerCase();
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 2);
    addInnerRow('   \\                        /   ', 2);
    addInnerRow(`    |       [  /${sym}\\  ]      |    `, 2);
    addInnerRow('    |       /  ..  \\       |    ', 2);
    addInnerRow('    |       \\  ==  /       |    ', 2);
    addInnerRow('    |        | || |        |    ', 2);
    addInnerRow('   /                        \\   ', 2);
    addInnerRow('  /==========================\\  ', 2);
    addInnerRow(' /                            \\ ', 1);
  } else if (d2Tile === 'door_closed') {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 2);
    addInnerRow('   \\     [ | + | ]          /   ', 2);
    addInnerRow('    |     |  | |  |        |    ', 2);
    addInnerRow('    |     |  |(o) |        |    ', 2);
    addInnerRow('    |     |  | |  |        |    ', 2);
    addInnerRow('    |     [ | + | ]        |    ', 2);
    addInnerRow('   /                        \\   ', 2);
    addInnerRow('  /==========================\\  ', 2);
    addInnerRow(' /                            \\ ', 1);
  } else if (d2Chest && !d2Chest.opened) {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 2);
    addInnerRow('   \\                        /   ', 2);
    addInnerRow('    |      [ ( $ ) ]       |    ', 2);
    addInnerRow('    |       |[o ]|         |    ', 2);
    addInnerRow('    |       ======         |    ', 2);
    addInnerRow('    |                      |    ', 2);
    addInnerRow('   /                        \\   ', 2);
    addInnerRow('  /==========================\\  ', 2);
    addInnerRow(' /                            \\ ', 1);
  } else if (d2Tile === 'merchant') {
    addInnerRow(' \\                            / ', 1);
    addInnerRow('  \\==========================/  ', 2);
    addInnerRow('   \\      [ SHOP ]          /   ', 2);
    addInnerRow('    |       /####\\         |    ', 2);
    addInnerRow('    |      |(o  o)|        |    ', 2);
    addInnerRow('    |       [$$$$]         |    ', 2);
    addInnerRow('    |       ======         |    ', 2);
    addInnerRow('   /                        \\   ', 2);
    addInnerRow('  /==========================\\  ', 2);
    addInnerRow(' /                            \\ ', 1);
  }
  // CASE 11: DISTANCE 3 (Mid-Range Wall)
  else if (d3Tile === 'wall') {
    if (torchFuel <= 2) {
      // Low Torch: fades into darkness
      addInnerRow(' \\                            / ', 1);
      addInnerRow('  \\==========================/  ', 2);
      addInnerRow('   \\                        /   ', 2);
      addInnerRow('    |                      |    ', 3);
      addInnerRow('    |                      |    ', 3);
      addInnerRow('    |                      |    ', 3);
      addInnerRow('    |                      |    ', 3);
      addInnerRow('   /                        \\   ', 2);
      addInnerRow('  /==========================\\  ', 2);
      addInnerRow(' /                            \\ ', 1);
    } else {
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
    }
  }
  // CASE 12: OPEN STRAIGHT CORRIDOR
  else {
    if (torchFuel <= 2) {
      addInnerRow(' \\                            / ', 1);
      addInnerRow('  \\==========================/  ', 2);
      addInnerRow('   |                      |   ', 3);
      addInnerRow('   |                      |   ', 3);
      addInnerRow('   |      [     .    ]    |   ', 4);
      addInnerRow('   |      [     .    ]    |   ', 4);
      addInnerRow('   |                      |   ', 3);
      addInnerRow('   |                      |   ', 3);
      addInnerRow('  /==========================\\  ', 2);
      addInnerRow(' /                            \\ ', 1);
    } else {
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
  }

  // APPLY COMBAT & SPELL VISUAL FX DIRECTLY TO 3D VIEWPORT:
  const processedRows = [...innerRows.slice(0, 10)];

  if (activeFx === 'melee_hit') {
    // Slash lines across the target sprite in rows 3, 4, 5
    processedRows[3] = overlayString(processedRows[3], '    /  /  /  /    ', 8);
    processedRows[4] = overlayString(processedRows[4], '   /  /  /  /     ', 7);
    processedRows[5] = overlayString(processedRows[5], '  /  /  /  /      ', 6);
  } else if (activeFx === 'fireball') {
    // Particle explosion centered in view
    processedRows[3] = overlayString(processedRows[3], '   *  *  *  *   ', 7);
    processedRows[4] = overlayString(processedRows[4], '  *  ( 🔥 )  *  ', 7);
    processedRows[5] = overlayString(processedRows[5], '   *  *  *  *   ', 7);
  } else if (activeFx === 'frost') {
    // Frost crystal burst
    processedRows[3] = overlayString(processedRows[3], '   +  *  +  *   ', 7);
    processedRows[4] = overlayString(processedRows[4], '  *  [ ❄ ]  *  ', 7);
    processedRows[5] = overlayString(processedRows[5], '   +  *  +  *   ', 7);
  }

  // Border styling (Damage Taken: red alert frame with '!' warnings!)
  const topBorder =
    activeFx === 'damage_taken'
      ? '!------------------------------!'
      : '+------------------------------+';
  const bottomBorder =
    activeFx === 'damage_taken'
      ? '!------------------------------!'
      : '+------------------------------+';
  const sideChar = activeFx === 'damage_taken' ? '!' : '|';

  const formattedInnerRows = processedRows.map((row) =>
    `${sideChar} ${row} ${sideChar}`.slice(0, 32)
  );

  const viewportLines: string[] = [topBorder, ...formattedInnerRows, bottomBorder];

  // EXPANDED 11x11 TILE RADAR MINI-MAP (Affected by Torch Fuel!)
  const mapRadius = 5;
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
        rowChars.push(`@${DIRECTION_ARROWS[facing]}`);
        rowDepths.push(1);
        continue;
      }

      // Torch Visibility attenuation on Radar:
      if (torchFuel === 0 && dist > 1) {
        rowChars.push(' ');
        rowDepths.push(4);
        continue;
      }
      if (torchFuel <= 2 && dist > 2) {
        rowChars.push(' ');
        rowDepths.push(4);
        continue;
      }

      if (mx < 0 || mx >= map.width || my < 0 || my >= map.height) {
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
          if (monster) rowChars.push(monster.isBoss ? 'B' : monster.symbol.toUpperCase());
          else if (t === 'merchant') rowChars.push('S');
          else if (chest && !chest.opened) rowChars.push('$');
          else if (t === 'wall') rowChars.push('#');
          else if (t === 'door_closed') rowChars.push('+');
          else if (t === 'door_open') rowChars.push('/');
          else if (t === 'stairs_down') rowChars.push('>');
          else if (t === 'fountain') rowChars.push('~');
          else rowChars.push('.');
          rowDepths.push(1);
        } else if (dist <= 4) {
          if (monster) rowChars.push(monster.symbol.toLowerCase());
          else if (t === 'merchant') rowChars.push('S');
          else if (chest && !chest.opened) rowChars.push('$');
          else if (t === 'wall') rowChars.push('=');
          else if (t === 'door_closed') rowChars.push('+');
          else if (t === 'door_open') rowChars.push('/');
          else if (t === 'stairs_down') rowChars.push('>');
          else if (t === 'fountain') rowChars.push('~');
          else rowChars.push('·');
          rowDepths.push(2);
        } else {
          if (monster) rowChars.push('?');
          else if (t === 'merchant') rowChars.push('S');
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
      lineDepths.push(0);
      const rowD = innerDepths[i - 1] || Array(30).fill(1);
      for (let c = 0; c < 30; c++) {
        lineDepths.push(rowD[c] ?? 1);
      }
      lineDepths.push(0);
    }

    lineDepths.push(0, 0);

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

function overlayString(base: string, overlay: string, startPos: number): string {
  const chars = base.split('');
  for (let i = 0; i < overlay.length; i++) {
    const pos = startPos + i;
    if (pos >= 0 && pos < chars.length && overlay[i] !== ' ') {
      chars[pos] = overlay[i];
    }
  }
  return chars.join('');
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
  if (player.torchFuel === 0) {
    return 'Total darkness envelops you as your torch flame sputters out into icy smoke. The cavernous stone walls dissolve into blackness, and unseen scuttling echoes from the unseen subterranean floor. Only close touch and keen instincts guide you.';
  }

  if (d1Monster) {
    if (d1Monster.isBoss) {
      return `The towering ${d1Monster.name} roars in fury, filling your entire widescreen field of view with muscular bulk and curved horns! Hellfire crackles along its dual-bladed axe as cavern tremors shake dust from the ceiling. A battle for survival begins!`;
    }
    return `A snarling ${d1Monster.name} fills your entire field of view, poised to strike at arm's length! Cold subterranean drafts whip across your face as adrenaline surges through your veins. The stench of wet stone and beastly fury hangs heavy in the oppressive gloom.`;
  }

  if (d1Tile === 'merchant') {
    return 'A hooded subterranean shopkeeper sits calmly behind a sturdy ironbound stall illuminated by soft lanternlight. Rows of potion vials, spare torches, and polished steel blades are neatly displayed across velvet cloths. A quiet sanctuary awaits your trade.';
  }

  if (d1Tile === 'door_closed') {
    return 'An imposing heavy wooden door reinforced with blackened iron studs [ | + | ] blocks the widescreen corridor directly ahead. Faint scratching sounds and a damp subterranean chill whisper from beyond the ancient timbers. The expansive stone walls curve away into the torchlit darkness on either side.';
  }

  if (d1Tile === 'door_open') {
    return 'An arched doorway stands wide open before you, framing the deep corridor beyond. Cool subterranean air flows freely through the threshold, stirring cobwebs draped along the high stone ceiling. Echoes of distant water droplets reverberate along the flagstones.';
  }

  if (d1Tile === 'wall') {
    return 'A massive barrier of rough-hewn granite spans the entire 30-column foreground directly before you. Moisture glistens along the deep mortar seams in the warm flicker of your torchlight. The broad corridor forces you to turn your heading left or right.';
  }

  if (d1Chest && !d1Chest.opened) {
    return 'A heavy iron-banded treasure chest [ ( $ ) ] rests solidly upon the stone floor right before your boots. Its brass padlock glistens with ancient polish against the dark flagstones. The surrounding corridor stretches wide and quiet in the subterranean stillness.';
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

  if (player.torchFuel <= 2) {
    return 'Your torch flickers low and frail, casting trembling amber shadows that struggle against the encroaching catacomb darkness. Beyond a few paces, the wide stone corridor vanishes into impenetrable black gloom.';
  }

  return 'A deep, panoramic stone corridor recedes into the oppressive gloom toward a distant vanishing point. Shadows dance along the 30-column masonry as your torchlight flickers in the quiet depths. The 11x11 radar tracks the vast 30x30 floor grid extending all around you.';
}
