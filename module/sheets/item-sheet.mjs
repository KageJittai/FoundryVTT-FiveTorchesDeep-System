/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ItemSheetFTD extends ItemSheet {

  constructor(item, options) {
    super(item, options);

    this.options.classes.push(`item-${item.type}`);
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["fivetorchesdeep", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    return `systems/fivetorchesdeep/templates/item/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const item = foundry.utils.deepClone(context.item);

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = context.item.getRollData();

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = item.system;
    context.flags = item.flags;

    context.richDesc = TextEditor.enrichHTML(context.system.description, {async: false, rollData: context.rollData });

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}
