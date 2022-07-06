import {roundSupplyLoad, calculateProficencyBonus, calculateAbilityMod, calculateNpcMods} from "../helpers/system-math.mjs"

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

    system.pb = calculateProficencyBonus(system.attributes.level.value);

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(system.abilities)) {
      ability.mod = calculateAbilityMod(ability.value);
    }

    const a = system.abilities;
    system.init = a.dex.value

    // Set resource limits from ability scores
    const r = system.resources;
    r.supply.max = a.int.value + r.supply.bonus;
    r.load.max = a.str.value + r.load.bonus;
    r.resilience.max = a.con.value + r.resilience.bonus;
    r.retainers.max = a.cha.value + r.retainers.bonus;
    r.mItems.max = Math.max(1, a.cha.mod) + r.mItems.bonus;

    // Compute Load
    r.mItems.value = 0;
    r.load.value = roundSupplyLoad(r.supply.value / CONFIG.FTD.SupplyPerLoad);

    this.items.forEach(i => {
      if (i.type == "item") {
        r.load.value += i.system.totalLoad;
      }
    });
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData() {
    if (this.type !== 'npc') return;

    // Make modifications to data here. For example:
    const system = this.system;
    system.mods = calculateNpcMods(system.hd)
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

    rollData.pb = rollData.pb ?? 0;
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