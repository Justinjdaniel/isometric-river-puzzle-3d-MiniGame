/**
 * Headless Game State Machine for the Isometric River Crossing Puzzle
 * Tracks positions of actors and the boat, capacity limits, and rule evaluation.
 */
export class GameState {
  constructor() {
    this.reset();
  }

  /**
   * Resets all game state values to starting conditions.
   * All four actors and the boat start at the 'left' bank.
   */
  reset() {
    this.actorPositions = {
      man: 'left',
      fox: 'left',
      sheep1: 'left',
      sheep2: 'left'
    };
    this.boatLocation = 'left';
    this.moves = 0;
  }

  /**
   * Returns the count of passengers currently on the boat.
   * @returns {number}
   */
  getBoatPassengerCount() {
    return Object.values(this.actorPositions).filter(pos => pos === 'boat').length;
  }

  /**
   * Returns a list of actors currently on the boat.
   * @returns {string[]}
   */
  getBoatPassengers() {
    return Object.keys(this.actorPositions).filter(actor => this.actorPositions[actor] === 'boat');
  }

  /**
   * Safely boards an actor from their current bank onto the boat.
   * @param {string} actor - 'man', 'fox', 'sheep1', 'sheep2'
   * @returns {boolean} - true if boarding succeeded, false otherwise
   */
  loadToBoat(actor) {
    if (this.checkRules() !== 'playing') {
      console.warn(`[GameState] loadToBoat failed: Game is already in a terminal state`);
      return false;
    }

    // SECURITY: Direct, zero-allocation logical check to prevent both Prototype Pollution and memory allocation overhead.
    if (actor !== 'man' && actor !== 'fox' && actor !== 'sheep1' && actor !== 'sheep2') {
      console.warn(`[GameState] loadToBoat failed: Invalid actor "${actor}"`);
      return false;
    }

    const currentPos = this.actorPositions[actor];

    // Actor is already on the boat
    if (currentPos === 'boat') {
      console.warn(`[GameState] loadToBoat failed: Actor "${actor}" is already on the boat`);
      return false;
    }

    // Actor can only board if they are on the same bank as the boat
    if (currentPos !== this.boatLocation) {
      console.warn(`[GameState] loadToBoat failed: Actor "${actor}" is on "${currentPos}" bank, but boat is at "${this.boatLocation}"`);
      return false;
    }

    // Check capacity limit of exactly 2 spots
    if (this.getBoatPassengerCount() >= 2) {
      console.warn(`[GameState] loadToBoat failed: Boat capacity limit reached (max 2)`);
      return false;
    }

    // Load actor
    this.actorPositions[actor] = 'boat';
    return true;
  }

  /**
   * Unloads an actor from the boat onto its current bank.
   * @param {string} actor - 'man', 'fox', 'sheep1', 'sheep2'
   * @returns {boolean} - true if unloading succeeded, false otherwise
   */
  unloadFromBoat(actor) {
    if (this.checkRules() !== 'playing') {
      console.warn(`[GameState] unloadFromBoat failed: Game is already in a terminal state`);
      return false;
    }

    // SECURITY: Direct, zero-allocation logical check to prevent both Prototype Pollution and memory allocation overhead.
    if (actor !== 'man' && actor !== 'fox' && actor !== 'sheep1' && actor !== 'sheep2') {
      console.warn(`[GameState] unloadFromBoat failed: Invalid actor "${actor}"`);
      return false;
    }

    const currentPos = this.actorPositions[actor];

    // Actor must be on the boat to unload
    if (currentPos !== 'boat') {
      console.warn(`[GameState] unloadFromBoat failed: Actor "${actor}" is not on the boat`);
      return false;
    }

    // Unload to boat's current bank
    this.actorPositions[actor] = this.boatLocation;
    return true;
  }

  /**
   * Triggers the boat's transition to the opposite bank if the shepherd ('man') is on board.
   * @returns {boolean} - true if movement succeeded, false otherwise
   */
  moveBoat() {
    if (this.checkRules() !== 'playing') {
      console.warn(`[GameState] moveBoat failed: Game is already in a terminal state`);
      return false;
    }

    // Shepherd ('man') must be on the boat to move it
    if (this.actorPositions['man'] !== 'boat') {
      console.warn('[GameState] moveBoat failed: Shepherd ("man") must be on the boat to sail');
      return false;
    }

    // Toggle boat location
    this.boatLocation = this.boatLocation === 'left' ? 'right' : 'left';
    this.moves++;
    return true;
  }

  /**
   * Helper to evaluate presence of an actor on a specific bank.
   * @param {string} actor - 'man', 'fox', 'sheep1', 'sheep2'
   * @param {string} bank - 'left', 'right'
   * @returns {boolean}
   * @private
   */
  _isPresentOnBank(actor, bank) {
    const pos = this.actorPositions[actor];
    return pos === bank || (pos === 'boat' && this.boatLocation === bank);
  }

  /**
   * Evaluates the current layout and checks game rules.
   * Checks if victory is achieved or if the fox has eaten a sheep.
   * @returns {string} - 'victory', 'game_over_fox_ate_sheep', or 'playing'
   */
  checkRules() {
    // 1. Victory Condition: All 4 actors are physically on 'right' bank.
    const allOnRight = Object.values(this.actorPositions).every(pos => pos === 'right');
    if (allOnRight) {
      return 'victory';
    }

    // 2. Check each bank ('left' and 'right') for game over conditions
    const banks = ['left', 'right'];
    for (const bank of banks) {
      const manPresent = this._isPresentOnBank('man', bank);
      const foxPresent = this._isPresentOnBank('fox', bank);
      const sheep1Present = this._isPresentOnBank('sheep1', bank);
      const sheep2Present = this._isPresentOnBank('sheep2', bank);

      // If shepherd is away, and fox is present with either sheep
      if (!manPresent && foxPresent && (sheep1Present || sheep2Present)) {
        return 'game_over_fox_ate_sheep';
      }
    }

    return 'playing';
  }
}

export default GameState;
