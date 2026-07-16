import { describe, test, expect, beforeEach } from 'vitest';
import { GameState } from './state.js';

describe('GameState Class Unit Tests', () => {
  let game;

  beforeEach(() => {
    game = new GameState();
  });

  test('Initial state is correct', () => {
    // Boat and all 4 actors start on 'left'
    expect(game.boatLocation).toBe('left');
    expect(game.actorPositions.man).toBe('left');
    expect(game.actorPositions.fox).toBe('left');
    expect(game.actorPositions.sheep1).toBe('left');
    expect(game.actorPositions.sheep2).toBe('left');
    expect(game.checkRules()).toBe('playing');
  });

  test('Moves counter increments correctly on boat moves and resets', () => {
    expect(game.moves).toBe(0);

    // Try moving boat (fails, shepherd not on boat)
    expect(game.moveBoat()).toBe(false);
    expect(game.moves).toBe(0);

    // Load shepherd and fox (safe setup)
    expect(game.loadToBoat('man')).toBe(true);
    expect(game.loadToBoat('fox')).toBe(true);

    // Move boat successfully
    expect(game.moveBoat()).toBe(true);
    expect(game.moves).toBe(1);

    // Move boat back successfully
    expect(game.moveBoat()).toBe(true);
    expect(game.moves).toBe(2);

    // Reset game
    game.reset();
    expect(game.moves).toBe(0);
  });

  test('Loading and unloading to the boat works', () => {
    // Load man (shepherd)
    const loadManSuccess = game.loadToBoat('man');
    expect(loadManSuccess).toBe(true);
    expect(game.actorPositions.man).toBe('boat');
    expect(game.getBoatPassengerCount()).toBe(1);

    // Unload man
    const unloadManSuccess = game.unloadFromBoat('man');
    expect(unloadManSuccess).toBe(true);
    expect(game.actorPositions.man).toBe('left');
    expect(game.getBoatPassengerCount()).toBe(0);
  });

  test('Moving the boat without the shepherd is blocked', () => {
    // Try to move boat with no one
    expect(game.moveBoat()).toBe(false);
    expect(game.boatLocation).toBe('left');

    // Load fox on the boat (shepherd is still on the bank)
    expect(game.loadToBoat('fox')).toBe(true);
    expect(game.actorPositions.fox).toBe('boat');

    // Try to move boat with only fox
    expect(game.moveBoat()).toBe(false);
    expect(game.boatLocation).toBe('left');
  });

  test('Overfilling the boat is blocked', () => {
    // Load man and fox (2 spots filled)
    expect(game.loadToBoat('man')).toBe(true);
    expect(game.loadToBoat('fox')).toBe(true);
    expect(game.getBoatPassengerCount()).toBe(2);

    // Try loading sheep1 (3rd spot) - should be blocked
    const loadSheepSuccess = game.loadToBoat('sheep1');
    expect(loadSheepSuccess).toBe(false);
    expect(game.actorPositions.sheep1).toBe('left');
    expect(game.getBoatPassengerCount()).toBe(2);
  });

  test('Cannot load an actor who is not on the same bank as the boat', () => {
    // Move shepherd and fox to 'right' bank (this is safe as sheep1 and sheep2 are left together)
    expect(game.loadToBoat('man')).toBe(true);
    expect(game.loadToBoat('fox')).toBe(true);
    expect(game.moveBoat()).toBe(true); // boat is at 'right' now

    expect(game.unloadFromBoat('man')).toBe(true);
    expect(game.unloadFromBoat('fox')).toBe(true);

    // Now boat is at 'right'. Sheep1 is still at 'left'.
    expect(game.boatLocation).toBe('right');
    expect(game.actorPositions.sheep1).toBe('left');

    // Try to load sheep1 into the boat - should fail because sheep1 is on 'left' and boat is on 'right'
    expect(game.loadToBoat('sheep1')).toBe(false);
    expect(game.actorPositions.sheep1).toBe('left');
  });

  test('Sheep-only safety (leaving sheep1 and sheep2 alone together is safe)', () => {
    // Move shepherd and fox to the 'right' bank, leaving sheep1 and sheep2 alone on 'left' bank
    expect(game.loadToBoat('man')).toBe(true);
    expect(game.loadToBoat('fox')).toBe(true);
    expect(game.moveBoat()).toBe(true); // boat is now at 'right'

    // Check rules: shepherd is away from 'left' bank, and sheep1 & sheep2 are there
    // This is safe because there is no fox on the 'left' bank.
    expect(game.checkRules()).toBe('playing');

    // Unload fox and shepherd to right bank
    expect(game.unloadFromBoat('fox')).toBe(true);
    expect(game.unloadFromBoat('man')).toBe(true);

    // Double check state
    expect(game.actorPositions.sheep1).toBe('left');
    expect(game.actorPositions.sheep2).toBe('left');
    expect(game.actorPositions.fox).toBe('right');
    expect(game.actorPositions.man).toBe('right');

    expect(game.checkRules()).toBe('playing');
  });

  test('Game over condition: Shepherd leaves the fox alone with sheep1 on left bank', () => {
    // Load man and sheep2 onto boat
    expect(game.loadToBoat('man')).toBe(true);
    expect(game.loadToBoat('sheep2')).toBe(true);

    // Move boat to right
    expect(game.moveBoat()).toBe(true);

    // At this point:
    // - Boat is at 'right'
    // - man and sheep2 are on boat (at 'right')
    // - fox and sheep1 are left on 'left' bank
    // Since shepherd is "away" from 'left' bank, fox eats sheep1 -> Game Over!
    expect(game.checkRules()).toBe('game_over_fox_ate_sheep');
  });

  test('Game over condition: Shepherd leaves the fox alone with sheep2 on left bank', () => {
    // Load man and sheep1 onto boat
    expect(game.loadToBoat('man')).toBe(true);
    expect(game.loadToBoat('sheep1')).toBe(true);

    // Move boat to right
    expect(game.moveBoat()).toBe(true);

    // Since shepherd is "away" from 'left' bank, fox eats sheep2 -> Game Over!
    expect(game.checkRules()).toBe('game_over_fox_ate_sheep');
  });

  test('Reset reverts everything to starting positions', () => {
    // Move some things around safely
    expect(game.loadToBoat('man')).toBe(true);
    expect(game.loadToBoat('fox')).toBe(true);
    expect(game.moveBoat()).toBe(true);
    expect(game.unloadFromBoat('fox')).toBe(true);

    // Perform reset
    game.reset();

    // Verify reset state
    expect(game.boatLocation).toBe('left');
    expect(game.actorPositions.man).toBe('left');
    expect(game.actorPositions.fox).toBe('left');
    expect(game.actorPositions.sheep1).toBe('left');
    expect(game.actorPositions.sheep2).toBe('left');
    expect(game.checkRules()).toBe('playing');
  });

  test('The win condition: all characters successfully and safely crossed', () => {
    // Let's reset and execute the CORRECT 12-step sequence to see if victory is achievable:
    game.reset();

    // 1. Take Fox to Right bank.
    expect(game.loadToBoat('man')).toBe(true);
    expect(game.loadToBoat('fox')).toBe(true);
    expect(game.moveBoat()).toBe(true);
    expect(game.unloadFromBoat('fox')).toBe(true);
    expect(game.checkRules()).toBe('playing'); // Left: S1, S2 (safe). Right: fox, boat(man) (safe).

    // 2. Return alone to Left bank.
    expect(game.moveBoat()).toBe(true);
    expect(game.checkRules()).toBe('playing'); // Left: S1, S2, boat(man) (safe). Right: fox (safe).

    // 3. Take Sheep1 to Right bank.
    expect(game.loadToBoat('sheep1')).toBe(true);
    expect(game.moveBoat()).toBe(true);
    expect(game.checkRules()).toBe('playing'); // Left: S2 (safe). Right: fox, boat(man, sheep1) (safe).

    // 4. Unload Sheep1, load Fox.
    expect(game.unloadFromBoat('sheep1')).toBe(true);
    expect(game.loadToBoat('fox')).toBe(true);
    expect(game.checkRules()).toBe('playing'); // Left: S2 (safe). Right: sheep1, boat(man, fox) (safe).

    // 5. Return with Fox to Left bank.
    expect(game.moveBoat()).toBe(true);
    expect(game.checkRules()).toBe('playing'); // Left: S2, boat(man, fox) (safe). Right: sheep1 (safe).

    // 6. Unload Fox, load Sheep2.
    expect(game.unloadFromBoat('fox')).toBe(true);
    expect(game.loadToBoat('sheep2')).toBe(true);
    expect(game.checkRules()).toBe('playing'); // Left: fox, boat(man, sheep2) (safe). Right: sheep1 (safe).

    // 7. Move Sheep2 to Right bank.
    expect(game.moveBoat()).toBe(true);
    expect(game.checkRules()).toBe('playing'); // Left: fox (safe). Right: sheep1, boat(man, sheep2) (safe).

    // 8. Unload Sheep2.
    expect(game.unloadFromBoat('sheep2')).toBe(true);
    expect(game.checkRules()).toBe('playing'); // Left: fox (safe). Right: sheep1, sheep2, boat(man) (safe).

    // 9. Return alone to Left bank.
    expect(game.moveBoat()).toBe(true);
    expect(game.checkRules()).toBe('playing'); // Left: fox, boat(man) (safe). Right: sheep1, sheep2 (sheep-only safety - safe!).

    // 10. Load Fox.
    expect(game.loadToBoat('fox')).toBe(true);
    expect(game.checkRules()).toBe('playing'); // Left: boat(man, fox) (safe). Right: sheep1, sheep2 (safe).

    // 11. Move Fox to Right bank.
    expect(game.moveBoat()).toBe(true);
    expect(game.checkRules()).toBe('playing'); // Left: empty. Right: sheep1, sheep2, boat(man, fox) (safe).

    // 12. Unload Fox.
    expect(game.unloadFromBoat('fox')).toBe(true);
    expect(game.unloadFromBoat('man')).toBe(true); // Unload the shepherd too!

    // Verify victory!
    expect(game.checkRules()).toBe('victory');
  });

  test('Actions are blocked in terminal states', () => {
    // Trigger game over
    game.loadToBoat('man');
    game.loadToBoat('sheep2');
    game.moveBoat();
    expect(game.checkRules()).toBe('game_over_fox_ate_sheep');

    // Try to move boat or load/unload - should fail
    expect(game.moveBoat()).toBe(false);
    expect(game.loadToBoat('fox')).toBe(false);
    expect(game.unloadFromBoat('man')).toBe(false);
  });
});
