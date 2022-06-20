export function loadCustomHandlebarHelpers() {
    Handlebars.registerHelper("ftd-resource", function (name, options) {
        let value = foundry.utils.getProperty(options.data.root, name);
        if ( options.hash.hasOwnProperty('value') ) {
            value = options.hash.value;
        }

        let type = "text";
        let dtype = "String"
        if (typeof (value) === "number") {
            type = "number";
            dtype = "Number";
        }
        const h = options.hash;
        const results = `<div class="resource${h.inline ? " inline" : ""}${h.box ? " box" : ""}">
            <label for="${name}" class="resource-label">${h.label}</label>
            <input class="resource-value" type="${type}" title="${h.label}" name="${name}"
            value="${value}" data-dtype="${dtype}" />
        </div>`;
        return new Handlebars.SafeString(results);
    });
}