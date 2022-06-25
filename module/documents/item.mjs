/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class ItemFTD extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    if (this.type === "item") {
      const qty = this.system.quantity;
      const load = this.system.load;
      let totalLoad = qty * load;
      if (!Number.isNumeric(totalLoad)) {
        totalLoad = 0;
      }
      this.system.totalLoad = totalLoad;

      if (this.system.subtype === "consumable") {
        let resupCost = this.system.supcost;
        let resupQty = 1;

        // If resupcost is less that one it
        // means you can get multiple items per sup
        if (resupCost < 1) {
          resupQty = Math.round(1 / resupCost);
          resupCost = 1;
        }

        let actorSupplyValue = this.actor?.system?.resources?.supply?.value ?? 0;

        this.system.resupply = {
          qty: resupQty,
          cost: resupCost,
          noSupply: resupCost > actorSupplyValue
        }
      }
    }
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${this.type}] ${this.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: this.system.description ?? ''
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.item.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // let result = await roll.roll({async: true});
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
