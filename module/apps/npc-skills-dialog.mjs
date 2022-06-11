/**
 * A specialized Dialog subclass for ability usage.
 * @extends {Dialog}
 */
 export class NpcSkillsDialog extends Dialog {
    constructor(actor, dialogData={}, options={}) {
      super(dialogData, options);
      this.options.classes = ["fivetorchesdeep", "dialog"];

      this.actor;
    }

    static async create(actor, skillSet) {
        if ( !actor.isOwner ) throw new Error("Unable to show skill dialog for unowned actors.");

        const viewData = {
            skillLabel: skillSet.capitalize(),
            skills: actor.system[skillSet],
            desc: actor.system[`${skillSet}Desc`]
        };

        const html = await renderTemplate("systems/fivetorchesdeep/templates/apps/npc-skills.html", viewData);

        return new Promise(resolve => {
            const dlg = new this(actor, {
                title: `${actor.name}: ${game.i18n.localize("FTD.EditNpcSkills" + skillSet.capitalize())}`,
                content: html,
                buttons: {
                    save: {
                        label: game.i18n.localize("FTD.Save"),
                        callback: html => {
                            const fd = new FormDataExtended(html[0].querySelector("form"));
                            resolve(fd.object);
                        }
                    }
                },
                default: "save",
                close: () => resolve(null)
            });
            dlg.render(true);
        });
    }
};