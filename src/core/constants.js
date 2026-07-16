// Game layout and visual constants for the 3D Isometric River Crossing Puzzle Game

export const DEVELOPER_MODE = false; // Set to false to lock characters in place for Step 4

export const COLORS = {
  WATER: 0x00FFFF,          // Bright brilliant cyan/turquoise water
  BANK_LAND: 0x66FF33,      // Hyper-vibrant sunlit neon meadow green
  EARTH_DARK: 0x8B5A2B,     // Lighter, warm-toned earthy block sides
  DOCK_WOOD: 0xA0522D,      // Rich wooden docks
  BOAT: 0xFF7700,           // Vibrant stylized orange kayak/canoe
  MAN: 0x1e6fba,            // Deep blue coat/robes
  FOX: 0xFF5500,            // Bright orange/red fox
  SHEEP: 0xFFFFFF,          // Fluffy white sheep wool
  SKY_AMBIENT: 0xE0F7FA,    // Bright sky ambient (light turquoise/cyan tint)
  SUNLIGHT: 0xFFFCEB,       // Bright, warm sunlight
  MOUNTAIN: 0x6E8B3D,       // Sunny green/grey mountain peaks
  SHADOW: 0xE0F7FA,         // Set background/backdrop to match bright sky ambient tint

  // Three distinct shades of forest green for natural organic conifer trees
  PINE_LIGHT: 0x5e8c31,     // Light pine green
  PINE_CLASSIC: 0x3b6a36,   // Classic pine green
  PINE_DEEP: 0x224d17       // Deep forest green
};

export const SPEED = {
  BOAT: 3.0,       // Speed of boat movement (units per second)
  ANIMATION: 5.0   // Loading/unloading animation speed
};

export const POSITIONS = {
  LEFT_BANK: { x: -6.0, y: 0.0, z: 0.0 },
  RIGHT_BANK: { x: 6.0, y: 0.0, z: 0.0 },
  BOAT_DOCK_LEFT: { x: -1.05, y: -0.05, z: 0.0 },  // Positioned parallel directly on the water edge next to left dock
  BOAT_DOCK_RIGHT: { x: 1.05, y: -0.05, z: 0.0 }   // Positioned parallel directly on the water edge next to right dock
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

// When inside the boat, positions relative to the boat coordinate (aligned along Z-axis)
export const BOAT_SEATS = {
  seat1: { x: 0.0, y: 0.1, z: -0.35 }, // Front seat
  seat2: { x: 0.0, y: 0.1, z: 0.35 }   // Back seat
};

// Official starting rotations for assets
export const ROTATIONS = {
  DOCKED_KAYAK: { y: Math.PI / 2 }     // Oriented parallel to the docks (bow along Z-axis)
};

export const BOUNDS = {
  CHUNK_WIDTH: 22.0,  // Expanded further by ~20% (from 18.4) to 22.0
  CHUNK_DEPTH: 16.5,  // Expanded further by ~20% (from 13.8) to 16.5
  CHUNK_HEIGHT: 3.0,
  RIVER_WIDTH: 5.0, // X spans from -2.5 to 2.5
  DOCK_X: 2.5,      // Placed at X = -2.5 and X = 2.5
  WATER_Y: -0.1,    // Sits slightly below grass
  LAND_Y: 0.0,
  DOCKS_Y: 0.05     // Projects slightly over water
};
