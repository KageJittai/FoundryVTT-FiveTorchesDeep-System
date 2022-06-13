export const FTD = {};

/**
 * The set of Ability Scores used within the sytem.
 * @type {Object}
 */
 FTD.abilities = {
  "str": "FTD.AbilityStr",
  "dex": "FTD.AbilityDex",
  "con": "FTD.AbilityCon",
  "int": "FTD.AbilityInt",
  "wis": "FTD.AbilityWis",
  "cha": "FTD.AbilityCha"
};

FTD.abilityAbbreviations = {
  "str": "FTD.AbilityStrAbbr",
  "dex": "FTD.AbilityDexAbbr",
  "con": "FTD.AbilityConAbbr",
  "int": "FTD.AbilityIntAbbr",
  "wis": "FTD.AbilityWisAbbr",
  "cha": "FTD.AbilityChaAbbr"
};

FTD.Categories = {
  "Brute": "FTD.CategoryBrute",
  "Leader": "FTD.CategoryLeader",
  "Predator": "FTD.CategoryPredator",
  "Shaper": "FTD.CategoryShaper",
  "Sniper": "FTD.CategorySniper",
  "Soldier": "FTD.CategorySoldier"
};

FTD.resources = {
  "supply": {
    label: "FTD.Supply",
    readonly: false
  },
  "load": {
    label: "FTD.Load",
    readonly: true
  },
  "resilience": {
    label: "FTD.Resilience",
    readonly: false
  },
  "retainers": {
    label: "FTD.Retainers",
    readonly: false
  },
  "mItems": {
    label: "FTD.MagicItems",
    readonly: true
  }
};

FTD.SupplyPerLoad = 5;
FTD.CoinPerLoad = 500;