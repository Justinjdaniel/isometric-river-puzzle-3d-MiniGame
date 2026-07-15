// Game layout and visual constants for the 3D Isometric River Crossing Puzzle Game

export const DEVELOPER_MODE = true; // Set to false to lock characters in place for Step 4

export const COLORS = {
  WATER: 0x156289,
  BANK_LAND: 0x5a8f35,      // Vibrant meadow green
  EARTH_DARK: 0x4d3319,     // Dark earthy block sides
  DOCK_WOOD: 0x8b5a2b,      // Rustic wooden docks
  BOAT: 0xcc6600,           // Stylized orange kayak/canoe
  MAN: 0x1a4a6e,            // Blue shepherd robes/hat
  FOX: 0xe65c00,            // Low-poly orange fox
  SHEEP: 0xe6e6e6,          // White sheep wool
  SKY_AMBIENT: 0xbfd2e6,
  SUNLIGHT: 0xfffcf0,       // Warm sunlight
  MOUNTAIN: 0x4a5a54,       // Dark green/grey mountain peaks
  SHADOW: 0x111c24          // Shadow color/dark backdrop
};

export const SPEED = {
  BOAT: 3.0,       // Speed of boat movement (units per second)
  ANIMATION: 5.0   // Loading/unloading animation speed
};

export const POSITIONS = {
  LEFT_BANK: { x: -6.0, y: 0.0, z: 0.0 },
  RIGHT_BANK: { x: 6.0, y: 0.0, z: 0.0 },
  BOAT_DOCK_LEFT: { x: -1.7, y: -0.05, z: 0.0 },  // Placed right next to the left dock
  BOAT_DOCK_RIGHT: { x: 1.7, y: -0.05, z: 0.0 }   // Placed right next to the right dock
};

// Actor starting coordinates on the left bank (or target bank coordinates)
export const ACTOR_START_POSITIONS = {
  man: { x: -4.5, y: 0.0, z: 0.0 },
  fox: { x: -5.5, y: 0.0, z: -2.0 },
  sheep1: { x: -5.5, y: 0.0, z: 2.0 },
  sheep2: { x: -6.5, y: 0.0, z: 0.5 }
};

// Relative offsets on whichever bank they land on
// Note: When they unload on a bank, their target coordinate will be:
// For left bank: ACTOR_START_POSITIONS[actor]
// For right bank: { x: -ACTOR_START_POSITIONS[actor].x, y: 0.0, z: ACTOR_START_POSITIONS[actor].z }
// This perfectly mirrors their positions across the river, keeping the layout symmetrical and elegant!
export function getBankPosition(actor, bank) {
  const start = ACTOR_START_POSITIONS[actor];
  if (bank === 'left') {
    return { x: start.x, y: start.y, z: start.z };
  } else {
    return { x: -start.x, y: start.y, z: start.z }; // Symmetrical mirror
  }
}

// When inside the boat, positions relative to the boat coordinate
export const BOAT_SEATS = {
  seat1: { x: -0.35, y: 0.1, z: 0.0 }, // Front seat
  seat2: { x: 0.35, y: 0.1, z: 0.0 }   // Back seat
};

export const BOUNDS = {
  CHUNK_WIDTH: 16.0,
  CHUNK_DEPTH: 12.0,
  CHUNK_HEIGHT: 3.0,
  RIVER_WIDTH: 5.0, // X spans from -2.5 to 2.5
  DOCK_X: 2.5,      // Placed at X = -2.5 and X = 2.5
  WATER_Y: -0.1,    // Sits slightly below grass
  LAND_Y: 0.0,
  DOCKS_Y: 0.05     // Projects slightly over water
};
