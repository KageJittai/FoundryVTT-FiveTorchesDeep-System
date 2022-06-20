export function loadCustomHandlebarHelpers() {
    Handlebars.registerHelper("ftd-resource", function (name, options) {
        const h = options.hash;

        let value = foundry.utils.getProperty(options.data.root, name);
        if ( h.hasOwnProperty('value') ) {
            value = h.value;
        }
        let title = h.hasOwnProperty('title') ? h.title : h.label;

        let type = "text";
        let dtype = "String"
        if (typeof (value) === "number") {
            type = "number";
            dtype = "Number";
        }
        const results = `<div class="resource${h.inline ? " inline" : ""}${h.box ? " box" : ""}">
            <label for="${name}" class="resource-label">${h.label}</label>
            <input class="resource-value" type="${type}" title="${title}" name="${name}"
            value="${value}" data-dtype="${dtype}"${h.readonly ? " readonly" : ""} />
        </div>`;
        return new Handlebars.SafeString(results);
    });

    Handlebars.registerHelper("ftd-resource-multi", function (name, options) {
        const h = options.hash;

        let value = foundry.utils.getProperty(options.data.root, name);
        if ( h.hasOwnProperty('value') ) {
            value = h.value;
        }
        let title = h.hasOwnProperty('title') ? h.title : h.label;

        const results = `<div class="resource${h.inline ? " inline" : ""}${h.box ? " box" : ""}">
        <label class="resource-label" for="${name}.value">${h.label}</label>
        <div class="resource-value multiple flexrow">
          <input class="res-value" type="number" data-dtype="Number"
            title="${title}"  name="${name}.value" value="${value.value}"
            ${h.value_readonly ? " readonly" : ""} />
          <span class="sep">/</span>
          <input class="res-max" type="number" data-dtype="Number"
            name="${name}.max" value="${value.max}"
            ${h.max_readonly ? " readonly" : ""} />
        </div>
        </div>`;
        return new Handlebars.SafeString(results);
    });
}