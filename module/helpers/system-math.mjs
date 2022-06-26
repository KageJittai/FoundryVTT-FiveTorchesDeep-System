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