import { getSystemSettings } from "./settings.mjs"

const RoundingMethods = {
    nearest: Math.round,
    floor: Math.floor,
    ceil: Math.ceil,
    none: function (v) {
        return Math.round(v * 100) / 100;
    }
}

export function roundItemLoad(value) {
    if (!Number.isNumeric(value)) value = 0;

    const roundingMethod = getSystemSettings("itemLoadRounding");
    return RoundingMethods[roundingMethod](value);
}

export function roundSupplyLoad(value) {
    if (!Number.isNumeric(value)) value = 0;

    const roundingMethod = getSystemSettings("supplyLoadRounding");
    return RoundingMethods[roundingMethod](value);
}

// Proficency Bonus, this will match 5e's if level goes past 9
export function calculateProficencyBonus(characterLevel) {
    return Math.floor(2 + (0.25 * (characterLevel - 1)));
}

export function calculateAbilityMod(abilityScore) {
    // Calculate the modifier using d20 rules.
    let mod = Math.floor((abilityScore - 10) / 2);
    // FTD caps ability mods
    return Math.max(-4, Math.min(mod, 4));
}

export function calculateNpcMods(hitdice) {
    const halfHd = Math.floor(hitdice / 2);
    return {
      "weak": Math.min(halfHd - 2, 8),
      "normal": Math.min(halfHd + 2, 10),
      "strong": Math.min(Math.floor(hitdice) + 2, 12)
    };
}