export default {
  // 🎣 Rods & Tools
  "golden rod": {
    key: "golden-rod",
    rarity: "legendary",
    rarityBoost: {
      rare: 1.5,
      legendary: 2.0
    },
    mutationBoost: 0.02,
    durability: 10
  },

  "basic rod": {
    key: "basic-rod",
    rarity: "common",
    rarityBoost: {},
    mutationBoost: 0,
    description: "A worn-out but trusty fishing rod. No bonuses.",
    durability: 20
  },

  "reinforced rod": {
    key: "reinforced-rod",
    rarity: "uncommon",
    rarityBoost: {
      uncommon: 1.25,
      rare: 1.1
    },
    mutationBoost: 0.005,
    description: "Slightly increases the chance of catching rare fish.",
    durability: 25
  },

  "cyber rod": {
    key: "cyber-rod",
    rarity: "epic",
    rarityBoost: {
      rare: 1.4,
      legendary: 1.5
    },
    mutationBoost: 0.03,
    description: "A futuristic rod with scanning tech for rare catches.",
    durability: 15
  },

  // 🪱 Baits & Boosters
  "bait": {
    key: "bait",
    rarity: "common",
    rarityBoost: {
      uncommon: 1.25,
      rare: 1.25
    },
    mutationBoost: 0.01,
    durability: 5
  },

  "radioactive bait": {
    key: "radioactive-bait",
    rarity: "rare",
    rarityBoost: {
      rare: 1.2
    },
    mutationBoost: 0.05,
    description: "Fish seem unnaturally drawn to its toxic glow.",
    durability: 3
  },

  "mystery chum": {
    key: "mystery-chum",
    rarity: "uncommon",
    rarityBoost: {
      rare: 1.1,
      legendary: 1.1
    },
    mutationBoost: 0.01,
    description: "Smells... suspicious. Increases odds for strange results.",
    durability: 2
  },

  // 🎩 Wearables
  "lucky hat": {
    key: "lucky-hat",
    rarity: "uncommon",
    mutationBoost: 0.05,
    description: "Increases the chance of catching mutated fish by 5%",
    durability: 15
  },

  "pirate eyepatch": {
    key: "pirate-eyepatch",
    rarity: "rare",
    rarityBoost: {
      rare: 1.3
    },
    description: "Channel your inner pirate. Boosts rare catch odds.",
    mutationBoost: 0.01,
    durability: 20
  },

  "angler's cloak": {
    key: "anglers-cloak",
    rarity: "epic",
    rarityBoost: {
      legendary: 1.5
    },
    description: "A cloak said to be worn by the Sea King. Doubles legendary odds at night.",
    mutationBoost: 0.02,
    durability: 10
  },

  // 💍 Charms & Trinkets
  "lucky coin": {
    key: "lucky-coin",
    rarity: "uncommon",
    mutationBoost: 0.03,
    description: "Keeps turning up heads. Boosts mutation chances slightly.",
    durability: 30
  },

  "cursed charm": {
    key: "cursed-charm",
    rarity: "rare",
    rarityBoost: {
      rare: 1.1,
      legendary: 1.3
    },
    mutationBoost: 0.06,
    description: "Increases rare and mutation odds, but makes fish harder to reel in.",
    durability: 8
  },

  "totem of the deep": {
    key: "totem-of-the-deep",
    rarity: "legendary",
    rarityBoost: {
      rare: 2.0,
      legendary: 2.0
    },
    mutationBoost: 0.05,
    description: "Summons the favor of deep-sea spirits. Powerful, but fragile.",
    durability: 3
  }
};
