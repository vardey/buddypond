import fishList from './data/Fish.js';
import mutationList from './data/Mutations.js';
import items from './data/Items.js';

const ITEM_DROP_CHANCE = 0.05; // 5% chance to get a random modifier instead of a fish
const droppableitems = Object.keys(items); // drop any modifier defined in items.js

let fishing = {};
fishing.Fish = fishList;
fishing.Mutations = mutationList;
fishing.Items = items;

// --- SEEDABLE RANDOM SETUP ---
let rng = Math.random;

fishing.setRandomSeed = function (seed) {
  if (typeof seed !== 'number') {
    throw new Error('Seed must be a number');
  }
  console.log(`Setting fishing random seed to ${seed}`);
  rng = function rng() {
    console.log(`Setting random seed to ${seed}`);
    let state = seed >>> 0; // force to uint32

    // LCG parameters from Numerical Recipes
    state = (1664525 * state + 1013904223) >>> 0;
    let res = state / 0x100000000; // scale to [0, 1)
    console.log(`Generated random number: ${res}`);
    return res;
  }
};

fishing.clearRandomSeed = function () {
  rng = Math.random;
};

// --- LOGIC ---
fishing.weightedRandom = function (items, weightKey = 'weight', weightsOverride = {}) {
  const total = items.reduce((acc, item) => {
    const override = weightsOverride[item.rarity] || 1;
    return acc + item[weightKey] * override;
  }, 0);

  const rand = rng() * total;
  let acc = 0;

  for (const item of items) {
    const override = weightsOverride[item.rarity] || 1;
    acc += item[weightKey] * override;
    if (rand < acc) return item;
  }
};

fishing.rollMutation = function (boost = 0) {
  for (const mutation of mutationList) {
    const totalChance = mutation.chance + boost;
    if (rng() < totalChance) return mutation;
  }
  return null;
};

fishing.castFishingLine = function (itemsInput = []) {
  if (rng() < ITEM_DROP_CHANCE) {
    const randomItem = droppableitems[Math.floor(rng() * droppableitems.length)];
    return {
      type: 'item',
      name: randomItem,
      key: items[randomItem]?.key || randomItem,
      rarity: items[randomItem]?.rarity,
      metadata: items[randomItem] || {},
      durability: items[randomItem]?.durability || 0,
      value: items[randomItem]?.value || 0,
      description: items[randomItem]?.effect || 'A useful fishing item!',
      itemsUsed: itemsInput
    };
  }

  // Boosts
  let rarityBoost = {};
  let mutationBoost = 0;

  for (const modName of itemsInput) {
    const mod = items[modName];
    if (!mod) continue;
    if (mod.rarityBoost) {
      for (const [rarity, boost] of Object.entries(mod.rarityBoost)) {
        rarityBoost[rarity] = (rarityBoost[rarity] || 1) * boost;
      }
    }
    if (mod.mutationBoost) {
      mutationBoost += mod.mutationBoost;
    }
  }

  const fish = fishing.weightedRandom(fishList, 'weight', rarityBoost);
  const mutation = fishing.rollMutation(mutationBoost);
  const weight = (
    rng() * (fish.maxWeight - fish.minWeight) + fish.minWeight
  ).toFixed(2);

  const valueMultiplier = mutation ? mutation.valueMultiplier : 1.0;
  const value = Math.round(fish.baseValue * valueMultiplier * weight);

  return {
    type: 'fish',
    key: fish.key,
    name: fish.name,
    rarity: fish.rarity,
    weight: parseFloat(weight),
    mutation: mutation ? mutation.name : null,
    value,
    description: mutation ? mutation.effect : null,
    itemsUsed: itemsInput
  };
};

export default fishing;
