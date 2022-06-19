import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import {NpcSkillsDialog} from "../apps/npc-skills-dialog.mjs"

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ActorSheetFTD extends ActorSheet {
  constructor(actor, options) {
    super(actor, options);

    this.options.classes.push(`actor-${actor.type}`);
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["fivetorchesdeep", "sheet", "actor"],
      template: "systems/fivetorchesdeep/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  /** @override */
  get template() {
    return `systems/fivetorchesdeep/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /** @override */
  getData() {
    const context = super.getData();

    // Clone Actor
    const actor = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actor.system;
    context.flags = actor.flags;

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    context.richBiography = TextEditor.enrichHTML(actor.system.biography, {async: false, rollData: context.rollData });

    // Prepare character data and items.
    if (actor.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }
    else if (actor.type == 'npc') {
      this._prepareItems(context);
      this._prepareNpcData(context);
    }

    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.FTD.abilities[k]) ?? k;
    }

    // Handle resources.
    for (let [k, v] of Object.entries(context.system.resources)) {
      v.label = game.i18n.localize(CONFIG.FTD.resources[k].label) ?? k;
      v.readonly = CONFIG.FTD.resources[k].readonly;
    }
  }

  _prepareNpcData(context) {
    context.hdList = [
      { "value": 0.25, "text": "1/4" },
      { "value": 0.5, "text": "1/2" }
    ];

    for (let i = 1; i <= 18; i++) {
      context.hdList.push({
        "value": i,
        "text": i.toString()
      });
    }

    context.categoryList = [];
    for (let [name, localizedName] of Object.entries(CONFIG.FTD.Categories)) {
      context.categoryList.push({
        value: name,
        text: game.i18n.localize(localizedName)
      });
    }

    // Build proficency lists
    context.strongList = this.actor.system.strong.split(";").map(p => p.trim());
    context.weakList = this.actor.system.weak.split(";").map(p => p.trim());
  }

  /**
   * Organize and classify Items for Character sheets.
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    };
    const techniques = [];
    const proficiencies = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
      // Append to techniques
      else if (i.type === 'technique') {
        techniques.push({
          _id: i._id,
          name: i.name,
          img: i.img,
          richDesc: TextEditor.enrichHTML(i.system.description, {rollData: context.rollData, async: false})
        });
      }
      else if (i.type === 'proficiency') {
        proficiencies.push({
          _id: i._id,
          name: i.name,
          img: i.img,
        });
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.techniques = techniques;
    context.proficiencies = proficiencies;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    html.find('.npc-skill-edit').click(async ev => {
      const skill = $(ev.currentTarget).data("skill-set");

      let result = await NpcSkillsDialog.create(this.actor, skill);

      if (result) {
        let update = {};
        update[`system.${skill}`] = result.skills;
        update[`system.${skill}Desc`] = result.desc;

        this.actor.update(update);
      }
    });

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const tagData = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: tagData
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    if (tagData.img) {
      itemData.img = tagData.img;
      delete tagData.img;
    }

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }
}
