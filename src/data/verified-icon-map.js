// Verified MapleStory.io GMS v83/classic item icon IDs.
// Important: this file maps by visible item name, not by MSCW crafting output_id.
// Wrong icon is worse than no icon, so keep unknown items unmapped until verified.

export const VERIFIED_ICON_MAP = {
  // Refined ores / ingots
  'Bronze Ingot': '4011000',
  'Iron Ingot': '4011001',
  'Steel Ingot': '4011001',
  'Mithril Ingot': '4011002',
  'Adamantium Ingot': '4011003',
  'Silver Ingot': '4011004',
  'Orihalcon Ingot': '4011005',
  'Gold Ingot': '4011006',

  // Ores
  'Bronze Ore': '4010000',
  'Iron Ore': '4010001',
  'Steel Ore': '4010001',
  'Mithril Ore': '4010002',
  'Adamantium Ore': '4010003',
  'Silver Ore': '4010004',
  'Orihalcon Ore': '4010005',
  'Gold Ore': '4010006',

  // Gems / crystals
  'Garnet': '4021000',
  'Amethyst': '4021001',
  'Aquamarine': '4021002',
  'Emerald': '4021003',
  'Opal': '4021004',
  'Sapphire': '4021005',
  'Topaz': '4021006',
  'Diamond': '4021007',
  'Black Crystal': '4021008',

  // Gem ores
  'Garnet Ore': '4020000',
  'Amethyst Ore': '4020001',
  'Aquamarine Ore': '4020002',
  'Emerald Ore': '4020003',
  'Opal Ore': '4020004',
  'Sapphire Ore': '4020005',
  'Topaz Ore': '4020006',
  'Diamond Ore': '4020007',
  'Black Crystal Ore': '4020008',

  // Common monster drops
  'Snail Shell': '4000000',
  'Blue Snail Shell': '4000001',
  'Red Snail Shell': '4000002',
  'Orange Mushroom Cap': '4000009',
  'Green Mushroom Cap': '4000013',
  'Blue Mushroom Cap': '4000016',
  'Jr. Necki Skin': '4000018',
  'Curse Eye Tail': '4000027',
  'Drake Skull': '4000030',
  'Clang Claw': '4000040',
  'Stirge Wing': '4000052',

  // Crafting materials
  'Screw': '4003000',
  'Processed Wood': '4003001',
  'Firewood': '4003004',
  'Stiff Feather': '4003005',
  'Leather': '4000021',

  // Equipment verified / to be expanded carefully.
  // Keep adding only after confirming the MapleStory.io icon visually matches the item name.
  'Metal Gear': '1002001',
  'Steel Helmet': '1002003',
  'Steel Full Helm': '1002007',
  'Steel Football Helmet': '1002009',
  'Iron Viking Helm': '1002011',
  'Steel Sharp Helm': '1002027',
  'Bronze Helmet': '1002039',
  'Mithril Helmet': '1002040',
  'Yellow Metal Gear': '1002041',
  'Blue Metal Gear': '1002042',
  'Bronze Coif': '1002043',
  'Mithril Coif': '1002044',
  'Gold Burgernet Helm': '1002049',
  'Orihalcon Burgernet Helm': '1002050',
  'Bronze Full Helm': '1002051',
  'Mithril Full Helm': '1002052',
  'Bronze Football Helmet': '1002055',
  'Mithril Football Helmet': '1002056',
  'Mithril Viking Helm': '1002058',
  'Bronze Viking Helm': '1002059'
};

export function normalizeItemName(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function resolveVerifiedIconId(name) {
  const normalized = normalizeItemName(name);
  const exactEntry = Object.entries(VERIFIED_ICON_MAP).find(([itemName]) => normalizeItemName(itemName) === normalized);
  return exactEntry ? exactEntry[1] : null;
}
