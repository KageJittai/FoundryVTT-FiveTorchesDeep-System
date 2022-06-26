export const FtdName = "fivetorchesdeep";

export function getSystemSettings(settingName) {
    return game.settings.get(FtdName, settingName);
}

export function registerSystemSettings() {
    game.settings.register(FtdName, "itemLoadRounding", {
        scope: "world",
        config: true,

        name: "SETTINGS.FTD.ItemLoadRounding",
        hint: "SETTINGS.FTD.ItemLoadRoundingHint",

        default: "nearest",
        type: String,
        choices: {
            nearest: "SETTINGS.FTD.RoundNearest",
            floor: "SETTINGS.FTD.RoundDown",
            ceil: "SETTINGS.FTD.RoundUp",
            none: "SETTINGS.FTD.NoRounding"
        }
    });

    game.settings.register(FtdName, "supplyLoadRounding", {
        scope: "world",
        config: true,

        name: "SETTINGS.FTD.SupplyLoadRounding",
        hint: "SETTINGS.FTD.SupplyLoadRoundingHint",

        default: "nearest",
        type: String,
        choices: {
            nearest: "SETTINGS.FTD.RoundNearest",
            floor: "SETTINGS.FTD.RoundDown",
            ceil: "SETTINGS.FTD.RoundUp",
            none: "SETTINGS.FTD.NoRounding"
        }
    });
}