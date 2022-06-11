/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class ActorFTD extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data.
   */
  prepareDerivedData() {
    const flags = this.flags.ftd || {};

    try {
    this._prepareCharacterData();
    this._prepareNpcData();
  }
    catch (e) {
      console.error(e);
    }
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData() {
    if (this.type !== 'character') return;

    // Make modifications to data here. For example:
    const system = this.system;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(system.abilities)) {
      // Calculate the modifier using d20 rules.
      ability.mod = Math.floor((ability.value - 10) / 2);
    }
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData() {
    if (this.type !== 'npc') return;

    // Make modifications to data here. For example:
    const system = this.system;
    const halfHd = Math.floor(system.hd / 2);
    system.mods = {
      "weak": Math.min(halfHd - 2, 8),
      "normal": Math.min(halfHd + 2, 10),
      "strong": Math.min(Math.floor(system.hd) + 2, 12)
    };
    
    system.avghp = Math.ceil(system.hd * 4.5);
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const rollData = foundry.utils.deepClone(super.getRollData());

    // Prepare character roll data.
    this._getCharacterRollData(rollData);
    this._getNpcRollData(rollData);

    return rollData;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(rollData) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (rollData.abilities) {
      for (let [k, v] of Object.entries(rollData.abilities)) {
        rollData[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (rollData.attributes.level) {
      rollData.lvl = rollData.attributes.level.value ?? 0;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(rollData) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
    rollData.basemod = this.system.mods.normal;
    rollData.weakmod = this.system.mods.weak;
    rollData.strongmod = this.system.mods.strong;
  }

}