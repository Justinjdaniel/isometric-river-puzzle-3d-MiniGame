// Game layout and visual constants for the 3D Isometric River Crossing Puzzle Game

export const COLORS = {
  WATER: 0x156289,
  BANK_LAND: 0x88b04b,
  BOAT: 0x7a5c3f,
  MAN: 0x3a6073,
  FOX: 0xd9534f,
  SHEEP: 0xf7f7f7,
  SKY_AMBIENT: 0xbfd2e6,
  SUNLIGHT: 0xffffff
};

export const SPEED = {
  BOAT: 3.0,       // Speed of boat movement (units per second)
  ANIMATION: 5.0   // Loading/unloading animation speed
};

export const POSITIONS = {
  LEFT_BANK: { x: -6.0, y: 0.5, z: 0.0 },
  RIGHT_BANK: { x: 6.0, y: 0.5, z: 0.0 },
  BOAT_DOCK_LEFT: { x: -2.0, y: 0.1, z: 0.0 },
  BOAT_DOCK_RIGHT: { x: 2.0, y: 0.1, z: 0.0 }
};

export const BOUNDS = {
  BANK_WIDTH: 5.0,
  RIVER_WIDTH: 4.0
};
